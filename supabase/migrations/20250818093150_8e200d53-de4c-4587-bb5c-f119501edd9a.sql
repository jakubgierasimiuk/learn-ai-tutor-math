-- Continue with more complex Package #4 skills

WITH skill_ids AS (
  SELECT id, name FROM skills WHERE name IN (
    'Własności działań: przemienność i łączność (dodawanie, mnożenie)',
    'Dzielenie pisemne przez liczbę jednocyfrową (z resztą)',
    'Reguły podzielności przez 2, 3, 5, 9, 10',
    'Mnożenie pisemne przez liczbę jednocyfrową',
    'Trójkąty – klasyfikacja według boków i kątów',
    'Kolejność wykonywania działań z nawiasami',
    'Dodawanie i odejmowanie liczb dziesiętnych (wyrównanie przecinka)',
    'Mnożenie liczb dziesiętnych (liczenie miejsc po przecinku)',
    'Pole prostokąta i kwadratu – siatki i kafelkowanie'
  )
)
INSERT INTO skills (name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives) VALUES
('Rozdzielność mnożenia względem dodawania i odejmowania', 'arithmetic', 'basic', 5, null, 'Zastosowanie rozdzielności do obliczeń w pamięci i upraszczania.', 'Własności działań', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Własności działań: przemienność i łączność (dodawanie, mnożenie)')], 15, 2, '["Rozkłada czynnik na sumę", "Upraszcza rachunki mentalne", "Ocena błędów typowych"]'::jsonb),
('Mnożenie pisemne przez liczbę dwucyfrową', 'arithmetic', 'intermediate', 5, null, 'Metoda wierszy częściowych, dodawanie wyników cząstkowych.', 'Działania pisemne', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Mnożenie pisemne przez liczbę jednocyfrową')], 20, 3, '["Wyznacza wiersze częściowe", "Poprawnie sumuje częściowe", "Kontroluje liczbę zer"]'::jsonb),
('Dzielenie pisemne przez liczbę dwucyfrową (proste przypadki)', 'arithmetic', 'intermediate', 5, null, 'Dzielenie przez 10–99, estymacja kolejnych cyfr ilorazu.', 'Działania pisemne', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Dzielenie pisemne przez liczbę jednocyfrową (z resztą)')], 25, 3, '["Szacuje cyfry ilorazu", "Weryfikuje przez mnożenie", "Analizuje sensowność wyniku"]'::jsonb),
('Rozkład na czynniki pierwsze i zapis potęgowy', 'arithmetic', 'intermediate', 5, null, 'Rozkład metodą kratki/drzewa i zapis w notacji potęgowej.', 'Podzielność liczb', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Reguły podzielności przez 2, 3, 5, 9, 10')], 20, 3, '["Dzieli przez kolejne liczby pierwsze", "Zapisuje potęgowo", "Weryfikuje rozkład mnożeniem"]'::jsonb),
('Suma kątów wewnętrznych trójkąta (180°) – zastosowania', 'geometry', 'basic', 5, null, 'Obliczenia brakujących kątów na podstawie sumy 180°.', 'Trójkąty', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Trójkąty – klasyfikacja według boków i kątów')], 15, 2, '["Oblicza brakujące kąty", "Stosuje na rysunku", "Uzasadnia rachunki"]'::jsonb),
('Dzielenie liczb dziesiętnych (przesunięcie przecinka w dzielniku)', 'arithmetic', 'intermediate', 5, null, 'Usuwanie przecinka z dzielnika i odpowiednie przesunięcie w dzielnej.', 'Liczby dziesiętne – działania', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Dzielenie pisemne przez liczbę jednocyfrową (z resztą)')], 20, 3, '["Przesuwa przecinki poprawnie", "Wyznacza miejsca w ilorazie", "Sprawdza przez mnożenie"]'::jsonb),
('Pole równoległoboku i rombu – wysokość i przekątne', 'geometry', 'intermediate', 5, null, 'P=a·h dla równoległoboku, P= (e·f)/2 dla rombu – interpretacja wysokości/przekątnych.', 'Obwody i pola', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Pole prostokąta i kwadratu – siatki i kafelkowanie')], 20, 3, '["Wskazuje wysokość i przekątne", "Dobiera wzór do figury", "Stosuje w zadaniach praktycznych"]'::jsonb),
('Czworokąty – klasyfikacja (kwadrat, prostokąt, romb, równoległobok, trapez)', 'geometry', 'basic', 5, null, 'Rozpoznawanie i własności podstawowych czworokątów.', 'Czworokąty', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Suma kątów wewnętrznych trójkąta (180°) – zastosowania')], 20, 2, '["Klasyfikuje czworokąty", "Wskazuje równoległe boki", "Stosuje własności w zadaniach"]'::jsonb);

-- Add more complex skills that require multiple prerequisites
WITH complex_skill_ids AS (
  SELECT id, name FROM skills WHERE name IN (
    'Kolejność wykonywania działań z nawiasami',
    'Dodawanie i odejmowanie liczb dziesiętnych (wyrównanie przecinka)',
    'Zaokrąglanie liczb naturalnych do dziesiątek, setek, tysięcy'
  )
)
INSERT INTO skills (name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives) VALUES
('Kolejność działań – wyrażenia z liczbami dziesiętnymi', 'arithmetic', 'intermediate', 5, null, 'Wyrażenia wieloetapowe z nawiasami i liczbami dziesiętnymi.', 'Kolejność działań', 
  ARRAY[
    (SELECT id FROM complex_skill_ids WHERE name = 'Kolejność wykonywania działań z nawiasami'),
    (SELECT id FROM complex_skill_ids WHERE name = 'Dodawanie i odejmowanie liczb dziesiętnych (wyrównanie przecinka)')
  ], 20, 3, '["Stosuje reguły kolejności", "Uzasadnia kroki obliczeń", "Weryfikuje wyniki w kontekście"]'::jsonb),
('Szacowanie wyników i kontrola błędów rachunkowych', 'arithmetic', 'intermediate', 6, null, 'Stosowanie zaokrągleń, estymacji rzędu wielkości i odwracania działań.', 'Szacowanie', 
  ARRAY[
    (SELECT id FROM complex_skill_ids WHERE name = 'Zaokrąglanie liczb naturalnych do dziesiątek, setek, tysięcy'),
    (SELECT id FROM complex_skill_ids WHERE name = 'Kolejność działań – wyrażenia z liczbami dziesiętnymi')
  ], 20, 3, '["Oszacowuje wyniki przed obliczeniem", "Wykrywa błędy rzędu wielkości", "Stosuje działanie odwrotne do weryfikacji"]'::jsonb);