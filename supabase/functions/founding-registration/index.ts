import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoundingRegistrationRequest {
  email: string;
  password?: string;
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

    // Handle GET request - return current stats (public access)
    if (req.method === 'GET') {
      // Get current stats using virtual scarcity
      const { data: count } = await supabase.rpc('get_founding_members_count');
      const { data: spotsLeft } = await supabase.rpc('get_virtual_spots_left');
      
      return new Response(
        JSON.stringify({
          success: true,
          totalMembers: count || 0,
          slotsLeft: spotsLeft || 0,
          isOpen: (spotsLeft || 0) > 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle authentication - optional for new user creation
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    let userEmail = null;
    let userName = null;
    let isExistingUser = false;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: authError } = await supabase.auth.getUser(token);
      
      if (userData?.user && !authError) {
        userId = userData.user.id;
        userEmail = userData.user.email;
        userName = userData.user.user_metadata?.name;
        isExistingUser = true;
      }
    }

    if (req.method === 'POST') {
      const body: FoundingRegistrationRequest = await req.json();
      
      // Check virtual spots left using new function
      const { data: spotsLeft, error: spotsError } = await supabase
        .rpc('get_virtual_spots_left');

      if (spotsError) {
        console.error('Error getting virtual spots left:', spotsError);
        return new Response(
          JSON.stringify({ error: 'Failed to check availability' }),
          { status: 500, headers: corsHeaders }
        );
      }

      if (spotsLeft <= 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Program is full', 
            slotsLeft: 0,
            message: 'All founding member spots have been taken'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // If user is not authenticated, create a new account
      if (!isExistingUser) {
        console.log('Creating new user account for:', body.email);
        
        // Generate password if not provided
        const password = body.password || Math.random().toString(36).substring(2, 15);
        
        try {
          const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
            email: body.email,
            password: password,
            user_metadata: {
              name: body.name || body.email.split('@')[0]
            },
            email_confirm: true // Auto-confirm email
          });

          if (signUpError) {
            console.error('Error creating user:', signUpError);
            
            // If user already exists, try to get the existing user
            if (signUpError.message.includes('already been registered')) {
              const { data: existingUser } = await supabase.auth.admin.listUsers();
              const user = existingUser?.users?.find(u => u.email === body.email);
              
              if (user) {
                userId = user.id;
                userEmail = user.email;
                userName = user.user_metadata?.name;
                isExistingUser = true;
                console.log('User already exists, using existing account:', userId);
              } else {
                return new Response(
                  JSON.stringify({ 
                    error: 'Konto z tym adresem email już istnieje. Zaloguj się, aby dołączyć do programu.',
                    code: 'USER_EXISTS'
                  }),
                  { status: 409, headers: corsHeaders }
                );
              }
            } else {
              return new Response(
                JSON.stringify({ error: 'Nie udało się utworzyć konta: ' + signUpError.message }),
                { status: 400, headers: corsHeaders }
              );
            }
          }

          userId = newUser.user.id;
          userEmail = newUser.user.email;
          userName = newUser.user.user_metadata?.name;
        } catch (error) {
          console.error('Error in user creation:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to create account' }),
            { status: 500, headers: corsHeaders }
          );
        }
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

      // Get client IP - extract first IP if multiple are present (proxy chain)
      let clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
      
      // x-forwarded-for can contain multiple IPs separated by comma (proxy chain)
      // Take only the first one (client's real IP)
      if (clientIP && clientIP.includes(',')) {
        clientIP = clientIP.split(',')[0].trim();
      }
      
      // Validate IP format for inet column
      if (clientIP !== 'unknown' && !clientIP.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        clientIP = 'unknown';
      }

      // Register founding member
      const foundingMemberData: any = {
        user_id: userId,
        email: userEmail || body.email,
        name: userName || body.name,
        phone: body.phone,
        referral_code: body.referralCode,
        referred_by: referredBy,
        device_info: body.deviceInfo,
        utm_params: body.utmParams,
        registration_source: 'landing_page'
      };
      
      // Only add registration_ip if it's a valid IP (not 'unknown')
      if (clientIP !== 'unknown') {
        foundingMemberData.registration_ip = clientIP;
      }
      
      const { data: foundingMember, error: insertError } = await supabase
        .from('founding_members')
        .insert(foundingMemberData)
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

      // Grant 30-day PAID subscription (10M tokens)
      try {
        const premiumEndDate = new Date();
        premiumEndDate.setDate(premiumEndDate.getDate() + 30);

        const { error: subError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            subscription_type: 'paid',
            status: 'active',
            subscription_end_date: premiumEndDate.toISOString(),
            token_limit_soft: 10000000,
            token_limit_hard: 10000000,
            monthly_tokens_used: 0,
            billing_cycle_start: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });

        if (subError) {
          console.error('Error granting paid subscription:', subError);
          throw new Error('Failed to grant subscription');
        }

        // Set founding member flag in profile
        await supabase
          .from('profiles')
          .update({ is_founding_member: true })
          .eq('user_id', userId);

        console.log('Paid subscription (30 days, 10M tokens) granted to founding member:', userId);
      } catch (error) {
        console.error('Error granting paid subscription:', error);
        // Continue anyway - user is still registered as founding member
      }

      // Award referral bonus if applicable
      if (referredBy) {
        // Get referrer's current subscription
        const { data: referrerSub } = await supabase
          .from('user_subscriptions')
          .select('subscription_end_date')
          .eq('user_id', referredBy)
          .single();
        
        if (referrerSub?.subscription_end_date) {
          // Extend subscription by 3 days
          const newEndDate = new Date(referrerSub.subscription_end_date);
          newEndDate.setDate(newEndDate.getDate() + 3);
          
          await supabase
            .from('user_subscriptions')
            .update({ subscription_end_date: newEndDate.toISOString() })
            .eq('user_id', referredBy);
        }
        
        // Update bonus counter
        await supabase
          .from('founding_members')
          .update({ 
            bonus_days_earned: 3
          })
          .eq('user_id', referredBy);
      }

      // Get updated stats using virtual scarcity
      const { data: newCount } = await supabase.rpc('get_founding_members_count');
      const { data: newSpotsLeft } = await supabase.rpc('get_virtual_spots_left');

      return new Response(
        JSON.stringify({
          success: true,
          foundingPosition: foundingMember.founding_position,
          slotsLeft: newSpotsLeft || 0,
          totalMembers: newCount || 0,
          premiumGranted: true
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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