import { batchImportSkillContent } from './skillContentImporter';

export async function runGroup1Import() {
  const chatGPTData = {
    "contentDatabase": [
      {
        "skillId": "1f44da1e-abb1-4c9a-835b-b164d82fe206",
        "skillName": "Działania na liczbach rzeczywistych",
        "class_level": 1,
        "department": "matematyka",
        "generatorParams": {
          "microSkill": "compute",
          "difficultyRange": [1, 10],
          "fallbackTrigger": 3
        },
        "teachingFlow": ["introduction","theory","examples","guided_practice","independent_practice","assessment"],
        "content": {
          "theory": {
            "introduction": "Liczby rzeczywiste obejmują liczby całkowite, wymierne i niewymierne. Uczymy się wykonywać działania (dodawanie, odejmowanie, mnożenie, dzielenie) oraz potęgowanie i pierwiastkowanie z zachowaniem kolejności działań. Ważna jest praca na wartościach dodatnich i ujemnych, zamiana ułamków zwykłych na dziesiętne i odwrotnie oraz szacowanie wyniku. Opanowanie prostych własności (łączność, przemienność, rozdzielność) pozwala upraszczać obliczenia i unikać błędów znaków.",
            "mainConcepts": ["Kolejność działań","Własności: łączność, przemienność, rozdzielność","Liczby ujemne i dodatnie","Potęgi i pierwiastki","Ułamki zwykłe i dziesiętne"],
            "formulas": ["a+b=b+a","(a+b)+c=a+(b+c)","a(b+c)=ab+ac","a^{-1}=1/a","\\sqrt{a^2}=|a|"],
            "timeToRead": 180
          },
          "examples": [
            {
              "title": "Kolejność działań z ułamkami",
              "problem": "Oblicz: \\$3-\\frac{5}{2}\\cdot(-4)\\$",
              "solution": "Krok 1: Najpierw mnożenie: (5/2)·(-4)= -10. Krok 2: 3 - ( -10 ) = 3+10. Krok 3: Wynik 13.",
              "explanation": "Zastosowano kolejność działań: mnożenie przed odejmowaniem oraz regułę znaków.",
              "timeToComplete": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Oblicz: \\$-7+12\\$",
              "expectedAnswer": "5",
              "hints": ["Znak liczb różny – odejmij mniejsze od większego","Zachowaj znak większej wartości bezwzględnej"],
              "timeToComplete": 240
            },
            {
              "type": "intermediate",
              "problem": "Upraszczaj: \\$2(3-5)+4\\$",
              "expectedAnswer": "0",
              "hints": ["Najpierw nawias","Następnie mnożenie","Na końcu dodawanie"],
              "timeToComplete": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Mylenie kolejności działań","Błędy znaków przy liczbach ujemnych","Zła konwersja ułamków"],
          "teachingTips": ["Ćwicz krótkie łańcuchy działań z komentarzem","Wprowadzaj szacowanie wyniku przed obliczeniem"],
          "prerequisites": ["Arytmetyka szkoły podstawowej","Operacje na ułamkach"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Najpierw dodawanie zamiast mnożenia",
            "intervention": "Przypomnij regułę kolejności i wskaż kontrprzykład"
          }
        ],
        "realWorldApplications": ["Szacowanie kosztów zakupów","Obliczenia w eksperymentach szkolnych"],
        "assessmentRubric": {
          "mastery": "Bez-błędne obliczenia i uzasadnione uproszczenia.",
          "proficient": "Poprawny wynik przy drobnych wahaniach w krokach.",
          "developing": "Częste błędy znaków lub kolejności działań."
        }
      },
      {
        "skillId": "bce53b28-de1d-4ec1-b08c-4139ef91b213",
        "skillName": "Nierówności liniowe z jedną niewiadomą",
        "class_level": 1,
        "department": "matematyka",
        "generatorParams": {
          "microSkill": "solve",
          "difficultyRange": [1, 10],
          "fallbackTrigger": 3
        },
        "teachingFlow": ["introduction","theory","examples","guided_practice","independent_practice","assessment"],
        "content": {
          "theory": {
            "introduction": "Nierówność liniowa ma postać ax+b>c, <, ≥ lub ≤. Rozwiązujemy ją jak równanie, pamiętając o zmianie znaku nierówności przy mnożeniu lub dzieleniu przez liczbę ujemną. Rozwiązaniem jest przedział wartości x przedstawiany także na osi liczbowej.",
            "mainConcepts": ["Przenoszenie wyrazów","Dzielenie przez liczbę ujemną","Zamiana na przedział","Zapis na osi","Sprawdzanie rozwiązania"],
            "formulas": ["ax+b>c","x>\\frac{c-b}{a}","(-1)\\cdot x \\Rightarrow \\text{znak}\\,\\text{odwr.}","\\[a,b),\\ (a,\\infty)"],
            "timeToRead": 180
          },
          "examples": [
            {
              "title": "Prosta nierówność",
              "problem": "Rozwiąż: \\$2x-5<9\\$",
              "solution": "Dodaj 5: 2x<14. Podziel przez 2: x<7. Odp: (-∞,7).",
              "explanation": "Stosujemy te same kroki co w równaniu; brak zmiany znaku, bo dzielimy przez dodatnią.",
              "timeToComplete": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Rozwiąż: \\$-3x\\ge 6\\$",
              "expectedAnswer": "x\\le -2",
              "hints": ["Podziel przez -3","Odwróć znak nierówności"],
              "timeToComplete": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż: \\$5-2x\\le 1\\$",
              "expectedAnswer": "x\\ge 2",
              "hints": ["Odejmij 5","Podziel przez -2 i odwróć znak"],
              "timeToComplete": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Brak odwrócenia znaku przy dzieleniu przez ujemne","Zapis punktu brzegowego niezgodnie ze znakiem"],
          "teachingTips": ["Ćwicz na osi liczbowej z otwartymi/zamkniętymi kółkami"],
          "prerequisites": ["Równania liniowe","Kolejność działań"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Dzielenie przez -1 bez zmiany znaku",
            "intervention": "Wprowadź kontrprzykład i zadanie kontrolne"
          }
        ],
        "realWorldApplications": ["Budżet z ograniczeniem wydatków","Warunki progowe w zadaniach fizycznych"],
        "assessmentRubric": {
          "mastery": "Poprawny przedział i wizualizacja na osi.",
          "proficient": "Drobne potknięcia w zapisie, poprawny wynik.",
          "developing": "Błędy w zmianie znaku i przedziałach."
        }
      }
    ]
  };

  try {
    console.log('Starting Group 1 import...');
    const result = await batchImportSkillContent(chatGPTData);
    console.log('Import completed:', result);
    return result;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}