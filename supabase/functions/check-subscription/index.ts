import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let subscriptionType: 'free' | 'paid' | 'super' = 'free';
    let tokenLimitSoft = 20000; // Default free tier soft limit
    let tokenLimitHard = 25000; // Default free tier hard limit
    let subscriptionEnd = null;
    let stripeCustomerId = null;
    
    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      stripeCustomerId = customerId;
      logStep("Found Stripe customer", { customerId });

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
        
        // Determine subscription type from price
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        if (amount >= 9999) { // Super plan
          subscriptionType = 'super';
          tokenLimitSoft = 999999999;
          tokenLimitHard = 999999999;
        } else if (amount >= 2999) { // Paid plan
          subscriptionType = 'paid';
          tokenLimitSoft = 999999999;
          tokenLimitHard = 999999999;
        }
        
        logStep("Determined subscription details", { subscriptionType, tokenLimitSoft, tokenLimitHard, amount });
      } else {
        logStep("No active subscription found");
      }
    } else {
      logStep("No Stripe customer found");
    }

    // Get dynamic limits from subscription_plans table
    const { data: planData, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('token_limit_soft, token_limit_hard')
      .eq('plan_type', subscriptionType)
      .eq('is_active', true)
      .single();

    if (!planError && planData) {
      tokenLimitSoft = planData.token_limit_soft;
      tokenLimitHard = planData.token_limit_hard;
      logStep("Dynamic limits loaded", { tokenLimitSoft, tokenLimitHard });
    }

    // Calculate total token usage from registration (lifetime, not monthly)
    const { data: tokenUsageData, error: tokenError } = await supabaseClient.rpc('get_user_total_token_usage', {
      target_user_id: user.id
    });
    
    const tokensUsedTotal = tokenUsageData || 0;
    logStep("Token usage calculated", { tokensUsedTotal });

    // Update user subscription in database
    const { error: upsertError } = await supabaseClient
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        subscription_type: subscriptionType,
        status: 'active',
        token_limit_soft: tokenLimitSoft,
        token_limit_hard: tokenLimitHard,
        tokens_used_total: tokensUsedTotal,
        stripe_customer_id: stripeCustomerId,
        subscription_end_date: subscriptionEnd,
        updated_at: new Date().toISOString(),
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      logStep("Error updating subscription", { error: upsertError });
      throw new Error(`Database update error: ${upsertError.message}`);
    }

    logStep("Updated database with subscription info", { 
      subscriptionType, 
      tokenLimitSoft,
      tokenLimitHard, 
      tokensUsedTotal,
      subscriptionEnd 
    });

    return new Response(JSON.stringify({
      subscription_type: subscriptionType,
      token_limit_soft: tokenLimitSoft,
      token_limit_hard: tokenLimitHard,
      tokens_used_total: tokensUsedTotal,
      subscription_end: subscriptionEnd,
      status: 'active'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});