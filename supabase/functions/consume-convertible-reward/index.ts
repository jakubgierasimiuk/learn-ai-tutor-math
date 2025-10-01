import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsumeRewardRequest {
  rewardId: string;
  convertTo: 'days' | 'tokens';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { rewardId, convertTo }: ConsumeRewardRequest = await req.json();

    if (!rewardId || !convertTo || !['days', 'tokens'].includes(convertTo)) {
      throw new Error("Invalid request parameters");
    }

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the convertible reward
    const { data: reward, error: rewardError } = await supabaseService
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('user_id', user.id)
      .eq('kind', 'convertible')
      .eq('status', 'released')
      .single();

    if (rewardError || !reward) {
      throw new Error("Reward not found or not available for consumption");
    }

    // Check if convertible_to includes the requested type
    const convertibleTo = reward.meta?.convertible_to || [];
    if (!convertibleTo.includes(convertTo)) {
      throw new Error(`Reward cannot be converted to ${convertTo}`);
    }

    // Get the amount based on conversion type
    const amount = convertTo === 'days' 
      ? (reward.meta?.days_amount || reward.amount)
      : (reward.meta?.tokens_amount || 4000);

    const consumed_at = new Date().toISOString();

    // Mark original reward as consumed
    await supabaseService
      .from('rewards')
      .update({
        status: 'consumed',
        consumed_at: consumed_at,
        meta: {
          ...reward.meta,
          converted_to: convertTo,
          converted_amount: amount,
          converted_at: consumed_at,
        }
      })
      .eq('id', rewardId);

    // Create new specific reward
    await supabaseService.from('rewards').insert({
      user_id: user.id,
      kind: convertTo,
      amount: amount,
      status: 'released',
      source: reward.source,
      meta: {
        ...reward.meta,
        original_reward_id: rewardId,
        converted_from: 'convertible',
        converted_at: consumed_at,
      },
      released_at: consumed_at,
    });

    // Update user's subscription or token balance based on conversion
    if (convertTo === 'days') {
      // Add days to trial_end_date in user_subscriptions
      const { data: subscription } = await supabaseService
        .from('user_subscriptions')
        .select('trial_end_date')
        .eq('user_id', user.id)
        .single();

      const currentEndDate = subscription?.trial_end_date 
        ? new Date(subscription.trial_end_date)
        : new Date();
      
      // If end date is in the past, start from now
      const baseDate = currentEndDate > new Date() ? currentEndDate : new Date();
      const newEndDate = new Date(baseDate);
      newEndDate.setDate(newEndDate.getDate() + amount);

      await supabaseService
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          trial_end_date: newEndDate.toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      console.log(`Added ${amount} days to user ${user.id}, new end date: ${newEndDate.toISOString()}`);
    } else if (convertTo === 'tokens') {
      // For tokens, we create a positive adjustment in the system
      // The token system will read from rewards table with kind='tokens' and status='released'
      // This is already handled by the insert above, no additional action needed
      console.log(`Added ${amount} tokens to user ${user.id} via rewards table`);
    }

    // Log the conversion event
    await supabaseService.from('referral_events').insert({
      referral_id: reward.meta?.referral_id || null,
      event_type: 'reward_consumed',
      payload: {
        user_id: user.id,
        reward_id: rewardId,
        converted_to: convertTo,
        amount: amount,
        timestamp: consumed_at,
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Reward converted to ${amount} ${convertTo}`,
      converted_to: convertTo,
      amount: amount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in consume-convertible-reward function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});