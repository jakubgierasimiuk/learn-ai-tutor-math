-- Add new columns to founding_scarcity_state for improved logic
ALTER TABLE founding_scarcity_state ADD COLUMN IF NOT EXISTS daily_target_decrease integer DEFAULT 10;
ALTER TABLE founding_scarcity_state ADD COLUMN IF NOT EXISTS daily_consumed_spots integer DEFAULT 0;
ALTER TABLE founding_scarcity_state ADD COLUMN IF NOT EXISTS cycle_start_date date DEFAULT CURRENT_DATE;
ALTER TABLE founding_scarcity_state ADD COLUMN IF NOT EXISTS accumulated_decrease numeric DEFAULT 0;

-- Reset the current state for new 7-day cycle
UPDATE founding_scarcity_state 
SET 
  virtual_spots_taken = 5,  -- Reset to show 95 spots available
  daily_consumed_spots = 0,
  cycle_start_date = CURRENT_DATE,
  accumulated_decrease = 0,
  last_update = NOW(),
  updated_at = NOW()
WHERE id = 'd72259aa-6c49-47ef-927d-99db38d9dbd9';

-- Update the get_virtual_spots_left function to use new logic
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
  SELECT GREATEST(3, 100 - (real_members.count + COALESCE(virtual_state.virtual_spots_taken, 0)))
  FROM real_members, virtual_state;
$function$;