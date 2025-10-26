import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all founding members
    const { data: foundingMembers, error: fmError } = await supabase
      .from('founding_members')
      .select('user_id, created_at, email')
      .eq('status', 'registered');

    if (fmError) {
      console.error('Error fetching founding members:', fmError);
      throw fmError;
    }

    const results = [];

    for (const member of foundingMembers || []) {
      const foundingDate = new Date(member.created_at);
      const expiryDate = new Date(foundingDate);
      expiryDate.setDate(expiryDate.getDate() + 30);

      // Update subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_type: 'paid',
          subscription_end_date: expiryDate.toISOString(),
          billing_cycle_start: foundingDate.toISOString(),
          token_limit_soft: 10000000,
          token_limit_hard: 10000000,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', member.user_id);

      if (updateError) {
        console.error(`Error updating ${member.email}:`, updateError);
        results.push({
          email: member.email,
          success: false,
          error: updateError.message
        });
      } else {
        console.log(`Fixed subscription for ${member.email}`);
        results.push({
          email: member.email,
          success: true,
          expiryDate: expiryDate.toISOString()
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fixed ${results.filter(r => r.success).length} founding member subscriptions`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
