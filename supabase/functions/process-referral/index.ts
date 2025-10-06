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
    logStep("Function deprecated - v1 is no longer active");
    
    return new Response(JSON.stringify({ 
      error: "This endpoint (process-referral v1) is deprecated. Please use process-referral-v2.",
      deprecated: true,
      redirect: "process-referral-v2"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 410, // Gone
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-referral v1", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});