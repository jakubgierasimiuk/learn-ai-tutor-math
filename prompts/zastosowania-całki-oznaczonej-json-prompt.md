# Prompt: Zastosowania całki oznaczonej (pola, objętości) - JSON Generator

## Kontekst systemu

Jesteś ekspertem w tworzeniu treści edukacyjnych dla **AI Math Tutor** - zaawansowanej platformy do nauki matematyki dla polskich szkół średnich i studentów pierwszego roku. System wykorzystuje:

- **Uniwersalne Generatory Zadań** z parametrami mikroumiejętności
- **Adaptacyjny Kontroler Trudności** z zakresami 1-5
- **Detekcję Błędnych Koncepcji** z mapowaniem feedbacku
- **Uczenie Fazowe** (wprowadzenie → ćwiczenia → utrwalanie)
- **Renderowanie LaTeX** z katex
- **Analityka Czasowa** z precyzyjnymi estymacjami

Obecnie system posiada już umiejętności z algebry podstawowej, nierówności kwadratowych, równań z wartością bezwzględną. Teraz rozszerzamy o **analizę matematyczną** - zastosowania całek do obliczania pól i objętości.

## Wymagany format JSON

Musisz wygenerować **DOKŁADNIE** tę strukturę JSON:

```json
{
  "skillId": "applications-definite-integral-cl3",
  "skillName": "Zastosowania całki oznaczonej (pola, objętości)",
  "class_level": 3,
  "department": "analiza_matematyczna",
  "generator_params": {
    "microSkill": "definite_integral_applications",
    "difficultyRange": [3, 5],
    "fallbackTrigger": "use_basic_area_volume_patterns"
  },
  "teaching_flow": {
    "phase1": { "name": "Wprowadzenie", "duration": 1500, "activities": ["theory", "guided_examples"] },
    "phase2": { "name": "Ćwiczenia", "duration": 2400, "activities": ["practice", "feedback"] },
    "phase3": { "name": "Utrwalanie", "duration": 1200, "activities": ["mastery_tasks", "assessment"] }
  },
  "content": {
    "theory": {
      "theory_text": "[OPIS TEORII - max 800 słów]",
      "key_formulas": ["[WZORY W LaTeX]"],
      "time_estimate": 600,
      "difficulty_level": 4
    },
    "examples": [
      {
        "example_code": "INT_APP_001",
        "problem_statement": "[TREŚĆ ZADANIA W LaTeX]",
        "solution_steps": [
          { "step": "[NAZWA KROKU]", "latex": "[WZÓR]", "explanation": "[WYJAŚNIENIE]" }
        ],
        "final_answer": "[ODPOWIEDŹ]",
        "explanation": "[PODSUMOWANIE]",
        "time_estimate": 300,
        "difficulty_level": 3
      }
    ],
    "practice_exercises": [
      {
        "exercise_code": "INT_EX_001",
        "problem_statement": "[ZADANIE]",
        "expected_answer": "[OCZEKIWANA ODPOWIEDŹ]",
        "difficulty_level": 3,
        "time_estimate": 400,
        "misconception_map": {
          "incorrect_answer_1": { "type": "integration_bounds_error", "feedback": "[FEEDBACK]" },
          "incorrect_answer_2": { "type": "volume_formula_confusion", "feedback": "[FEEDBACK]" }
        }
      }
    ]
  },
  "misconception_patterns": [
    {
      "pattern_code": "INT_BOUNDS_ERROR",
      "description": "[OPIS BŁĘDU]",
      "example_error": "[PRZYKŁAD BŁĘDNEJ ODPOWIEDZI]",
      "intervention_strategy": "[STRATEGIA NAPRAWCZA]"
    }
  ],
  "real_world_applications": [
    {
      "context": "[KONTEKST - np. inżynieria]",
      "problem_description": "[OPIS PROBLEMU]",
      "age_group": "liceum/studia",
      "connection_explanation": "[JAK ŁĄCZY SIĘ Z CAŁKAMI]"
    }
  ],
  "pedagogical_notes": {
    "common_mistakes": ["[LISTA BŁĘDÓW]"],
    "teaching_tips": ["[WSKAZÓWKI DYDAKTYCZNE]"],
    "prerequisites": ["[WYMAGANIA WSTĘPNE]"],
    "estimated_time": 5100,
    "difficulty_progression": "[OPIS PROGRESJI TRUDNOŚCI]"
  },
  "assessment_rubric": {
    "scope": "Ocena 10 zadań z zastosowań całki oznaczonej (klasa 3/studia).",
    "criteria": [
      {
        "skill": "[NAZWA UMIEJĘTNOŚCI]",
        "beginner": "[POZIOM POCZĄTKUJĄCY]",
        "intermediate": "[POZIOM ŚREDNI]", 
        "advanced": "[POZIOM ZAAWANSOWANY]"
      }
    ]
  }
}
```

## Wymagania treści

### Teoria (theory_text):
Obejmij **wszystkie kluczowe koncepty**:
- Pole między krzywymi: $\int_a^b |f(x)-g(x)|dx$
- Pole w układzie parametrycznym: $\int_{t_1}^{t_2} y(t) \cdot x'(t) dt$
- Objętość bryły obrotowej (metoda krążków): $V = \pi\int_a^b [f(x)]^2 dx$  
- Objętość bryły obrotowej (metoda pierścieni): $V = \pi\int_a^b ([R(x)]^2 - [r(x)]^2) dx$
- Objętość przez przekroje poprzeczne: $V = \int_a^b A(x) dx$
- Długość łuku krzywej: $L = \int_a^b \sqrt{1+[f'(x)]^2} dx$

### Przykłady (6 przykładów):
1. **INT_APP_001**: Pole między parabołą a prostą
2. **INT_APP_002**: Pole figury ograniczonej trzema krzywymi  
3. **INT_APP_003**: Objętość bryły obrotowej - metoda krążków
4. **INT_APP_004**: Objętość bryły obrotowej - metoda pierścieni
5. **INT_APP_005**: Objętość przez przekroje (np. trójkątne)
6. **INT_APP_006**: Długość łuku krzywej

### Ćwiczenia praktyczne (8 ćwiczeń):
- **Poziom 3**: Podstawowe pola i objętości (4 zadania)
- **Poziom 4**: Złożone figury i bryły (3 zadania)  
- **Poziom 5**: Zadania parametryczne i optymalizacyjne (1 zadanie)

### Typowe błędne koncepcje (5-6 wzorców):
- Błędne granice całkowania
- Mylenie metod objętości (krążki vs pierścienie)
- Pomijanie wartości bezwzględnej w polach
- Błędy w funkcjach górnych/dolnych
- Nieprawidłowe stosowanie wzorów parametrycznych

### Zastosowania praktyczne (4 przykłady):
- **Inżynieria**: Objętość zbiorników, powierzchnia materiałów
- **Fizyka**: Pole pod wykresem prędości, środek masy
- **Architektura**: Powierzchnie kopuł, objętości konstrukcji
- **Medycyna**: Objętość narządów z obrazowania 3D

## Krytyczne specyfikacje techniczne

### Integracja z Generatorem:
- `microSkill`: "definite_integral_applications" (dokładnie ta nazwa!)
- `difficultyRange`: [3, 5] (zaawansowany poziom)
- `fallbackTrigger`: "use_basic_area_volume_patterns"

### Formatowanie LaTeX:
- **TYLKO** LaTeX inline: `$...$` (NIGDY `$$...$$`)
- **Maksymalnie** 60 znaków na wzór
- **Zakazane** zagnieżdżenia: `$...$` w `$...$`
- **Dozwolone** komendy: `\int`, `\pi`, `\sqrt`, `\frac`, `^`, `_`, `\cdot`, `\sin`, `\cos`, `\ln`
- **Przykład poprawny**: `$V = \pi\int_0^2 x^2 dx$`

### Standaryzacja czasu:
- **Wszystkie** czasy w sekundach
- Theory: 600s, Examples: 250-400s, Exercises: 300-500s
- **Łączny czas**: ~5100s (85 minut)

### Limity długości:
- `theory_text`: max 800 słów
- `explanation` w przykładach: max 150 słów  
- `feedback` w misconceptions: max 100 słów

## Metodologia tworzenia treści

### Wybór umiejętności:
- **Zgodność** z polskim programem nauczania (klasa 3 LO / studia I rok)
- **Bogactwo** błędnych koncepcji do wykrycia
- **Progresywna** struktura od podstaw do zaawansowanych
- **Kompatybilność** z generatorem zadań

### Standardy jakości:

**Teoria**:
- Zwięzłe, matematycznie precyzyjne definicje
- Intuicyjne wyjaśnienia geometryczne
- Powiązania z wcześniejszymi umiejętnościami
- Przykłady zastosowań praktycznych

**Przykłady**:  
- Różnorodność metod i poziomów trudności
- Szczegółowe kroki rozwiązania z uzasadnieniem
- Wizualizacja geometryczna gdzie możliwe
- Sprawdzenie wyników i interpretacja

**Ćwiczenia**:
- Progresja trudności 3→4→5
- Różnorodność typów zadań i kontekstów
- Precyzyjne mapowanie błędów na feedback
- Konstruktywne wskazówki naprawcze

### Wzbogacenia pedagogiczne:
- **Częste błędy**: 6-8 konkretnych pułapek
- **Wskazówki**: Strategie rozwiązywania i weryfikacji
- **Zastosowania**: 4 różne dziedziny praktyczne  
- **Progresja**: Od prostych pól do złożonych objętości

## Lista priorytetowych mikroumiejętności

Uwzględnij te **konkretne** obszary w treści:

1. **Pole między krzywymi** (`area_between_curves`)
2. **Pole w parametryzacji** (`parametric_area`) 
3. **Objętość - metoda krążków** (`volume_disk_method`)
4. **Objętość - metoda pierścieni** (`volume_washer_method`)
5. **Objętość przez przekroje** (`volume_cross_sections`)
6. **Długość łuku** (`arc_length`)
7. **Zastosowania fizyczne** (`physics_applications`)

## Obowiązkowe sprawdzenia przed wysłaniem

### ✅ Walidacja JSON:
- [ ] Poprawna składnia JSON (brak przecinków na końcu)
- [ ] Wszystkie wymagane pola obecne
- [ ] Konsystentne nazewnictwo kodów

### ✅ LaTeX:
- [ ] Tylko inline `$...$` (brak display `$$...$$`)  
- [ ] Wszystkie wzory < 60 znaków
- [ ] Brak zagnieżdżeń modów matematycznych
- [ ] Testowe sprawdzenie w katex

### ✅ Jednostki czasu:
- [ ] Wszystkie czasy w sekundach
- [ ] Suma czasów ~5100s
- [ ] Realistyczne estymacje

### ✅ Limity słów:
- [ ] theory_text ≤ 800 słów  
- [ ] Każdy explanation ≤ 150 słów
- [ ] Każdy feedback ≤ 100 słów

### ✅ Język i kodowanie:
- [ ] Całość w języku polskim
- [ ] Poprawne polskie znaki (ą, ć, ę, ł, ń, ó, ś, ź, ż)
- [ ] Spójność terminologii matematycznej
- [ ] Precyzyjne obliczenia i wzory

## Finalne dostarczenie

Zwróć **WYŁĄCZNIE** kompletny obiekt JSON z wszystkimi 20 umiejętnościami. 

**ŻADNEGO** dodatkowego tekstu, komentarzy ani wyjaśnień.

JSON musi być **gotowy do produkcji** - natychmiast użyteczny przez system, z najwyższą jakością, dokładnością i zgodnością z polskim curriculum matematycznym na poziomie zaawansowanym.