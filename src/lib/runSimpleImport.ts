import { batchImportSkillContent } from './skillContentImporter';

// Simplified import with fixed data structure
const simpleChatGPTData = {
  contentDatabase: [
    {
      skillId: "1f44da1e-abb1-4c9a-835b-b164d82fe206",
      skillName: "Działania na liczbach rzeczywistych",
      class_level: 1,
      department: "algebra",
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
      }
    },
    {
      skillId: "bce53b28-de1d-4ec1-b08c-4139ef91b213",
      skillName: "Nierówności liniowe z jedną niewiadomą",
      class_level: 1,
      department: "algebra",
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
      }
    },
    {
      skillId: "ab3ff5a5-499b-4041-8037-9b76072dced1",
      skillName: "Rozwiązywanie równań liniowych",
      class_level: 1,
      department: "algebra",
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
      }
    },
    {
      skillId: "1d4bcd6b-2306-412b-ac3e-600689d473d4",
      skillName: "Funkcja liniowa",
      class_level: 1,
      department: "funkcje",
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
      }
    },
    {
      skillId: "d8d22ed7-67a9-48a9-a0f9-a89aa8f9633f",
      skillName: "Twierdzenie Pitagorasa",
      class_level: 1,
      department: "geometry",
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
runSimpleImport();