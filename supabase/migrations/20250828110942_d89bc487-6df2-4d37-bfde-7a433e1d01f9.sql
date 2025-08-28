-- Add ai_tutorial_completed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_tutorial_completed BOOLEAN DEFAULT FALSE;