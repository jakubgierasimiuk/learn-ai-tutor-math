-- Manually create profile for existing user who doesn't have one
DO $$
BEGIN
  -- Check if profile exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = '0ec22431-513b-4fe1-bfa6-67884643e586') THEN
    INSERT INTO profiles (user_id, email, ai_tutorial_completed, first_lesson_completed)
    VALUES ('0ec22431-513b-4fe1-bfa6-67884643e586', 'ytrewq.trewq456@yahoo.com', false, false);
  END IF;
END $$;

-- Ensure the trigger exists and is working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert new profile using UPSERT to avoid conflicts
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'name', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();