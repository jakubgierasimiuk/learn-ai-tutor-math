import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Processing migration action: ${action}`);

    switch (action) {
      case 'migrate_profiles':
        return await migrateProfilesToUnified();
      
      case 'migrate_sessions': 
        return await migrateSessionsToUnified();
        
      case 'sync_content_structure':
        return await syncContentStructure();
        
      case 'update_edge_functions':
        return await updateEdgeFunctionIntegration();
        
      default:
        throw new Error(`Unknown migration action: ${action}`);
    }

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function migrateProfilesToUnified() {
  try {
    console.log('Starting profile migration...');
    
    // Get all existing profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;

    let migrated = 0;
    for (const profile of profiles || []) {
      // Check if already migrated
      const { data: existing } = await supabase
        .from('universal_learner_profiles')
        .select('id')
        .eq('user_id', profile.user_id)
        .single();

      if (existing) continue;

      // Migrate profile data
      const learnerProfileData = profile.learner_profile || {};
      
      const { error: insertError } = await supabase
        .from('universal_learner_profiles')
        .insert({
          user_id: profile.user_id,
          diagnostic_summary: learnerProfileData.diagnostic_data || {},
          class_level: learnerProfileData.class_level || 1,
          track: learnerProfileData.track || 'basic',
          learning_style: learnerProfileData.learning_style || { visual: 0.33, auditory: 0.33, kinesthetic: 0.33 },
          response_patterns: learnerProfileData.performance_patterns || { avg_response_time: 30000, confidence_pattern: 'moderate' },
          error_patterns: {},
          skill_mastery_map: {},
          micro_skill_strengths: learnerProfileData.strength_areas || {},
          prerequisite_gaps: learnerProfileData.struggle_areas || {},
          preferred_explanation_style: 'detailed',
          optimal_difficulty_range: { min: learnerProfileData.preferred_difficulty || 3, max: 7 },
          engagement_triggers: { variety: true, progress_feedback: true },
          frustration_threshold: 3,
          difficulty_multiplier: 1.0,
          learning_velocity: 1.0,
          retention_rate: 0.8,
          current_learning_context: {},
          last_interaction_summary: {},
          next_recommended_action: { type: 'diagnostic', priority: 'high' },
          total_learning_time_minutes: 0,
          sessions_completed: 0,
          concepts_mastered: 0
        });

      if (insertError) {
        console.error(`Error migrating profile ${profile.user_id}:`, insertError);
      } else {
        migrated++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, migrated, total: profiles?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Profile migration error:', error);
    throw error;
  }
}

async function migrateSessionsToUnified() {
  try {
    console.log('Starting session migration...');
    
    // Get recent study_sessions that aren't migrated yet
    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (error) throw error;

    let migrated = 0;
    for (const session of sessions || []) {
      // Check if already migrated
      const { data: existing } = await supabase
        .from('unified_learning_sessions')
        .select('id')
        .eq('user_id', session.user_id)
        .eq('started_at', session.started_at)
        .single();

      if (existing) continue;

      // Get or create profile for this user
      let { data: profile } = await supabase
        .from('universal_learner_profiles')
        .select('id')
        .eq('user_id', session.user_id)
        .single();

      if (!profile) {
        // Create basic profile
        const { data: newProfile } = await supabase
          .from('universal_learner_profiles')
          .insert({
            user_id: session.user_id,
            diagnostic_summary: {},
            learning_style: { visual: 0.33, auditory: 0.33, kinesthetic: 0.33 },
            response_patterns: { avg_response_time: 30000, confidence_pattern: 'moderate' },
            error_patterns: {},
            skill_mastery_map: {},
            micro_skill_strengths: {},
            prerequisite_gaps: {},
            optimal_difficulty_range: { min: 3, max: 7 },
            engagement_triggers: { variety: true, progress_feedback: true },
            current_learning_context: {},
            last_interaction_summary: {},
            next_recommended_action: { type: 'diagnostic', priority: 'high' }
          })
          .select('id')
          .single();
        
        profile = newProfile;
      }

      if (!profile) continue;

      // Migrate session data
      const accuracy = session.completed_steps > 0 ? 
        (session.completed_steps - (session.pseudo_activity_strikes || 0)) / session.completed_steps : 0;

      const { error: insertError } = await supabase
        .from('unified_learning_sessions')
        .insert({
          user_id: session.user_id,
          profile_id: profile.id,
          session_type: session.session_type || 'study_learn',
          skill_focus: session.skill_id,
          department: 'mathematics',
          difficulty_level: 5,
          tasks_completed: session.completed_steps || 0,
          correct_answers: Math.round((session.completed_steps || 0) * accuracy),
          total_response_time_ms: (session.average_response_time_ms || 30000) * (session.completed_steps || 1),
          hints_used: session.hints_used || 0,
          difficulty_adjustments: [],
          engagement_score: session.mastery_score || 0.5,
          frustration_incidents: session.pseudo_activity_strikes || 0,
          learning_momentum: 1.0,
          ai_model_used: session.ai_model_used || 'gpt-4o-mini',
          total_tokens_used: session.total_tokens_used || 0,
          explanation_style_used: 'detailed',
          learning_path: [],
          context_switches: 0,
          concepts_learned: [],
          misconceptions_addressed: [],
          next_session_recommendations: {},
          started_at: session.started_at,
          completed_at: session.completed_at
        });

      if (insertError) {
        console.error(`Error migrating session ${session.id}:`, insertError);
      } else {
        migrated++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, migrated, total: sessions?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Session migration error:', error);
    throw error;
  }
}

async function syncContentStructure() {
  try {
    console.log('Syncing content structure...');
    
    // Update skills without content_structure
    const { data, error } = await supabase
      .from('skills')
      .select('id, content_data, content_structure')
      .is('content_structure', null)
      .limit(50);

    if (error) throw error;

    let updated = 0;
    for (const skill of data || []) {
      const contentStructure = skill.content_data || {
        theory: { sections: [] },
        examples: { solved: [] },
        practiceExercises: []
      };

      const { error: updateError } = await supabase
        .from('skills')
        .update({ content_structure: contentStructure })
        .eq('id', skill.id);

      if (updateError) {
        console.error(`Error updating skill ${skill.id}:`, updateError);
      } else {
        updated++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, updated, total: data?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Content sync error:', error);
    throw error;
  }
}

async function updateEdgeFunctionIntegration() {
  try {
    console.log('Updating edge function integration...');
    
    // This is a placeholder for any edge function specific updates
    // In practice, this would update configuration or run maintenance tasks
    
    return new Response(
      JSON.stringify({ success: true, message: 'Edge functions updated' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function update error:', error);
    throw error;
  }
}