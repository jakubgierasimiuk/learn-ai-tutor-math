import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[ADMIN-LINK-REFERRAL] Function started");

    // Initialize Supabase clients
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error("Authentication failed");

    console.log("[ADMIN-LINK-REFERRAL] User authenticated:", user.email);

    // Check if user is admin using the is_admin() function
    const { data: isAdminData, error: adminCheckError } = await supabaseAdmin
      .rpc('is_admin');

    if (adminCheckError) {
      console.error("[ADMIN-LINK-REFERRAL] Admin check error:", adminCheckError);
      throw new Error("Failed to verify admin status");
    }

    if (!isAdminData) {
      console.log("[ADMIN-LINK-REFERRAL] Unauthorized access attempt by:", user.email);
      return new Response(
        JSON.stringify({ error: "Unauthorized - admin access required" }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("[ADMIN-LINK-REFERRAL] Admin verified:", user.email);

    // Parse request body
    const { inviteeEmail, referralCode } = await req.json();
    
    if (!inviteeEmail || !referralCode) {
      throw new Error("Missing inviteeEmail or referralCode");
    }

    console.log("[ADMIN-LINK-REFERRAL] Linking:", { inviteeEmail, referralCode });

    // Find the invitee user by email
    const { data: inviteeProfile, error: inviteeError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('email', inviteeEmail)
      .single();

    if (inviteeError || !inviteeProfile) {
      throw new Error(`Invitee user not found: ${inviteeEmail}`);
    }

    const inviteeUserId = inviteeProfile.user_id;
    console.log("[ADMIN-LINK-REFERRAL] Found invitee user_id:", inviteeUserId);

    // Find the referrer by referral code
    const { data: referrerProfile, error: referrerError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrerProfile) {
      throw new Error(`Referral code not found: ${referralCode}`);
    }

    const referrerId = referrerProfile.user_id;
    console.log("[ADMIN-LINK-REFERRAL] Found referrer:", referrerProfile.email);

    // Prevent self-referral
    if (referrerId === inviteeUserId) {
      throw new Error("Cannot link user to their own referral code");
    }

    // Check if referral already exists
    const { data: existingReferral } = await supabaseAdmin
      .from('referrals')
      .select('id, stage')
      .eq('referred_user_id', inviteeUserId)
      .maybeSingle();

    if (existingReferral) {
      console.log("[ADMIN-LINK-REFERRAL] Referral already exists:", existingReferral);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Referral already exists",
          referral: existingReferral
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create referral record with stage='invited'
    const { data: newReferral, error: referralInsertError } = await supabaseAdmin
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_user_id: inviteeUserId,
        referral_code: referralCode,
        stage: 'invited',
        risk_score: 0,
        notes: { 
          manually_linked: true, 
          linked_by_admin: user.email, 
          linked_at: new Date().toISOString() 
        }
      })
      .select()
      .single();

    if (referralInsertError) {
      console.error("[ADMIN-LINK-REFERRAL] Error creating referral:", referralInsertError);
      throw new Error(`Failed to create referral: ${referralInsertError.message}`);
    }

    console.log("[ADMIN-LINK-REFERRAL] Referral created:", newReferral.id);

    // Grant invitee rewards (7 days + 4000 tokens)
    const rewardsToCreate = [
      {
        user_id: inviteeUserId,
        kind: 'days',
        amount: 7,
        status: 'released',
        source: 'activation',
        meta: { reason: 'admin_link', linked_by: user.email },
        released_at: new Date().toISOString()
      },
      {
        user_id: inviteeUserId,
        kind: 'tokens',
        amount: 4000,
        status: 'released',
        source: 'activation',
        meta: { reason: 'admin_link', linked_by: user.email },
        released_at: new Date().toISOString()
      }
    ];

    const { error: rewardsError } = await supabaseAdmin
      .from('rewards')
      .insert(rewardsToCreate);

    if (rewardsError) {
      console.error("[ADMIN-LINK-REFERRAL] Error creating rewards:", rewardsError);
      // Don't fail the whole operation, just log
    } else {
      console.log("[ADMIN-LINK-REFERRAL] Invitee rewards created");
    }

    // Log admin action
    await supabaseAdmin.from('admin_actions_log').insert({
      admin_id: user.id,
      target_user_id: inviteeUserId,
      action_type: 'link_referral',
      details: {
        invitee_email: inviteeEmail,
        referral_code: referralCode,
        referrer_email: referrerProfile.email,
        referral_id: newReferral.id
      }
    });

    console.log("[ADMIN-LINK-REFERRAL] Success - referral linked and rewards granted");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Referral successfully linked and rewards granted",
        referral: newReferral,
        rewards_granted: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ADMIN-LINK-REFERRAL] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
