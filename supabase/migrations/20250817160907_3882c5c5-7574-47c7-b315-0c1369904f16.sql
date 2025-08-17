-- Add chapter_tag column to skills table if it doesn't exist
ALTER TABLE skills ADD COLUMN IF NOT EXISTS chapter_tag TEXT;

-- Insert a small test batch to verify structure
INSERT INTO skills (
  name, department, level, class_level, men_code, description, chapter_tag, 
  estimated_time_minutes, difficulty_rating, learning_objectives
) VALUES 
('Zastosowanie wzoru na kwadrat sumy i różnicy', 'algebra', 'basic', 9, 'III.2.1', 'Stosowanie wzoru skróconego mnożenia (a ± b)^2 do szybkiego rozwijania i upraszczania wyrażeń algebraicznych.', 'Wyrażenia algebraiczne', 20, 2, '{"Uczeń stosuje wzór (a ± b)^2 = a^2 ± 2ab + b^2 do rozwijania sumy i różnicy do kwadratu.", "Uczeń upraszcza wyrażenia algebraiczne, korzystając z powyższego wzoru skróconego mnożenia."}'),

('Różnica kwadratów - rozkład na czynniki', 'algebra', 'basic', 9, 'III.2.1', 'Rozpoznawanie i stosowanie tożsamości a^2 - b^2 = (a - b)(a + b) w celu faktoryzacji wyrażeń algebraicznych.', 'Wyrażenia algebraiczne', 20, 2, '{"Uczeń rozkłada wyrażenia w postaci różnicy dwóch kwadratów na iloczyn dwóch czynników liniowych.", "Uczeń rozpoznaje strukturę a^2 - b^2 w wyrażeniu i zastępuje ją iloczynem (a - b)(a + b)."}'),

('Mnożenie wielomianów (dwumian przez dwumian)', 'algebra', 'basic', 9, 'III.2.4', 'Umiejętność mnożenia dwóch dwumianów (lub ogólnie wielomianów) z wykorzystaniem rozdzielności mnożenia względem dodawania.', 'Wyrażenia algebraiczne', 20, 2, '{"Uczeń mnoży dwa dwumiany, np. (ax + b)(cx + d), obliczając sumę iloczynów wszystkich par składników.", "Uczeń porządkuje i upraszcza otrzymany wielomian po wykonaniu mnożenia."}');