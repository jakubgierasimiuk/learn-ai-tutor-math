-- Database cleanup migration for application launch
-- This migration will clean test data while preserving admin account

-- Step 1: Identify and resolve user_id inconsistencies for admin user
-- Get the correct user_id from auth.users for jakub.gierasimiuk@gmail.com
DO $$
DECLARE
    admin_auth_id uuid;
    admin_profile_id uuid;
BEGIN
    -- Get auth.users ID for admin
    SELECT id INTO admin_auth_id 
    FROM auth.users 
    WHERE email = 'jakub.gierasimiuk@gmail.com';
    
    -- Get profiles user_id for admin  
    SELECT user_id INTO admin_profile_id
    FROM profiles 
    WHERE email = 'jakub.gierasimiuk@gmail.com';
    
    -- If they're different, update all references to use auth.users ID
    IF admin_auth_id IS NOT NULL AND admin_profile_id IS NOT NULL AND admin_auth_id != admin_profile_id THEN
        -- Update all tables to use the correct auth.users ID
        UPDATE profiles SET user_id = admin_auth_id WHERE user_id = admin_profile_id;
        UPDATE user_roles SET user_id = admin_auth_id WHERE user_id = admin_profile_id;
        UPDATE user_subscriptions SET user_id = admin_auth_id WHERE user_id = admin_profile_id;
        UPDATE study_sessions SET user_id = admin_auth_id WHERE user_id = admin_profile_id;
        UPDATE learning_interactions SET user_id = admin_auth_id WHERE user_id = admin_profile_id;
        UPDATE ai_conversation_log SET user_id = admin_auth_id WHERE user_id = admin_profile_id;
        UPDATE unified_learning_sessions SET user_id = admin_auth_id WHERE user_id = admin_profile_id;
        UPDATE referrals SET referrer_id = admin_auth_id WHERE referrer_id = admin_profile_id;
        UPDATE referrals SET referred_user_id = admin_auth_id WHERE referred_user_id = admin_profile_id;
        UPDATE user_referral_stats SET user_id = admin_auth_id WHERE user_id = admin_profile_id;
        
        RAISE NOTICE 'Updated admin user_id from % to %', admin_profile_id, admin_auth_id;
    END IF;
END $$;

-- Step 2: Remove test user ytrewq/trewq456@yahoo.com from all tables
-- First get the user_id to delete
DO $$
DECLARE
    test_user_id uuid;
    test_profile_id uuid;
BEGIN
    -- Get user ID from auth.users
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email = 'trewq456@yahoo.com';
    
    -- Get user ID from profiles  
    SELECT user_id INTO test_profile_id
    FROM profiles 
    WHERE email = 'trewq456@yahoo.com' OR name = 'ytrewq';
    
    -- Delete from all tables that reference user_id (cascade will handle most)
    IF test_user_id IS NOT NULL THEN
        DELETE FROM user_roles WHERE user_id = test_user_id;
        DELETE FROM user_subscriptions WHERE user_id = test_user_id;
        DELETE FROM study_sessions WHERE user_id = test_user_id;
        DELETE FROM learning_interactions WHERE user_id = test_user_id;
        DELETE FROM ai_conversation_log WHERE user_id = test_user_id;
        DELETE FROM unified_learning_sessions WHERE user_id = test_user_id;
        DELETE FROM referrals WHERE referrer_id = test_user_id OR referred_user_id = test_user_id;
        DELETE FROM user_referral_stats WHERE user_id = test_user_id;
        DELETE FROM profiles WHERE user_id = test_user_id;
        
        RAISE NOTICE 'Deleted test user data for auth ID: %', test_user_id;
    END IF;
    
    -- Also clean up by profile ID if different
    IF test_profile_id IS NOT NULL AND test_profile_id != test_user_id THEN
        DELETE FROM user_roles WHERE user_id = test_profile_id;
        DELETE FROM user_subscriptions WHERE user_id = test_profile_id;
        DELETE FROM study_sessions WHERE user_id = test_profile_id;
        DELETE FROM learning_interactions WHERE user_id = test_profile_id;
        DELETE FROM ai_conversation_log WHERE user_id = test_profile_id;
        DELETE FROM unified_learning_sessions WHERE user_id = test_profile_id;
        DELETE FROM referrals WHERE referrer_id = test_profile_id OR referred_user_id = test_profile_id;
        DELETE FROM user_referral_stats WHERE user_id = test_profile_id;
        DELETE FROM profiles WHERE user_id = test_profile_id;
        
        RAISE NOTICE 'Deleted test user data for profile ID: %', test_profile_id;
    END IF;
END $$;

-- Step 3: Clear analytical data while preserving admin data
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'jakub.gierasimiuk@gmail.com';
    
    -- Clear analytics cache completely
    DELETE FROM analytics_cache;
    RAISE NOTICE 'Cleared analytics cache';
    
    -- Clear page analytics (assume this table exists based on context)
    -- DELETE FROM page_analytics;
    
    -- Clear AI conversation logs except admin
    DELETE FROM ai_conversation_log 
    WHERE user_id IS NULL OR user_id != admin_user_id;
    RAISE NOTICE 'Cleared AI conversation logs except admin';
    
    -- Clear study sessions except admin
    DELETE FROM study_sessions 
    WHERE user_id IS NULL OR user_id != admin_user_id;
    RAISE NOTICE 'Cleared study sessions except admin';
    
    -- Clear learning interactions except admin
    DELETE FROM learning_interactions 
    WHERE user_id IS NULL OR user_id != admin_user_id;
    RAISE NOTICE 'Cleared learning interactions except admin';
    
    -- Clear unified learning sessions except admin
    DELETE FROM unified_learning_sessions 
    WHERE user_id IS NULL OR user_id != admin_user_id;
    RAISE NOTICE 'Cleared unified learning sessions except admin';
    
    -- Clear other test data tables
    DELETE FROM referrals WHERE referrer_id != admin_user_id AND referred_user_id != admin_user_id;
    DELETE FROM referral_events;
    DELETE FROM survey_responses WHERE user_id != admin_user_id;
    DELETE FROM user_surveys WHERE user_id != admin_user_id;
    DELETE FROM validation_logs WHERE user_id != admin_user_id;
    DELETE FROM app_error_logs WHERE user_id != admin_user_id;
    DELETE FROM emotional_learning_states WHERE user_id != admin_user_id;
    DELETE FROM learning_phase_progress WHERE user_id != admin_user_id;
    DELETE FROM misconception_networks WHERE user_id != admin_user_id;
    DELETE FROM learner_intelligence WHERE user_id != admin_user_id;
    
    RAISE NOTICE 'Cleared test data from analytical tables';
END $$;

-- Step 4: Reset sequences and clean up orphaned data
-- Clean up any orphaned records
DELETE FROM user_subscriptions 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Step 5: Verification queries
DO $$
DECLARE
    total_users integer;
    admin_exists boolean;
    admin_has_role boolean;
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO total_users FROM auth.users;
    
    -- Check admin exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'jakub.gierasimiuk@gmail.com') INTO admin_exists;
    
    -- Check admin has admin role
    SELECT EXISTS(
        SELECT 1 FROM user_roles ur 
        JOIN auth.users au ON ur.user_id = au.id 
        WHERE au.email = 'jakub.gierasimiuk@gmail.com' 
        AND ur.role = 'admin'
    ) INTO admin_has_role;
    
    RAISE NOTICE 'Cleanup completed. Total users: %, Admin exists: %, Admin has role: %', 
        total_users, admin_exists, admin_has_role;
END $$;