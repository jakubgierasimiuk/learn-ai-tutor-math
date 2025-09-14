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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from auth header
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, consent_data } = await req.json();

    if (action === 'grant_reward') {
      // Get device fingerprint and IP from headers
      const deviceFingerprint = req.headers.get('x-device-fingerprint') || 
                               req.headers.get('user-agent') || 'unknown';
      const ipAddress = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 'unknown';

      // Check if user already received marketing consent reward
      const { data: existingReward } = await supabaseClient
        .from('marketing_consent_rewards')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'granted')
        .single();

      if (existingReward) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Bonus already claimed' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
      }

      // Check for fraud - same device fingerprint
      const { data: duplicateDevices } = await supabaseClient
        .from('marketing_rewards_history')
        .select('user_id')
        .eq('device_fingerprint', deviceFingerprint)
        .eq('source', 'marketing_consent');

      if (duplicateDevices && duplicateDevices.length > 0) {
        console.log('Potential fraud detected:', { deviceFingerprint, duplicateDevices });
        // Still grant but flag for review
      }

      // Grant reward: 2 days + 3000 tokens
      const bonusDays = 2;
      const bonusTokens = 3000;
      const clawbackEligibleUntil = new Date();
      clawbackEligibleUntil.setHours(clawbackEligibleUntil.getHours() + 24);

      // Update user subscription with bonus
      const { error: subError } = await supabaseClient.rpc('add_subscription_bonus', {
        target_user_id: user.id,
        bonus_days: bonusDays,
        bonus_tokens: bonusTokens
      });

      if (subError) {
        console.error('Subscription bonus error:', subError);
        // Fallback - try direct update
        const { data: currentSub } = await supabaseClient
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (currentSub) {
          const newEndDate = new Date(currentSub.trial_end_date || currentSub.subscription_end_date);
          newEndDate.setDate(newEndDate.getDate() + bonusDays);

          await supabaseClient
            .from('user_subscriptions')
            .update({
              trial_end_date: newEndDate.toISOString(),
              bonus_tokens_granted: (currentSub.bonus_tokens_granted || 0) + bonusTokens
            })
            .eq('user_id', user.id);
        }
      }

      // Record reward in history
      const { error: historyError } = await supabaseClient
        .from('marketing_rewards_history')
        .insert({
          user_id: user.id,
          reward_type: 'personalized_plan',
          amount: bonusTokens,
          description: 'Spersonalizowany Plan Nauki',
          source: 'marketing_consent',
          device_fingerprint: deviceFingerprint,
          ip_address: ipAddress,
          user_agent: req.headers.get('user-agent')
        });

      // Update marketing consent rewards status
      const { error: rewardError } = await supabaseClient
        .from('marketing_consent_rewards')
        .upsert({
          user_id: user.id,
          reward_granted: true,
          reward_granted_at: new Date().toISOString(),
          bonus_days: bonusDays,
          bonus_tokens: bonusTokens,
          clawback_eligible_until: clawbackEligibleUntil.toISOString(),
          status: 'granted',
          device_fingerprint: deviceFingerprint
        });

      if (historyError || rewardError) {
        console.error('Database errors:', { historyError, rewardError });
      }

      console.log('Marketing reward granted:', {
        user_id: user.id,
        bonus_days: bonusDays,
        bonus_tokens: bonusTokens,
        device_fingerprint: deviceFingerprint
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Otrzymałeś Spersonalizowany Plan Nauki + 2 dni + 3000 tokenów!',
        reward: {
          bonus_days: bonusDays,
          bonus_tokens: bonusTokens,
          description: 'Spersonalizowany Plan Nauki'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'check_eligibility') {
      // Check if user is eligible for marketing reward
      const { data: existingReward } = await supabaseClient
        .from('marketing_consent_rewards')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const isEligible = !existingReward || existingReward.status === 'pending';

      return new Response(JSON.stringify({
        eligible: isEligible,
        status: existingReward?.status || 'pending'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Marketing consent reward error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});