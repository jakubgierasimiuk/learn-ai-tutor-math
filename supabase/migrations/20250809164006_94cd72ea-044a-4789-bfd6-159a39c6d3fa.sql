-- Ensure timestamp update function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create diagnostic_items bank table
CREATE TABLE IF NOT EXISTS public.diagnostic_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_code TEXT UNIQUE NOT NULL,
  prompt TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'mcq',
  choices JSONB NOT NULL,
  correct_key TEXT NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] NOT NULL DEFAULT '{}',
  topic TEXT NOT NULL,
  class_levels INTEGER[] DEFAULT '{}',
  track TEXT DEFAULT 'basic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diagnostic_items ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can view active items
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Anyone can view active diagnostic items' 
      AND schemaname = 'public'
      AND tablename = 'diagnostic_items'
  ) THEN
    CREATE POLICY "Anyone can view active diagnostic items"
    ON public.diagnostic_items
    FOR SELECT
    USING (is_active = true);
  END IF;
END $$;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_diagnostic_items_updated_at ON public.diagnostic_items;
CREATE TRIGGER update_diagnostic_items_updated_at
BEFORE UPDATE ON public.diagnostic_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();