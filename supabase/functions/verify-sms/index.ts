import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifySMSRequest {
  phoneNumber: string;
  code: string;
}

interface HLRResponse {
  status: string;
  type: string; // mobile, landline, voip
  carrier: string;
  country: string;
}

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

    const { phoneNumber, code }: VerifySMSRequest = await req.json();

    if (!phoneNumber || !code) {
      throw new Error("Phone number and verification code are required");
    }

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get verification record
    const { data: verification, error: verificationError } = await supabaseService
      .from('sms_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_e164', phoneNumber)
      .is('verified_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verificationError) {
      throw new Error("Error fetching verification record");
    }

    if (!verification) {
      throw new Error("No valid verification code found or code expired");
    }

    // Check attempt limit
    if (verification.attempts >= verification.max_attempts) {
      throw new Error("Maximum verification attempts exceeded");
    }

    // Hash provided code
    const hashedCode = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(code + user.id)
    );
    const providedCodeHash = Array.from(new Uint8Array(hashedCode))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Increment attempts
    await supabaseService
      .from('sms_verifications')
      .update({ attempts: verification.attempts + 1 })
      .eq('id', verification.id);

    // Verify code
    if (providedCodeHash !== verification.code_hash) {
      throw new Error("Invalid verification code");
    }

    // Perform HLR lookup via SMS API
    const SMS_API_TOKEN = Deno.env.get('SMS_API_KEY');
    let isVoIP = false;
    let hlrStatus = 'unknown';

    if (SMS_API_TOKEN) {
      try {
        const hlrResponse = await fetch(`https://api.smsapi.pl/hlr.do`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${SMS_API_TOKEN}`,
          },
          body: new URLSearchParams({
            'to': phoneNumber,
            'format': 'json',
          }),
        });

        if (hlrResponse.ok) {
          const hlrResult: HLRResponse = await hlrResponse.json();
          isVoIP = hlrResult.type === 'voip';
          hlrStatus = hlrResult.status;
          console.log('HLR Result:', hlrResult);
        }
      } catch (hlrError) {
        console.error('HLR lookup failed:', hlrError);
        // Continue without HLR data
      }
    }

    // Mark verification as completed
    await supabaseService
      .from('sms_verifications')
      .update({ 
        verified_at: new Date().toISOString(),
        attempts: verification.attempts + 1 
      })
      .eq('id', verification.id);

    // Update user profile with verified phone
    await supabaseService
      .from('profiles')
      .update({
        phone_e164: phoneNumber,
        phone_verified_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    // Get client IP and user agent for fraud detection
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Generate device hash
    const deviceHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(userAgent + clientIP)
    );
    const deviceHashStr = Array.from(new Uint8Array(deviceHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Store device info
    await supabaseService.from('devices').upsert({
      user_id: user.id,
      device_hash: deviceHashStr,
      first_ip: clientIP,
      last_seen: new Date().toISOString(),
    });

    // Store fraud signals
    if (isVoIP) {
      await supabaseService.from('fraud_signals').insert({
        user_id: user.id,
        signal_type: 'voip',
        signal_value: phoneNumber,
        score_delta: -20,
      });
    }

    // Emit phone verified event
    await supabaseService.from('referral_events').insert({
      referral_id: null, // Will be updated if referral exists
      event_type: 'phone_verified',
      payload: {
        user_id: user.id,
        phone_e164: phoneNumber,
        hlr_status: hlrStatus,
        is_voip: isVoIP,
        device_hash: deviceHashStr,
        ip: clientIP,
        timestamp: new Date().toISOString(),
      }
    });

    // Check if this user was referred and trigger activation check
    const { data: referral } = await supabaseService
      .from('referrals')
      .select('*')
      .eq('referred_user_id', user.id)
      .eq('stage', 'invited')
      .maybeSingle();

    if (referral) {
      // Check if user has completed onboarding (we'll implement this check later)
      // For now, just update the referral with phone verification
      await supabaseService
        .from('referrals')
        .update({
          phone_hash: await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(phoneNumber)
          ).then(hash => 
            Array.from(new Uint8Array(hash))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('')
          ),
          device_hash: deviceHashStr,
          ip: clientIP,
          notes: {
            ...referral.notes,
            phone_verified_at: new Date().toISOString(),
            hlr_status: hlrStatus,
            is_voip: isVoIP,
          }
        })
        .eq('id', referral.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Phone number verified successfully',
      hlr_status: hlrStatus,
      is_voip: isVoIP 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in verify-sms function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});