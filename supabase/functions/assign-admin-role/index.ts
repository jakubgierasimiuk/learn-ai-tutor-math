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
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Find user by email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Failed to fetch users: ${userError.message}`);
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: `User with email ${email} not found` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check if user already has admin role
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleCheckError && roleCheckError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Error checking existing role: ${roleCheckError.message}`);
    }

    if (existingRole) {
      return new Response(
        JSON.stringify({ message: `User ${email} already has admin role` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Assign admin role
    const { error: assignError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'admin',
        assigned_by: user.id // Self-assigned for initial setup
      });

    if (assignError) {
      throw new Error(`Failed to assign admin role: ${assignError.message}`);
    }

    // Log the action
    const { error: logError } = await supabaseAdmin
      .from('admin_actions_log')
      .insert({
        admin_id: user.id,
        action_type: 'assign_role',
        target_user_id: user.id,
        details: { role: 'admin', method: 'manual_assignment' }
      });

    if (logError) {
      console.warn('Failed to log admin action:', logError.message);
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully assigned admin role to ${email}`,
        user_id: user.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error('Error in assign-admin-role function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});