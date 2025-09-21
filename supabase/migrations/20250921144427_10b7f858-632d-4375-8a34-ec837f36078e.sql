-- Fix extension in public schema security issue
-- Move pg_net extension to extensions schema to improve security

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_net extension to extensions schema
ALTER EXTENSION pg_net SET SCHEMA extensions;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA extensions TO public;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO public;