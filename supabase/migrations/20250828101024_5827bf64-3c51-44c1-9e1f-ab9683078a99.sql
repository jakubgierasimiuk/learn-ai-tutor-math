-- Fix authentication registration issues
-- Step 1: Remove duplicate unique constraint on user_id in profiles table
-- Keep only the primary key, remove the extra unique constraint

-- First, check which unique constraints exist and remove the extra one
-- We'll keep the primary key and remove any additional unique constraints on user_id
DO $$ 
BEGIN
    -- Remove the extra unique constraint on user_id if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_unique' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_unique;
    END IF;
    
    -- Also remove the key constraint if it exists separately
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_key' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_key;
    END IF;
END $$;

-- Step 2: Drop and recreate the trigger and function with proper error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 3: Create a more robust function that handles all edge cases
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new profile, handling potential NULL email and conflicts
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, ''), -- Handle NULL email
    COALESCE(NEW.raw_user_meta_data ->> 'name', '')
  )
  ON CONFLICT (user_id) DO NOTHING; -- This should now work with only one unique constraint
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 4: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();