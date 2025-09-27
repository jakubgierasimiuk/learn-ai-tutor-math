import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, reason = 'consent_revoked', force = false } = await req.json();

    if (!user_id) {
      throw new Error('user_id is required');
    }

    // Get user's marketing consent reward status
    const { data: rewardData, error: rewardError } = await supabaseClient
      .from('marketing_consent_rewards')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'granted')
      .single();

    if (rewardError || !rewardData) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No active reward found for clawback'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if still eligible for clawback (within 24 hours)
    const now = new Date();
    const clawbackDeadline = new Date(rewardData.clawback_eligible_until);
    
    if (!force && now > clawbackDeadline) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Clawback period expired'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Perform clawback: remove bonus days and tokens
    const bonusDays = rewardData.bonus_days || 0;
    const bonusTokens = rewardData.bonus_tokens || 0;

    // Update user subscription - remove bonus
    const { error: subError } = await supabaseClient.rpc('remove_subscription_bonus', {
      target_user_id: user_id,
      bonus_days: bonusDays,
      bonus_tokens: bonusTokens
    });

    if (subError) {
      console.error('Subscription clawback error:', subError);
      // Fallback - try direct update
      const { data: currentSub } = await supabaseClient
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (currentSub) {
        const currentEndDate = new Date(currentSub.trial_end_date || currentSub.subscription_end_date);
        currentEndDate.setDate(currentEndDate.getDate() - bonusDays);

        await supabaseClient
          .from('user_subscriptions')
          .update({
            trial_end_date: currentEndDate.toISOString(),
            bonus_tokens_granted: Math.max(0, (currentSub.bonus_tokens_granted || 0) - bonusTokens)
          })
          .eq('user_id', user_id);
      }
    }

    // Update reward status to clawed_back
    const { error: updateError } = await supabaseClient
      .from('marketing_consent_rewards')
      .update({
        status: 'clawed_back',
        marketing_consent_revoked_at: now.toISOString()
      })
      .eq('user_id', user_id);

    // Update rewards history
    const { error: historyError } = await supabaseClient
      .from('marketing_rewards_history')
      .update({
        status: 'clawed_back',
        clawed_back_at: now.toISOString(),
        clawback_reason: reason
      })
      .eq('user_id', user_id)
      .eq('source', 'marketing_consent')
      .eq('status', 'active');

    if (updateError || historyError) {
      console.error('Clawback update errors:', { updateError, historyError });
    }

    console.log('Marketing reward clawed back:', {
      user_id,
      reason,
      bonus_days: bonusDays,
      bonus_tokens: bonusTokens,
      clawback_time: now.toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Bonus został cofnięty z powodu braku zgody marketingowej',
      clawback_details: {
        bonus_days_removed: bonusDays,
        bonus_tokens_removed: bonusTokens,
        reason: reason
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Marketing consent clawback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});