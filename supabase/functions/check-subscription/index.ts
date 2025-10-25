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
    
    // Get subscription plans
    const { data: plans } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true);

    const freeLimit = plans?.find(p => p.plan_type === 'free');
    const paidLimit = plans?.find(p => p.plan_type === 'paid');
    const expiredLimit = plans?.find(p => p.plan_type === 'expired');
    logStep("Plans loaded", { free: freeLimit?.token_limit_hard, paid: paidLimit?.token_limit_hard, expired: expiredLimit?.token_limit_hard });

    // Calculate current token usage
    const { data: tokenUsageData, error: tokenError } = await supabaseClient.rpc('get_user_total_token_usage', {
      target_user_id: user.id
    });
    
    const tokensUsedTotal = tokenUsageData || 0;
    logStep("Token usage calculated", { tokensUsedTotal });

    let subscriptionType: 'free' | 'paid' | 'super' | 'expired' | 'limited_free' = 'free';
    let subscriptionStatus = 'active';
    let subscriptionEnd: string | null = null;
    let stripeCustomerId: string | null = null;
    let monthlyTokensUsed = 0;
    let billingCycleStart: string | null = null;

    // Check for Stripe customer and ALL subscription statuses
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length > 0) {
      const customer = customers.data[0];
      stripeCustomerId = customer.id;

      // Get ALL subscriptions (not just active ones)
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        expand: ['data.items.data.price']
      });

      logStep("Stripe subscriptions found", { count: subscriptions.data.length });

      if (subscriptions.data.length > 0) {
        // Get the most recent subscription
        const subscription = subscriptions.data[0];
        const price = subscription.items.data[0]?.price;
        
        logStep("Subscription status", {
          status: subscription.status,
          priceAmount: price?.unit_amount
        });

        // Map Stripe status to our application logic
        if (subscription.status === 'active') {
          if (price && price.unit_amount === 4999) { // 49.99 PLN - now 10M tokens
            subscriptionType = 'paid';
            subscriptionStatus = 'active';
            subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
            billingCycleStart = new Date(subscription.current_period_start * 1000).toISOString();
          }
        } else if (subscription.status === 'past_due') {
          // Past due = immediate downgrade to free
          subscriptionType = 'free';
          subscriptionStatus = 'active';
          logStep("Past due subscription - downgraded to free");
        } else if (['canceled', 'incomplete', 'incomplete_expired', 'unpaid'].includes(subscription.status)) {
          // Canceled = expired with 5k tokens
          subscriptionType = 'expired';
          subscriptionStatus = 'active';
          subscriptionEnd = subscription.canceled_at ? 
            new Date(subscription.canceled_at * 1000).toISOString() : 
            new Date(subscription.current_period_end * 1000).toISOString();
          logStep("Canceled subscription - moved to expired plan");
        }
      }
    } else {
      logStep("No Stripe customer found");
    }

    // Get current subscription from database to check for transitions and trial status
    const { data: currentSub } = await supabaseClient
      .from('user_subscriptions')
      .select('subscription_type, monthly_tokens_used, trial_end_date, billing_cycle_start, subscription_end_date, token_limit_soft, token_limit_hard')
      .eq('user_id', user.id)
      .single();

    // Check if user has active paid subscription from database (e.g., founding members)
    if (currentSub?.subscription_type === 'paid' && currentSub.subscription_end_date) {
      const subEndDate = new Date(currentSub.subscription_end_date);
      const now = new Date();
      
      if (now <= subEndDate) {
        // Active paid subscription (non-Stripe, e.g., founding member)
        subscriptionType = 'paid';
        subscriptionEnd = currentSub.subscription_end_date;
        billingCycleStart = currentSub.billing_cycle_start || billingCycleStart;
        
        logStep("Active paid subscription from database (founding member)", {
          subscriptionEnd,
          tokenLimitHard: currentSub.token_limit_hard
        });
      } else {
        // Paid subscription expired - will be handled by expiry logic below
        logStep("Paid subscription expired, will downgrade to limited_free");
      }
    }

    // Check for trial expiry and handle transitions
    let isTrialExpired = false;
    if (currentSub) {
      monthlyTokensUsed = currentSub.monthly_tokens_used || 0;
      billingCycleStart = currentSub.billing_cycle_start || billingCycleStart;
      
      // Check if free trial has expired
      if (currentSub.subscription_type === 'free' && currentSub.trial_end_date) {
        const trialEndDate = new Date(currentSub.trial_end_date);
        if (new Date() > trialEndDate) {
          isTrialExpired = true;
          subscriptionType = 'limited_free';
          monthlyTokensUsed = 0; // Reset for new limited_free plan
          logStep("Trial expired - downgraded to limited_free");
        }
      }

      // Check if founding member paid subscription expired (no Stripe)
      if (currentSub.subscription_type === 'paid') {
        const subscriptionEndDate = currentSub.subscription_end_date 
          ? new Date(currentSub.subscription_end_date) 
          : null;
        
        // If subscription expired and no active Stripe subscription
        if (subscriptionEndDate && new Date() > subscriptionEndDate && !stripeCustomerId) {
          subscriptionType = 'limited_free';
          monthlyTokensUsed = 0;
          subscriptionEnd = null;
          logStep("Founding member subscription expired - downgraded to limited_free");
        }
      }
      
      // Check if free account exceeded token limits (should move to expired)
      if (currentSub.subscription_type === 'free' && subscriptionType === 'free') {
        const hardLimit = freeLimit?.token_limit_hard || 25000;
        if (tokensUsedTotal >= hardLimit) {
          subscriptionType = 'expired';
          monthlyTokensUsed = 0;
          logStep("Free account exceeded hard token limit - moved to expired");
        }
      }
      
      // Handle subscription type transitions
      if (currentSub.subscription_type === 'paid' && subscriptionType === 'expired') {
        // Transition from paid to expired - reset monthly tokens and set to expired plan
        monthlyTokensUsed = 0;
        logStep("Transition: Paid -> Expired (5k tokens granted)");
      } else if (currentSub.subscription_type === 'free' && subscriptionType === 'paid') {
        // Transition from free to paid - reset monthly tokens for new billing cycle
        monthlyTokensUsed = 0;
        logStep("Transition: Free -> Paid (10M tokens granted)");
      }
    } else {
      // New user - set trial end date for 7 days from now
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      billingCycleStart = new Date().toISOString();
      logStep("New user - setting 7-day trial", { trialEndDate: trialEndDate.toISOString() });
    }

    // Get the appropriate limits based on subscription type
    const limitedFreeLimit = plans?.find(p => p.plan_type === 'limited_free');
    let finalLimits;
    if (subscriptionType === 'paid') {
      finalLimits = {
        tokenLimitSoft: paidLimit?.token_limit_soft || 10000000,
        tokenLimitHard: paidLimit?.token_limit_hard || 10000000
      };
    } else if (subscriptionType === 'expired') {
      finalLimits = {
        tokenLimitSoft: expiredLimit?.token_limit_soft || 5000,
        tokenLimitHard: expiredLimit?.token_limit_hard || 5000
      };
    } else if (subscriptionType === 'limited_free') {
      finalLimits = {
        tokenLimitSoft: limitedFreeLimit?.token_limit_soft || 1000,
        tokenLimitHard: limitedFreeLimit?.token_limit_hard || 1200
      };
    } else {
      // Free trial (7 days with 25k tokens)
      finalLimits = {
        tokenLimitSoft: freeLimit?.token_limit_soft || 20000,
        tokenLimitHard: freeLimit?.token_limit_hard || 25000
      };
    }

    // Prepare trial end date for new users or trial expiry handling
    let trialEndDate = currentSub?.trial_end_date;
    if (!currentSub && subscriptionType === 'free') {
      // New user - set trial for 7 days
      const newTrialEnd = new Date();
      newTrialEnd.setDate(newTrialEnd.getDate() + 7);
      trialEndDate = newTrialEnd.toISOString();
    } else if (isTrialExpired) {
      // Clear trial end date for expired trials
      trialEndDate = null;
    }

    // Update user subscription in database
    const { error: upsertError } = await supabaseClient
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        subscription_type: subscriptionType,
        status: subscriptionStatus,
        token_limit_soft: finalLimits.tokenLimitSoft,
        token_limit_hard: finalLimits.tokenLimitHard,
        tokens_used_total: tokensUsedTotal,
        monthly_tokens_used: monthlyTokensUsed,
        stripe_customer_id: stripeCustomerId,
        subscription_end_date: subscriptionEnd,
        billing_cycle_start: billingCycleStart || new Date().toISOString(),
        trial_end_date: trialEndDate,
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
      subscriptionStatus,
      tokenLimitSoft: finalLimits.tokenLimitSoft,
      tokenLimitHard: finalLimits.tokenLimitHard,
      tokensUsedTotal,
      monthlyTokensUsed,
      subscriptionEnd 
    });

    return new Response(JSON.stringify({
      subscription_type: subscriptionType,
      token_limit_soft: finalLimits.tokenLimitSoft,
      token_limit_hard: finalLimits.tokenLimitHard,
      tokens_used_total: tokensUsedTotal,
      monthly_tokens_used: monthlyTokensUsed,
      subscription_end: subscriptionEnd,
      status: subscriptionStatus,
      trial_end_date: trialEndDate,
      is_trial_expired: isTrialExpired
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