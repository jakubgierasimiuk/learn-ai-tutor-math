-- Add onboarding fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS initial_level text DEFAULT null,
ADD COLUMN IF NOT EXISTS learning_goal text DEFAULT null;

-- Update existing users to have onboarding_completed = true if they already have diagnosis_completed = true
UPDATE profiles 
SET onboarding_completed = true 
WHERE diagnosis_completed = true;