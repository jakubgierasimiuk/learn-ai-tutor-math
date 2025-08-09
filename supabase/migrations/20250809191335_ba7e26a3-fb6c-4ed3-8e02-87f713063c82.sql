-- Fix function search_path to satisfy linter and improve security
ALTER FUNCTION public.update_updated_at_column()
SET search_path = public;
