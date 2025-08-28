-- Add missing columns to profiles table for level tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS initial_level TEXT,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;