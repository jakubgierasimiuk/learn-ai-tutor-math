import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[AUTO-CLOSE-SESSION] Function started, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('[AUTO-CLOSE-SESSION] CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, sessionType, userId } = await req.json();
    console.log('[AUTO-CLOSE-SESSION] Request data:', { sessionId, sessionType, userId });

    if (!sessionId || !sessionType || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: sessionId, sessionType, userId' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('[AUTO-CLOSE-SESSION] Environment variables loaded:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[AUTO-CLOSE-SESSION] Missing environment variables');
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('[AUTO-CLOSE-SESSION] Supabase client initialized');

    console.log(`Auto-closing session ${sessionId} (type: ${sessionType}) for user ${userId}`);

    // Get interaction count to determine if summary should be generated
    const { data: interactions, error: interactionsError } = await supabase
      .from('learning_interactions')
      .select('id')
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (interactionsError) {
      console.error('Error counting interactions:', interactionsError);
    }

    const interactionCount = interactions?.length || 0;
    console.log(`Session ${sessionId} has ${interactionCount} interactions`);

    // If session has meaningful interactions (>= 3), generate summary
    let shouldGenerateSummary = interactionCount >= 3;

    if (shouldGenerateSummary) {
      console.log(`Generating summary for session ${sessionId} with ${interactionCount} interactions`);
      
      // Call session-summary function in background
      EdgeRuntime.waitUntil(
        generateSessionSummary(sessionId, sessionType, userId, supabase)
      );
    } else {
      console.log(`Closing session ${sessionId} without summary (only ${interactionCount} interactions)`);
      
      // Just close the session without generating summary
      EdgeRuntime.waitUntil(
        closeSessionDirectly(sessionId, sessionType, userId, supabase)
      );
    }

    // Return immediate response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Session close process initiated',
        willGenerateSummary: shouldGenerateSummary,
        interactionCount
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AUTO-CLOSE-SESSION] Error in auto-close-session:', { 
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateSessionSummary(sessionId: string, sessionType: string, userId: string, supabase: any) {
  console.log('[AUTO-CLOSE-SESSION] Background: Starting summary generation for session:', sessionId, 'type:', sessionType);
  try {
    console.log(`[AUTO-CLOSE-SESSION] Background: Generating summary for session ${sessionId}`);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('[AUTO-CLOSE-SESSION] Background: OpenAI API key not found');
      throw new Error('OpenAI API key not found');
    }
    
    console.log('[AUTO-CLOSE-SESSION] Background: OpenAI API key found, proceeding...');

    // Get session data
    let sessionData;
    if (sessionType === 'chat' || sessionType === 'lesson') {
      const { data: session, error: sessionError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError) {
        console.error('Error getting session data:', sessionError);
        return;
      }
      sessionData = session;
    } else if (sessionType === 'unified') {
      const { data: session, error: sessionError } = await supabase
        .from('unified_learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError) {
        console.error('Error getting unified session data:', sessionError);
        return;
      }
      sessionData = session;
    }

    // Get interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('learning_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('sequence_number', { ascending: true });

    if (interactionsError) {
      console.error('Error getting interactions:', interactionsError);
      return;
    }

    const interactionsData = interactions || [];

    // Prepare summary data
    const interactionSummary = interactionsData.map((interaction, index) => ({
      sequence: index + 1,
      user_input: interaction.user_input || '',
      ai_response: interaction.ai_response || '',
      response_time: interaction.response_time_ms,
      interaction_type: interaction.interaction_type
    }));

    const sessionMetrics = {
      total_interactions: interactionsData.length,
      total_duration_minutes: Math.round((Date.now() - new Date(sessionData.started_at).getTime()) / 60000),
      average_response_time: interactionsData.length > 0 
        ? Math.round(interactionsData.reduce((sum, i) => sum + (i.response_time_ms || 0), 0) / interactionsData.length)
        : 0,
      skills_practiced: sessionData.skill_id ? [sessionData.skill_id] : [],
      hints_used: sessionData.hints_used || 0,
      early_reveals: sessionData.early_reveals || 0
    };

    // Generate AI summary
    const summaryPrompt = `
Analyze this learning session that was automatically closed and provide a brief summary in Polish:

SESSION TYPE: ${sessionType}
SESSION METRICS: ${JSON.stringify(sessionMetrics, null, 2)}

INTERACTION HISTORY:
${interactionSummary.map(i => `
User: ${i.user_input}
AI: ${i.ai_response}
---`).join('\n')}

Provide a concise summary focusing on:
1. What was discussed/learned
2. Key progress made
3. Areas that need attention

Keep it brief since this was an auto-closed session.
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
            content: 'You are an educational AI that creates brief summaries of auto-closed learning sessions in Polish.' 
          },
          { role: 'user', content: summaryPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status}`);
      return;
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices[0].message.content;

    // Create compact summary
    const compactSummary = summary.length > 200 
      ? summary.substring(0, 197) + '...'
      : summary;

    // Update session with summary
    const summaryData = {
      user_interactions: interactionSummary,
      session_metrics: sessionMetrics,
      ai_summary: summary,
      generated_at: new Date().toISOString(),
      auto_closed: true
    };

    if (sessionType === 'chat' || sessionType === 'lesson') {
      await supabase
        .from('study_sessions')
        .update({
          summary_state: summaryData,
          summary_compact: compactSummary,
          completed_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
    } else if (sessionType === 'unified') {
      await supabase
        .from('unified_learning_sessions')
        .update({
          next_session_recommendations: summaryData,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
    }

    console.log(`Background: Successfully generated summary for session ${sessionId}`);

  } catch (error) {
    console.error(`Background: Error generating summary for session ${sessionId}:`, error);
  }
}

async function closeSessionDirectly(sessionId: string, sessionType: string, userId: string, supabase: any) {
  try {
    console.log(`Background: Closing session ${sessionId} directly (no summary)`);

    if (sessionType === 'chat' || sessionType === 'lesson') {
      await supabase
        .from('study_sessions')
        .update({
          completed_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
    } else if (sessionType === 'unified') {
      await supabase
        .from('unified_learning_sessions')
        .update({
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
    }

    console.log(`Background: Successfully closed session ${sessionId} without summary`);

  } catch (error) {
    console.error(`Background: Error closing session ${sessionId}:`, error);
  }
}