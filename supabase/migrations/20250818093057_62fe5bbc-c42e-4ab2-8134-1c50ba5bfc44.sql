-- Continue adding third level Package #4 skills 

WITH skill_ids AS (
  SELECT id, name FROM skills WHERE name IN (
    'Dodawanie pisemne liczb naturalnych (z przeniesieniem)',
    'Czynniki i wielokrotności, parzystość i nieparzystość', 
    'Mnożenie pisemne przez liczbę jednocyfrową',
    'Dodawanie i odejmowanie liczb dziesiętnych (wyrównanie przecinka)',
    'Dodawanie i odejmowanie liczb całkowitych na osi',
    'Kąty przyległe i wierzchołkowe – własności i obliczenia',
    'Pole prostokąta i kwadratu – siatki i kafelkowanie',
    'Zaokrąglanie liczb naturalnych do dziesiątek, setek, tysięcy'
  )
)
INSERT INTO skills (name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives) VALUES
('Odejmowanie pisemne liczb naturalnych (z pożyczką)', 'arithmetic', 'basic', 4, null, 'Kolumnowe odejmowanie z pożyczką między miejscami.', 'Działania pisemne', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Dodawanie pisemne liczb naturalnych (z przeniesieniem)')], 20, 2, '["Wykonuje pożyczki", "Weryfikuje wyniki działaniem odwrotnym", "Interpretuje błąd rachunkowy"]'::jsonb),
('Własności działań: przemienność i łączność (dodawanie, mnożenie)', 'arithmetic', 'basic', 4, null, 'Uproszczenia rachunkowe dzięki przemienności i łączności.', 'Własności działań', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Dodawanie pisemne liczb naturalnych (z przeniesieniem)')], 15, 2, '["Grupuje składniki", "Zmienia kolejność czynników", "Porównuje strategie obliczeń"]'::jsonb),
('Dzielenie pisemne przez liczbę jednocyfrową (z resztą)', 'arithmetic', 'basic', 4, null, 'Dzielenie w słupku przez 2–9, rozumienie reszty.', 'Działania pisemne', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Mnożenie pisemne przez liczbę jednocyfrową')], 20, 2, '["Wyznacza kolejne cyfry ilorazu", "Oblicza i interpretuje resztę", "Sprawdza wynik mnożeniem"]'::jsonb),
('Reguły podzielności przez 2, 3, 5, 9, 10', 'arithmetic', 'basic', 5, null, 'Stosowanie prostych testów podzielności do szybkich wniosków.', 'Podzielność liczb', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Czynniki i wielokrotności, parzystość i nieparzystość')], 15, 2, '["Zna testy podzielności", "Weryfikuje podzielność liczb", "Używa sumy cyfr dla 9 i 3"]'::jsonb),
('Mnożenie i dzielenie liczb całkowitych – zasady znaków', 'real_numbers', 'intermediate', 6, null, 'Zasady znaków przy mnożeniu i dzieleniu (plus/minus).', 'Liczby całkowite', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Dodawanie i odejmowanie liczb całkowitych na osi')], 20, 3, '["Stosuje zasady znaków", "Rozwiązuje równania prostego typu", "Analizuje kontrprzykłady"]'::jsonb),
('Trójkąty – klasyfikacja według boków i kątów', 'geometry', 'basic', 5, null, 'Równoboczny, równoramienny, różnoboczny; ostro/prosto/rozwartokątny.', 'Trójkąty', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Kąty przyległe i wierzchołkowe – własności i obliczenia')], 20, 2, '["Rozpoznaje typ trójkąta", "Zaznacza wysokości", "Wskazuje własności boków/kątów"]'::jsonb),
('Symetria osiowa – rozpoznawanie i rysowanie odbić', 'geometry', 'basic', 5, null, 'Wyznaczanie osi symetrii i konstruowanie odbić punktów i figur.', 'Symetrie', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Pole prostokąta i kwadratu – siatki i kafelkowanie')], 15, 2, '["Wyznacza osie symetrii", "Rysuje odbicia", "Stosuje w zadaniach z siatką"]'::jsonb),
('Dodawanie i odejmowanie ułamków o wspólnym mianowniku', 'arithmetic', 'basic', 5, null, 'Operacje na licznikach, upraszczanie wyników.', 'Ułamki – działania', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Ułamki zwykłe – pojęcie i reprezentacje (część całości, odcinek, diagram)')], 15, 2, '["Dodaje i odejmuje liczniki", "Skraca wynik", "Interpretuje operacje na modelu"]'::jsonb),
('Mnożenie liczb dziesiętnych (liczenie miejsc po przecinku)', 'arithmetic', 'intermediate', 5, null, 'Mnożenie jak całkowitych, a potem ustawienie przecinka według sumy miejsc.', 'Liczby dziesiętne – działania', ARRAY[(SELECT id FROM skill_ids WHERE name = 'Mnożenie pisemne przez liczbę jednocyfrową')], 20, 3, '["Mnoży ignorując przecinek", "Liczy liczbę miejsc po przecinku", "Sprawdza oszacowaniem"]'::jsonb);

-- Also add skills that can be done in parallel with current ones
WITH additional_skill_ids AS (
  SELECT id, name FROM skills WHERE name IN (
    'Zaokrąglanie liczb naturalnych do dziesiątek, setek, tysięcy',
    'Dodawanie i odejmowanie liczb dziesiętnych (wyrównanie przecinka)'
  )
)
INSERT INTO skills (name, department, level, class_level, men_code, description, chapter_tag, prerequisites, estimated_time_minutes, difficulty_rating, learning_objectives) VALUES
('Kolejność wykonywania działań z nawiasami', 'arithmetic', 'basic', 4, null, 'Reguła: nawiasy → mnożenie/dzielenie → dodawanie/odejmowanie.', 'Kolejność działań', ARRAY[(SELECT id FROM additional_skill_ids WHERE name = 'Zaokrąglanie liczb naturalnych do dziesiątek, setek, tysięcy')], 20, 2, '["Rozwiązuje wyrażenia wieloetapowe", "Uzasadnia kolejność", "Koryguje typowe błędy"]'::jsonb);