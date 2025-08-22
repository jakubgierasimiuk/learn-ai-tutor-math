import { batchImportSkillContent } from './skillContentImporter';

// Simplified import with fixed data structure
const simpleChatGPTData = {
  contentDatabase: [
    {
      skillId: "1f44da1e-abb1-4c9a-835b-b164d82fe206",
      skillName: "Działania na liczbach rzeczywistych",
      class_level: 1,
      department: "algebra",
      generatorParams: {
        microSkill: "default",
        difficultyRange: [1, 8],
        fallbackTrigger: "standard_approach"
      },
      teachingFlow: {
        phase1: { name: "Wprowadzenie", duration: 900, activities: ["theory", "guided_examples"] },
        phase2: { name: "Ćwiczenia", duration: 1200, activities: ["practice", "feedback"] },
        phase3: { name: "Utrwalanie", duration: 600, activities: ["mastery_tasks", "assessment"] }
      },
      content: {
        theory: {
          introduction: "Liczby rzeczywiste obejmują liczby całkowite, wymierne i niewymierne. W tym temacie ćwiczymy kolejność działań, pracę z liczbami ujemnymi oraz ułamkami zwykłymi i dziesiętnymi.",
          keyConceptsLaTex: ["$a+b=b+a$", "$(a+b)+c=a+(b+c)$"],
          timeEstimate: 180
        },
        examples: [
          {
            title: "Kolejność działań",
            problem: "Oblicz $3-\\frac{5}{2}\\cdot(-4)$",
            solution: "Najpierw mnożenie: $(5/2)\\cdot(-4)=-10$. Następnie: $3-(-10)=13$.",
            timeEstimate: 300
          }
        ],
        practiceExercises: [
          {
            type: "basic",
            problem: "Oblicz $-7+12$",
            expectedAnswer: "5",
            hints: ["Porównaj wartości bezwzględne"],
            timeEstimate: 240
          }
        ]
      },
      pedagogicalNotes: {
        commonMistakes: ["Ignorowanie kolejności działań", "Błędy znaków przy mnożeniu ujemnych"],
        teachingTips: ["Wprowadzaj szacowanie przed rachunkiem"],
        prerequisites: ["Arytmetyka szkoły podstawowej"]
      },
      misconceptionPatterns: [
        {
          pattern: "Dodawanie przed mnożeniem w złożonych wyrażeniach",
          intervention: "Przypomnij hierarchię działań i rozwiąż kontrprzykład krok po kroku"
        }
      ],
      realWorldApplications: ["Przeliczanie cen i rabatów", "Szacowanie wyników pomiarów"],
      assessmentRubric: {
        mastery: "Bez błędów stosuje własności działań i szacuje wynik.",
        proficient: "Popełnia drobne błędy rachunkowe, poprawna metoda.",
        developing: "Często myli kolejność działań lub znaki."
      }
    },
    {
      skillId: "bce53b28-de1d-4ec1-b08c-4139ef91b213",
      skillName: "Nierówności liniowe z jedną niewiadomą",
      class_level: 1,
      department: "algebra",
      generatorParams: {
        microSkill: "default",
        difficultyRange: [1, 8],
        fallbackTrigger: "standard_approach"
      },
      teachingFlow: {
        phase1: { name: "Wprowadzenie", duration: 900, activities: ["theory", "guided_examples"] },
        phase2: { name: "Ćwiczenia", duration: 1200, activities: ["practice", "feedback"] },
        phase3: { name: "Utrwalanie", duration: 600, activities: ["mastery_tasks", "assessment"] }
      },
      content: {
        theory: {
          introduction: "Nierówność liniowa ma postać $ax+b < c$. Rozwiązujemy ją analogicznie do równań, pamiętając o zmianie znaku przy dzieleniu przez liczbę ujemną.",
          keyConceptsLaTex: ["$ax+b<c$", "$x<\\frac{c-b}{a}$"],
          timeEstimate: 180
        },
        examples: [
          {
            title: "Prosta nierówność",
            problem: "Rozwiąż $2x-5<9$",
            solution: "Dodaj 5: $2x<14$. Podziel przez 2: $x<7$.",
            timeEstimate: 300
          }
        ],
        practiceExercises: [
          {
            type: "basic",
            problem: "Rozwiąż $x+4>1$",
            expectedAnswer: "x>-3",
            hints: ["Odejmij 4"],
            timeEstimate: 240
          }
        ]
      },
      pedagogicalNotes: {
        commonMistakes: ["Brak zmiany znaku przy dzieleniu przez liczbę ujemną"],
        teachingTips: ["Ćwicz na osi z kółkami otwartymi i zamkniętymi"],
        prerequisites: ["Równania liniowe", "Notacja przedziałowa"]
      },
      misconceptionPatterns: [
        {
          pattern: "Dzielenie przez -1 bez odwrócenia znaku",
          intervention: "Pokaż kontrprzykład liczbowy i zaznacz wynik na osi"
        }
      ],
      realWorldApplications: ["Budżety z ograniczeniami", "Warunki progowe w fizyce"],
      assessmentRubric: {
        mastery: "Poprawnie wyznacza przedziały i przedstawia na osi.",
        proficient: "Nieliczne potknięcia w zapisie przedziału.",
        developing: "Nieprawidłowa zmiana znaku i mylenie nawiasów."
      }
    },
    {
      skillId: "ab3ff5a5-499b-4041-8037-9b76072dced1",
      skillName: "Rozwiązywanie równań liniowych",
      class_level: 1,
      department: "algebra",
      generatorParams: {
        microSkill: "default",
        difficultyRange: [1, 8],
        fallbackTrigger: "standard_approach"
      },
      teachingFlow: {
        phase1: { name: "Wprowadzenie", duration: 900, activities: ["theory", "guided_examples"] },
        phase2: { name: "Ćwiczenia", duration: 1200, activities: ["practice", "feedback"] },
        phase3: { name: "Utrwalanie", duration: 600, activities: ["mastery_tasks", "assessment"] }
      },
      content: {
        theory: {
          introduction: "Równanie liniowe w jednej niewiadomej ma postać $ax+b=c$. Celem jest izolacja $x$ za pomocą równoważnych przekształceń.",
          keyConceptsLaTex: ["$ax+b=c$", "$x=\\frac{c-b}{a}$"],
          timeEstimate: 180
        },
        examples: [
          {
            title: "Równanie podstawowe",
            problem: "Rozwiąż $3x+7=1$",
            solution: "Odejmij 7: $3x=-6$. Podziel przez 3: $x=-2$.",
            timeEstimate: 300
          }
        ],
        practiceExercises: [
          {
            type: "basic",
            problem: "Rozwiąż $2x-4=10$",
            expectedAnswer: "x=7",
            hints: ["Dodaj 4", "Podziel przez 2"],
            timeEstimate: 240
          }
        ]
      },
      pedagogicalNotes: {
        commonMistakes: ["Dzielenie tylko jednej strony równania", "Błędy znaków przy przenoszeniu"],
        teachingTips: ["Ucz sprawdzania przez podstawienie"],
        prerequisites: ["Działania na liczbach", "Kolejność działań"]
      },
      misconceptionPatterns: [
        {
          pattern: "Traktowanie znaku po przeniesieniu jako niezmiennego",
          intervention: "Ćwiczenia z komentarzem 'co robię po obu stronach?'"
        }
      ],
      realWorldApplications: ["Modele kosztów stałych i zmiennych", "Skalowanie wielkości w fizyce"],
      assessmentRubric: {
        mastery: "Szybko i bezbłędnie izoluje $x$ i weryfikuje wynik.",
        proficient: "Poprawny wynik, okazjonalne potknięcia w zapisie.",
        developing: "Błędy w przekształceniach, brak sprawdzenia."
      }
    },
    {
      skillId: "1d4bcd6b-2306-412b-ac3e-600689d473d4",
      skillName: "Funkcja liniowa",
      class_level: 1,
      department: "funkcje",
      generatorParams: {
        microSkill: "default",
        difficultyRange: [1, 8],
        fallbackTrigger: "standard_approach"
      },
      teachingFlow: {
        phase1: { name: "Wprowadzenie", duration: 900, activities: ["theory", "guided_examples"] },
        phase2: { name: "Ćwiczenia", duration: 1200, activities: ["practice", "feedback"] },
        phase3: { name: "Utrwalanie", duration: 600, activities: ["mastery_tasks", "assessment"] }
      },
      content: {
        theory: {
          introduction: "Funkcja liniowa ma postać $f(x)=ax+b$. Współczynnik $a$ określa nachylenie prostej, a $b$ to punkt przecięcia z osią $OY$.",
          keyConceptsLaTex: ["$f(x)=ax+b$", "$x_0=-\\frac{b}{a}$"],
          timeEstimate: 180
        },
        examples: [
          {
            title: "Miejsce zerowe",
            problem: "Dla $f(x)=2x+1$ wyznacz $x_0$",
            solution: "Rozwiąż $2x+1=0$. Otrzymasz $x=-\\frac{1}{2}$.",
            timeEstimate: 300
          }
        ],
        practiceExercises: [
          {
            type: "basic",
            problem: "Podaj $a$ w $f(x)=5x-3$",
            expectedAnswer: "a=5",
            hints: ["Porównaj z $ax+b$"],
            timeEstimate: 240
          }
        ]
      },
      pedagogicalNotes: {
        commonMistakes: ["Mylenie $a$ z $b$", "Błędny znak miejsca zerowego"],
        teachingTips: ["Ćwicz odczyt z wykresu i z równania równolegle"],
        prerequisites: ["Układ współrzędnych", "Równania liniowe"]
      },
      misconceptionPatterns: [
        {
          pattern: "Uznawanie $b$ za nachylenie prostej",
          intervention: "Porównaj wykresy dla $a$ różnych i stałego $b$"
        }
      ],
      realWorldApplications: ["Modele kosztów stałych i zmiennych", "Prędkość stała w fizyce"],
      assessmentRubric: {
        mastery: "Poprawnie interpretuje $a,b$, rysuje i odczytuje parametry.",
        proficient: "Poprawny odczyt z drobnymi nieścisłościami.",
        developing: "Myli role $a$ i $b$, niepewny wykres."
      }
    },
    {
      skillId: "d8d22ed7-67a9-48a9-a0f9-a89aa8f9633f",
      skillName: "Twierdzenie Pitagorasa",
      class_level: 1,
      department: "geometry",
      generatorParams: {
        microSkill: "default",
        difficultyRange: [1, 8],
        fallbackTrigger: "standard_approach"
      },
      teachingFlow: {
        phase1: { name: "Wprowadzenie", duration: 900, activities: ["theory", "guided_examples"] },
        phase2: { name: "Ćwiczenia", duration: 1200, activities: ["practice", "feedback"] },
        phase3: { name: "Utrwalanie", duration: 600, activities: ["mastery_tasks", "assessment"] }
      },
      content: {
        theory: {
          introduction: "W trójkącie prostokątnym o przyprostokątnych $a,b$ i przeciwprostokątnej $c$ zachodzi $a^2+b^2=c^2$.",
          keyConceptsLaTex: ["$a^2+b^2=c^2$", "$c=\\sqrt{a^2+b^2}$"],
          timeEstimate: 180
        },
        examples: [
          {
            title: "Oblicz przeciwprostokątną",
            problem: "Dane $a=6, b=8$",
            solution: "$c=\\sqrt{6^2+8^2}=\\sqrt{36+64}=10$.",
            timeEstimate: 300
          }
        ],
        practiceExercises: [
          {
            type: "basic",
            problem: "Dane $a=5, b=12$",
            expectedAnswer: "c=13",
            hints: ["Użyj $c=\\sqrt{a^2+b^2}$"],
            timeEstimate: 240
          }
        ]
      },
      pedagogicalNotes: {
        commonMistakes: ["Mylenie przeciwprostokątnej z przyprostokątną", "Zapominanie o pierwiastku na końcu"],
        teachingTips: ["Zawsze szkicuj trójkąt i oznacz kąt prosty"],
        prerequisites: ["Potęgowanie i pierwiastkowanie", "Geometria płaska – podstawy"]
      },
      misconceptionPatterns: [
        {
          pattern: "Stosowanie $c^2=a\\cdot b$ zamiast $a^2+b^2=c^2$",
          intervention: "Kontrprzykład liczbowy i identyfikacja boków na rysunku"
        }
      ],
      realWorldApplications: ["Budownictwo i geodezja", "Nawigacja i odległość w terenie"],
      assessmentRubric: {
        mastery: "Sprawnie oblicza brakujące boki i uzasadnia wybór wzoru.",
        proficient: "Poprawne obliczenia, sporadyczne braki w komentarzu.",
        developing: "Myli boki lub pomija pierwiastkowanie."
      }
    }
  ]
};

export async function runSimpleImport() {
  try {
    console.log('Starting simple import...');
    const result = await batchImportSkillContent(simpleChatGPTData);
    console.log('Simple import completed:', result);
    return result;
  } catch (error) {
    console.error('Simple import failed:', error);
    throw error;
  }
}

// Auto run
runSimpleImport()
  .then(result => {
    console.log('Import completed successfully:', result);
  })
  .catch(error => {
    console.error('Import failed:', error);
  });