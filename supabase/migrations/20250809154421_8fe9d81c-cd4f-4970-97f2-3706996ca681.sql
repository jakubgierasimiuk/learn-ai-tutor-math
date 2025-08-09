-- Create diagnostic sessions table
CREATE TABLE IF NOT EXISTS public.diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  current_phase INTEGER NOT NULL DEFAULT 0,
  class_level INTEGER,
  track TEXT DEFAULT 'basic',
  self_ratings JSONB,
  meta JSONB,
  summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.diagnostic_sessions ENABLE ROW LEVEL SECURITY;

-- Policies: user can manage own sessions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can manage their own diagnostic sessions' 
      AND tablename = 'diagnostic_sessions'
  ) THEN
    CREATE POLICY "Users can manage their own diagnostic sessions"
    ON public.diagnostic_sessions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_diagnostic_sessions_updated_at ON public.diagnostic_sessions;
CREATE TRIGGER update_diagnostic_sessions_updated_at
BEFORE UPDATE ON public.diagnostic_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to set user_id from auth if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_user_id_on_diagnostic_sessions'
  ) THEN
    CREATE TRIGGER set_user_id_on_diagnostic_sessions
    BEFORE INSERT ON public.diagnostic_sessions
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_auth();
  END IF;
END $$;

-- Create diagnostic item attempts table
CREATE TABLE IF NOT EXISTS public.diagnostic_item_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  item_id UUID NULL,
  question_code TEXT NULL,
  phase INTEGER NULL,
  answer JSONB,
  is_correct BOOLEAN,
  confidence INTEGER,
  response_time_ms INTEGER,
  hint_level INTEGER DEFAULT 0,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_diag_attempts_user ON public.diagnostic_item_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_diag_attempts_session ON public.diagnostic_item_attempts(session_id);

-- Enable RLS for attempts
ALTER TABLE public.diagnostic_item_attempts ENABLE ROW LEVEL SECURITY;

-- Policies: users can insert/select their own attempts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert their own diagnostic attempts' 
      AND tablename = 'diagnostic_item_attempts'
  ) THEN
    CREATE POLICY "Users can insert their own diagnostic attempts"
    ON public.diagnostic_item_attempts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view their own diagnostic attempts' 
      AND tablename = 'diagnostic_item_attempts'
  ) THEN
    CREATE POLICY "Users can view their own diagnostic attempts"
    ON public.diagnostic_item_attempts
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Trigger to set user_id from auth if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_user_id_on_diagnostic_attempts'
  ) THEN
    CREATE TRIGGER set_user_id_on_diagnostic_attempts
    BEFORE INSERT ON public.diagnostic_item_attempts
    FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_auth();
  END IF;
END $$;
