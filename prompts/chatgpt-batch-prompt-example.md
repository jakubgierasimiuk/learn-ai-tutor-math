# Przykład Promptu dla ChatGPT - Batch Import

## Instrukcja użycia:

1. Wygeneruj prompty używając komponentu `BatchImportRunner`
2. Skopiuj wygenerowany prompt do ChatGPT
3. ChatGPT zwróci JSON w formacie `{ "contentDatabase": [...] }`
4. Skopiuj JSON i wklej do pola importu w `BatchImportRunner`
5. Kliknij "Importuj Dane z ChatGPT"

## Przykład wygenerowanego promptu:

```markdown
# Generowanie Treści dla Klasy 4 - Batch 1

Wygeneruj pełną treść edukacyjną dla poniższych 10 umiejętności z klasy 4 polskiej szkoły podstawowej.

## Umiejętności do wygenerowania:

1. **Dodawanie pisemne liczb naturalnych (z przeniesieniem)** (ID: 1729d025-ecf4-45cb-819c-6147c8cda333, Dział: arithmetic)
2. **Odejmowanie pisemne liczb naturalnych (z pożyczką)** (ID: 903233a2-5494-49bc-a079-46d111022daf, Dział: arithmetic)
3. **Mnożenie pisemne przez liczbę jednocyfrową** (ID: 4ddf10c4-4a7a-498e-8cde-38fc9c5a4b2a, Dział: arithmetic)
...

## Wymagania:

1. **Format**: Zwróć TYLKO prawidłowy JSON w formacie:
```json
{
  "contentDatabase": [
    // ... 10 umiejętności z pełną strukturą
  ]
}
```

2. **Struktura każdej umiejętności**:
   - skillId: użyj dokładnie podanego ID z listy powyżej
   - skillName: użyj dokładnie podanej nazwy z listy powyżej  
   - class_level: 4
   - department: użyj podanego działu
   - generatorParams: { microSkill: "default", difficultyRange: [1, 6], fallbackTrigger: "standard_approach" }

3. **Zawartość (content)**:
   - theory: wprowadzenie (maks 100 słów), keyConceptsLaTex (wzory inline $...$)
   - examples: 2-3 przykłady z rozwiązaniem krok po kroku
   - practiceExercises: 3-5 ćwiczeń o rosnącej trudności

4. **Polskie nazewnictwo**: Wszystko w języku polskim, dostosowane do poziomu klasy 4

5. **LaTeX**: TYLKO inline $wzory$ (maks 50 znaków), NO display math $$...$$

6. **Czas**: Wszystkie timeEstimate w sekundach (60-300 dla teorii, 120-600 dla ćwiczeń)

**UWAGA**: Odpowiedz TYLKO prawidłowym JSON bez dodatkowych komentarzy!
```

## Oczekiwana odpowiedź z ChatGPT:

```json
{
  "contentDatabase": [
    {
      "skillId": "1729d025-ecf4-45cb-819c-6147c8cda333",
      "skillName": "Dodawanie pisemne liczb naturalnych (z przeniesieniem)",
      "class_level": 4,
      "department": "arithmetic",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 6],
        "fallbackTrigger": "standard_approach"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie",
          "duration": 900,
          "activities": ["theory", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia",
          "duration": 1200,
          "activities": ["practice", "feedback"]
        },
        "phase3": {
          "name": "Utrwalanie",
          "duration": 600,
          "activities": ["mastery_tasks", "assessment"]
        }
      },
      // ... reszta struktury
    }
    // ... pozostałe umiejętności
  ]
}
```

## Wskazówki dla ChatGPT:

- Używaj polskich nazw matematycznych zgodnych z podstawą programową
- Dostosuj poziom trudności do klasy 4 (wiek 9-10 lat)
- Wzory LaTeX mają być proste i czytelne
- Przykłady mają być praktyczne i zrozumiałe dla dzieci
- Ćwiczenia powinny mieć rosnący poziom trudności