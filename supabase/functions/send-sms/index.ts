import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendSMSRequest {
  phoneNumber: string;
  message?: string;
}

interface SMSAPIResponse {
  count: number;
  parts: Array<{
    id: string;
    phone_number: string;
    status: string;
  }>;
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

    const { phoneNumber, message }: SendSMSRequest = await req.json();

    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Default verification message
    const smsMessage = message || `Twój kod weryfikacyjny: ${verificationCode}. Nie udostępniaj go nikomu.`;

    // Get SMS API credentials
    const SMS_API_TOKEN = Deno.env.get('SMS_API_KEY');
    if (!SMS_API_TOKEN) {
      console.log('SMS API not configured - simulating SMS send for development');
      // For development/demo purposes, simulate successful SMS
      const smsResult = {
        count: 1,
        parts: [{
          id: `sim_${Date.now()}`,
          phone_number: phoneNumber,
          status: 'SENT'
        }]
      };
      console.log('SMS simulated successfully:', smsResult);
      
      // Continue with the rest of the function using simulated result
      const hashedCode = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(verificationCode + user.id)
      );
      const codeHash = Array.from(new Uint8Array(hashedCode))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Create service client for database operations
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      // Store verification attempt
      await supabaseService.from('sms_verifications').upsert({
        user_id: user.id,
        phone_e164: phoneNumber,
        code_hash: codeHash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        created_at: new Date().toISOString(),
      });

      // Log referral event if user came from referral
      const { data: profile } = await supabaseService
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get client IP for fraud detection
      const clientIP = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';

      // Emit SMS sent event
      await supabaseService.from('referral_events').insert({
        referral_id: null, // Will be updated if referral exists
        event_type: 'sms_sent',
        payload: {
          user_id: user.id,
          phone_e164: phoneNumber,
          ip: clientIP,
          timestamp: new Date().toISOString(),
        }
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'SMS sent successfully (simulated for development)',
        messageId: smsResult.parts[0]?.id || 'simulated',
        verificationCode: verificationCode // Include for development testing
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Send SMS via SMS API
    const smsResponse = await fetch('https://api.smsapi.pl/sms.do', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${SMS_API_TOKEN}`,
      },
      body: new URLSearchParams({
        'to': phoneNumber,
        'message': smsMessage,
        'from': 'Info', // Generic sender name that should work
        'format': 'json',
        'normalize': '1', // Enable phone number normalization
        'max_parts': '1', // Single SMS part
      }),
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error('SMS API Error:', errorText);
      throw new Error(`Failed to send SMS: ${errorText}`);
    }

    const smsResult: SMSAPIResponse = await smsResponse.json();
    console.log('SMS sent successfully:', smsResult);

    // Store verification code in database (hashed for security)
    const hashedCode = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(verificationCode + user.id)
    );
    const codeHash = Array.from(new Uint8Array(hashedCode))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Store verification attempt
    await supabaseService.from('sms_verifications').upsert({
      user_id: user.id,
      phone_e164: phoneNumber,
      code_hash: codeHash,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      created_at: new Date().toISOString(),
    });

    // Log referral event if user came from referral
    const { data: profile } = await supabaseService
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get client IP for fraud detection
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    // Emit SMS sent event
    await supabaseService.from('referral_events').insert({
      referral_id: null, // Will be updated if referral exists
      event_type: 'sms_sent',
      payload: {
        user_id: user.id,
        phone_e164: phoneNumber,
        ip: clientIP,
        timestamp: new Date().toISOString(),
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'SMS sent successfully',
      messageId: smsResult.parts?.[0]?.id || 'unknown'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in send-sms function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});