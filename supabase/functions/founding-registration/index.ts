import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoundingRegistrationRequest {
  email: string;
  name?: string;
  phone?: string;
  referralCode?: string;
  utmParams?: Record<string, string>;
  deviceInfo?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = userData.user.id;

    if (req.method === 'POST') {
      const body: FoundingRegistrationRequest = await req.json();
      
      // Check current count
      const { data: currentCount, error: countError } = await supabase
        .rpc('get_founding_members_count');

      if (countError) {
        console.error('Error getting count:', countError);
        return new Response(
          JSON.stringify({ error: 'Failed to check availability' }),
          { status: 500, headers: corsHeaders }
        );
      }

      if (currentCount >= 100) {
        return new Response(
          JSON.stringify({ error: 'Program is full', slotsLeft: 0 }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Handle referral if provided
      let referredBy = null;
      if (body.referralCode) {
        const { data: referrer } = await supabase
          .from('referrals')
          .select('referrer_id')
          .eq('code', body.referralCode)
          .single();
        
        if (referrer) {
          referredBy = referrer.referrer_id;
        }
      }

      // Get client IP
      const clientIP = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';

      // Register founding member
      const { data: foundingMember, error: insertError } = await supabase
        .from('founding_members')
        .insert({
          user_id: userId,
          email: body.email,
          name: body.name,
          phone: body.phone,
          referral_code: body.referralCode,
          referred_by: referredBy,
          registration_ip: clientIP,
          device_info: body.deviceInfo,
          utm_params: body.utmParams,
          registration_source: 'landing_page'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting founding member:', insertError);
        
        if (insertError.code === '23505') { // Unique constraint violation
          return new Response(
            JSON.stringify({ error: 'Already registered', code: 'ALREADY_REGISTERED' }),
            { status: 409, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({ error: 'Registration failed' }),
          { status: 500, headers: corsHeaders }
        );
      }

      // Award referral bonus if applicable
      if (referredBy) {
        // Add bonus days to referrer
        await supabase
          .from('founding_members')
          .update({ bonus_days_earned: 3 })
          .eq('user_id', referredBy);
      }

      // Get updated count
      const { data: newCount } = await supabase.rpc('get_founding_members_count');

      return new Response(
        JSON.stringify({
          success: true,
          foundingPosition: foundingMember.founding_position,
          slotsLeft: Math.max(0, 100 - (newCount || 0)),
          totalMembers: newCount || 0
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      // Get current stats
      const { data: count } = await supabase.rpc('get_founding_members_count');
      
      return new Response(
        JSON.stringify({
          totalMembers: count || 0,
          slotsLeft: Math.max(0, 100 - (count || 0)),
          isOpen: (count || 0) < 100
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Founding registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});