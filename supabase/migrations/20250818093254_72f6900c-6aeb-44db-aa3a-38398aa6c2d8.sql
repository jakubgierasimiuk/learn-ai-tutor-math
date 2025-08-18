-- Complete Package #4 with remaining essential skills

WITH rozkład_skill AS (
  SELECT id FROM skills WHERE name = 'Rozkład na czynniki pierwsze i zapis potęgowy'
),
dziesiętne_skills AS (
  SELECT id, name FROM skills WHERE name IN (
    'Dzielenie liczb dziesiętnych (przesunięcie przecinka w dzielniku)',
    'Ułamki równoważne i skracanie przez NWD'
  )
),
geometry_skills AS (
  SELECT id, name FROM skills WHERE name IN (
    'Pole równoległoboku i rombu – wysokość i przekątne',
    'Mnożenie liczb dziesiętnych (liczenie miejsc po przecinku)',
    'Konwersje długości, masy, objętości – podstawy',
    'Symetria osiowa – rozpoznawanie i rysowanie odbić'
  )
),
fraction_skills AS (
  SELECT id, name FROM skills WHERE name IN (
    'Dodawanie i odejmowanie ułamków o wspólnym mianowniku',
    'Ułamki równoważne i skracanie przez NWD'
  )
)
INSERT INTO skills (name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives) VALUES
-- NWD and NWW
('NWD – największy wspólny dzielnik (rozkłady, algorytm Euklidesa)', 'arithmetic', 'intermediate', 5, null, 'Obliczanie NWD z rozkładu na czynniki i algorytmem Euklidesa.', 'NWD i NWW', ARRAY[(SELECT id FROM rozkład_skill)], 20, 3, '["Wyznacza NWD z rozkładów", "Stosuje algorytm Euklidesa", "Używa NWD do skracania ułamków"]'::jsonb),
('NWW – najmniejsza wspólna wielokrotność (z rozkładów)', 'arithmetic', 'intermediate', 5, null, 'Wyznaczanie NWW przez dobór maksymalnych potęg czynników.', 'NWD i NWW', ARRAY[(SELECT id FROM rozkład_skill)], 20, 3, '["Dobiera potęgi czynników", "Sprawdza relację NWD·NWW=a·b", "Stosuje do wspólnego mianownika"]'::jsonb),

-- Fractions advanced operations
('Ułamki równoważne i skracanie przez NWD', 'arithmetic', 'basic', 5, null, 'Rozpoznanie równoważności i skracanie ułamków przez NWD.', 'Ułamki zwykłe', ARRAY[(SELECT id FROM rozkład_skill)], 20, 2, '["Wyznacza NWD licznika i mianownika", "Skraca do nieskracalnej", "Sprawdza równoważność"]'::jsonb),
('Sprowadzanie do wspólnego mianownika (NWW mianowników)', 'arithmetic', 'intermediate', 5, null, 'Wspólny mianownik poprzez NWW – przygotowanie do dodawania/odejmowania.', 'Ułamki zwykłe', ARRAY[(SELECT id FROM skills WHERE name = 'NWW – najmniejsza wspólna wielokrotność (z rozkładów)')], 20, 3, '["Dobiera NWW mianowników", "Rozszerza ułamki", "Kontroluje równoważność po rozszerzeniu"]'::jsonb),
('Dodawanie i odejmowanie ułamków o różnych mianownikach', 'arithmetic', 'intermediate', 5, null, 'Sprowadzanie do wspólnego mianownika i operacje na licznikach.', 'Ułamki – działania', ARRAY[(SELECT id FROM skills WHERE name = 'Sprowadzanie do wspólnego mianownika (NWW mianowników)')], 20, 3, '["Sprowadza do NWW", "Dodaje/odejmuje liczniki", "Upraszcza wynik"]'::jsonb),
('Mnożenie ułamków (w tym przez liczbę naturalną) – skracanie na krzyż', 'arithmetic', 'intermediate', 5, null, 'Mnożenie liczników i mianowników, skracanie na krzyż.', 'Ułamki – działania', ARRAY[(SELECT id FROM skills WHERE name = 'Ułamki równoważne i skracanie przez NWD')], 20, 3, '["Mnoży ułamki i skraca", "Interpretuje mnożenie przez naturalną", "Weryfikuje wyniki"]'::jsonb),
('Dzielenie ułamków – mnożenie przez odwrotność', 'arithmetic', 'intermediate', 5, null, 'Zamiana dzielenia na mnożenie przez odwrotność drugiego czynnika.', 'Ułamki – działania', ARRAY[(SELECT id FROM skills WHERE name = 'Mnożenie ułamków (w tym przez liczbę naturalną) – skracanie na krzyż')], 20, 3, '["Stosuje odwrotność", "Skraca na krzyż", "Sprawdza wynik przez mnożenie"]'::jsonb),

-- Decimals to fractions conversions  
('Liczby dziesiętne ↔ ułamki zwykłe (zamiany w obie strony)', 'arithmetic', 'basic', 5, null, 'Dzielenie licznika przez mianownik i zapis dziesiętny jako ułamek (10^k).', 'Ułamki ↔ dziesiętne', 
  ARRAY[
    (SELECT id FROM dziesiętne_skills WHERE name = 'Dzielenie liczb dziesiętnych (przesunięcie przecinka w dzielniku)'),
    (SELECT id FROM dziesiętne_skills WHERE name = 'Ułamki równoważne i skracanie przez NWD')
  ], 15, 2, '["Zamienia przez dzielenie", "Zapisuje dziesiętne jako ułamki", "Skraca do nieskracalnej"]'::jsonb),

-- Proportions and percentages foundations
('Stosunek, proporcja i skala – wprowadzenie i interpretacja', 'arithmetic', 'basic', 5, null, 'Zapis a:b=c:d, sprawdzanie prawdziwości proporcji, skale map.', 'Proporcje i skale', ARRAY[(SELECT id FROM geometry_skills WHERE name = 'Mnożenie liczb dziesiętnych (liczenie miejsc po przecinku)')], 15, 2, '["Zapisuje proporcje", "Sprawdza równoważność", "Przelicza odległości w skali"]'::jsonb),

-- Geometry advanced 
('Pole trapezu – średnia arytmetyczna podstaw', 'geometry', 'intermediate', 6, null, 'P=1/2·(a+b)·h, identyfikacja podstaw i wysokości.', 'Obwody i pola', ARRAY[(SELECT id FROM geometry_skills WHERE name = 'Pole równoległoboku i rombu – wysokość i przekątne')], 20, 3, '["Rozróżnia elementy trapezu", "Stosuje wzór poprawnie", "Szacuje wynik"]'::jsonb),
('Koło i okrąg – elementy, obwód i pole (π≈3,14)', 'geometry', 'intermediate', 6, null, 'Promień, średnica, obwód 2πr i pole πr² – obliczenia przybliżone.', 'Koło i okrąg', ARRAY[(SELECT id FROM geometry_skills WHERE name = 'Mnożenie liczb dziesiętnych (liczenie miejsc po przecinku)')], 20, 3, '["Odróżnia promień i średnicę", "Oblicza obwód/pole", "Dobiera jednostki"]'::jsonb),
('Jednostki pola i objętości – konwersje (cm²↔m², cm³↔ml↔l)', 'arithmetic', 'intermediate', 6, null, 'Przeliczenia jednostek pola i objętości; uważność na potęgi 10.', 'Jednostki i wielkości', ARRAY[(SELECT id FROM geometry_skills WHERE name = 'Konwersje długości, masy, objętości – podstawy')], 20, 3, '["Tworzy tabele przeliczeń", "Rozróżnia m² vs m³", "Unika błędu ×10 vs ×100 vs ×1000"]'::jsonb),
('Symetria środkowa (punktowa) – wstęp i konstrukcje', 'geometry', 'intermediate', 6, null, 'Konstrukcje obrazu w symetrii środkowej i rozpoznawanie figur środkowo-symetrycznych.', 'Symetrie', ARRAY[(SELECT id FROM geometry_skills WHERE name = 'Symetria osiowa – rozpoznawanie i rysowanie odbić')], 20, 3, '["Odnajduje środek symetrii", "Konstrukcja obrazów punktów", "Analizuje własności figur"]'::jsonb);