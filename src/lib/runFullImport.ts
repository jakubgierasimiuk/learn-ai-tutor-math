import { batchImportSkillContent } from './skillContentImporter';

export async function runFullGroup1Import() {
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

// Run the import immediately
runFullGroup1Import().then(result => {
  console.log('Final result:', result);
}).catch(error => {
  console.error('Final error:', error);
});