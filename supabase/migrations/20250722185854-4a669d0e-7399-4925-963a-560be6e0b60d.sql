
-- Dodaj więcej tematów matematycznych
INSERT INTO topics (name, description, difficulty_level, learning_objectives, estimated_time_minutes, category) VALUES
('Procenty i proporcje', 'Nauka obliczania procentów, proporcji i zastosowań w życiu codziennym', 2, ARRAY['Obliczanie procentów z liczby', 'Rozwiązywanie problemów z proporcjami', 'Zastosowania procentów w praktyce', 'Obliczanie podwyżek i zniżek'], 45, 'mathematics'),
('Funkcje liniowe', 'Wprowadzenie do funkcji liniowych, ich właściwości i zastosowania', 3, ARRAY['Zrozumienie pojęcia funkcji', 'Rysowanie wykresów funkcji liniowych', 'Znajdowanie równania prostej', 'Interpretacja współczynników a i b'], 60, 'mathematics'),
('Planimetria - pola figur', 'Obliczanie pól podstawowych figur geometrycznych', 2, ARRAY['Pole prostokąta i kwadratu', 'Pole trójkąta różnymi metodami', 'Pole koła i jego części', 'Pole figur złożonych'], 40, 'mathematics'),
('Statystyka opisowa', 'Podstawy statystyki - średnie, mediana, dominanta', 2, ARRAY['Obliczanie średniej arytmetycznej', 'Znajdowanie mediany', 'Określanie dominanty', 'Interpretacja danych statystycznych'], 35, 'mathematics'),
('Potęgi i pierwiastki', 'Działania na potęgach i pierwiastkach kwadratowych', 3, ARRAY['Właściwości potęg', 'Obliczanie pierwiastków', 'Zastosowanie wzorów skróconego mnożenia', 'Racjonalizacja mianownika'], 50, 'mathematics'),
('Prawdopodobieństwo', 'Podstawy rachunku prawdopodobieństwa', 3, ARRAY['Pojęcie prawdopodobieństwa', 'Obliczanie prawdopodobieństwa zdarzeń', 'Prawdopodobieństwo warunkowe', 'Zastosowania w praktyce'], 55, 'mathematics');

-- Dodaj lekcje dla nowych tematów
-- Lekcje dla tematu "Procenty i proporcje"
INSERT INTO lessons (topic_id, title, description, content_type, content_data, lesson_order, estimated_time_minutes, difficulty_level) VALUES
((SELECT id FROM topics WHERE name = 'Procenty i proporcje'), 'Podstawy procentów', 'Nauka podstawowych pojęć związanych z procentami', 'theory', '{
  "theory_content": "Procent to sposób wyrażania części całości. Symbol % oznacza \"na sto\". Na przykład 25% oznacza 25 części ze 100. Aby obliczyć procent z liczby, mnożymy tę liczbę przez procent i dzielimy przez 100. Na przykład: 25% z 200 = (25 × 200) ÷ 100 = 50.",
  "key_concepts": ["Procent", "Symbol %", "Część całości", "Obliczanie procentu z liczby"],
  "examples": [
    {"question": "Oblicz 30% z 150", "answer": "45", "explanation": "30% z 150 = (30 × 150) ÷ 100 = 4500 ÷ 100 = 45"},
    {"question": "Ile procent stanowi 24 z 80?", "answer": "30%", "explanation": "24 ÷ 80 × 100% = 0,3 × 100% = 30%"}
  ]
}', 1, 15, 2),

((SELECT id FROM topics WHERE name = 'Procenty i proporcje'), 'Ćwiczenia z procentów', 'Praktyczne zadania z obliczania procentów', 'practice', '{
  "exercises": [
    {"question": "Oblicz 15% z 240", "answer": "36", "type": "calculation", "explanation": "15% z 240 = (15 × 240) ÷ 100 = 36"},
    {"question": "Jaką część procentową stanowi 45 z 300?", "answer": "15%", "type": "calculation", "explanation": "45 ÷ 300 × 100% = 15%"},
    {"question": "Cena towaru wynosiła 200 zł. Po zniżce 20% cena wynosi:", "answer": "160", "type": "word_problem", "explanation": "Zniżka: 20% z 200 = 40 zł. Nowa cena: 200 - 40 = 160 zł"},
    {"question": "Oblicz 8% z 1250", "answer": "100", "type": "calculation", "explanation": "8% z 1250 = (8 × 1250) ÷ 100 = 100"}
  ]
}', 2, 20, 2);

-- Lekcje dla tematu "Funkcje liniowe"
INSERT INTO lessons (topic_id, title, description, content_type, content_data, lesson_order, estimated_time_minutes, difficulty_level) VALUES
((SELECT id FROM topics WHERE name = 'Funkcje liniowe'), 'Wprowadzenie do funkcji', 'Podstawowe pojęcia związane z funkcjami', 'theory', '{
  "theory_content": "Funkcja to przyporządkowanie, które każdemu elementowi z dziedziny przypisuje dokładnie jeden element z przeciwdziedziny. Funkcja liniowa ma postać f(x) = ax + b, gdzie a i b to liczby rzeczywiste. Współczynnik a nazywamy współczynnikiem kierunkowym, a b to wyraz wolny.",
  "key_concepts": ["Funkcja", "Dziedzina", "Przeciwdziedzina", "Funkcja liniowa", "Współczynnik kierunkowy", "Wyraz wolny"],
  "examples": [
    {"question": "Podaj wartość funkcji f(x) = 2x + 3 dla x = 4", "answer": "11", "explanation": "f(4) = 2 × 4 + 3 = 8 + 3 = 11"},
    {"question": "Jaki jest współczynnik kierunkowy funkcji f(x) = -3x + 7?", "answer": "-3", "explanation": "W funkcji f(x) = ax + b współczynnik kierunkowy to a = -3"}
  ]
}', 1, 20, 3),

((SELECT id FROM topics WHERE name = 'Funkcje liniowe'), 'Wykres funkcji liniowej', 'Rysowanie i interpretacja wykresów funkcji liniowych', 'practice', '{
  "exercises": [
    {"question": "Jaki jest współczynnik kierunkowy funkcji f(x) = 5x - 2?", "answer": "5", "type": "identification", "explanation": "W postaci f(x) = ax + b, współczynnik kierunkowy to a = 5"},
    {"question": "Oblicz f(3) dla funkcji f(x) = -2x + 8", "answer": "2", "type": "calculation", "explanation": "f(3) = -2 × 3 + 8 = -6 + 8 = 2"},
    {"question": "Dla jakiej wartości x funkcja f(x) = 3x - 9 przyjmuje wartość 0?", "answer": "3", "type": "equation", "explanation": "3x - 9 = 0, więc 3x = 9, x = 3"},
    {"question": "Podaj wyraz wolny funkcji f(x) = 4x - 7", "answer": "-7", "type": "identification", "explanation": "W postaci f(x) = ax + b, wyraz wolny to b = -7"}
  ]
}', 2, 25, 3);

-- Lekcje dla tematu "Planimetria - pola figur"
INSERT INTO lessons (topic_id, title, description, content_type, content_data, lesson_order, estimated_time_minutes, difficulty_level) VALUES
((SELECT id FROM topics WHERE name = 'Planimetria - pola figur'), 'Pola podstawowych figur', 'Wzory na pola prostokąta, kwadratu i trójkąta', 'theory', '{
  "theory_content": "Pole figury to miara powierzchni zajmowanej przez tę figurę. Podstawowe wzory: Pole prostokąta = a × b (gdzie a i b to długości boków), Pole kwadratu = a² (gdzie a to długość boku), Pole trójkąta = (a × h) ÷ 2 (gdzie a to podstawa, h to wysokość).",
  "key_concepts": ["Pole figury", "Prostokąt", "Kwadrat", "Trójkąt", "Podstawa", "Wysokość"],
  "examples": [
    {"question": "Oblicz pole prostokąta o bokach 6 cm i 8 cm", "answer": "48 cm²", "explanation": "Pole = 6 × 8 = 48 cm²"},
    {"question": "Jakie jest pole kwadratu o boku 5 cm?", "answer": "25 cm²", "explanation": "Pole = 5² = 25 cm²"}
  ]
}', 1, 15, 2),

((SELECT id FROM topics WHERE name = 'Planimetria - pola figur'), 'Ćwiczenia z pól figur', 'Praktyczne obliczanie pól różnych figur', 'practice', '{
  "exercises": [
    {"question": "Oblicz pole prostokąta o bokach 12 cm i 7 cm", "answer": "84", "type": "calculation", "explanation": "Pole = 12 × 7 = 84 cm²"},
    {"question": "Pole kwadratu wynosi 36 cm². Jaka jest długość jego boku?", "answer": "6", "type": "reverse_calculation", "explanation": "a² = 36, więc a = 6 cm"},
    {"question": "Oblicz pole trójkąta o podstawie 10 cm i wysokości 6 cm", "answer": "30", "type": "calculation", "explanation": "Pole = (10 × 6) ÷ 2 = 30 cm²"},
    {"question": "Prostokąt ma pole 48 cm² i jeden bok 8 cm. Jaka jest długość drugiego boku?", "answer": "6", "type": "reverse_calculation", "explanation": "48 = 8 × b, więc b = 48 ÷ 8 = 6 cm"}
  ]
}', 2, 20, 2);

-- Lekcje dla tematu "Statystyka opisowa"
INSERT INTO lessons (topic_id, title, description, content_type, content_data, lesson_order, estimated_time_minutes, difficulty_level) VALUES
((SELECT id FROM topics WHERE name = 'Statystyka opisowa'), 'Miary tendencji centralnej', 'Średnia, mediana i dominanta', 'theory', '{
  "theory_content": "Miary tendencji centralnej to wartości, które charakteryzują środek rozkładu danych. Średnia arytmetyczna to suma wszystkich wartości podzielona przez ich liczbę. Mediana to wartość środkowa po uporządkowaniu danych rosnąco. Dominanta to wartość występująca najczęściej.",
  "key_concepts": ["Średnia arytmetyczna", "Mediana", "Dominanta", "Rozkład danych", "Wartość środkowa"],
  "examples": [
    {"question": "Oblicz średnią z liczb: 4, 6, 8, 10, 12", "answer": "8", "explanation": "Średnia = (4+6+8+10+12) ÷ 5 = 40 ÷ 5 = 8"},
    {"question": "Znajdź medianę zbioru: 3, 7, 9, 11, 15", "answer": "9", "explanation": "Po uporządkowaniu środkowa wartość to 9"}
  ]
}', 1, 18, 2),

((SELECT id FROM topics WHERE name = 'Statystyka opisowa'), 'Ćwiczenia ze statystyki', 'Praktyczne obliczanie miar statystycznych', 'practice', '{
  "exercises": [
    {"question": "Oblicz średnią z liczb: 2, 5, 8, 9, 11", "answer": "7", "type": "calculation", "explanation": "Średnia = (2+5+8+9+11) ÷ 5 = 35 ÷ 5 = 7"},
    {"question": "Znajdź medianę zbioru: 1, 4, 7, 10, 13, 16", "answer": "8.5", "type": "calculation", "explanation": "Mediana = (7+10) ÷ 2 = 8,5"},
    {"question": "W zbiorze {2, 3, 3, 5, 5, 5, 7} dominantą jest:", "answer": "5", "type": "identification", "explanation": "Liczba 5 występuje najczęściej (3 razy)"},
    {"question": "Oblicz średnią z liczb: 15, 20, 25, 30", "answer": "22.5", "type": "calculation", "explanation": "Średnia = (15+20+25+30) ÷ 4 = 90 ÷ 4 = 22,5"}
  ]
}', 2, 17, 2);

-- Dodaj więcej osiągnięć
INSERT INTO achievements (name, description, condition_type, condition_value, points_reward, icon, category) VALUES
('Mistrz procentów', 'Ukończ wszystkie lekcje z procentów z wynikiem 90%+', 'score_average', 90, 150, '📊', 'learning'),
('Funkcyjny ekspert', 'Opanuj funkcje liniowe', 'lessons_completed', 5, 200, '📈', 'learning'),
('Geometryczny geniusz', 'Zostań mistrzem planimetrii', 'score_average', 85, 175, '📐', 'learning'),
('Statystyczny analityk', 'Ukończ kurs statystyki opisowej', 'lessons_completed', 3, 125, '📊', 'learning'),
('Matematyczny maraton', 'Spędź 5 godzin ucząc się matematyki', 'time_spent', 300, 300, '⏰', 'dedication'),
('Seria sukcesów', 'Uzyskaj 7-dniową passę nauki', 'streak', 7, 250, '🔥', 'dedication'),
('Społeczny uczeń', 'Dołącz do 3 grup studyjnych', 'groups_joined', 3, 100, '👥', 'social'),
('Mentor grupy', 'Pomóż 5 osobom w grupach studyjnych', 'help_given', 5, 200, '🎓', 'social'),
('Pierwsza dziesiątka', 'Zdobądź miejsce w top 10 rankingu', 'leaderboard_position', 10, 500, '🏆', 'competition');
