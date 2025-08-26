-- Check the exact structure of the profiles table and its constraints
\d public.profiles;

-- List all constraints on the profiles table
SELECT constraint_name, constraint_type, column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' AND tc.table_schema = 'public';

-- Check if there are any issues with the unique constraint
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'profiles' AND schemaname = 'public';