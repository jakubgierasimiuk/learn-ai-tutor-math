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
    console.log('🔧 Starting trial dates migration...');

    // Find all free accounts without trial_end_date
    const { data: accountsToMigrate, error: queryError } = await supabase
      .from('user_subscriptions')
      .select('user_id, created_at, subscription_type')
      .eq('subscription_type', 'free')
      .is('trial_end_date', null);

    if (queryError) {
      console.error('❌ Error querying accounts:', queryError);
      throw queryError;
    }

    console.log(`📊 Found ${accountsToMigrate?.length || 0} accounts to migrate`);

    if (!accountsToMigrate || accountsToMigrate.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No accounts need migration',
        migrated: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let migratedCount = 0;
    let movedToLimitedFree = 0;
    const errors: any[] = [];

    // Process each account
    for (const account of accountsToMigrate) {
      try {
        console.log(`⚡ Processing account ${account.user_id}`);

        const createdAt = new Date(account.created_at);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceCreation > 7) {
          // Account older than 7 days - move to limited_free
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              subscription_type: 'limited_free',
              trial_end_date: null,
              monthly_tokens_used: 0,
              billing_cycle_start: new Date().toISOString(),
              token_limit_soft: 1000,
              token_limit_hard: 1200,
            })
            .eq('user_id', account.user_id);

          if (updateError) {
            console.error(`❌ Error updating account ${account.user_id}:`, updateError);
            errors.push({ user_id: account.user_id, error: updateError.message });
            continue;
          }

          console.log(`✅ Moved account ${account.user_id} to limited_free (${daysSinceCreation} days old)`);
          movedToLimitedFree++;
        } else {
          // Account within 7 days - set trial_end_date
          const trialEndDate = new Date(createdAt);
          trialEndDate.setDate(trialEndDate.getDate() + 7);

          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              trial_end_date: trialEndDate.toISOString(),
            })
            .eq('user_id', account.user_id);

          if (updateError) {
            console.error(`❌ Error updating account ${account.user_id}:`, updateError);
            errors.push({ user_id: account.user_id, error: updateError.message });
            continue;
          }

          console.log(`✅ Set trial end date for account ${account.user_id}: ${trialEndDate.toISOString()}`);
        }

        migratedCount++;

      } catch (error) {
        console.error(`❌ Failed to process account ${account.user_id}:`, error);
        errors.push({ user_id: account.user_id, error: (error as Error).message });
      }
    }

    console.log(`🎯 Migration completed. Migrated: ${migratedCount}, Moved to limited_free: ${movedToLimitedFree}, Errors: ${errors.length}`);

    return new Response(JSON.stringify({
      message: `Migration completed successfully`,
      totalProcessed: accountsToMigrate.length,
      migrated: migratedCount,
      movedToLimitedFree: movedToLimitedFree,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Critical error in migrate-trial-dates:', error);
    return new Response(JSON.stringify({ 
      error: (error as Error).message,
      details: 'Critical error in trial dates migration'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});