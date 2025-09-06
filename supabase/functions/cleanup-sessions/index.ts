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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting automated session cleanup...');

    // Find sessions that have been inactive for more than 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Get stale study_sessions (chat and lesson)
    const { data: staleSessions, error: staleSessionsError } = await supabase
      .from('study_sessions')
      .select('id, user_id, session_type, started_at')
      .eq('status', 'in_progress')
      .lt('started_at', twoHoursAgo);

    if (staleSessionsError) {
      console.error('Error finding stale study_sessions:', staleSessionsError);
    }

    // Get stale unified_learning_sessions
    const { data: staleUnifiedSessions, error: staleUnifiedError } = await supabase
      .from('unified_learning_sessions')
      .select('id, user_id, started_at')
      .is('completed_at', null)
      .lt('started_at', twoHoursAgo);

    if (staleUnifiedError) {
      console.error('Error finding stale unified sessions:', staleUnifiedError);
    }

    const allStaleSessions = [
      ...(staleSessions || []).map(s => ({ ...s, sessionType: s.session_type })),
      ...(staleUnifiedSessions || []).map(s => ({ ...s, sessionType: 'unified' }))
    ];

    console.log(`Found ${allStaleSessions.length} stale sessions to process`);

    let processedCount = 0;
    let summaryGeneratedCount = 0;
    let directlyClosedCount = 0;

    // Process each stale session
    for (const session of allStaleSessions) {
      try {
        console.log(`Processing stale session ${session.id} (type: ${session.sessionType})`);

        // Check interaction count to determine if summary should be generated
        const { data: interactions, error: interactionsError } = await supabase
          .from('learning_interactions')
          .select('id')
          .eq('session_id', session.id)
          .eq('user_id', session.user_id);

        if (interactionsError) {
          console.error(`Error counting interactions for session ${session.id}:`, interactionsError);
          continue;
        }

        const interactionCount = interactions?.length || 0;
        console.log(`Session ${session.id} has ${interactionCount} interactions`);

        if (interactionCount >= 3) {
          // Generate summary for sessions with meaningful content
          console.log(`Generating summary for session ${session.id}`);
          await generateSessionSummary(session.id, session.sessionType, session.user_id, supabase);
          summaryGeneratedCount++;
        } else {
          // Close directly for sessions with minimal content
          console.log(`Closing session ${session.id} without summary`);
          await closeSessionDirectly(session.id, session.sessionType, session.user_id, supabase);
          directlyClosedCount++;
        }

        processedCount++;

        // Add small delay to avoid overwhelming the system
        await new Deno.Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing session ${session.id}:`, error);
      }
    }

    console.log(`Cleanup completed: ${processedCount} sessions processed, ${summaryGeneratedCount} with summaries, ${directlyClosedCount} closed directly`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Session cleanup completed',
        stats: {
          totalFound: allStaleSessions.length,
          totalProcessed: processedCount,
          summariesGenerated: summaryGeneratedCount,
          directlyClosed: directlyClosedCount
        }
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cleanup-sessions:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateSessionSummary(sessionId: string, sessionType: string, userId: string, supabase: any) {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

    // Get session data
    let sessionData;
    if (sessionType === 'chat' || sessionType === 'lesson') {
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
    }

    // Get interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('learning_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('sequence_number', { ascending: true });

    if (interactionsError) throw interactionsError;

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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
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
      auto_closed: true,
      cleanup_reason: 'stale_session_cleanup'
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

    console.log(`Successfully generated cleanup summary for session ${sessionId}`);

  } catch (error) {
    console.error(`Error generating cleanup summary for session ${sessionId}:`, error);
    throw error;
  }
}

async function closeSessionDirectly(sessionId: string, sessionType: string, userId: string, supabase: any) {
  try {
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

    console.log(`Successfully closed session ${sessionId} without summary`);

  } catch (error) {
    console.error(`Error closing session ${sessionId}:`, error);
    throw error;
  }
}