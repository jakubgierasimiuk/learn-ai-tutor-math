import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-REFERRAL] ${step}${detailsStr}`);
};

interface ProcessReferralRequest {
  referralCode: string;
  action: 'register' | 'start_trial' | 'complete_subscription';
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

    const { referralCode, action }: ProcessReferralRequest = await req.json();
    
    logStep("Processing referral", { userId: user.id, referralCode, action });

    // Find the referral code
    const { data: codeData, error: codeError } = await supabaseClient
      .from("referral_codes")
      .select("user_id")
      .eq("code", referralCode)
      .eq("is_active", true)
      .single();

    if (codeError || !codeData) {
      throw new Error("Invalid or inactive referral code");
    }

    const referrerId = codeData.user_id;

    // Don't allow self-referral
    if (referrerId === user.id) {
      throw new Error("Cannot use your own referral code");
    }

    logStep("Valid referral code found", { referrerId });

    if (action === 'register') {
      // Check if user already has a referral record
      const { data: existingReferral } = await supabaseClient
        .from("referrals")
        .select("id")
        .eq("referred_user_id", user.id)
        .single();

      if (existingReferral) {
        logStep("User already has referral record");
        return new Response(JSON.stringify({ 
          success: true, 
          message: "User already registered with referral" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Create referral record
      const { error: referralError } = await supabaseClient
        .from("referrals")
        .insert({
          referrer_id: referrerId,
          referred_user_id: user.id,
          referral_code: referralCode,
          status: 'pending'
        });

      if (referralError) {
        throw new Error(`Error creating referral: ${referralError.message}`);
      }

      logStep("Referral record created");

    } else if (action === 'start_trial') {
      // Update referral to trial status
      const { error: updateError } = await supabaseClient
        .from("referrals")
        .update({
          status: 'trial',
          trial_started_at: new Date().toISOString()
        })
        .eq("referred_user_id", user.id)
        .eq("referral_code", referralCode);

      if (updateError) {
        throw new Error(`Error updating referral to trial: ${updateError.message}`);
      }

      logStep("Referral updated to trial status");

    } else if (action === 'complete_subscription') {
      // Complete the referral
      const { error: completeError } = await supabaseClient
        .from("referrals")
        .update({
          status: 'completed',
          subscription_activated_at: new Date().toISOString()
        })
        .eq("referred_user_id", user.id)
        .eq("referral_code", referralCode);

      if (completeError) {
        throw new Error(`Error completing referral: ${completeError.message}`);
      }

      // Create referral reward for the referrer
      const { error: rewardError } = await supabaseClient
        .from("referral_rewards")
        .insert({
          user_id: referrerId,
          referral_id: (await supabaseClient
            .from("referrals")
            .select("id")
            .eq("referred_user_id", user.id)
            .eq("referral_code", referralCode)
            .single()).data?.id,
          reward_type: 'free_month',
          amount: 1
        });

      if (rewardError) {
        logStep("Warning: Could not create reward", { error: rewardError.message });
      }

      logStep("Referral completed and reward created");
    }

    // Update referrer stats (this will trigger automatically via the database trigger)
    // The trigger_update_referral_stats function will be called

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Referral ${action} processed successfully` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-referral", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});