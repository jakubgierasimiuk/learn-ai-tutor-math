-- Create founding_members table for tracking Founding 100 program
CREATE TABLE public.founding_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  phone text,
  registration_source text DEFAULT 'landing_page',
  referral_code text,
  referred_by uuid,
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'activated', 'churned')),
  founding_position integer,
  bonus_days_earned integer DEFAULT 0,
  registration_ip inet,
  device_info jsonb,
  utm_params jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founding_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own founding member record"
ON public.founding_members
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own founding member record"
ON public.founding_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all founding members"
ON public.founding_members
FOR SELECT
USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_founding_members_user_id ON public.founding_members(user_id);
CREATE INDEX idx_founding_members_status ON public.founding_members(status);
CREATE INDEX idx_founding_members_created_at ON public.founding_members(created_at);
CREATE UNIQUE INDEX idx_founding_members_email ON public.founding_members(email);

-- Create function to get current founding member count
CREATE OR REPLACE FUNCTION public.get_founding_members_count()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COUNT(*)::integer
  FROM public.founding_members
  WHERE status = 'registered';
$$;

-- Create function to assign founding position
CREATE OR REPLACE FUNCTION public.assign_founding_position()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Assign sequential founding position
  SELECT COALESCE(MAX(founding_position), 0) + 1
  INTO NEW.founding_position
  FROM public.founding_members;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic position assignment
CREATE TRIGGER assign_founding_position_trigger
  BEFORE INSERT ON public.founding_members
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_founding_position();

-- Create update trigger
CREATE TRIGGER update_founding_members_updated_at
  BEFORE UPDATE ON public.founding_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();