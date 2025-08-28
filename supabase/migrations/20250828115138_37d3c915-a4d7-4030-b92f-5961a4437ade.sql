-- Add fields to track onboarding progress
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ai_tutorial_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_lesson_completed BOOLEAN DEFAULT false;