import { batchImportSkillContent } from './skillContentImporter';

const simpleChatGPTData = {
  contentDatabase: [
    {
      skillId: "1f44da1e-abb1-4c9a-835b-b164d82fe206",
      skillName: "Działania na liczbach rzeczywistych",
      class_level: 1,
      department: "mathematics",
      generatorParams: {
        difficulty: 1,
        microSkill: "basic_operations"
      },
      teachingFlow: {
        phase1: { activities: ["theory", "examples"] },
        phase2: { activities: ["guided_practice"] },
        phase3: { activities: ["independent_practice"] }
      },
      pedagogicalNotes: {
        teachingTips: ["Start with visual representations", "Use real-world examples"],
        estimatedTime: 3600,
        prerequisites: ["Number sense", "Basic arithmetic"]
      },
      misconceptionPatterns: {
        common: ["Sign confusion", "Order of operations errors"]
      },
      realWorldApplications: ["Financial calculations", "Measurement conversions"],
      assessmentRubric: {
        mastery_threshold: 80,
        total_questions: 10
      },
      content: {
        theory: {
          introduction: "Liczby rzeczywiste obejmują wszystkie liczby wymierne i niewymierne...",
          keyConceptsLaTex: [
            "a + b = b + a",
            "a \\cdot b = b \\cdot a",
            "a + 0 = a"
          ],
          timeEstimate: 30
        },
        examples: [
          {
            title: "Dodawanie liczb rzeczywistych",
            problem: "Oblicz: 3.5 + (-2.7)",
            solution: "3.5 + (-2.7) = 3.5 - 2.7 = 0.8",
            expectedAnswer: "0.8",
            timeEstimate: 5
          }
        ],
        practiceExercises: [
          {
            exerciseId: "ex_real_1",
            problem: "Oblicz: (-5) + 8 - 3",
            expectedAnswer: "0",
            difficulty: 1,
            timeEstimate: 3
          }
        ]
      }
    },
    {
      skillId: "ab3ff5a5-499b-4041-8037-9b76072dced1",
      skillName: "Rozwiązywanie równań liniowych",
      class_level: 1,
      department: "mathematics",
      generatorParams: {
        difficulty: 2,
        microSkill: "linear_equations"
      },
      teachingFlow: {
        phase1: { activities: ["theory", "examples"] },
        phase2: { activities: ["guided_practice"] },
        phase3: { activities: ["independent_practice"] }
      },
      pedagogicalNotes: {
        teachingTips: ["Use balance method", "Check solutions"],
        estimatedTime: 4500,
        prerequisites: ["Basic arithmetic", "Variable concepts"]
      },
      misconceptionPatterns: {
        common: ["Sign errors", "Incorrect isolation"]
      },
      realWorldApplications: ["Distance-rate problems", "Financial planning"],
      assessmentRubric: {
        mastery_threshold: 75,
        total_questions: 12
      },
      content: {
        theory: {
          introduction: "Równanie liniowe to równanie pierwszego stopnia z jedną niewiadomą...",
          keyConceptsLaTex: [
            "ax + b = c",
            "x = \\frac{c-b}{a}"
          ],
          timeEstimate: 25
        },
        examples: [
          {
            title: "Proste równanie liniowe",
            problem: "Rozwiąż: 2x + 3 = 11",
            solution: "2x = 11 - 3 = 8, więc x = 4",
            expectedAnswer: "x = 4",
            timeEstimate: 7
          }
        ],
        practiceExercises: [
          {
            exerciseId: "eq_lin_1",
            problem: "Rozwiąż: 3x - 7 = 14",
            expectedAnswer: "x = 7",
            difficulty: 2,
            timeEstimate: 5
          }
        ]
      }
    },
    {
      skillId: "1d4bcd6b-2306-412b-ac3e-600689d473d4",
      skillName: "Funkcja liniowa",
      class_level: 1,
      department: "mathematics",
      generatorParams: {
        difficulty: 2,
        microSkill: "linear_functions"
      },
      teachingFlow: {
        phase1: { activities: ["theory", "examples"] },
        phase2: { activities: ["guided_practice"] },
        phase3: { activities: ["independent_practice"] }
      },
      pedagogicalNotes: {
        teachingTips: ["Start with graphs", "Connect to real situations"],
        estimatedTime: 5400,
        prerequisites: ["Coordinate system", "Linear equations"]
      },
      misconceptionPatterns: {
        common: ["Slope confusion", "Y-intercept errors"]
      },
      realWorldApplications: ["Cost analysis", "Speed calculations"],
      assessmentRubric: {
        mastery_threshold: 80,
        total_questions: 10
      },
      content: {
        theory: {
          introduction: "Funkcja liniowa ma postać f(x) = ax + b, gdzie a to współczynnik kierunkowy...",
          keyConceptsLaTex: [
            "f(x) = ax + b",
            "a = \\frac{y_2 - y_1}{x_2 - x_1}"
          ],
          timeEstimate: 35
        },
        examples: [
          {
            title: "Wykres funkcji liniowej",
            problem: "Narysuj wykres funkcji f(x) = 2x + 1",
            solution: "Współczynnik kierunkowy a=2, przecięcie z osią y w punkcie (0,1)",
            expectedAnswer: "Prosta przechodząca przez (0,1) i (1,3)",
            timeEstimate: 10
          }
        ],
        practiceExercises: [
          {
            exerciseId: "lin_func_1",
            problem: "Znajdź równanie prostej przechodzącej przez punkty (0,2) i (3,8)",
            expectedAnswer: "f(x) = 2x + 2",
            difficulty: 2,
            timeEstimate: 8
          }
        ]
      }
    },
    {
      skillId: "d8d22ed7-67a9-48a9-a0f9-a89aa8f9633f",
      skillName: "Twierdzenie Pitagorasa",
      class_level: 2,
      department: "geometry",
      generatorParams: {
        difficulty: 2,
        microSkill: "geometry"
      },
      teachingFlow: {
        phase1: { activities: ["theory", "examples"] },
        phase2: { activities: ["guided_practice"] },
        phase3: { activities: ["independent_practice"] }
      },
      pedagogicalNotes: {
        teachingTips: ["Use visual proofs", "Connect to distance formula"],
        estimatedTime: 4200,
        prerequisites: ["Square roots", "Area of squares"]
      },
      misconceptionPatterns: {
        common: ["Hypotenuse confusion", "Square root errors"]
      },
      realWorldApplications: ["Construction", "Navigation", "Design"],
      assessmentRubric: {
        mastery_threshold: 85,
        total_questions: 8
      },
      content: {
        theory: {
          introduction: "W trójkącie prostokątnym kwadrat długości przeciwprostokątnej...",
          keyConceptsLaTex: [
            "a^2 + b^2 = c^2",
            "c = \\sqrt{a^2 + b^2}"
          ],
          timeEstimate: 20
        },
        examples: [
          {
            title: "Obliczanie przeciwprostokątnej",
            problem: "W trójkącie prostokątnym przyprostokątne mają długości 3 i 4. Oblicz przeciwprostokątną.",
            solution: "c² = 3² + 4² = 9 + 16 = 25, więc c = 5",
            expectedAnswer: "c = 5",
            timeEstimate: 6
          }
        ],
        practiceExercises: [
          {
            exerciseId: "pythag_1",
            problem: "Oblicz długość boku c, jeśli a = 5 i b = 12",
            expectedAnswer: "c = 13",
            difficulty: 2,
            timeEstimate: 5
          }
        ]
      }
    }
  ]
};

export async function runManualImport() {
  console.log('🚀 Starting manual skill import...');
  
  try {
    const result = await batchImportSkillContent(simpleChatGPTData);
    console.log('✅ Import completed!', result);
    return result;
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Auto-run the import
runManualImport()
  .then(result => console.log('Final result:', result))
  .catch(error => console.error('Final error:', error));