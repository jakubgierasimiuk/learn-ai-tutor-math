-- Fix the learner_intelligence table constraint issue
ALTER TABLE learner_intelligence ADD CONSTRAINT learner_intelligence_user_id_unique UNIQUE (user_id);

-- Now manually create the missing profile
INSERT INTO profiles (user_id, email, ai_tutorial_completed, first_lesson_completed, learning_goal)
VALUES ('0ec22431-513b-4fe1-bfa6-67884643e586', 'ytrewq.trewq456@yahoo.com', false, false, 'poprawa_ocen')
ON CONFLICT (user_id) DO NOTHING;