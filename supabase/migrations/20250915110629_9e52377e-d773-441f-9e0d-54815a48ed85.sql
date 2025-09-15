-- Create founding scarcity state table
CREATE TABLE public.founding_scarcity_state (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  virtual_spots_taken integer NOT NULL DEFAULT 0,
  last_update timestamp with time zone NOT NULL DEFAULT now(),
  hourly_decrease_rate integer NOT NULL DEFAULT 5,
  peak_hours_config jsonb NOT NULL DEFAULT '{"peak_start": 16, "peak_end": 22, "peak_multiplier": 1.5}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founding_scarcity_state ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view scarcity state" 
ON public.founding_scarcity_state 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage scarcity state" 
ON public.founding_scarcity_state 
FOR ALL 
USING (true);

-- Insert initial state
INSERT INTO public.founding_scarcity_state (virtual_spots_taken, hourly_decrease_rate)
VALUES (0, 5);

-- Create function to get virtual spots left
CREATE OR REPLACE FUNCTION public.get_virtual_spots_left()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH real_members AS (
    SELECT COUNT(*)::integer as count
    FROM public.founding_members
    WHERE status = 'registered'
  ),
  virtual_state AS (
    SELECT virtual_spots_taken
    FROM public.founding_scarcity_state
    ORDER BY updated_at DESC
    LIMIT 1
  )
  SELECT GREATEST(0, 100 - (real_members.count + COALESCE(virtual_state.virtual_spots_taken, 0)))
  FROM real_members, virtual_state;
$function$