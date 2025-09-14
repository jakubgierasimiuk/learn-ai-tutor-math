-- Add new columns for bug reporting system to app_error_logs table
ALTER TABLE app_error_logs ADD COLUMN user_description TEXT;
ALTER TABLE app_error_logs ADD COLUMN reproduction_steps TEXT;
ALTER TABLE app_error_logs ADD COLUMN severity TEXT CHECK (severity IN ('blocking', 'hindering', 'cosmetic'));
ALTER TABLE app_error_logs ADD COLUMN status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'fixed'));
ALTER TABLE app_error_logs ADD COLUMN admin_notes TEXT;
ALTER TABLE app_error_logs ADD COLUMN user_journey JSONB;
ALTER TABLE app_error_logs ADD COLUMN session_context JSONB;