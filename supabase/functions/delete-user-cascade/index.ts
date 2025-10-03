import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { userId } = await req.json()

    if (!userId) {
      throw new Error('userId is required')
    }

    console.log(`Deleting user cascade: ${userId}`)

    // Comprehensive list of all tables that need cleaning
    const tablesToClean = [
      // Intelligence and learning profiles
      'learner_intelligence',
      'learning_profiles',
      'cognitive_load_profiles',
      'emotional_learning_states',
      'flow_state_analytics',
      'learning_predictions',
      
      // Learning data
      'learning_interactions',
      'learning_phase_progress',
      'unified_learning_sessions',
      'user_lesson_progress',
      'diagnostic_tests',
      'diagnostic_sessions',
      'diagnostic_item_attempts',
      'spaced_repetition_cards',
      
      // User data
      'profiles',
      'user_referral_stats',
      'user_streaks',
      'user_achievements',
      'user_subscriptions',
      
      // Marketing and rewards
      'marketing_consent_rewards',
      'marketing_consents',
      'marketing_rewards_history',
      'referral_rewards',
      'rewards',
      'convertible_rewards',
      
      // Fraud and security
      'devices',
      'fraud_signals',
      
      // Social and gamification
      'daily_stats',
      'leaderboards',
      'learning_goals',
      'goal_reminders',
      'points_history',
      'badges',
      
      // Session and activity
      'study_sessions',
      'ai_conversation_log',
      'app_error_logs',
      'app_event_logs',
      
      // Feedback and surveys
      'user_surveys',
      'survey_responses',
      'feature_feedback',
      
      // Study groups and social
      'study_group_members',
      'session_participants',
      'challenges',
      
      // User roles
      'user_roles',
    ]

    let deletedTables = []
    let failedTables = []

    // Delete from all tables
    for (const table of tablesToClean) {
      try {
        const { error, count } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', userId)
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error.message)
          failedTables.push({ table, error: error.message })
        } else {
          deletedTables.push(table)
          if (count && count > 0) {
            console.log(`Deleted ${count} records from ${table}`)
          }
        }
      } catch (err) {
        console.error(`Exception deleting from ${table}:`, err)
        failedTables.push({ table, error: String(err) })
      }
    }

    console.log(`Cleaned ${deletedTables.length} tables successfully`)
    if (failedTables.length > 0) {
      console.log(`Failed to clean ${failedTables.length} tables:`, failedTables)
    }

    // Now delete the user from auth.users
    console.log(`Deleting user from auth.users: ${userId}`)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting from auth.users:', deleteError)
      throw deleteError
    }

    console.log(`User ${userId} deleted successfully from auth.users`)

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
