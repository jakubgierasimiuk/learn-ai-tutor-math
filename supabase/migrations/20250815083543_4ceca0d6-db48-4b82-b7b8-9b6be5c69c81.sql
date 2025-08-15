-- Add current_equation and initialized fields to study_sessions table
ALTER TABLE public.study_sessions 
ADD COLUMN IF NOT EXISTS current_equation TEXT,
ADD COLUMN IF NOT EXISTS initialized BOOLEAN DEFAULT FALSE;

-- Update existing sessions to be marked as initialized
UPDATE public.study_sessions 
SET initialized = TRUE 
WHERE initialized IS NULL OR initialized = FALSE;