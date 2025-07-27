import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLAIM-REWARD] ${step}${detailsStr}`);
};

interface ClaimRewardRequest {
  rewardId: string;
  deliveryInfo: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { rewardId, deliveryInfo }: ClaimRewardRequest = await req.json();
    
    logStep("Processing reward claim", { userId: user.id, rewardId });

    // Get reward details
    const { data: reward, error: rewardError } = await supabaseClient
      .from("rewards_catalog")
      .select("*")
      .eq("id", rewardId)
      .eq("is_active", true)
      .single();

    if (rewardError || !reward) {
      throw new Error("Reward not found or inactive");
    }

    // Get user's current stats
    const { data: userStats, error: statsError } = await supabaseClient
      .from("user_referral_stats")
      .select("available_points")
      .eq("user_id", user.id)
      .single();

    if (statsError || !userStats) {
      throw new Error("User referral stats not found");
    }

    // Check if user has enough points
    if (userStats.available_points < reward.points_required) {
      throw new Error(`Insufficient points. Required: ${reward.points_required}, Available: ${userStats.available_points}`);
    }

    logStep("User has sufficient points", { 
      required: reward.points_required, 
      available: userStats.available_points 
    });

    // Create reward claim
    const { data: claim, error: claimError } = await supabaseClient
      .from("reward_claims")
      .insert({
        user_id: user.id,
        reward_id: rewardId,
        points_spent: reward.points_required,
        status: 'pending',
        delivery_info: deliveryInfo
      })
      .select("*")
      .single();

    if (claimError) {
      throw new Error(`Error creating reward claim: ${claimError.message}`);
    }

    // Update user's available points by triggering stats recalculation
    const { error: updateError } = await supabaseClient.rpc('update_referral_stats', {
      p_user_id: user.id
    });

    if (updateError) {
      logStep("Warning: Could not update stats", { error: updateError.message });
    }

    logStep("Reward claim created successfully", { claimId: claim.id });

    return new Response(JSON.stringify({ 
      success: true, 
      claimId: claim.id,
      message: "Reward claimed successfully! You will receive confirmation via email.",
      pointsSpent: reward.points_required
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in claim-reward", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});