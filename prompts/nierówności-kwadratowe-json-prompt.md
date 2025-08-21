# Prompt do generowania JSON dla umiejętności: Nierówności kwadratowe

## KONTEKST APLIKACJI

Jesteś ekspertem w tworzeniu treści edukacyjnych dla polskiej aplikacji matematycznej na poziom liceum. Aplikacja używa adaptacyjnej pedagogiki z fazowym systemem nauki (teoria → ćwiczenia → utrwalanie). Twoim zadaniem jest wygenerowanie kompletnego JSON-a dla umiejętności "Nierówności kwadratowe" dla klasy 1 liceum (algebra).

## WYMAGANA STRUKTURA JSON

Wygeneruj JSON DOKŁADNIE według tej struktury (wykorzystaj istniejące pole "skillId" jako "quadratic-inequalities-cl1"):

```json
{
  "skillId": "quadratic-inequalities-cl1",
  "skillName": "Nierówności kwadratowe",
  "class_level": 1,
  "department": "algebra",
  "generator_params": {
    "microSkill": "quadratic_inequality_solving",
    "difficultyRange": [2, 5],
    "fallbackTrigger": "use_basic_quadratic_patterns"
  },
  "teaching_flow": {
    "phase1": { "name": "Wprowadzenie", "duration": 1200, "activities": ["theory", "guided_examples"] },
    "phase2": { "name": "Ćwiczenia", "duration": 1800, "activities": ["practice", "feedback"] },
    "phase3": { "name": "Utrwalanie", "duration": 900, "activities": ["mastery_tasks", "assessment"] }
  },
  "content": {
    "theory": { ... },
    "examples": [ ... ],
    "practice_exercises": [ ... ]
  },
  "misconception_patterns": [ ... ],
  "real_world_applications": [ ... ],
  "pedagogical_notes": { ... },
  "assessment_rubric": { ... }
}
```

## WYMAGANIA MERYTORYCZNE

### TEORIA (theory):
- Definicja nierówności kwadratowej (ax² + bx + c > 0, < 0, ≥ 0, ≤ 0)
- Metoda sprawdzania znaku funkcji kwadratowej
- Rola dyskryminianty w rozwiązywaniu nierówności
- Interpretacja graficzna (parabola powyżej/poniżej osi OX)
- Przypadki szczególne (brak rozwiązań, wszystkie liczby rzeczywiste)
- Wzory: Δ = b² - 4ac, postać iloczynowa, schemat znaków
- time_estimate: 400-500 sekund
- difficulty_level: 2-3

### PRZYKŁADY (examples) - 5 przykładów:
1. **Podstawowa nierówność** (np. x² - 5x + 6 > 0) - metoda graficzna/iloczynowa
2. **Nierówność z Δ < 0** - brak miejsc zerowych, stały znak
3. **Nierówność z pierwiastkiem podwójnym** - jeden punkt zerowy
4. **Nierówność postaci ≤ 0** - uwzględnienie granic przedziału
5. **Złożona nierówność** - wymagająca przekształceń algebraicznych

Każdy przykład:
- Kod (QUAD_INE_001, QUAD_INE_002, ...)
- 3-5 kroków rozwiązania z LaTeX-em
- Wyjaśnienie interpretacji graficznej
- time_estimate: 180-250 sekund
- difficulty_level: 2-4

### ĆWICZENIA (practice_exercises) - 6 zadań:
1. Podstawowe rozwiązanie (poziom 2)
2. Nierówność z ujemnym współczynnikiem przy x² (poziom 3)
3. Nierówność nieostra (≥, ≤) (poziom 3)
4. Przypadek bez rozwiązań (poziom 3)
5. Nierówność wymagająca przekształceń (poziom 4)
6. Zadanie aplikacyjne (ruch, pole, zysk) (poziom 4)

### BŁĘDY I MISCONCEPCJE:
- Pomijanie znaku współczynnika przy x²
- Mylenie kierunku nierówności przy zmianie znaku
- Ignorowanie przypadków równości w nierównościach nieostrych
- Błędna interpretacja graficzna (parabola ramiona w dół/górę)
- Nieprawidłowe wyznaczanie przedziałów z tablicy znaków

### ZASTOSOWANIA PRAKTYCZNE:
- Optymalizacja zysków w firmie
- Ruch ciał (wysokość, zasięg rzutu)
- Geometria analityczna (pole figur)
- Fizyka (energia, prędkość)

## WYMAGANIA TECHNICZNE

1. **LaTeX**: Wszystkie wzory w notacji LaTeX ($...$)
2. **Język**: Wyłącznie polski
3. **Kodowanie znaków**: Polskie znaki (ą, ć, ę, ł, ń, ó, ś, ź, ż)
4. **Precyzja**: Dokładne obliczenia i sprawdzone wzory
5. **Spójność**: Konsekwentne oznaczenia zmiennych i funkcji

## STRUKTURA ODPOWIEDZI

Zwróć TYLKO i wyłącznie kompletny, poprawny JSON bez żadnych komentarzy, wyjaśnień czy dodatkowego tekstu. JSON musi być gotowy do bezpośredniego wklejenia do aplikacji.

## POZIOM SZCZEGÓŁOWOŚCI

- Teoria: Kompleksowa ale przystępna dla ucznia klasy 1 liceum
- Przykłady: Krok po kroku z wyjaśnieniami
- Ćwiczenia: Zróżnicowany poziom trudności z feedback-iem
- Błędy: Typowe pomyłki uczniów z konkretną pomocą
- Zastosowania: Realne sytuacje dla licealistów

Wygeneruj teraz kompletny JSON dla umiejętności "Nierówności kwadratowe".