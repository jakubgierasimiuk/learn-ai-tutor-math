import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS configuration for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Request payload interface
interface ProcessReferralRequest {
  referralCode: string;
  action: 'register' | 'check_activation' | 'complete_conversion';
}

// Main request handler
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

    const { referralCode, action }: ProcessReferralRequest = await req.json();

    if (!referralCode) {
      throw new Error("Referral code is required");
    }

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find the referral code owner
    const { data: referrer, error: referrerError } = await supabaseService
      .from('profiles')
      .select('user_id, referral_code')
      .eq('referral_code', referralCode)
      .maybeSingle();

    if (referrerError || !referrer) {
      throw new Error("Invalid referral code");
    }

    // Prevent self-referral
    if (referrer.user_id === user.id) {
      throw new Error("Cannot refer yourself");
    }

    // Get client info for fraud detection
    // x-forwarded-for can contain multiple IPs (e.g., "client, proxy1, proxy2")
    // We take only the first one (the original client IP)
    const forwardedForHeader = req.headers.get('x-forwarded-for');
    const firstForwarded = forwardedForHeader?.split(',').map(s => s.trim()).filter(Boolean)[0] ?? null;
    const realIP = req.headers.get('x-real-ip');
    const rawIP = firstForwarded || realIP || null;

    const isValidIPv4 = (ip: string) => {
      const m = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
      if (!m) return false;
      return m.slice(1).every((o) => {
        const n = Number(o);
        return n >= 0 && n <= 255;
      });
    };
    const isValidIPv6 = (ip: string) => ip.includes(':') && ip.length <= 45; // coarse but safe enough to avoid 'unknown'

    const clientIP = rawIP && (isValidIPv4(rawIP) || isValidIPv6(rawIP)) ? rawIP : null;
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (action === 'register') {
      // Check if referral already exists
      const { data: existingReferral } = await supabaseService
        .from('referrals')
        .select('*')
        .eq('referred_user_id', user.id)
        .maybeSingle();

      if (existingReferral) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Referral already registered' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const newReferralPayload = {
        referrer_id: referrer.user_id,
        referred_user_id: user.id,
        referral_code: referralCode,
        stage: 'invited',
        ip: clientIP, // may be null if unavailable/invalid
        risk_score: 0,
        notes: {
          registered_at: new Date().toISOString(),
          user_agent: userAgent,
          ip: clientIP,
          ip_raw: rawIP ?? 'unknown',
        },
      } as const;
      // Extra safety in case of accidental 'status' key somewhere upstream
      // deno-lint-ignore no-explicit-any
      const sanitizedPayload: any = { ...newReferralPayload };
      if ('status' in sanitizedPayload) {
        delete sanitizedPayload.status;
      }
      console.log('[Referral] 🧾 Insert payload (referrals):', sanitizedPayload);
      
      const { data: newReferral, error: referralError } = await supabaseService
        .from('referrals')
        .insert(sanitizedPayload)
        .select()
        .single();

      if (referralError) {
        console.error('[Referral] ❌ Database error creating referral:', {
          error: referralError,
          message: referralError.message,
          details: referralError.details,
          hint: referralError.hint,
          code: referralError.code
        });
        throw new Error(`Failed to create referral record: ${referralError.message}`);
      }
      
      console.log('[Referral] ✅ Created referral:', newReferral);

      // Log referral event
      await supabaseService.from('referral_events').insert({
        referral_id: newReferral.id,
        event_type: 'referral_signed_up',
        payload: {
          referrer_id: referrer.user_id,
          referred_user_id: user.id,
          ip: clientIP,
          device_hash: null,
          timestamp: new Date().toISOString(),
        }
      });

      // Give invitee bonus (7 days + 4000 tokens)
      await supabaseService.from('rewards').insert([
        {
          user_id: user.id,
          kind: 'days',
          amount: 7,
          status: 'released',
          source: 'activation',
          meta: { reason: 'invited_user_bonus' },
          released_at: new Date().toISOString(),
        },
        {
          user_id: user.id,
          kind: 'tokens',
          amount: 4000,
          status: 'released', 
          source: 'activation',
          meta: { reason: 'invited_user_bonus' },
          released_at: new Date().toISOString(),
        }
      ]);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Referral registered successfully',
        referral_id: newReferral.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'check_activation') {
      // Find the referral
      const { data: referral } = await supabaseService
        .from('referrals')
        .select('*')
        .eq('referred_user_id', user.id)
        .eq('referral_code', referralCode)
        .eq('stage', 'invited')
        .maybeSingle();

      if (!referral) {
        throw new Error("Referral not found or already processed");
      }

      // Check activation conditions:
      // 1. Phone verified
      const { data: profile } = await supabaseService
        .from('profiles')
        .select('phone_verified_at')
        .eq('user_id', user.id)
        .single();

      const phoneVerified = !!profile?.phone_verified_at;

      // 2. Onboarding completed + 20 min learning (simplified check for now)
      const { data: sessions } = await supabaseService
        .from('study_sessions')
        .select('id, created_at, completed_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()) // Within 72h
        .limit(10);

      const learningMinutes = sessions?.length ? sessions.length * 5 : 0; // Simplified calculation
      const onboardingCompleted = learningMinutes >= 20;

      if (!phoneVerified || !onboardingCompleted) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Activation conditions not met',
          conditions: {
            phone_verified: phoneVerified,
            onboarding_completed: onboardingCompleted,
            learning_minutes: learningMinutes,
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Calculate risk score
      const { data: riskScore, error: riskError } = await supabaseService.rpc('calculate_risk_score', {
        p_user_id: user.id,
        p_phone_verified: phoneVerified,
        p_phone_is_voip: false, // Will be set from verification
        p_ip_is_vpn: false, // TODO: Implement VPN detection
        p_device_is_duplicate: false, // TODO: Check device duplicates
        p_onboarding_completed: onboardingCompleted,
        p_learning_time_minutes: learningMinutes,
      });

      if (riskError) {
        console.error('Error calculating risk score:', riskError);
        throw new Error('Failed to calculate risk score');
      }

      const finalRiskScore = riskScore || 0;

      console.log('Calculated risk score:', riskScore);

      // Update referral with activation
      const activated_at = new Date().toISOString();
      await supabaseService
        .from('referrals')
        .update({
          stage: 'activated',
          risk_score: riskScore,
          activated_at: activated_at,
          notes: {
            ...referral.notes,
            activated_at: activated_at,
            phone_verified: phoneVerified,
            learning_minutes: learningMinutes,
            risk_score: riskScore,
          }
        })
        .eq('id', referral.id);

      // Log activation event
      await supabaseService.from('referral_events').insert({
        referral_id: referral.id,
        event_type: 'referral_activated',
        payload: {
          referrer_id: referral.referrer_id,
          referred_user_id: user.id,
          risk_score: finalRiskScore,
          timestamp: activated_at,
        }
      });

      // Give reward based on risk score
      let rewardStatus = 'pending';
      let releasedAt = null;

      if (finalRiskScore >= 85) {
        rewardStatus = 'released';
        releasedAt = new Date().toISOString();
      } else if (finalRiskScore >= 70) {
        rewardStatus = 'pending'; // Will be released by CRON after 48-72h
      } else {
        rewardStatus = 'pending'; // Manual review needed
      }

      // Give convertible reward to referrer (3 days or 4000 tokens)
      await supabaseService.from('rewards').insert({
        user_id: referral.referrer_id,
        kind: 'convertible',
        amount: 3,
        status: rewardStatus,
        source: 'activation',
        meta: { 
          convertible_to: ['days', 'tokens'],
          days_amount: 3,
          tokens_amount: 4000,
          referral_id: referral.id 
        },
        released_at: releasedAt,
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Referral activated successfully',
        risk_score: riskScore,
        reward_status: rewardStatus 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'complete_conversion') {
      // Find the referral
      const { data: referral } = await supabaseService
        .from('referrals')
        .select('*')
        .eq('referred_user_id', user.id)
        .eq('referral_code', referralCode)
        .eq('stage', 'activated')
        .maybeSingle();

      if (!referral) {
        throw new Error("Referral not found or not activated");
      }

      // Update referral to converted
      const converted_at = new Date().toISOString();
      await supabaseService
        .from('referrals')
        .update({
          stage: 'converted',
          converted_at: converted_at,
          notes: {
            ...referral.notes,
            converted_at: converted_at,
          }
        })
        .eq('id', referral.id);

      // Log conversion event
      await supabaseService.from('referral_events').insert({
        referral_id: referral.id,
        event_type: 'referral_converted',
        payload: {
          referrer_id: referral.referrer_id,
          referred_user_id: user.id,
          timestamp: converted_at,
        }
      });

      // Give conversion reward to referrer (+30 days)
      await supabaseService.from('rewards').insert({
        user_id: referral.referrer_id,
        kind: 'days',
        amount: 30,
        status: 'released',
        source: 'conversion',
        meta: { referral_id: referral.id },
        released_at: new Date().toISOString(),
      });

      // Update referral stats (triggers ladder bonuses)
      await supabaseService.rpc('update_referral_stats_v2', { 
        p_user_id: referral.referrer_id 
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Referral conversion completed successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error('Error in process-referral-v2 function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});