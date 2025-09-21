-- Fix infinite recursion in study_group_members policies
-- First check the correct data types and fix the function

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can leave groups or admins can remove members" ON public.study_group_members;

-- Create a secure function to check if user is group admin with correct types
CREATE OR REPLACE FUNCTION public.is_group_admin(_user_id uuid, _group_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.study_group_members
    WHERE user_id = _user_id 
      AND group_id = _group_id 
      AND role = 'admin'
  );
$$;

-- Create secure policies without recursion
CREATE POLICY "Users can leave groups or admins can remove" 
ON public.study_group_members FOR DELETE 
USING (
  auth.uid() = user_id OR 
  public.is_group_admin(auth.uid(), group_id)
);