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

    // Enhanced AI prompt with educational coaching
    const systemPrompt = `You are an advanced AI Learning Coach specialized in mathematics education. Your role is to:

1. **Adapt to Learning Level**: Adjust explanations based on user's demonstrated ability
2. **Provide Contextual Help**: Reference the user's learning history and weak areas
3. **Use Socratic Method**: Guide discovery through questions rather than just giving answers
4. **Offer Multiple Approaches**: Present different ways to understand concepts
5. **Encourage Growth Mindset**: Focus on progress and learning from mistakes

${userContext}

Guidelines:
- Always respond in Polish
- Break down complex concepts into digestible steps
- Use real-world examples and visual metaphors
- Ask follow-up questions to ensure understanding
- Suggest practice exercises when appropriate
- Celebrate progress and provide encouragement
- If user seems confused, offer simpler explanations or different approaches
- Track common misconceptions and address them proactively

Current topic: ${topic || 'General mathematics'}
User level: ${level || 'beginner'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

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
        message: aiResponse
      });
    }

    // Analyze the conversation for learning insights
    const learningInsights = await analyzeLearningProgress(message, aiResponse, userProgress);

    return new Response(JSON.stringify({ 
      response: aiResponse,
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