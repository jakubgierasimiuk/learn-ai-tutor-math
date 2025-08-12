-- Purge AI chat logs and study tutor steps for a specific user by email
DO $$
DECLARE
  target_user_id uuid;
  chat_deleted_count int := 0;
  steps_deleted_count int := 0;
BEGIN
  -- Find user by email from profiles
  SELECT user_id INTO target_user_id
  FROM profiles
  WHERE email = 'jakub.gierasimiuk@gmail.com'
  ORDER BY created_at DESC
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'No user found for email %', 'jakub.gierasimiuk@gmail.com';
    RETURN;
  END IF;

  -- Delete AIChat logs (chat_logs) if lesson_sessions table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'lesson_sessions'
  ) THEN
    EXECUTE format(
      'DELETE FROM public.chat_logs USING public.lesson_sessions ls
       WHERE chat_logs.session_id = ls.id AND ls.user_id = %L',
      target_user_id
    );
    GET DIAGNOSTICS chat_deleted_count = ROW_COUNT;
  ELSE
    RAISE NOTICE 'Table public.lesson_sessions not found; skipping chat_logs cleanup';
  END IF;

  -- Delete StudyTutor steps (lesson_steps joined via study_sessions)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'study_sessions'
  ) THEN
    EXECUTE format(
      'DELETE FROM public.lesson_steps USING public.study_sessions ss
       WHERE lesson_steps.session_id = ss.id AND ss.user_id = %L',
      target_user_id
    );
    GET DIAGNOSTICS steps_deleted_count = ROW_COUNT;
  ELSE
    RAISE NOTICE 'Table public.study_sessions not found; skipping lesson_steps cleanup';
  END IF;

  RAISE NOTICE 'Deleted rows -> chat_logs: %, lesson_steps: %', chat_deleted_count, steps_deleted_count;
END $$;