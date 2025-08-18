-- Continue adding remaining Package #4 skills with proper dependencies

-- Add second level skills (requiring the ones we just added)
WITH skill_ids AS (
  SELECT id, name FROM skills WHERE name IN (
    'Porównywanie i porządkowanie liczb naturalnych',
    'Zaokrąglanie liczb naturalnych do dziesiątek, setek, tysięcy',
    'Mnożenie pisemne przez liczbę jednocyfrową',
    'Liczby dziesiętne – zapis, porównywanie i oś liczbowa',
    'Ułamki zwykłe – pojęcie i reprezentacje (część całości, odcinek, diagram)',
    'Liczby całkowite – wprowadzenie (dodatnie i ujemne)',
    'Rodzaje kątów i pomiar kątomierzem'
  )
)
INSERT INTO skills (name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives) VALUES
('Dodawanie pisemne liczb naturalnych (z przeniesieniem)', 'arithmetic', 'basic', 4, null, 'Kolumnowe dodawanie z przeniesieniami w wyższe rzędy.', 'Działania pisemne', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Porównywanie i porządkowanie liczb naturalnych')], 20, 2, '["Ustawia liczby w kolumnach", "Wykonuje przeniesienia", "Sprawdza wynik oszacowaniem"]'::jsonb),
('Czynniki i wielokrotności, parzystość i nieparzystość', 'arithmetic', 'basic', 4, null, 'Czynniki liczby i jej wielokrotności, pojęcie parzystości.', 'Podzielność liczb', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Porównywanie i porządkowanie liczb naturalnych')], 15, 2, '["Wyznacza czynniki", "Wyszukuje wielokrotności", "Rozpoznaje parzystość po reszcie z dzielenia przez 2"]'::jsonb),
('Dodawanie i odejmowanie liczb dziesiętnych (wyrównanie przecinka)', 'arithmetic', 'basic', 4, null, 'Ustawianie przecinków w kolumnach, przeniesienia i pożyczki.', 'Liczby dziesiętne – działania', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Liczby dziesiętne – zapis, porównywanie i oś liczbowa')], 20, 2, '["Wyrównuje przecinki", "Zaokrągla wynik", "Kontroluje wynik oszacowaniem"]'::jsonb),
('Ułamki niewłaściwe i liczby mieszane – obustronne zamiany', 'arithmetic', 'basic', 4, null, 'Konwersja ułamków niewłaściwych i liczb mieszanych oraz zastosowania w zadaniach.', 'Ułamki zwykłe', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Ułamki zwykłe – pojęcie i reprezentacje (część całości, odcinek, diagram)')], 15, 2, '["Rozkłada ułamek niewłaściwy", "Zamienia liczbę mieszaną na ułamek", "Stosuje w obliczeniach"]'::jsonb),
('Obwody wielokątów – zastosowania praktyczne', 'geometry', 'basic', 4, null, 'Obliczanie łącznej długości krawędzi figur, dobór jednostek.', 'Obwody i pola', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Porównywanie i porządkowanie liczb naturalnych')], 15, 1, '["Stosuje wzory obwodów", "Konwertuje jednostki długości", "Interpretuje wynik kontekstowo"]'::jsonb),
('Pole prostokąta i kwadratu – siatki i kafelkowanie', 'geometry', 'basic', 4, null, 'Pole jako liczba jednostek kwadratowych, wzory P=a·b i P=a².', 'Obwody i pola', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Mnożenie pisemne przez liczbę jednocyfrową')], 15, 2, '["Oblicza pole prostokąta/kwadratu", "Dobiera jednostki pola", "Łączy z siatką kwadratową"]'::jsonb),
('Dodawanie i odejmowanie liczb całkowitych na osi', 'real_numbers', 'basic', 6, null, 'Ruchy na osi jako model dodawania/odejmowania liczb ujemnych.', 'Liczby całkowite', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Liczby całkowite – wprowadzenie (dodatnie i ujemne)')], 20, 2, '["Modeluje działanie ruchem na osi", "Stosuje zasady znaków", "Weryfikuje wyniki przykładem"]'::jsonb),
('Kąty przyległe i wierzchołkowe – własności i obliczenia', 'geometry', 'basic', 5, null, 'Suma kątów przyległych 180°, równość kątów wierzchołkowych.', 'Kąty', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Rodzaje kątów i pomiar kątomierzem')], 15, 2, '["Wyznacza brakujące kąty", "Uzasadnia własności", "Zapisuje równości kątowe"]'::jsonb);