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

    // Delete from learner_intelligence first (this is the one causing the FK constraint error)
    const { error: learnerError } = await supabaseAdmin
      .from('learner_intelligence')
      .delete()
      .eq('user_id', userId)

    if (learnerError) {
      console.error('Error deleting learner_intelligence:', learnerError)
    }

    // Delete from other tables that might not have CASCADE
    const tablesToClean = [
      'learning_profiles',
      'cognitive_load_profiles',
      'emotional_learning_states',
      'flow_state_analytics',
      'learning_predictions',
      'marketing_consent_rewards',
      'marketing_consents',
      'devices',
      'fraud_signals',
    ]

    for (const table of tablesToClean) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', userId)
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error)
      }
    }

    // Now delete the user from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw deleteError
    }

    console.log(`User ${userId} deleted successfully`)

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
