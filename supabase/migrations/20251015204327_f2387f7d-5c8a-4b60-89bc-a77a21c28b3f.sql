-- Reset founding scarcity state to show 98 spots left
UPDATE founding_scarcity_state 
SET 
  virtual_spots_taken = 2,
  updated_at = now()
WHERE id = 'd72259aa-6c49-47ef-927d-99db38d9dbd9';