import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: string;
  content: string;
  progress?: {
    recentTopics: string[];
    averageScore: number;
    weakAreas: string[];
    totalLessons: number;
  };
  accessibility?: {
    fontSize?: string;
    voiceEnabled?: boolean;
    language?: string;
  };
}

// Helper function to get tasks from database for edge functions
async function getTasksForEdgeFunction(skillId: string, difficulty: number = 5): Promise<any[]> {
  try {
    const supabaseUrl = 'https://rfcjhdxsczcwbpknudyy.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY2poZHhzY3pjd2Jwa251ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjY5NDgsImV4cCI6MjA2ODYwMjk0OH0.Fljfz9HWi_N_hEZ4UKvk-PMKAWr4fbW_NJIE73dShoY';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: tasks, error } = await supabase
      .from('task_definitions')
      .select('*')
      .eq('skill_id', skillId)
      .gte('difficulty', difficulty - 1)
      .lte('difficulty', difficulty + 1)
      .eq('is_active', true)
      .limit(5);

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return tasks || [];
  } catch (error) {
    console.error('Error in getTasksForEdgeFunction:', error);
    return [];
  }
}

// Build comprehensive system prompt with unified learning context
function buildSystemPrompt(learnerProfile: any, currentTask: any, session: any): string {
  const basePrompt = `Jesteś AI Tutorem Matematyki wykorzystującym zaawansowany system uczenia się. Pomagasz uczniom w sposób dostosowany do ich indywidualnego profilu i potrzeb.`;

  const profileContext = learnerProfile ? `
PROFIL UCZNIA:
- Poziom trudności: ${learnerProfile.optimal_difficulty_range?.min || 3}-${learnerProfile.optimal_difficulty_range?.max || 7}
- Styl wyjaśnień: ${learnerProfile.preferred_explanation_style || 'balanced'}
- Szybkość uczenia: ${learnerProfile.learning_velocity || 1.0}
- Obszary trudności: ${JSON.stringify(learnerProfile.error_patterns || {})}
- Mocne strony: ${JSON.stringify(learnerProfile.micro_skill_strengths || {})}
` : 'PROFIL UCZNIA: Nowy użytkownik';

  const sessionContext = session ? `
AKTUALNA SESJA:
- Typ: ${session.session_type}
- Umiejętność: ${session.skill_focus || 'ogólna matematyka'}
- Poziom trudności: ${session.difficulty_level || 5}
- Zadania ukończone: ${session.tasks_completed || 0}
- Poprawne odpowiedzi: ${session.correct_answers || 0}
- Momentum nauki: ${session.learning_momentum || 1.0}
` : 'SESJA: Pierwsza interakcja';

  const taskContext = currentTask ? `
AKTUALNE ZADANIE:
- Dziedzina: ${currentTask.department}
- Umiejętność: ${currentTask.skill_name}
- Poziom: ${currentTask.difficulty}
- Treść: ${currentTask.latex_content}
- Oczekiwana odpowiedź: ${currentTask.expected_answer}
` : 'ZADANIE: Do wygenerowania na podstawie rozmowy';

  return `${basePrompt}

${profileContext}

${sessionContext}

${taskContext}

ZASADY ODPOWIEDZI:
1. Zawsze odpowiadaj po polsku
2. Dostosuj poziom języka do profilu ucznia
3. Używaj LaTeX dla wzorów matematycznych (w znacznikach $$)
4. Jeśli otrzymujesz odpowiedź na zadanie, sprawdź czy jest poprawna
5. Dawaj konstruktywne feedback dostosowane do stylu uczenia
6. Zachęcaj do myślenia, nie podawaj od razu pełnych rozwiązań
7. Wykorzystuj informacje z profilu do personalizacji pomocy
8. Śledź postępy i dostosuj trudność w czasie rzeczywistym

Odpowiadaj jak doświadczony tutor, który zna ucznia i jego potrzeby.`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();
    
    // Get Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call unified learning system for session management
    const { data: unifiedSession, error: sessionError } = await supabase.functions.invoke('unified-learning', {
      body: {
        action: 'get_or_create_session',
        userId: user.id,
        sessionType: 'ai_chat',
        department: 'mathematics'
      }
    });

    if (sessionError) {
      console.error('Session management error:', sessionError);
    }

    // Get user learning context from unified system
    const { data: learnerProfile } = await supabase
      .from('universal_learner_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get or generate current task using ContentTaskManager
    let currentTask = null;
    if (unifiedSession?.currentSession?.skill_focus) {
      const tasks = await getTasksForEdgeFunction(
        unifiedSession.currentSession.skill_focus,
        unifiedSession.currentSession.difficulty_level || 5
      );
      if (tasks.length > 0) {
        currentTask = tasks[0];
      }
    }

    // Build system prompt with unified learning context
    const systemPrompt = buildSystemPrompt(learnerProfile, currentTask, unifiedSession?.currentSession);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: learnerProfile?.preferred_ai_model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({ role: msg.role, content: msg.content }))
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse AI insights if available
    let insights = null;
    try {
      const insightMatch = aiResponse.match(/\[INSIGHTS\](.*?)\[\/INSIGHTS\]/s);
      if (insightMatch) {
        insights = JSON.parse(insightMatch[1].trim());
      }
    } catch (e) {
      // No insights or invalid format
    }

    // Log conversation to database for learning analytics
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      // Log user message
      await supabase.from('chat_logs').insert({
        session_id: unifiedSession?.currentSession?.id || null,
        role: lastMessage.role,
        message: lastMessage.content
      });

      // Log assistant response
      await supabase.from('chat_logs').insert({
        session_id: unifiedSession?.currentSession?.id || null,
        role: 'assistant',
        message: aiResponse
      });
    }

    // Analyze learning progress using simple heuristics
    const learningInsights = await analyzeLearningProgress(lastMessage?.content || '', aiResponse);

    // Update unified session if needed
    if (unifiedSession?.currentSession && lastMessage) {
      await supabase.functions.invoke('unified-learning', {
        body: {
          action: 'update_session',
          sessionId: unifiedSession.currentSession.id,
          updates: {
            taskCompleted: true,
            isCorrect: aiResponse.includes('Poprawnie') || aiResponse.includes('Świetnie'),
            responseTime: 30000, // Default response time
            tokensUsed: data.usage?.total_tokens || 0
          }
        }
      });
    }

    return new Response(JSON.stringify({ 
      message: aiResponse,
      insights: learningInsights || insights,
      session: unifiedSession?.currentSession,
      currentTask: currentTask
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Simple heuristic learning progress analysis
async function analyzeLearningProgress(userMessage: string, aiResponse: string) {
  const needsHelp = userMessage.toLowerCase().includes('nie rozumiem') || 
                   userMessage.toLowerCase().includes('pomoc') ||
                   aiResponse.toLowerCase().includes('spróbujmy jeszcze raz');
  
  const showsUnderstanding = aiResponse.toLowerCase().includes('poprawnie') ||
                            aiResponse.toLowerCase().includes('świetnie') ||
                            aiResponse.toLowerCase().includes('bardzo dobrze');
  
  const suggestedActions = [];
  
  if (needsHelp) {
    suggestedActions.push('provide_additional_explanation');
  }
  
  if (showsUnderstanding) {
    suggestedActions.push('increase_difficulty');
  } else {
    suggestedActions.push('provide_more_practice');
  }

  return {
    needsHelp,
    topicMastery: showsUnderstanding ? 'good' : 'needs_work',
    suggestedActions
  };
}