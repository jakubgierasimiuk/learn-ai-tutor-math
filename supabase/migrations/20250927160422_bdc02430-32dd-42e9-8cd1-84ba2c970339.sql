-- Reset founding counter to start from 100 spots available
UPDATE founding_scarcity_state 
SET virtual_spots_taken = 0, 
    updated_at = now()
WHERE id = 'd72259aa-6c49-47ef-927d-99db38d9dbd9';