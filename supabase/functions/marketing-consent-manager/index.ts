import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, consent_type, is_granted, source = 'api' } = await req.json();

    if (action === 'update_consent') {
      const deviceFingerprint = req.headers.get('x-device-fingerprint') || 
                               req.headers.get('user-agent') || 'unknown';
      const ipAddress = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 'unknown';

      // Handle consent grant/revoke
      const consentData = {
        user_id: user.id,
        consent_type: consent_type || 'general',
        is_granted: is_granted,
        granted_at: is_granted ? new Date().toISOString() : null,
        revoked_at: !is_granted ? new Date().toISOString() : null,
        source: source,
        device_fingerprint: deviceFingerprint,
        ip_address: ipAddress,
        metadata: {
          user_agent: req.headers.get('user-agent'),
          timestamp: new Date().toISOString()
        }
      };

      // Insert new consent record (we keep history)
      const { error: consentError } = await supabaseClient
        .from('marketing_consents')
        .insert(consentData);

      if (consentError) {
        throw new Error(`Failed to update consent: ${consentError.message}`);
      }

      // If consent is being revoked and user has reward, handle clawback
      if (!is_granted && consent_type === 'general') {
        const { data: rewardData } = await supabaseClient
          .from('marketing_consent_rewards')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'granted')
          .single();

        if (rewardData && rewardData.clawback_eligible_until) {
          const now = new Date();
          const clawbackDeadline = new Date(rewardData.clawback_eligible_until);
          
          if (now <= clawbackDeadline) {
            // Schedule clawback
            await supabaseClient
              .from('marketing_consent_rewards')
              .update({
                marketing_consent_revoked_at: now.toISOString(),
                status: 'clawed_back'
              })
              .eq('user_id', user.id);

            // Call clawback function
            await supabaseClient.functions.invoke('marketing-consent-clawback', {
              body: { user_id: user.id, reason: 'consent_revoked' }
            });
          }
        }
      }

      // Update legacy marketing_consent field in profiles for backward compatibility
      await supabaseClient
        .from('profiles')
        .update({
          marketing_consent: is_granted,
          marketing_consent_at: is_granted ? new Date().toISOString() : null
        })
        .eq('user_id', user.id);

      console.log('Marketing consent updated:', {
        user_id: user.id,
        consent_type,
        is_granted,
        source,
        device_fingerprint: deviceFingerprint
      });

      return new Response(JSON.stringify({
        success: true,
        message: is_granted ? 'Zgoda marketingowa została udzielona' : 'Zgoda marketingowa została cofnięta'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'get_consents') {
      // Get all consents for user
      const { data: consents, error } = await supabaseClient
        .from('marketing_consents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch consents: ${error.message}`);
      }

      // Get current consent status (latest for each type)
      const consentStatus: { [key: string]: boolean } = {};
      const consentsByType: { [key: string]: any[] } = {};

      consents?.forEach(consent => {
        if (!consentsByType[consent.consent_type]) {
          consentsByType[consent.consent_type] = [];
          consentStatus[consent.consent_type] = consent.is_granted;
        }
        consentsByType[consent.consent_type].push(consent);
      });

      return new Response(JSON.stringify({
        current_status: consentStatus,
        history: consentsByType,
        all_consents: consents
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'check_reward_status') {
      // Check marketing reward status
      const { data: rewardStatus } = await supabaseClient
        .from('marketing_consent_rewards')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return new Response(JSON.stringify({
        reward_status: rewardStatus || { status: 'not_initialized' }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Marketing consent manager error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
