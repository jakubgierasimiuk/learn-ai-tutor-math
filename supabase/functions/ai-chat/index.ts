import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  message: string;
  topic?: string;
  level?: string;
  userId?: string;
  sessionId?: number;
  userProgress?: any;
  weakAreas?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, topic, level, userId, sessionId, userProgress, weakAreas }: ChatMessage = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client for server operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's learning context if userId provided
    let userContext = "";
    if (userId) {
      // Fetch user's recent lesson progress
      const { data: recentProgress } = await supabase
        .from('user_lesson_progress')
        .select(`
          score,
          completion_percentage,
          lessons!inner(title, content_type, difficulty_level),
          topics!inner(name)
        `)
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false })
        .limit(5);

      // Fetch user's achievement level
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, level')
        .eq('user_id', userId)
        .single();

      if (recentProgress && profile) {
        const avgScore = recentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / recentProgress.length;
        userContext = `
User Learning Context:
- Current level: ${profile.level}, Points: ${profile.total_points}
- Average score from recent lessons: ${Math.round(avgScore)}%
- Recent topics studied: ${recentProgress.map(p => p.topics.name).join(', ')}
- Weak areas: ${weakAreas?.join(', ') || 'None identified'}
`;
      }
    }

    // Enhanced AI prompt with educational coaching (Polish, structured)
    const systemPrompt = `Jesteś polskim AI Learning Coach specjalizującym się w matematyce.

Zasady pracy:
1) Dopasowanie poziomu: dostosuj słownictwo i złożoność (beginner/intermediate/advanced).
2) Metoda Sokratesa: zadawaj pytania naprowadzające, nie podawaj od razu pełnego rozwiązania.
3) Struktura odpowiedzi: max 2 krótkie akapity + lista kroków; używaj Markdown; wzory pogrubiaj jak **a² + b² = c²**.
4) Na końcu ZAWSZE jedno krótkie pytanie sprawdzające zrozumienie.
5) Weryfikacja obliczeń: sprawdzaj rachunki; jeśli poprawiasz, wskaż błąd i popraw.
6) Personalizacja przykładów: użyj ostatnich tematów i słabych obszarów.
7) Co 3 tury zaproponuj mini-ćwiczenie (1 krótkie zadanie), jeśli użytkownik nie wyrazi sprzeciwu.

Wyjście powinno zawierać zwykłą odpowiedź dla ucznia, a na końcu opcjonalny blok z wnioskami:
---INSIGHTS--- {"needsHelp": boolean, "confidence": number (0..1), "nextAction": string, "difficulty": "low"|"med"|"high"}
(Jeśli nie masz pewności, pomiń blok INSIGHTS.)

Kontekst użytkownika (jeśli dostępny):
${userContext}

Bieżący temat: ${topic || 'Matematyka – ogólne'}
Poziom użytkownika: ${level || 'beginner'}`;

    // Build conversation history for better continuity
    const messagesForOpenAI: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (sessionId) {
      const { data: logs } = await supabase
        .from('chat_logs')
        .select('role, message, id')
        .eq('session_id', sessionId)
        .order('id', { ascending: false })
        .limit(12);

      if (logs && logs.length) {
        const ordered = [...logs].reverse();
        for (const l of ordered) {
          if (l.role === 'user' || l.role === 'assistant') {
            messagesForOpenAI.push({ role: l.role, content: l.message });
          }
        }
      }
    }

    messagesForOpenAI.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messagesForOpenAI,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse: string = data.choices?.[0]?.message?.content ?? '';

    // Extract optional INSIGHTS block from the end of the response
    let insightsFromModel: any = null;
    let cleanedResponse = aiResponse;

    const match = aiResponse.match(/---INSIGHTS---\s*({[\s\S]*?})/);
    if (match) {
      try {
        insightsFromModel = JSON.parse(match[1]);
        cleanedResponse = aiResponse.replace(match[0], '').trim();
      } catch {
        // Ignore parsing errors; we'll fall back to heuristic insights
      }
    }

    // Log the chat interaction for learning analytics
    if (userId && sessionId) {
      await supabase.from('chat_logs').insert({
        session_id: sessionId,
        role: 'user',
        message: message
      });

      await supabase.from('chat_logs').insert({
        session_id: sessionId,
        role: 'assistant',
        message: cleanedResponse
      });
    }

    // Build learning insights (prefer model JSON, fallback to heuristic)
    let learningInsights: any;
    if (insightsFromModel) {
      learningInsights = {
        needsHelp: typeof insightsFromModel.needsHelp === 'boolean'
          ? insightsFromModel.needsHelp
          : (typeof insightsFromModel.confidence === 'number' ? insightsFromModel.confidence < 0.5 : false),
        topicMastery: insightsFromModel.topicMastery
          || (insightsFromModel.difficulty
              ? (insightsFromModel.difficulty === 'low' ? 'good' : insightsFromModel.difficulty === 'med' ? 'improving' : 'needs_work')
              : 'unknown'),
        suggestedActions: insightsFromModel.nextAction ? [insightsFromModel.nextAction] : []
      };
    } else {
      learningInsights = await analyzeLearningProgress(message, cleanedResponse, userProgress);
    }

    return new Response(JSON.stringify({ 
      response: cleanedResponse,
      insights: learningInsights
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      response: 'Przepraszam, wystąpił problem. Spróbuj ponownie za chwilę.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeLearningProgress(userMessage: string, aiResponse: string, userProgress: any) {
  // Simple learning analytics
  const insights = {
    needsHelp: false,
    topicMastery: 'unknown',
    suggestedActions: [] as string[]
  };

  // Detect confusion indicators
  const confusionWords = ['nie rozumiem', 'confused', 'trudne', 'ciężkie', 'nie wiem'];
  if (confusionWords.some(word => userMessage.toLowerCase().includes(word))) {
    insights.needsHelp = true;
    insights.suggestedActions.push('Zaproponuj prostsze wyjaśnienie');
    insights.suggestedActions.push('Dodaj więcej przykładów');
  }

  // Detect understanding indicators
  const understandingWords = ['rozumiem', 'jasne', 'ok', 'dzięki', 'clear'];
  if (understandingWords.some(word => userMessage.toLowerCase().includes(word))) {
    insights.topicMastery = 'improving';
    insights.suggestedActions.push('Przejdź do praktycznych ćwiczeń');
  }

  return insights;
}