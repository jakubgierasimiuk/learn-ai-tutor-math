import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Jesteś StudyTutor – wirtualnym nauczycielem matematyki dla polskiej szkoły średniej.
Twój nadrzędny cel: ZROZUMIENIE ucznia, nie "szybka odpowiedź".

Zasady absolutne:
1. Prowadzisz dialog sokratejski: pytasz → ucznia → oceniasz → podpowiadasz.
2. Nigdy nie wyjawiasz pełnego rozwiązania, dopóki uczeń nie poprosi "Pokaż rozwiązanie" lub trzykrotnie odpowie błędnie.
3. Tłumaczysz w blokach ≤ 90 sekund czytania, numerujesz kroki KROK 1, KROK 2…
4. Korzystasz z języka polskiego na poziomie B2, unikasz żargonu akademickiego.
5. Zapisu matematycznego używasz w LaTeX inline, np. $Δ=b^2-4ac$.
6. Uwzględniasz meta-dane JSON przesyłane w każdym komunikacie użytkownika (skill_id, klasa, poziom).
7. Po zakończeniu lekcji zwracasz blok JSON:
   {
     "mastered": ["skill_uuid1", "skill_uuid2"],
     "struggled": ["skill_uuid3"],
     "nextSuggested": "skill_uuid4"
   }
8. Jeśli uczeń zada pytanie poza bieżącym tematem, odpowiedz: "Zapiszę to pytanie i wrócimy do niego po lekcji. Czy kontynuujemy?"
9. Maksymalne użycie tokenów w Twojej odpowiedzi ≤ 350.
10. Nie omawiasz podręczników ani autorów; koncentruj się na umiejętnościach.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, skillId, responseTime, stepType } = await req.json();
    
    if (!message || !sessionId || !skillId) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get skill details
    const { data: skill, error: skillError } = await supabaseClient
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (skillError) {
      console.error('Error fetching skill:', skillError);
      throw skillError;
    }

    // Get session details
    const { data: session, error: sessionError } = await supabaseClient
      .from('study_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      throw sessionError;
    }

    // Get previous conversation history
    const { data: previousSteps, error: stepsError } = await supabaseClient
      .from('lesson_steps')
      .select('*')
      .eq('session_id', sessionId)
      .order('step_number', { ascending: true });

    if (stepsError) {
      console.error('Error fetching steps:', stepsError);
      throw stepsError;
    }

    // Calculate average response time for pseudo-activity detection
    const userSteps = previousSteps?.filter(step => step.user_input && step.response_time_ms) || [];
    const averageResponseTime = userSteps.length > 0 
      ? userSteps.reduce((sum, step) => sum + (step.response_time_ms || 0), 0) / userSteps.length
      : 5000; // Default 5 seconds

    const minResponseTime = Math.max(averageResponseTime * 0.4, 2000); // Minimum 2 seconds
    const isPseudoActivity = responseTime > 0 && responseTime < minResponseTime;

    // Build conversation history for OpenAI
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ];

    // Add context about the skill
    const skillContext = {
      skill_id: skillId,
      skill_name: skill.name,
      class_level: skill.class_level,
      level: skill.level,
      department: skill.department,
      description: skill.description
    };

    // Add previous conversation
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach(step => {
        if (step.ai_response) {
          messages.push({
            role: 'assistant',
            content: step.ai_response
          });
        }
        if (step.user_input) {
          messages.push({
            role: 'user',
            content: `${JSON.stringify(skillContext)}\n${step.user_input}`
          });
        }
      });
    }

    // Add current user message with proper handling for lesson start
    let userMessage = message;
    if (message === "Rozpocznij lekcję" && previousSteps.length === 0) {
      userMessage = `Rozpocznij lekcję sokratejską dla umiejętności: ${skill.name}. Przedstaw się krótko i zadaj pierwsze pytanie diagnostyczne.`;
    }
    
    messages.push({
      role: 'user',
      content: `${JSON.stringify(skillContext)}\n${userMessage}`
    });

    // Limit conversation history to prevent token overflow
    const maxMessages = 15;
    if (messages.length > maxMessages) {
      const systemMessage = messages[0];
      const recentMessages = messages.slice(-(maxMessages - 1));
      messages.splice(0, messages.length, systemMessage, ...recentMessages);
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 350,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiResponse = await openAIResponse.json();
    const aiMessage = aiResponse.choices[0]?.message?.content;
    
    if (!aiMessage) {
      throw new Error('No response from AI');
    }

    const tokensUsed = aiResponse.usage?.total_tokens || 0;

    // Determine if this is a correct answer (simple heuristic)
    const isCorrect = aiMessage.toLowerCase().includes('poprawnie') || 
                     aiMessage.toLowerCase().includes('świetnie') ||
                     aiMessage.toLowerCase().includes('brawo');

    // Get next step number
    const nextStepNumber = (previousSteps?.length || 0) + 1;

    // Save lesson step
    const { error: stepInsertError } = await supabaseClient
      .from('lesson_steps')
      .insert({
        session_id: sessionId,
        step_number: nextStepNumber,
        step_type: stepType || 'question',
        ai_prompt: JSON.stringify(skillContext),
        ai_response: aiMessage,
        user_input: message,
        is_correct: isCorrect,
        response_time_ms: responseTime,
        tokens_used: tokensUsed
      });

    if (stepInsertError) {
      console.error('Error saving lesson step:', stepInsertError);
    }

    // Update session statistics
    const newHintsUsed = stepType === 'hint' ? session.hints_used + 1 : session.hints_used;
    const newEarlyReveals = message.toLowerCase().includes('pokaż rozwiązanie') ? 
                           session.early_reveals + 1 : session.early_reveals;
    const newStrikes = isPseudoActivity ? session.pseudo_activity_strikes + 1 : 
                      (isCorrect ? Math.max(0, session.pseudo_activity_strikes - 1) : session.pseudo_activity_strikes);

    const { error: sessionUpdateError } = await supabaseClient
      .from('study_sessions')
      .update({
        completed_steps: nextStepNumber,
        total_steps: Math.max(session.total_steps, nextStepNumber),
        hints_used: newHintsUsed,
        early_reveals: newEarlyReveals,
        pseudo_activity_strikes: newStrikes,
        total_tokens_used: session.total_tokens_used + tokensUsed,
        average_response_time_ms: userSteps.length > 0 ? 
          Math.round((session.average_response_time_ms * userSteps.length + responseTime) / (userSteps.length + 1)) :
          responseTime
      })
      .eq('id', sessionId);

    if (sessionUpdateError) {
      console.error('Error updating session:', sessionUpdateError);
    }

    // Update daily token usage
    const today = new Date().toISOString().split('T')[0];
    const { error: dailyLimitError } = await supabaseClient
      .from('user_daily_limits')
      .upsert({
        user_id: session.user_id,
        date: today,
        tokens_used: tokensUsed,
        sessions_count: 1
      }, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      });

    if (dailyLimitError) {
      console.error('Error updating daily limits:', dailyLimitError);
    }

    // Return response with metadata
    return new Response(JSON.stringify({
      message: aiMessage,
      tokensUsed: tokensUsed,
      stepNumber: nextStepNumber,
      pseudoActivityDetected: isPseudoActivity,
      correctAnswer: isCorrect,
      hints: newHintsUsed,
      strikes: newStrikes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in study-tutor function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Wystąpił błąd podczas komunikacji z tutorem AI. Spróbuj ponownie.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});