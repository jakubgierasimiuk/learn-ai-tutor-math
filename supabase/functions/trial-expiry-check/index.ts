import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting trial expiry check...');

    // Find users whose trial has expired
    const { data: expiredTrials, error: queryError } = await supabase
      .from('user_subscriptions')
      .select('user_id, trial_end_date, subscription_type')
      .eq('subscription_type', 'free')
      .not('trial_end_date', 'is', null)
      .lt('trial_end_date', new Date().toISOString());

    if (queryError) {
      console.error('❌ Error querying expired trials:', queryError);
      throw queryError;
    }

    console.log(`📊 Found ${expiredTrials?.length || 0} expired trials`);

    if (!expiredTrials || expiredTrials.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No expired trials found',
        processed: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processedCount = 0;
    const errors: any[] = [];

    // Process each expired trial
    for (const trial of expiredTrials) {
      try {
        console.log(`⚡ Processing trial expiry for user ${trial.user_id}`);

        // Update subscription to limited_free and reset monthly usage
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_type: 'limited_free',
            monthly_tokens_used: 0,
            billing_cycle_start: new Date().toISOString(),
            trial_end_date: null, // Clear trial end date
          })
          .eq('user_id', trial.user_id);

        if (updateError) {
          console.error(`❌ Error updating user ${trial.user_id}:`, updateError);
          errors.push({ user_id: trial.user_id, error: updateError.message });
          continue;
        }

        // Log the trial expiry event
        await supabase
          .from('app_event_logs')
          .insert({
            user_id: trial.user_id,
            event_type: 'trial_expired',
            payload: {
              from_plan: 'free',
              to_plan: 'limited_free',
              trial_end_date: trial.trial_end_date,
            },
          });

        console.log(`✅ Successfully processed trial expiry for user ${trial.user_id}`);
        processedCount++;

      } catch (error) {
        console.error(`❌ Failed to process user ${trial.user_id}:`, error);
        errors.push({ user_id: trial.user_id, error: (error as Error).message });
      }
    }

    // Send notification emails for users nearing trial expiry (optional future enhancement)
    await checkUpcomingTrialExpiries();

    console.log(`🎯 Trial expiry check completed. Processed: ${processedCount}, Errors: ${errors.length}`);

    return new Response(JSON.stringify({
      message: `Processed ${processedCount} expired trials`,
      processed: processedCount,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Critical error in trial-expiry-check:', error);
    return new Response(JSON.stringify({ 
      error: (error as Error).message,
      details: 'Critical error in trial expiry check'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkUpcomingTrialExpiries() {
  try {
    // Check for trials expiring in 1 and 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    // Users with trials expiring in 3 days
    const { data: expiringSoon } = await supabase
      .from('user_subscriptions')
      .select('user_id, trial_end_date')
      .eq('subscription_type', 'free')
      .not('trial_end_date', 'is', null)
      .gte('trial_end_date', new Date().toISOString())
      .lte('trial_end_date', threeDaysFromNow.toISOString());

    // Log upcoming expiries for future email notifications
    if (expiringSoon && expiringSoon.length > 0) {
      console.log(`📧 ${expiringSoon.length} users have trials expiring within 3 days`);
      
      for (const user of expiringSoon) {
        const daysLeft = Math.ceil((new Date(user.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        await supabase
          .from('app_event_logs')
          .insert({
            user_id: user.user_id,
            event_type: 'trial_expiry_warning',
            payload: {
              days_left: daysLeft,
              trial_end_date: user.trial_end_date,
            },
          });
      }
    }

  } catch (error) {
    console.error('❌ Error checking upcoming trial expiries:', error);
  }
}