-- First, check if RLS is enabled (it should be based on the schema, but let's make sure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies and create restrictive ones
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create restrictive policies that properly enforce access control
CREATE POLICY "Users can only view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure no public access to the profiles table
-- (RLS enabled means anonymous users can't access without explicit policies)