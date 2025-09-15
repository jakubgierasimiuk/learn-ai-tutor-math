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

-- Create function to update virtual scarcity
CREATE OR REPLACE FUNCTION public.update_virtual_scarcity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_hour integer;
  is_peak_hour boolean;
  decrease_amount integer;
  peak_multiplier numeric;
  current_state record;
  virtual_spots_left integer;
BEGIN
  -- Get current hour
  current_hour := EXTRACT(HOUR FROM now());
  
  -- Get current state
  SELECT * INTO current_state
  FROM public.founding_scarcity_state
  ORDER BY updated_at DESC
  LIMIT 1;
  
  -- Check if we're in peak hours
  is_peak_hour := current_hour >= (current_state.peak_hours_config->>'peak_start')::integer
                  AND current_hour <= (current_state.peak_hours_config->>'peak_end')::integer;
  
  -- Get peak multiplier
  peak_multiplier := COALESCE((current_state.peak_hours_config->>'peak_multiplier')::numeric, 1.5);
  
  -- Calculate decrease amount (3-8 range, more during peak hours)
  IF is_peak_hour THEN
    decrease_amount := (RANDOM() * 5 + 3)::integer * peak_multiplier;
  ELSE
    decrease_amount := (RANDOM() * 5 + 3)::integer;
  END IF;
  
  -- Ensure we never go below 3 spots left
  virtual_spots_left := public.get_virtual_spots_left();
  
  -- Only decrease if we have more than 3 spots and the decrease won't put us below 3
  IF virtual_spots_left > 3 AND (virtual_spots_left - decrease_amount) >= 3 THEN
    UPDATE public.founding_scarcity_state
    SET 
      virtual_spots_taken = virtual_spots_taken + decrease_amount,
      last_update = now(),
      updated_at = now()
    WHERE id = current_state.id;
  END IF;
END;
$function$

-- Create trigger to update timestamp
CREATE TRIGGER update_founding_scarcity_state_updated_at
BEFORE UPDATE ON public.founding_scarcity_state
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();