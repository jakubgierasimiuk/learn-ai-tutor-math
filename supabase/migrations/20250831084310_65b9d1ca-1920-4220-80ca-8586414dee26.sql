-- Fix the learning_analytics table security issue
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict access to learning analytics data
CREATE POLICY "Users can only view their own learning analytics" 
ON public.learning_analytics 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- If there are INSERT/UPDATE operations needed, add policies for those too
CREATE POLICY "System can insert learning analytics" 
ON public.learning_analytics 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning analytics" 
ON public.learning_analytics 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);