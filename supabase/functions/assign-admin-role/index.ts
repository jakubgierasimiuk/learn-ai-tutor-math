import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // CRITICAL SECURITY: Verify the caller is authenticated and has admin privileges
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create regular client to verify admin status of caller
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { 
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // Verify caller is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Check if caller has admin role
    const { data: callerRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (roleError || !callerRoles || callerRoles.length === 0) {
      console.warn(`Unauthorized admin role assignment attempt by user ${user.id}`);
      return new Response(
        JSON.stringify({ error: "Insufficient privileges. Admin role required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Rate limiting check
    const { data: rateLimitCheck, error: rateLimitError } = await supabase
      .rpc('check_admin_rate_limit', {
        p_user_id: user.id,
        p_action_type: 'assign_admin_role',
        p_max_attempts: 5,
        p_window_minutes: 60
      });

    if (rateLimitError || !rateLimitCheck) {
      console.warn(`Rate limit exceeded for admin operations by user ${user.id}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email } = await req.json();

    // Input validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = email.toLowerCase().trim();

    // Find user by email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Failed to fetch users: ${userError.message}`);
    }

    const targetUser = users.users.find(u => u.email === sanitizedEmail);
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: `User with email ${sanitizedEmail} not found` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check if user already has admin role
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', targetUser.id)
      .eq('role', 'admin')
      .single();

    if (roleCheckError && roleCheckError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Error checking existing role: ${roleCheckError.message}`);
    }

    if (existingRole) {
      return new Response(
        JSON.stringify({ message: `User ${sanitizedEmail} already has admin role` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Assign admin role
    const { error: assignError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: targetUser.id,
        role: 'admin',
        assigned_by: user.id // Assigned by the authenticated admin
      });

    if (assignError) {
      throw new Error(`Failed to assign admin role: ${assignError.message}`);
    }

    // Log the action
    const { error: logError } = await supabaseAdmin
      .from('admin_actions_log')
      .insert({
        admin_id: user.id, // The admin who performed the action
        action_type: 'assign_role',
        target_user_id: targetUser.id, // The user who received the role
        details: { 
          role: 'admin', 
          method: 'edge_function_assignment',
          target_email: sanitizedEmail,
          assigned_by_email: user.email 
        }
      });

    if (logError) {
      console.warn('Failed to log admin action:', logError.message);
    }

    console.log(`Admin role successfully assigned to ${sanitizedEmail} by ${user.email}`);

    return new Response(
      JSON.stringify({ 
        message: `Successfully assigned admin role to ${sanitizedEmail}`,
        user_id: targetUser.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error('Error in assign-admin-role function:', error);
    
    // Don't expose internal error details to prevent information leakage
    const safeErrorMessage = error instanceof Error && error.message.includes('Failed to') 
      ? error.message 
      : 'Internal server error';
    
    return new Response(
      JSON.stringify({ error: safeErrorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});