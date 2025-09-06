import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[CLEANUP-SESSIONS] Function started, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('[CLEANUP-SESSIONS] CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[CLEANUP-SESSIONS] Starting session cleanup...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    console.log('[CLEANUP-SESSIONS] Environment variables loaded:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[CLEANUP-SESSIONS] Missing environment variables');
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('[CLEANUP-SESSIONS] Supabase client initialized');

    console.log('[CLEANUP-SESSIONS] Starting automated session cleanup...');

    // Find sessions that have been inactive for more than 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    console.log('[CLEANUP-SESSIONS] Looking for sessions older than:', twoHoursAgo);

    // Get stale study_sessions (chat and lesson)
    const { data: staleSessions, error: staleSessionsError } = await supabase
      .from('study_sessions')
      .select('id, user_id, session_type, started_at')
      .eq('status', 'in_progress')
      .lt('started_at', twoHoursAgo);

    console.log('[CLEANUP-SESSIONS] Found stale study_sessions:', staleSessions?.length || 0);

    if (staleSessionsError) {
      console.error('[CLEANUP-SESSIONS] Error finding stale study_sessions:', staleSessionsError);
    }

    // Get stale unified_learning_sessions
    const { data: staleUnifiedSessions, error: staleUnifiedError } = await supabase
      .from('unified_learning_sessions')
      .select('id, user_id, started_at')
      .is('completed_at', null)
      .lt('started_at', twoHoursAgo);

    console.log('[CLEANUP-SESSIONS] Found stale unified_learning_sessions:', staleUnifiedSessions?.length || 0);

    if (staleUnifiedError) {
      console.error('[CLEANUP-SESSIONS] Error finding stale unified sessions:', staleUnifiedError);
    }

    const allStaleSessions = [
      ...(staleSessions || []).map(s => ({ ...s, sessionType: s.session_type })),
      ...(staleUnifiedSessions || []).map(s => ({ ...s, sessionType: 'unified' }))
    ];

    console.log(`[CLEANUP-SESSIONS] Found ${allStaleSessions.length} stale sessions to process`);

    let processedCount = 0;
    let summaryGeneratedCount = 0;
    let directlyClosedCount = 0;

    // Process each stale session
    for (const session of allStaleSessions) {
      try {
        console.log(`[CLEANUP-SESSIONS] Processing stale session ${session.id} (type: ${session.sessionType})`);

        // Check interaction count to determine if summary should be generated
        const { data: interactions, error: interactionsError } = await supabase
          .from('learning_interactions')
          .select('id')
          .eq('session_id', session.id)
          .eq('user_id', session.user_id);

        if (interactionsError) {
          console.error(`[CLEANUP-SESSIONS] Error counting interactions for session ${session.id}:`, interactionsError);
          continue;
        }

        const interactionCount = interactions?.length || 0;
        console.log(`[CLEANUP-SESSIONS] Session ${session.id} has ${interactionCount} interactions`);

        if (interactionCount >= 3) {
          // Generate summary for sessions with meaningful content
          console.log(`[CLEANUP-SESSIONS] Generating summary for session ${session.id}`);
          await generateSessionSummary(session.id, session.sessionType, session.user_id, supabase);
          summaryGeneratedCount++;
        } else {
          // Close directly for sessions with minimal content
          console.log(`[CLEANUP-SESSIONS] Closing session ${session.id} without summary`);
          await closeSessionDirectly(session.id, session.sessionType, session.user_id, supabase);
          directlyClosedCount++;
        }

        processedCount++;

        // Add small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`[CLEANUP-SESSIONS] Error processing session ${session.id}:`, error);
      }
    }

    const result = {
      success: true,
      message: 'Session cleanup completed',
      stats: {
        totalFound: allStaleSessions.length,
        totalProcessed: processedCount,
        summariesGenerated: summaryGeneratedCount,
        directlyClosed: directlyClosedCount
      }
    };

    console.log(`[CLEANUP-SESSIONS] Cleanup completed:`, result.stats);

    return new Response(
      JSON.stringify(result), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[CLEANUP-SESSIONS] Error in cleanup-sessions:', { 
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
  console.log('[CLEANUP-SESSIONS] Starting summary generation for session:', sessionId, 'type:', sessionType);
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('[CLEANUP-SESSIONS] OpenAI API key not found');
      throw new Error('OpenAI API key not found');
    }
    
    console.log('[CLEANUP-SESSIONS] OpenAI API key found, proceeding...');

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
        console.error('[CLEANUP-SESSIONS] Error getting session data:', sessionError);
        throw sessionError;
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
        console.error('[CLEANUP-SESSIONS] Error getting unified session data:', sessionError);
        throw sessionError;
      }
      sessionData = session;
    }

    console.log('[CLEANUP-SESSIONS] Session data fetched successfully');

    // Get interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('learning_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('sequence_number', { ascending: true });

    if (interactionsError) {
      console.error('[CLEANUP-SESSIONS] Error getting interactions:', interactionsError);
      throw interactionsError;
    }

    const interactionsData = interactions || [];
    console.log('[CLEANUP-SESSIONS] Interactions fetched:', interactionsData.length);

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
Analyze this learning session that was automatically cleaned up and provide a brief summary in Polish:

SESSION TYPE: ${sessionType}
SESSION DURATION: ${sessionMetrics.total_duration_minutes} minutes
TOTAL INTERACTIONS: ${sessionMetrics.total_interactions}

INTERACTION HISTORY:
${interactionSummary.slice(0, 10).map(i => `
User: ${i.user_input}
AI: ${i.ai_response}
---`).join('\n')}

Provide a concise summary focusing on:
1. What was discussed/learned
2. Key progress made  
3. Any important concepts covered

Keep it brief since this was an auto-cleanup.
`;

    console.log('[CLEANUP-SESSIONS] Calling OpenAI API...');

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
            content: 'You are an educational AI that creates brief summaries of auto-cleaned learning sessions in Polish.' 
          },
          { role: 'user', content: summaryPrompt }
        ],
        max_tokens: 400,
        temperature: 0.6
      }),
    });

    console.log('[CLEANUP-SESSIONS] OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CLEANUP-SESSIONS] OpenAI API error:', response.status, response.statusText, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const summary = aiResponse.choices[0].message.content;
    console.log('[CLEANUP-SESSIONS] OpenAI summary generated, length:', summary?.length || 0);

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
      auto_closed: true,
      cleanup_reason: 'stale_session_cleanup'
    };

    console.log('[CLEANUP-SESSIONS] Updating session with summary...');

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
        
      if (updateError) {
        console.error('[CLEANUP-SESSIONS] Failed to update study_sessions:', updateError.message);
        throw new Error(`Failed to update session: ${updateError.message}`);
      }
    } else if (sessionType === 'unified') {
      const { error: updateError } = await supabase
        .from('unified_learning_sessions')
        .update({
          next_session_recommendations: summaryData,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('[CLEANUP-SESSIONS] Failed to update unified_learning_sessions:', updateError.message);
        throw new Error(`Failed to update session: ${updateError.message}`);
      }
    }

    console.log(`[CLEANUP-SESSIONS] Successfully generated cleanup summary for session ${sessionId}`);

  } catch (error) {
    console.error(`[CLEANUP-SESSIONS] Error generating cleanup summary for session ${sessionId}:`, error.message, error.stack);
    // Fall back to closing session without summary
    console.log(`[CLEANUP-SESSIONS] Falling back to direct session close for: ${sessionId}`);
    await closeSessionDirectly(sessionId, sessionType, userId, supabase);
  }
}

async function closeSessionDirectly(sessionId: string, sessionType: string, userId: string, supabase: any) {
  console.log('[CLEANUP-SESSIONS] Closing session directly:', sessionId, 'type:', sessionType);
  try {
    if (sessionType === 'chat' || sessionType === 'lesson') {
      const { error } = await supabase
        .from('study_sessions')
        .update({
          completed_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
        
      console.log('[CLEANUP-SESSIONS] Direct close result for study_sessions:', !error ? 'success' : error.message);
      
      if (error) {
        console.error('[CLEANUP-SESSIONS] Failed to close study_sessions:', error.message);
        throw new Error(`Failed to close session: ${error.message}`);
      }
    } else if (sessionType === 'unified') {
      const { error } = await supabase
        .from('unified_learning_sessions')
        .update({
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId);
        
      console.log('[CLEANUP-SESSIONS] Direct close result for unified_learning_sessions:', !error ? 'success' : error.message);
      
      if (error) {
        console.error('[CLEANUP-SESSIONS] Failed to close unified_learning_sessions:', error.message);
        throw new Error(`Failed to close session: ${error.message}`);
      }
    }

    console.log(`[CLEANUP-SESSIONS] Successfully closed session ${sessionId} without summary`);

  } catch (error) {
    console.error(`[CLEANUP-SESSIONS] Error closing session ${sessionId}:`, error.message, error.stack);
  }
}