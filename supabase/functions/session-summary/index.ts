import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, sessionType, userId } = await req.json();

    if (!sessionId || !sessionType || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: sessionId, sessionType, userId' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Generating summary for session ${sessionId} (type: ${sessionType})`);

    // Get session data based on type
    let sessionData;
    let interactionsData;

    if (sessionType === 'chat') {
      const { data: session, error: sessionError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError) throw sessionError;
      sessionData = session;
    } else if (sessionType === 'lesson') {
      // Handle lesson type sessions - they're stored in study_sessions table
      const { data: session, error: sessionError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError) throw sessionError;
      sessionData = session;
    } else if (sessionType === 'unified') {
      const { data: session, error: sessionError } = await supabase
        .from('unified_learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError) throw sessionError;
      sessionData = session;
    } else {
      throw new Error(`Unsupported session type: ${sessionType}`);
    }

    // Get interaction history
    const { data: interactions, error: interactionsError } = await supabase
      .from('learning_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('sequence_number', { ascending: true });

    if (interactionsError) throw interactionsError;
    interactionsData = interactions || [];

    // Get AI conversation logs for additional context
    const { data: aiLogs, error: aiLogsError } = await supabase
      .from('ai_conversation_log')
      .select('user_input, ai_response, function_name')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (aiLogsError) console.log('No AI logs found for session');

    // Prepare context for AI summary
    const interactionSummary = interactionsData.map((interaction, index) => ({
      sequence: index + 1,
      user_input: interaction.user_input || '',
      ai_response: interaction.ai_response || '',
      response_time: interaction.response_time_ms,
      interaction_type: interaction.interaction_type
    }));

    const sessionMetrics = {
      total_interactions: interactionsData.length,
      total_duration_minutes: sessionData.completed_at 
        ? Math.round((new Date(sessionData.completed_at).getTime() - new Date(sessionData.started_at).getTime()) / 60000)
        : null,
      average_response_time: interactionsData.length > 0 
        ? Math.round(interactionsData.reduce((sum, i) => sum + (i.response_time_ms || 0), 0) / interactionsData.length)
        : 0,
      skills_practiced: sessionData.skill_id ? [sessionData.skill_id] : [],
      hints_used: sessionData.hints_used || 0,
      early_reveals: sessionData.early_reveals || 0
    };

    // Generate AI summary
    const summaryPrompt = `
Analyze this learning session and provide a comprehensive summary in Polish:

SESSION TYPE: ${sessionType}
SESSION METRICS: ${JSON.stringify(sessionMetrics, null, 2)}

INTERACTION HISTORY:
${interactionSummary.map(i => `
User: ${i.user_input}
AI: ${i.ai_response}
Response Time: ${i.response_time}ms
---`).join('\n')}

Please provide:
1. PODSUMOWANIE (2-3 sentences describing what was learned)
2. GŁÓWNE OSIĄGNIĘCIA (key achievements and progress)
3. OBSZARY DO POPRAWY (areas that need improvement)
4. NASTĘPNE KROKI (recommended next steps)
5. UWAGI DODATKOWE (any additional observations)

Keep the summary concise but informative, focusing on learning progress and pedagogical insights.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an educational AI that analyzes learning sessions and provides insightful summaries in Polish. Focus on learning progress, challenges, and recommendations.' 
          },
          { role: 'user', content: summaryPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices[0].message.content;

    // Create compact summary (first 200 characters)
    const compactSummary = summary.length > 200 
      ? summary.substring(0, 197) + '...'
      : summary;

    // Update session with summary
    const summaryData = {
      user_interactions: interactionSummary,
      session_metrics: sessionMetrics,
      ai_summary: summary,
      generated_at: new Date().toISOString()
    };

    if (sessionType === 'chat' || sessionType === 'lesson') {
      const { error: updateError } = await supabase
        .from('study_sessions')
        .update({
          summary_state: summaryData,
          summary_compact: compactSummary,
          completed_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else if (sessionType === 'unified') {
      const { error: updateError } = await supabase
        .from('unified_learning_sessions')
        .update({
          next_session_recommendations: summaryData,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (updateError) throw updateError;
    }

    console.log(`Session summary generated successfully for ${sessionId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: summary,
        compact: compactSummary,
        metrics: sessionMetrics
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating session summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});