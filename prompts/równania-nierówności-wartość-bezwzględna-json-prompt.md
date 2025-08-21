# Prompt do generowania danych JSON dla tematu: Równania i nierówności z wartością bezwzględną

Jesteś ekspertem w dziedzinie matematyki i pedagogiki, specjalizującym się w tworzeniu materiałów edukacyjnych dla polskich uczniów na poziomie liceum. Twoim zadaniem jest wygenerowanie kompletnej struktury JSON dla tematu "Równania i nierówności z wartością bezwzględną" zgodnie z poniższą specyfikacją.

## Kontekst aplikacji
Tworzysz dane dla systemu adaptacyjnego uczenia matematyki, który:
- Dostosowuje poziom trudności do umiejętności ucznia
- Identyfikuje i adresuje typowe błędy koncepcyjne
- Dostarcza spersonalizowane ścieżki nauki z natychmiastowym feedbackiem
- Wykorzystuje rzeczywiste zastosowania do motywowania uczniów

## Wymagana struktura JSON

```json
{
  "skillId": "equations-inequalities-absolute-value-cl2",
  "skillName": "Równania i nierówności z wartością bezwzględną",
  "class_level": 2,
  "department": "algebra",
  "generator_params": {
    "microSkill": "absolute_value_equations_inequalities",
    "difficultyRange": [2, 5],
    "fallbackTrigger": "use_basic_absolute_equation_patterns"
  },
  "teaching_flow": {
    "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] },
    "phase2": { "name": "Ćwiczenia", "duration": 1800, "activities": ["practice", "feedback"] },
    "phase3": { "name": "Utrwalanie", "duration": 900, "activities": ["mastery_tasks", "assessment"] }
  },
  "content": {
    "theory": { /* teoria */ },
    "examples": [ /* przykłady */ ],
    "practice_exercises": [ /* ćwiczenia */ ]
  },
  "misconception_patterns": [ /* wzorce błędów */ ],
  "real_world_applications": [ /* zastosowania */ ],
  "pedagogical_notes": { /* notatki pedagogiczne */ },
  "assessment_rubric": { /* kryteria oceny */ }
}
```

## Szczegółowe wymagania zawartości

### 1. Teoria (theory)
- **theory_text**: Jasne wyjaśnienie metod rozwiązywania równań i nierówności z wartością bezwzględną
- **key_formulas**: Kluczowe wzory i reguły (minimum 4-6 wzorów w LaTeX)
- **time_estimate**: 400-500 sekund
- **difficulty_level**: 2-3

Teoria powinna obejmować:
- Równania typu |f(x)| = a (przypadki a > 0, a = 0, a < 0)
- Równania typu |f(x)| = |g(x)|
- Nierówności typu |f(x)| < a, |f(x)| > a
- Nierówności typu |f(x)| < |g(x)|
- Interpretacja geometryczna na osi liczbowej
- Metoda analizy przypadków (definicja kawałkowa)

### 2. Przykłady (examples)
Dostarcz **6 przykładów** o rosnącej trudności:

**Przykład 1**: Podstawowe równanie |x| = 3
**Przykład 2**: Równanie |x - 2| = 5
**Przykład 3**: Równanie |2x + 1| = 7
**Przykład 4**: Nierówność |x| ≤ 4
**Przykład 5**: Nierówność |x - 3| > 2
**Przykład 6**: Równanie |x - 1| = |x + 2|

Każdy przykład musi zawierać:
- **example_code**: Unikalny kod (ABS_EQ_001, ABS_EQ_002, itd.)
- **problem_statement**: Zadanie w LaTeX
- **solution_steps**: 3-5 kroków z wyjaśnieniami
- **final_answer**: Końcowa odpowiedź
- **explanation**: Kluczowa idea rozwiązania
- **time_estimate**: 120-200 sekund
- **difficulty_level**: 1-4

### 3. Ćwiczenia praktyczne (practice_exercises)
Stwórz **8 ćwiczeń** różnej trudności:
- 2 ćwiczenia poziom 1-2 (podstawowe równania)
- 3 ćwiczenia poziom 2-3 (równania z przekształceniami)
- 2 ćwiczenia poziom 3-4 (nierówności)
- 1 ćwiczenie poziom 4-5 (złożone przypadki)

Każde ćwiczenie zawiera:
- **exercise_code**: Unikalny kod
- **problem_statement**: Zadanie
- **expected_answer**: Oczekiwana odpowiedź
- **difficulty_level**: 1-5
- **time_estimate**: 180-300 sekund
- **misconception_map**: Mapa typowych błędów z feedbackiem

### 4. Wzorce błędów (misconception_patterns)
Zidentyfikuj **4-5 typowych błędów**:
- Zapomnienie o dwóch przypadkach w równaniach |f(x)| = a
- Błędne rozwiązywanie nierówności |x| > a
- Pomyłki przy równaniach |f(x)| = |g(x)|
- Błędy w interpretacji geometrycznej
- Nieprawidłowe łączenie przedziałów w nierównościach

### 5. Zastosowania praktyczne (real_world_applications)
Podaj **4 zastosowania** z różnych dziedzin:
- Fizyka (błędy pomiarowe, tolerancje)
- Geografia (odległości na mapie)
- Ekonomia (odchylenia od budżetu)
- Technologia (kontrola jakości)

### 6. Notatki pedagogiczne (pedagogical_notes)
- **common_mistakes**: 4-5 najczęstszych błędów
- **teaching_tips**: 4-5 wskazówek dydaktycznych
- **prerequisites**: Wymagane umiejętności wstępne
- **estimated_time**: Łączny czas nauki (3600 sekund)
- **difficulty_progression**: Opis stopniowania trudności

### 7. Kryteria oceny (assessment_rubric)
Zdefiniuj 4 główne umiejętności z poziomami:
- **Rozwiązywanie równań z wartością bezwzględną**
- **Rozwiązywanie nierówności z wartością bezwzględną**
- **Interpretacja geometryczna**
- **Analiza przypadków i sprawdzanie rozwiązań**

## Wymagania techniczne
- Wszystkie wzory matematyczne w formacie LaTeX
- Polski język we wszystkich opisach
- Logiczna progresja trudności
- Precyzyjne oszacowania czasu
- Konstruktywny feedback dla błędów
- Zgodność z polskim systemem edukacyjnym (poziom liceum)

## Format odpowiedzi
Wygeneruj kompletny, poprawny JSON bez dodatkowych komentarzy. JSON musi być gotowy do bezpośredniego użycia w aplikacji.

---

Wygeneruj teraz kompletne dane JSON dla tematu "Równania i nierówności z wartością bezwzględną".