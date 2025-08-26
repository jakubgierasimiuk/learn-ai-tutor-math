-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Create app_roles table for role definitions
CREATE TABLE public.app_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name app_role NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for user-role assignments
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create admin_actions_log for audit trail
CREATE TABLE public.admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.app_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions_log ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(role) 
  FROM public.user_roles 
  WHERE user_id = _user_id;
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role);
$$;

-- RLS Policies for app_roles
CREATE POLICY "Anyone can view app roles" ON public.app_roles
  FOR SELECT USING (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- RLS Policies for admin_actions_log
CREATE POLICY "Admins can view admin actions log" ON public.admin_actions_log
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert admin actions log" ON public.admin_actions_log
  FOR INSERT WITH CHECK (public.is_admin() AND auth.uid() = admin_id);

-- Insert default roles
INSERT INTO public.app_roles (name, display_name, description, permissions) VALUES
  ('user', 'User', 'Standard user with basic access', '["view_own_data", "create_sessions", "complete_lessons"]'::jsonb),
  ('admin', 'Administrator', 'Full system access and user management', '["manage_users", "manage_roles", "view_analytics", "manage_content", "system_admin"]'::jsonb);

-- Create trigger for updating timestamps
CREATE TRIGGER update_app_roles_updated_at
  BEFORE UPDATE ON public.app_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add admin role to existing admin users (those with admin/test emails)
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
  au.id,
  'admin'::app_role,
  au.id
FROM auth.users au
WHERE au.email LIKE '%admin%' OR au.email LIKE '%test%'
ON CONFLICT (user_id, role) DO NOTHING;