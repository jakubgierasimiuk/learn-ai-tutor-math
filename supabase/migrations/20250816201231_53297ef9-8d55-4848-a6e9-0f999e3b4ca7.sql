-- Insert sample skills data
INSERT INTO skills (name, description, department, level, class_level, men_code, learning_objectives, phases, estimated_time_minutes, difficulty_rating) VALUES
('Liczby rzeczywiste', 'Podstawowe operacje na liczbach rzeczywistych', 'real_numbers', 'basic', 1, 'LR.01', 
 '{"objectives": ["Wykonywanie działań na liczbach rzeczywistych", "Porównywanie liczb", "Zaokrąglanie"]}',
 '{"phase1": "Wprowadzenie", "phase2": "Ćwiczenia", "phase3": "Zastosowania", "phase4": "Problemy", "phase5": "Ocena"}',
 45, 3),
('Wyrażenia algebraiczne', 'Operacje na wyrażeniach algebraicznych', 'algebraic_expressions', 'intermediate', 2, 'WA.01',
 '{"objectives": ["Rozwijanie wyrażeń", "Faktoryzacja", "Upraszczanie ułamków algebraicznych"]}',
 '{"phase1": "Podstawy", "phase2": "Wzory skróconego mnożenia", "phase3": "Faktoryzacja", "phase4": "Ułamki algebraiczne", "phase5": "Zastosowania"}',
 60, 4);

-- Insert skill phases
INSERT INTO skill_phases (skill_id, phase_number, phase_name, phase_description, ai_instructions, success_criteria, estimated_duration_minutes) VALUES
-- Real Numbers phases
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 1, 'Wprowadzenie do liczb rzeczywistych', 'Podstawowe pojęcia i definicje', 'Przedstaw podstawowe typy liczb rzeczywistych i ich właściwości', '{"min_correct": 3, "max_errors": 2}', 10),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 2, 'Działania arytmetyczne', 'Dodawanie, odejmowanie, mnożenie, dzielenie', 'Ćwicz podstawowe działania na liczbach rzeczywistych', '{"min_correct": 5, "max_errors": 2}', 15),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 3, 'Porównywanie i zaokrąglanie', 'Porównywanie liczb i zaokrąglanie do określonej dokładności', 'Naucz porównywania liczb i zaokrąglania', '{"min_correct": 4, "max_errors": 1}', 10),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 4, 'Problemy tekstowe', 'Zastosowanie w zadaniach praktycznych', 'Rozwiązuj problemy praktyczne z liczbami rzeczywistymi', '{"min_correct": 3, "max_errors": 1}', 15),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 5, 'Test końcowy', 'Sprawdzenie opanowania materiału', 'Przeprowadź kompleksową ocenę umiejętności', '{"min_correct": 8, "max_errors": 2}', 15),

-- Algebraic Expressions phases  
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 1, 'Podstawy wyrażeń algebraicznych', 'Wprowadzenie do wyrażeń algebraicznych', 'Przedstaw podstawowe pojęcia dotyczące wyrażeń algebraicznych', '{"min_correct": 3, "max_errors": 2}', 12),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 2, 'Wzory skróconego mnożenia', 'Nauka i zastosowanie wzorów', 'Naucz wzorów skróconego mnożenia i ich zastosowania', '{"min_correct": 5, "max_errors": 2}', 18),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 3, 'Faktoryzacja', 'Rozkład na czynniki', 'Ćwicz rozkład wyrażeń algebraicznych na czynniki', '{"min_correct": 4, "max_errors": 1}', 15),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 4, 'Ułamki algebraiczne', 'Operacje na ułamkach algebraicznych', 'Naucz operacji na ułamkach algebraicznych', '{"min_correct": 4, "max_errors": 1}', 20),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 5, 'Zastosowania praktyczne', 'Rozwiązywanie problemów z wyrażeniami', 'Rozwiązuj kompleksowe problemy z wyrażeniami algebraicznymi', '{"min_correct": 6, "max_errors": 2}', 15);

-- Insert micro skills for Real Numbers
INSERT INTO micro_skills (skill_id, name, description, task_types, difficulty_range) VALUES
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 'real_numbers_basic_operations', 'Podstawowe działania arytmetyczne', '{"addition", "subtraction", "multiplication", "division"}', '{1,3}'),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 'real_numbers_decimal_operations', 'Działania na liczbach dziesiętnych', '{"decimal_arithmetic", "precision"}', '{2,4}'),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 'real_numbers_fraction_operations', 'Działania na ułamkach', '{"fraction_arithmetic", "mixed_numbers"}', '{2,5}'),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 'real_numbers_percentage_calculations', 'Obliczenia procentowe', '{"percentage", "increase", "decrease"}', '{2,4}'),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 'real_numbers_rounding', 'Zaokrąglanie liczb', '{"rounding", "significant_figures"}', '{1,3}'),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 'real_numbers_comparison', 'Porównywanie liczb', '{"ordering", "inequalities"}', '{1,3}'),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 'real_numbers_scientific_notation', 'Zapis naukowy', '{"scientific_notation", "powers_of_ten"}', '{3,6}'),
((SELECT id FROM skills WHERE name = 'Liczby rzeczywiste'), 'real_numbers_word_problems', 'Zadania tekstowe', '{"word_problems", "applications"}', '{3,7}');

-- Insert micro skills for Algebraic Expressions
INSERT INTO micro_skills (skill_id, name, description, task_types, difficulty_range) VALUES
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 'algebra_short_multiplication_formulas', 'Wzory skróconego mnożenia', '{"expansion", "factoring"}', '{2,5}'),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 'algebra_polynomial_addition', 'Dodawanie wielomianów', '{"addition", "subtraction"}', '{1,4}'),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 'algebra_polynomial_multiplication', 'Mnożenie wielomianów', '{"multiplication", "foil"}', '{2,6}'),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 'algebra_factoring_polynomials', 'Faktoryzacja wielomianów', '{"factoring", "common_factor"}', '{3,7}'),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 'algebra_rational_simplification', 'Upraszczanie ułamków algebraicznych', '{"simplification", "cancellation"}', '{3,6}'),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 'algebra_rational_addition_subtraction', 'Dodawanie i odejmowanie ułamków algebraicznych', '{"addition", "subtraction", "common_denominator"}', '{4,7}'),
((SELECT id FROM skills WHERE name = 'Wyrażenia algebraiczne'), 'algebra_rational_multiplication_division', 'Mnożenie i dzielenie ułamków algebraicznych', '{"multiplication", "division", "reciprocal"}', '{4,7}');

-- Insert misconception patterns for Real Numbers
INSERT INTO misconception_patterns (department, micro_skill, misconception_id, description, feedback_template, correction_strategy, difficulty_adjustment) VALUES
('real_numbers', 'real_numbers_basic_operations', 'order_of_operations', 'Nieprawidłowa kolejność działań', 'Pamiętaj o kolejności działań: najpierw nawiasy, potem mnożenie i dzielenie, na końcu dodawanie i odejmowanie', 'practice_order_exercises', -1),
('real_numbers', 'real_numbers_decimal_operations', 'decimal_point_placement', 'Błędne umieszczenie przecinka dziesiętnego', 'Przy mnożeniu liczb dziesiętnych licz miejsca po przecinku w obu liczbach i umieść przecinek odpowiednio w wyniku', 'decimal_place_drills', -2),
('real_numbers', 'real_numbers_fraction_operations', 'wrong_denominator_addition', 'Dodawanie mianowników przy dodawaniu ułamków', 'Przy dodawaniu ułamków nie dodajemy mianowników - sprowadzamy do wspólnego mianownika', 'common_denominator_practice', -2),
('real_numbers', 'real_numbers_percentage_calculations', 'percentage_as_multiplier', 'Traktowanie procentów jak zwykłych liczb', 'Procent to setna część - 25% to 0,25, nie 25', 'percentage_conversion_drills', -1),
('real_numbers', 'real_numbers_rounding', 'wrong_rounding_direction', 'Błędny kierunek zaokrąglania', 'Przy zaokrąglaniu: 5 i więcej - w górę, mniej niż 5 - w dół', 'rounding_rules_practice', -1);

-- Insert misconception patterns for Algebraic Expressions
INSERT INTO misconception_patterns (department, micro_skill, misconception_id, description, feedback_template, correction_strategy, difficulty_adjustment) VALUES
('algebraic_expressions', 'algebra_short_multiplication_formulas', 'square_sum_missing_term', 'Pomijanie środkowego wyrazu w (a+b)²', 'Wzór (a+b)² = a² + 2ab + b² - nie zapominaj o środkowym wyrazie 2ab', 'middle_term_emphasis', -2),
('algebraic_expressions', 'algebra_short_multiplication_formulas', 'square_diff_missing_term', 'Błędne zastosowanie wzoru na różnicę kwadratów', 'Wzór (a-b)² = a² - 2ab + b² to nie to samo co a² - b²', 'pattern_distinction', -2),
('algebraic_expressions', 'algebra_polynomial_addition', 'polynomial_subtraction_sign', 'Błędy znakowe przy odejmowaniu wielomianów', 'Przy odejmowaniu zmieniaj znaki wszystkich składników odjemnika', 'sign_change_practice', -1),
('algebraic_expressions', 'algebra_polynomial_multiplication', 'missing_terms_foiling', 'Pomijanie wyrazów przy mnożeniu dwumianów', 'Każdy składnik pierwszego nawiasu musi być pomnożony przez każdy z drugiego', 'systematic_foil_practice', -2),
('algebraic_expressions', 'algebra_factoring_polynomials', 'factoring_common_factor', 'Niepełne wyłączanie wspólnego czynnika', 'Wyłączaj pełny wspólny czynnik - zarówno liczbowy jak i literowy', 'complete_factoring_drills', -2),
('algebraic_expressions', 'algebra_rational_simplification', 'cancel_terms_in_sum', 'Skracanie przez pojedyncze składniki sumy', 'Można skracać tylko wspólne czynniki, nie składniki sumy', 'cancellation_rules_practice', -3),
('algebraic_expressions', 'algebra_rational_addition_subtraction', 'add_denominators', 'Dodawanie mianowników przy dodawaniu ułamków', 'Przy dodawaniu ułamków algebraicznych sprowadź do wspólnego mianownika', 'common_denominator_algebra', -2);