-- Set onboarding_completed to true for all existing users since the flow is incomplete
-- This is a one-time fix for the current users
UPDATE profiles 
SET onboarding_completed = true 
WHERE onboarding_completed = false;