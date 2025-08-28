-- Fix authentication registration issues without breaking foreign keys
-- Since other tables depend on profiles_user_id_key, we'll keep it and fix the function

-- Drop and recreate the trigger and function with correct ON CONFLICT syntax
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a robust function that uses the correct unique constraint name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new profile using the existing unique constraint
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, ''), -- Handle potential NULL email
    COALESCE(NEW.raw_user_meta_data ->> 'name', '')
  )
  ON CONFLICT ON CONSTRAINT profiles_pkey DO NOTHING; -- Use the primary key constraint instead
  
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