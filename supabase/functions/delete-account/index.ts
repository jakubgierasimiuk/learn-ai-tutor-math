import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0'
import Stripe from 'https://esm.sh/stripe@14.21.0'

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Create client with user's JWT to get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Brak autoryzacji' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Nie udalo sie zweryfikowac uzytkownika' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Parse request body
    const { confirmEmail } = await req.json()

    // Verify email confirmation matches
    if (!confirmEmail || confirmEmail.toLowerCase() !== user.email?.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Email potwierdzajacy nie zgadza sie z adresem konta' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`User ${user.id} (${user.email}) requested account deletion`)

    // Cancel Stripe subscription before deleting account
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (stripeKey && user.email) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
        const customers = await stripe.customers.list({ email: user.email, limit: 1 })

        if (customers.data.length > 0) {
          const customer = customers.data[0]
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
          })

          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id)
            console.log(`Cancelled Stripe subscription ${sub.id} for user ${user.id}`)
          }

          console.log(`Stripe cleanup done for user ${user.id}: ${subscriptions.data.length} subscription(s) cancelled`)
        } else {
          console.log(`No Stripe customer found for user ${user.id}`)
        }
      } catch (stripeError) {
        console.error(`Stripe cancellation error for user ${user.id}:`, stripeError)
        // Continue with account deletion even if Stripe fails
        // Better to delete the account and manually handle Stripe than to block deletion
      }
    }

    // Create admin client for deletion operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Comprehensive list of all tables that need cleaning (same as delete-user-cascade)
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

      // Founding members
      'founding_members',
    ]

    let deletedTables = []
    let failedTables = []

    // Delete from all tables
    for (const table of tablesToClean) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', user.id)

        if (error) {
          console.error(`Error deleting from ${table}:`, error.message)
          failedTables.push({ table, error: error.message })
        } else {
          deletedTables.push(table)
        }
      } catch (err) {
        console.error(`Exception deleting from ${table}:`, err)
        failedTables.push({ table, error: String(err) })
      }
    }

    console.log(`Cleaned ${deletedTables.length} tables for user ${user.id}`)
    if (failedTables.length > 0) {
      console.log(`Failed to clean ${failedTables.length} tables:`, failedTables.map(f => f.table))
    }

    // Delete the user from auth.users
    console.log(`Deleting user from auth.users: ${user.id}`)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting from auth.users:', deleteError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nie udalo sie usunac konta z systemu uwierzytelniania'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log(`User ${user.id} (${user.email}) deleted successfully`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Konto zostalo pomyslnie usuniete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Delete account error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Wystapil nieoczekiwany blad' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
