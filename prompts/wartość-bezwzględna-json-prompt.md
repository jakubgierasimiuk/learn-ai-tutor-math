# Prompt do generowania JSON: Wartość bezwzględna - definicja i własności

## KONTEKST APLIKACJI
Tworzysz dane dla systemu edukacyjnego - aplikacji do nauki matematyki dla uczniów szkół średnich. System wykorzystuje AI do adaptacyjnego nauczania z personalizacją ścieżki nauki. 

## CEL
Wygeneruj kompletny JSON zawierający wszystkie dane potrzebne do nauczania tematu "Wartość bezwzględna - definicja i własności" dla klasy 1 liceum (algebra).

## WYMAGANA STRUKTURA JSON
```json
{
  "skillId": "absolute-value-definition-cl1",
  "skillName": "Wartość bezwzględna - definicja i własności", 
  "class_level": 1,
  "department": "algebra",
  "generator_params": {
    "microSkill": "absolute_value_basics",
    "difficultyRange": [1, 4],
    "fallbackTrigger": "use_basic_absolute_patterns"
  },
  "teaching_flow": {
    "phase1": { "name": "...", "duration": 900, "activities": [...] },
    "phase2": { "name": "...", "duration": 1200, "activities": [...] },
    "phase3": { "name": "...", "duration": 600, "activities": [...] }
  },
  "content": {
    "theory": {
      "theory_text": "...",
      "key_formulas": ["...", "..."],
      "time_estimate": 300,
      "difficulty_level": 1
    },
    "examples": [
      {
        "example_code": "ABS_001",
        "problem_statement": "...",
        "solution_steps": [
          {
            "step": "...",
            "latex": "...",
            "explanation": "..."
          }
        ],
        "final_answer": "...",
        "explanation": "...",
        "time_estimate": 120,
        "difficulty_level": 1
      }
    ],
    "practice_exercises": [
      {
        "exercise_code": "ABS_EX_001",
        "problem_statement": "...",
        "expected_answer": "...",
        "difficulty_level": 2,
        "time_estimate": 150,
        "misconception_map": {
          "incorrect_answer_1": {
            "type": "sign_confusion",
            "feedback": "..."
          }
        }
      }
    ]
  },
  "misconception_patterns": [...],
  "real_world_applications": [...],
  "pedagogical_notes": {...},
  "assessment_rubric": {...}
}
```

## SZCZEGÓŁOWE WYMAGANIA TREŚCI

### THEORY (teoria)
- Definicja wartości bezwzględnej jako odległość od zera
- Interpretacja geometryczna na osi liczbowej
- Właściwości: |a| ≥ 0, |a| = |-a|, |ab| = |a||b|
- Wzór kawałkowy: |x| = x dla x≥0, |x| = -x dla x<0
- Czas szacunkowy: 300 sekund

### EXAMPLES (4-5 przykładów)
Przykłady powinny pokazywać:
1. Obliczanie |5|, |-3|, |0| (podstawowe)
2. Obliczanie |2-5|, |π-4| (wyrażenia)
3. Zastosowanie wzoru kawałkowego dla |x-2|
4. Właściwość |a·b| = |a|·|b|
5. Porównywanie |a| z |b|

### PRACTICE_EXERCISES (6 ćwiczeń)
Zadania o rosnącej trudności:
- Obliczanie wartości bezwzględnych liczb
- Wyrażenia z wartością bezwzględną
- Zastosowanie definicji kawałkowej
- Nierówności z wartością bezwzględną (proste)

### MISCONCEPTION_PATTERNS
Typowe błędy uczniów:
- |−a| = −|a| (błąd znaku)
- |a + b| = |a| + |b| zawsze
- Mylenie |x| z x
- Niewłaściwe rozumienie "odległości od zera"

### REAL_WORLD_APPLICATIONS
Praktyczne zastosowania:
- Odchylenia od normy (temperatura, pomiary)
- Błędy pomiarowe w fizyce
- Odległości w GPS/nawigacji
- Kontrola jakości w produkcji

### ASSESSMENT_RUBRIC
Kryteria oceny umiejętności:
- Obliczanie podstawowych wartości bezwzględnych
- Stosowanie definicji kawałkowej
- Rozumienie interpretacji geometrycznej
- Zastosowanie właściwości

## WYMAGANIA TECHNICZNE
- Wszystkie wzory matematyczne w LaTeX (pojedyncze $)
- Polskie znaki diakrytyczne poprawnie kodowane
- Czas w sekundach dla time_estimate
- Poziomy trudności: 1-5
- Kody przykładów: ABS_001, ABS_002, etc.
- Kody ćwiczeń: ABS_EX_001, ABS_EX_002, etc.

## OCZEKIWANY POZIOM
Klasa 1 liceum - podstawy wartości bezwzględnej bez skomplikowanych równań i nierówności. Skupić się na definicji, własności i prostych obliczeniach.

**WAŻNE:** Zwróć JSON w formacie gotowym do skopiowania, bez dodatkowych komentarzy czy objaśnień przed ani po kodzie JSON.