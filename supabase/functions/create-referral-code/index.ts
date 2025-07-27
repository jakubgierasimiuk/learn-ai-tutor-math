import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-REFERRAL-CODE] ${step}${detailsStr}`);
};

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
    
    logStep("User authenticated", { userId: user.id });

    // Check if user already has a referral code
    const { data: existingCode, error: fetchError } = await supabaseClient
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error fetching existing code: ${fetchError.message}`);
    }

    if (existingCode) {
      logStep("Returning existing code", { code: existingCode.code });
      return new Response(JSON.stringify({ 
        code: existingCode.code,
        isNew: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate new unique code
    let attempts = 0;
    let newCode: string;
    let isUnique = false;

    while (!isUnique && attempts < 10) {
      const { data, error } = await supabaseClient.rpc('generate_referral_code');
      if (error) throw new Error(`Error generating code: ${error.message}`);
      
      newCode = data;
      
      // Check if code already exists
      const { data: existing } = await supabaseClient
        .from("referral_codes")
        .select("id")
        .eq("code", newCode)
        .single();
      
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Could not generate unique referral code");
    }

    // Insert new referral code
    const { data: insertedCode, error: insertError } = await supabaseClient
      .from("referral_codes")
      .insert({
        user_id: user.id,
        code: newCode!,
        is_active: true
      })
      .select("code")
      .single();

    if (insertError) {
      throw new Error(`Error inserting code: ${insertError.message}`);
    }

    // Initialize user referral stats if not exists
    const { error: statsError } = await supabaseClient
      .from("user_referral_stats")
      .upsert({
        user_id: user.id,
        successful_referrals: 0,
        total_points: 0,
        available_points: 0,
        free_months_earned: 0,
        current_tier: 'beginner'
      });

    if (statsError) {
      logStep("Warning: Could not initialize stats", { error: statsError.message });
    }

    logStep("Created new referral code", { code: insertedCode.code });

    return new Response(JSON.stringify({ 
      code: insertedCode.code,
      isNew: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-referral-code", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});