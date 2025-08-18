-- First add the missing columns to skills table
ALTER TABLE skills ADD COLUMN IF NOT EXISTS content_data jsonb DEFAULT '{}';
ALTER TABLE skills ADD COLUMN IF NOT EXISTS generator_params jsonb DEFAULT '{}';