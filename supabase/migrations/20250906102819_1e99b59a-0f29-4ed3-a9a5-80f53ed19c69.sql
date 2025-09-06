-- Dodanie symboli matematycznych dla konkretnych umiejętności
INSERT INTO skill_math_symbols (skill_id, quick_symbols, panel_symbols) VALUES
-- Wartość bezwzględna
('9bae92cf-4b76-4f05-80db-a9df027d3a2e', '["| |", "±", "≥", "≤", "∈"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "relacje": ["<", ">", "≤", "≥", "±", "∓"], "wartość_bezwzględna": ["|x|", "| |", "±"], "zbiory": ["∈", "∉", "ℝ", "ℕ", "ℤ"]}'),

-- Nierówności kwadratowe
('383a996f-6f04-406f-9b86-e9fe2fc93879', '["≤", "≥", "<", ">", "±", "√", "Δ"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "relacje": ["<", ">", "≤", "≥", "±", "∓"], "pierwiastki": ["√", "∛", "²", "³"], "kwadratowe": ["Δ", "±", "√"], "zbiory": ["∈", "∉", "∩", "∪", "∅", "ℝ"]}'),

-- Równania kwadratowe
('f4360fe4-2882-4eaf-8528-d0ea7ecc023f', '["±", "√", "Δ", "≠", "∈"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "pierwiastki": ["√", "∛", "²", "³"], "kwadratowe": ["Δ", "±", "√"], "zbiory": ["∈", "∉", "ℝ", "ℂ"], "relacje": ["≠", "=", "≈"]}'),

-- Równania i nierówności z wartością bezwzględną
('d03dc349-2398-4ecd-a407-4c7e3894b068', '["| |", "±", "≤", "≥", "∩", "∪"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "wartość_bezwzględna": ["|x|", "| |", "±"], "relacje": ["<", ">", "≤", "≥", "±", "∓"], "zbiory": ["∈", "∉", "∩", "∪", "∅", "ℝ"], "pierwiastki": ["√", "²"]}'),

-- Funkcja liniowa
('1d4bcd6b-2306-412b-ac3e-600689d473d4', '["f(x)", "→", "∈", "ℝ", "∞"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "funkcje": ["f(x)", "g(x)", "y=", "→"], "zbiory": ["∈", "∉", "ℝ", "ℕ", "ℤ", "∅"], "specjalne": ["∞", "-∞", "+∞"], "relacje": ["<", ">", "≤", "≥"]}'),

-- Trygonometria
('11c60846-c02d-4ee0-9540-8ab3d111bbde', '["sin", "cos", "tg", "π", "°", "±"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "trygonometria": ["sin", "cos", "tg", "ctg", "arcsin", "arccos"], "specjalne": ["π", "e", "°", "′", "″"], "pierwiastki": ["√", "²", "³"], "relacje": ["±", "∓", "≈"]}'),

-- Liczby zespolone
('ab7a796e-f284-4a68-85de-973f2efbd376', '["i", "±", "√", "∈", "ℂ", "ℝ"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "zespolone": ["i", "Re", "Im", "z̄"], "zbiory": ["∈", "∉", "ℂ", "ℝ", "ℕ", "ℤ"], "pierwiastki": ["√", "∛", "²", "³"], "relacje": ["±", "∓", "|z|"]}'),

-- Granica funkcji
('a4017cd1-c5be-4412-981f-e2419a001290', '["lim", "→", "∞", "±∞", "∈"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "granice": ["lim", "→", "∞", "+∞", "-∞"], "funkcje": ["f(x)", "g(x)", "y="], "zbiory": ["∈", "∉", "ℝ", "∅"], "relacje": ["<", ">", "≤", "≥", "≈"]}'),

-- Ciągi liczbowe  
('d2c97032-6934-4cc4-a233-44c0f861a3ea', '["aₙ", "∞", "lim", "∑", "∈"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "ciągi": ["aₙ", "a₁", "n", "∑", "∏"], "granice": ["lim", "→", "∞", "+∞", "-∞"], "zbiory": ["∈", "∉", "ℕ", "ℝ"], "indeksy": ["₁", "₂", "ₙ", "ₖ"]}'),

-- Prawdopodobieństwo
('c7a89cb6-c3b0-4eb5-bc02-3b7b30ca629a', '["P(A)", "∩", "∪", "∈", "∅"]', '{"podstawowe": ["+", "-", "×", "÷", "=", "≠"], "prawdopodobieństwo": ["P(A)", "P(B)", "P(A|B)", "Ω"], "zbiory": ["∈", "∉", "∩", "∪", "∅", "⊂", "⊆"], "relacje": ["<", ">", "≤", "≥"], "specjalne": ["!", "C", "A"]}');

-- Dodanie wzorców rozpoznawania kontekstu
INSERT INTO math_symbol_patterns (keywords, symbols, confidence) VALUES
-- Wartość bezwzględna
('{"wartość bezwzględna", "moduł", "odległość", "dodatni", "ujemny"}', '["| |", "|x|", "±", "≥", "≤"]', 9),

-- Nierówności
('{"nierówność", "większy", "mniejszy", "co najmniej", "co najwyżej", "przedział"}', '["≤", "≥", "<", ">", "∩", "∪", "∈"]', 8),

-- Równania kwadratowe
('{"równanie kwadratowe", "delta", "dyskryminanta", "pierwiastek", "rozwiązanie"}', '["Δ", "±", "√", "²", "≠", "∈"]', 9),

-- Funkcje
('{"funkcja", "dziedzina", "przeciwdziedzina", "wykres", "zbiór wartości"}', '["f(x)", "→", "∈", "∉", "ℝ", "∅"]', 8),

-- Trygonometria
('{"trygonometria", "sinus", "cosinus", "tangens", "kąt", "stopnie", "radiany"}', '["sin", "cos", "tg", "π", "°", "′"]', 9),

-- Granice
('{"granica", "dąży", "nieskończoność", "zbieżność", "rozbieżność"}', '["lim", "→", "∞", "+∞", "-∞"]', 9),

-- Liczby zespolone
('{"liczby zespolone", "urojony", "rzeczywisty", "sprzężenie", "moduł"}', '["i", "ℂ", "ℝ", "Re", "Im", "z̄"]', 8),

-- Pierwiastki i potęgi
('{"pierwiastek", "potęga", "kwadrat", "sześcian", "stopień"}', '["√", "∛", "²", "³", "ⁿ"]', 7),

-- Zbiory
('{"zbiór", "element", "należy", "podzbiór", "przecięcie", "suma", "różnica"}', '["∈", "∉", "⊂", "⊆", "∩", "∪", "∅"]', 8),

-- Ciągi
('{"ciąg", "wyraz", "suma", "iloczyn", "indeks", "nieskończony"}', '["aₙ", "∑", "∏", "₁", "₂", "ₙ"]', 8),

-- Prawdopodobieństwo
('{"prawdopodobieństwo", "zdarzenie", "losowy", "rozkład", "kombinacja"}', '["P(A)", "Ω", "∩", "∪", "!", "C"]', 8),

-- Algebraiczne wyrażenia
('{"wielomian", "stopień", "współczynnik", "faktoryzacja", "rozkład"}', '["x²", "x³", "aₙ", "≠", "∈", "ℝ"]', 7),

-- Relacje i porównania
('{"równy", "różny", "podobny", "przybliżony", "identyczny"}', '["=", "≠", "≈", "≡", "∼"]', 6);