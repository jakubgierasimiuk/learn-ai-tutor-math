-- Reset founding scarcity state to show 100 available spots
UPDATE founding_scarcity_state
SET 
  virtual_spots_taken = 0,
  accumulated_decrease = 0,
  daily_consumed_spots = 0,
  cycle_start_date = CURRENT_DATE,
  last_update = now(),
  updated_at = now()
WHERE id IN (SELECT id FROM founding_scarcity_state LIMIT 1);

-- If no record exists, insert one
INSERT INTO founding_scarcity_state (
  virtual_spots_taken,
  accumulated_decrease,
  daily_consumed_spots,
  cycle_start_date,
  hourly_decrease_rate,
  daily_target_decrease,
  peak_hours_config,
  last_update,
  updated_at
)
SELECT 
  0,
  0,
  0,
  CURRENT_DATE,
  5,
  10,
  '{"peak_end": 22, "peak_start": 16, "peak_multiplier": 1.5}'::jsonb,
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM founding_scarcity_state);