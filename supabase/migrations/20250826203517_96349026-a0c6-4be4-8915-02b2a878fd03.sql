-- Check if the trigger exists and is properly configured
SELECT 
    t.tgname AS trigger_name,
    t.tgenabled AS is_enabled,
    p.proname AS function_name,
    pg_get_triggerdef(t.oid) AS trigger_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'auth.users'::regclass
AND t.tgname = 'on_auth_user_created';

-- Check if the handle_new_user function exists
SELECT 
    proname AS function_name,
    prosecdef AS is_security_definer,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user' 
AND pronamespace = 'public'::regnamespace;

-- Test the function directly to see if it works
SELECT public.handle_new_user();