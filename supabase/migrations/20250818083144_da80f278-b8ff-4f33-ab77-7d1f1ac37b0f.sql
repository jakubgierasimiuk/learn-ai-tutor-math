-- Add Package #4 skills for grades 4-6 with correct prerequisite UUIDs

-- First, add basic skills that don't have prerequisites
INSERT INTO skills (name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives) VALUES
-- Basic skills without prerequisites
('Wartość miejsca w systemie dziesiętnym (do milionów)', 'arithmetic', 'basic', 4, null, 'Odczyt i zapis liczb do 7 cyfr, rozkład na sumę składowych miejsc.', 'Liczby naturalne', ARRAY[]::uuid[], 15, 1, ARRAY['Rozpoznaje wartość miejsca', 'Rozkłada liczbę na rozwinięcie dziesiętne', 'Porównuje na podstawie najwyższego miejsca']),
('Tabliczka mnożenia do 100', 'arithmetic', 'basic', 4, null, 'Automatyzacja tabliczki mnożenia.', 'Działania podstawowe', ARRAY[]::uuid[], 15, 1, ARRAY['Zna tabliczkę mnożenia', 'Mnoży szybko w pamięci', 'Stosuje w zadaniach']),
('Oś liczbowa – podstawy', 'arithmetic', 'basic', 4, null, 'Podstawowe pojęcie osi liczbowej.', 'Oś liczbowa', ARRAY[]::uuid[], 10, 1, ARRAY['Zaznacza liczby na osi', 'Odczytuje wartości', 'Porównuje pozycje']),
('Konwersje długości, masy, objętości – podstawy', 'arithmetic', 'basic', 5, null, 'Podstawowe przeliczenia jednostek.', 'Jednostki', ARRAY[]::uuid[], 15, 2, ARRAY['Przelicza jednostki', 'Dobiera właściwe jednostki', 'Sprawdza sensowność']),
('Elementy figury – punkt, prosta, odcinek, półprosta', 'geometry', 'basic', 4, null, 'Podstawowe pojęcia geometrii płaskiej i ich oznaczenia.', 'Pojęcia wstępne', ARRAY[]::uuid[], 15, 1, ARRAY['Rozpoznaje elementy na rysunku', 'Stosuje poprawne oznaczenia', 'Rysuje proste konstrukcje']);

-- Now add skills with prerequisites using the IDs of skills we just inserted
WITH skill_ids AS (
  SELECT id, name FROM skills WHERE name IN (
    'Wartość miejsca w systemie dziesiętnym (do milionów)',
    'Tabliczka mnożenia do 100', 
    'Oś liczbowa – podstawy',
    'Konwersje długości, masy, objętości – podstawy',
    'Elementy figury – punkt, prosta, odcinek, półprosta'
  )
)
INSERT INTO skills (name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives)
SELECT * FROM (VALUES
  ('Porównywanie i porządkowanie liczb naturalnych', 'arithmetic', 'basic', 4, null, 'Porównywanie liczb różnej długości zapisu i porządkowanie rosnąco/malejąco.', 'Liczby naturalne', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Wartość miejsca w systemie dziesiętnym (do milionów)')], 15, 1, ARRAY['Porządkuje listy liczb', 'Zaznacza liczby na osi', 'Uzasadnia porównania']),
  ('Zaokrąglanie liczb naturalnych do dziesiątek, setek, tysięcy', 'arithmetic', 'basic', 4, null, 'Reguła 0–4 w dół i 5–9 w górę, zastosowanie do szacowania.', 'Liczby naturalne', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Wartość miejsca w systemie dziesiętnym (do milionów)')], 15, 1, ARRAY['Zaokrągla do wskazanego miejsca', 'Szacuje wyniki działań', 'Ocena sensowności przybliżeń']),
  ('Rodzaje kątów i pomiar kątomierzem', 'geometry', 'basic', 4, null, 'Kąty ostre, proste, rozwarte; pomiar i rysowanie.', 'Kąty', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Elementy figury – punkt, prosta, odcinek, półprosta')], 15, 1, ARRAY['Mierzy kąty', 'Rysuje podany kąt', 'Klasyfikuje kąty']),
  ('Liczby dziesiętne – zapis, porównywanie i oś liczbowa', 'arithmetic', 'basic', 4, null, 'Miejsca dziesiętne i setne, porównywanie i zaznaczanie na osi.', 'Liczby dziesiętne', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Wartość miejsca w systemie dziesiętnym (do milionów)')], 15, 2, ARRAY['Porównuje liczby dziesiętne', 'Porządkuje rosnąco/malejąco', 'Wyznacza pozycje na osi']),
  ('Ułamki zwykłe – pojęcie i reprezentacje (część całości, odcinek, diagram)', 'arithmetic', 'basic', 4, null, 'Ułamek jako część całości i jako iloraz liczb naturalnych.', 'Ułamki zwykłe', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Wartość miejsca w systemie dziesiętnym (do milionów)')], 20, 2, ARRAY['Odczytuje i zapisuje ułamki', 'Zaznacza na osi liczbowej', 'Wskazuje całość i część']),
  ('Mnożenie pisemne przez liczbę jednocyfrową', 'arithmetic', 'basic', 4, null, 'Mnożenie kolumnowe przez 2–9 z przeniesieniami.', 'Działania pisemne', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Tabliczka mnożenia do 100')], 15, 2, ARRAY['Stosuje układ w kolumnie', 'Kontroluje przeniesienia', 'Oszacowuje rząd wielkości']),
  ('Liczby całkowite – wprowadzenie (dodatnie i ujemne)', 'real_numbers', 'basic', 6, null, 'Znaczenie liczb ujemnych (temperatura, długi, wysokości).', 'Liczby całkowite', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Oś liczbowa – podstawy')], 15, 2, ARRAY['Zaznacza liczby całkowite na osi', 'Porównuje całkowite', 'Rozumie interpretacje kontekstowe'])
) AS v(name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives);