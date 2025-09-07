-- Add RLS policy for admins to view all AI conversation logs
CREATE POLICY "Admins can view all AI conversation logs" 
ON ai_conversation_log 
FOR SELECT 
USING (public.is_admin());