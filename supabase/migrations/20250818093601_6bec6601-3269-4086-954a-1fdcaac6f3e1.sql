-- Final batch of Package #4 skills - percentages, proportions, and remaining geometry

WITH proportion_base AS (
  SELECT id FROM skills WHERE name = 'Stosunek, proporcja i skala – wprowadzenie i interpretacja'
),
decimal_fraction AS (
  SELECT id FROM skills WHERE name = 'Liczby dziesiętne ↔ ułamki zwykłe (zamiany w obie strony)'
),
unit_conversions AS (
  SELECT id FROM skills WHERE name = 'Jednostki pola i objętości – konwersje (cm²↔m², cm³↔ml↔l)'
),
area_base AS (
  SELECT id FROM skills WHERE name = 'Pole prostokąta i kwadratu – siatki i kafelkowanie'
),
circle_skills AS (
  SELECT id FROM skills WHERE name = 'Koło i okrąg – elementy, obwód i pole (π≈3,14)'
),
trapez_skills AS (
  SELECT id FROM skills WHERE name = 'Pole trapezu – średnia arytmetyczna podstaw'
),
proportions AS (
  SELECT id FROM skills WHERE name = 'Proporcje – metoda na krzyż i uzupełnianie tabel'
),
fraction_mixed AS (
  SELECT id FROM skills WHERE name = 'Dodawanie i odejmowanie ułamków o różnych mianownikach'
),
percent_compound AS (
  SELECT id FROM skills WHERE name = 'Procent składany – 2–3 następujące po sobie zmiany'
)
INSERT INTO skills (name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives) VALUES
-- Proportions
('Proporcje – metoda na krzyż i uzupełnianie tabel', 'arithmetic', 'intermediate', 5, null, 'Rozwiązywanie proporcji metodą na krzyż, uzupełnianie braków w tabelach.', 'Proporcje i skale', ARRAY[(SELECT id FROM proportion_base)], 20, 3, '["Uzupełnia tablice proporcji", "Rozwiązuje na krzyż", "Weryfikuje wyniki"]'::jsonb),
('Jednostkowa cena, prędkość i gęstość – stawki jednostkowe', 'arithmetic', 'intermediate', 6, null, 'Obliczanie wielkości jednostkowych (zł/kg, km/h, zł/szt.).', 'Wielkości i stawki jednostkowe', ARRAY[(SELECT id FROM proportions)], 20, 3, '["Oblicza cenę jednostkową", "Porównuje oferty", "Stosuje v=s/t i przelicza jednostki"]'::jsonb),

-- Percentages
('Procent – pojęcie i reprezentacje (diagramy, ułamek, liczba dziesiętna)', 'arithmetic', 'basic', 6, null, 'Procent jako ułamek o mianowniku 100 i jego reprezentacje.', 'Procenty', ARRAY[(SELECT id FROM decimal_fraction)], 20, 2, '["Zamienia % ↔ ułamek ↔ dziesiętne", "Interpretuje 25%, 50%, 75%", "Zaznacza na diagramach"]'::jsonb),
('Obliczanie procentu z liczby (p% z N)', 'arithmetic', 'basic', 6, null, 'Metoda ułamka i metoda liczby dziesiętnej do liczenia p% z N.', 'Procenty', ARRAY[(SELECT id FROM skills WHERE name = 'Procent – pojęcie i reprezentacje (diagramy, ułamek, liczba dziesiętna)')], 20, 2, '["Stosuje wzór p/100·N", "Sprawdza wyniki estymacją", "Dobiera jednostki i interpretację"]'::jsonb),
('Jaka liczba stanowi p% innej liczby (odwrotne zadania procentowe)', 'arithmetic', 'intermediate', 6, null, 'Wyznaczanie liczby bazowej, gdy znany jest procent i wartość procentowa.', 'Procenty', ARRAY[(SELECT id FROM skills WHERE name = 'Obliczanie procentu z liczby (p% z N)')], 20, 3, '["Rozwiązuje x·p/100=A", "Stosuje proporcję", "Weryfikuje wynik"]'::jsonb),
('Porównania procentowe – o ile procent większa/mniejsza', 'arithmetic', 'intermediate', 6, null, 'Różnice względne i asymetria wzrostu/spadku w %.', 'Procenty', ARRAY[(SELECT id FROM skills WHERE name = 'Obliczanie procentu z liczby (p% z N)')], 20, 3, '["Stosuje (B−A)/A·100%", "Rozumie asymetrię spadku vs wzrostu", "Interpretuje wykresy i tabele"]'::jsonb),
('Procent składany – 2–3 następujące po sobie zmiany', 'arithmetic', 'intermediate', 6, null, 'Mnożniki (1±p/100) i ich składanie w łańcuchu zmian.', 'Procenty', ARRAY[(SELECT id FROM skills WHERE name = 'Porównania procentowe – o ile procent większa/mniejsza')], 25, 3, '["Stosuje mnożniki kolejno", "Porównuje z jednokrotną zmianą", "Szacuje efekt łączny"]'::jsonb),
('Rabat, VAT i napiwek – praktyczne zastosowania procentów', 'arithmetic', 'intermediate', 6, null, 'Obliczenia cen po rabatach, doliczanie podatków i napiwków.', 'Procenty – zastosowania', ARRAY[(SELECT id FROM skills WHERE name = 'Obliczanie procentu z liczby (p% z N)')], 20, 3, '["Modeluje rabaty i podatki", "Porównuje oferty", "Sprawdza sensowność wyniku"]'::jsonb),

-- Geometry - solids and volumes
('Siatki graniastosłupów prostych – rozumienie i składanie', 'geometry', 'intermediate', 6, null, 'Siatki prostopadłościanu i graniastosłupów – łączenie pól ścian.', 'Bryły i siatki', ARRAY[(SELECT id FROM area_base)], 20, 3, '["Rozpoznaje siatki brył", "Liczy sumę pól ścian", "Łączy siatkę z bryłą 3D"]'::jsonb),
('Objętość prostopadłościanu – a·b·c i jednostki objętości', 'geometry', 'intermediate', 6, null, 'Obliczanie objętości prostopadłościanu i użycie odpowiednich jednostek.', 'Bryły i objętości', ARRAY[(SELECT id FROM unit_conversions)], 20, 3, '["Stosuje V=a·b·c", "Konwertuje jednostki objętości", "Weryfikuje wynik oszacowaniem"]'::jsonb),

-- Charts and functions intro
('Tabele zależności i wykres punktowy (układ współrzędnych – wstęp)', 'functions', 'basic', 6, null, 'Uzupełnianie tabel wartości i nanoszenie punktów (x,y) na układ współrzędnych.', 'Wykresy – wstęp', ARRAY[(SELECT id FROM proportions)], 20, 2, '["Odczytuje współrzędne", "Rysuje punkty z tabeli", "Łączy proste zależności liniowe"]'::jsonb),
('Wykres zależności prostych – interpretacja osi i skali', 'functions', 'basic', 6, null, 'Rysowanie prostych wykresów zależności cena–ilość, droga–czas.', 'Wykresy – wstęp', ARRAY[(SELECT id FROM skills WHERE name = 'Tabele zależności i wykres punktowy (układ współrzędnych – wstęp)')], 20, 2, '["Dobiera skalę osi", "Odczytuje wartości z wykresu", "Interpretuje znaczenie nachylenia"]'::jsonb),

-- Advanced problems
('Mieszanie i średnie ważone – zadania z procentami', 'arithmetic', 'advanced', 6, null, 'Średnia ważona stężeń/cen; łączenie dwóch roztworów/partii.', 'Procenty – zastosowania', 
  ARRAY[
    (SELECT id FROM skills WHERE name = 'Jednostkowa cena, prędkość i gęstość – stawki jednostkowe'),
    (SELECT id FROM proportions)
  ], 25, 4, '["Wyznacza średnie ważone", "Stosuje tabelę mieszanek", "Interpretuje wyniki kontekstowo"]'::jsonb),
('Zadania tekstowe z ułamkami, proporcjami i procentami (mix)', 'arithmetic', 'advanced', 6, null, 'Zadania wieloetapowe łączące ułamki, proporcje i procenty.', 'Zastosowania – zadania problemowe', 
  ARRAY[
    (SELECT id FROM fraction_mixed),
    (SELECT id FROM percent_compound)
  ], 25, 4, '["Tworzy model matematyczny", "Dobiera właściwe narzędzia", "Weryfikuje rozwiązanie opisem"]'::jsonb),
('Zadania problemowe z geometrii płaskiej (mix pól, obwodów i kątów)', 'geometry', 'advanced', 6, null, 'Zadania łączące kilka wzorów i własności w jednym kontekście.', 'Geometria – zadania złożone', 
  ARRAY[
    (SELECT id FROM trapez_skills),
    (SELECT id FROM circle_skills)
  ], 25, 4, '["Dobiera strategię rozwiązania", "Łączy wzory i przekształcenia", "Weryfikuje wyniki opisem i oszacowaniem"]'::jsonb);