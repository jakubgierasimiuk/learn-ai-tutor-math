import { supabase } from "@/integrations/supabase/client";

export interface SkillContentData {
  skillId: string;
  skillName: string;
  class_level: number;
  department: string;
  generatorParams: {
    microSkill: string;
    difficultyRange: number[];
    fallbackTrigger: boolean;
  };
  teachingFlow: string[];
  content: {
    theory: {
      text: string;
      keyFormulas: string[];
      timeEstimate: number;
    };
    examples: Array<{
      id: string;
      problemStatement: string;
      solution: {
        steps: string[];
        finalAnswer: string;
        explanation: string;
      };
      timeEstimate: number;
    }>;
    practiceExercises: Array<{
      id: string;
      problemStatement: string;
      expectedAnswer: string;
      difficulty: number;
      timeEstimate: number;
      misconceptionMap: Array<{
        pattern: string;
        exampleAnswer: string;
        explanation: string;
      }>;
    }>;
  };
  pedagogicalNotes: {
    scaffoldingQuestions: Array<{
      question: string;
      tag: string;
      difficulty: string;
    }>;
    prerequisiteCheck: {
      skillRef: string;
      description: string;
    };
    nextTopicConnection: {
      skillRef: string;
      description: string;
    };
    estimatedTime: number;
  };
  misconceptionPatterns: Array<{
    pattern: string;
    description: string;
    exampleError: string;
    intervention: string;
  }>;
  realWorldApplications: Array<{
    context: string;
    problem: string;
    ageGroup: string;
    connection: string;
  }>;
  assessmentRubric: {
    scope: string;
    masteryThreshold: number;
    skillLevels: {
      beginner: string;
      developing: string;
      proficient: string;
      advanced: string;
    };
  };
}

export async function importSkillContent(skillData: SkillContentData) {
  try {
    // 1. Create or update the main skill record
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .upsert({
        name: skillData.skillName,
        description: `Skill for class ${skillData.class_level}: ${skillData.skillName}`,
        department: skillData.department,
        class_level: skillData.class_level,
        generator_params: skillData.generatorParams,
        teaching_flow: skillData.teachingFlow,
        is_active: true
      }, { onConflict: 'name' })
      .select()
      .single();

    if (skillError) throw skillError;
    
    const skillId = skill.id;

    // 2. Import theory content
    const { error: theoryError } = await supabase
      .from('skill_theory_content')
      .upsert({
        skill_id: skillId,
        theory_text: skillData.content.theory.text,
        key_formulas: skillData.content.theory.keyFormulas,
        time_estimate: skillData.content.theory.timeEstimate,
        difficulty_level: 1
      }, { onConflict: 'skill_id' });

    if (theoryError) throw theoryError;

    // 3. Import examples
    for (const example of skillData.content.examples) {
      const { error: exampleError } = await supabase
        .from('skill_examples')
        .upsert({
          skill_id: skillId,
          example_code: example.id,
          problem_statement: example.problemStatement,
          solution_steps: example.solution.steps,
          final_answer: example.solution.finalAnswer,
          explanation: example.solution.explanation,
          time_estimate: example.timeEstimate,
          difficulty_level: 1
        }, { onConflict: 'skill_id, example_code' });

      if (exampleError) throw exampleError;
    }

    // 4. Import practice exercises
    for (const exercise of skillData.content.practiceExercises) {
      const { error: exerciseError } = await supabase
        .from('skill_practice_exercises')
        .upsert({
          skill_id: skillId,
          exercise_code: exercise.id,
          problem_statement: exercise.problemStatement,
          expected_answer: exercise.expectedAnswer,
          difficulty_level: exercise.difficulty,
          time_estimate: exercise.timeEstimate,
          misconception_map: exercise.misconceptionMap
        }, { onConflict: 'skill_id, exercise_code' });

      if (exerciseError) throw exerciseError;
    }

    // 5. Import misconception patterns
    for (const misconception of skillData.misconceptionPatterns) {
      const { error: misconceptionError } = await supabase
        .from('skill_misconception_patterns')
        .upsert({
          skill_id: skillId,
          pattern_code: misconception.pattern,
          description: misconception.description,
          example_error: misconception.exampleError,
          intervention_strategy: misconception.intervention
        }, { onConflict: 'skill_id, pattern_code' });

      if (misconceptionError) throw misconceptionError;
    }

    // 6. Import real world applications
    for (const application of skillData.realWorldApplications) {
      const { error: applicationError } = await supabase
        .from('skill_real_world_applications')
        .upsert({
          skill_id: skillId,
          context: application.context,
          problem_description: application.problem,
          age_group: application.ageGroup,
          connection_explanation: application.connection,
          difficulty_level: 1
        }, { onConflict: 'skill_id, context' });

      if (applicationError) throw applicationError;
    }

    // 7. Import pedagogical notes
    const { error: pedagogicalError } = await supabase
      .from('skill_pedagogical_notes')
      .upsert({
        skill_id: skillId,
        scaffolding_questions: skillData.pedagogicalNotes.scaffoldingQuestions,
        prerequisite_description: skillData.pedagogicalNotes.prerequisiteCheck.description,
        next_topic_description: skillData.pedagogicalNotes.nextTopicConnection.description,
        estimated_total_time: skillData.pedagogicalNotes.estimatedTime,
        teaching_flow: skillData.teachingFlow
      }, { onConflict: 'skill_id' });

    if (pedagogicalError) throw pedagogicalError;

    // 8. Import assessment rubric
    const { error: rubricError } = await supabase
      .from('skill_assessment_rubrics')
      .upsert({
        skill_id: skillId,
        scope_description: skillData.assessmentRubric.scope,
        mastery_threshold: skillData.assessmentRubric.masteryThreshold,
        skill_levels: skillData.assessmentRubric.skillLevels
      }, { onConflict: 'skill_id' });

    if (rubricError) throw rubricError;

    return { success: true, skillId };
  } catch (error) {
    console.error('Error importing skill content:', error);
    return { success: false, error };
  }
}

// Content database to import - all 10 skills
export const contentDatabase = {
  "contentDatabase": [
    {
      "skillId": "skill_001",
      "skillName": "Działania na liczbach naturalnych",
      "class_level": 4,
      "department": "real_numbers",
      "generatorParams": {
        "microSkill": "real_numbers_basic_operations",
        "difficultyRange": [1, 3],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Liczby naturalne to 0, 1, 2, 3, ... Uczymy się dodawania, odejmowania, mnożenia i dzielenia tych liczb. Dodawanie i mnożenie są łączne i przemienne ($a + b = b + a$). Zero jest elementem neutralnym dodawania, a 1 jest neutralny dla mnożenia ($a \\cdot 1 = a$). Mnożenie to powtarzane dodawanie (np. 3 razy 4 to $4+4+4$). Dzielenie to odwrotność mnożenia. Ważne: $a \\cdot 0 = 0$ i $a + 0 = a$.",
          "keyFormulas": ["$a + b = b + a$", "$a \\cdot 0 = 0$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_001_01",
            "problemStatement": "$56 + 27 = ?$",
            "solution": {
              "steps": [
                "Dodajemy jedności: $6 + 7 = 13$.",
                "Zapisujemy $3$, przenosimy $1$ do następnego rzędu.",
                "Dodajemy dziesiątki wraz z przeniesieniem: $5 + 2 + 1 = 8$."
              ],
              "finalAnswer": "$83$",
              "explanation": "Podczas dodawania pisemnego sumujemy kolumnami od prawej strony (najpierw jedności, potem dziesiątki z przeniesieniem). Otrzymujemy wynik $83$."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_001_01",
            "problemStatement": "$34 + 19 = ?$",
            "expectedAnswer": "53",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": [
              {
                "pattern": "forget_to_carry",
                "exampleAnswer": "43",
                "explanation": "Zapomniałeś dodać przeniesioną jedynkę do sumy dziesiątek."
              }
            ]
          },
          {
            "id": "practice_001_02",
            "problemStatement": "$41 - 26 = ?$",
            "expectedAnswer": "15",
            "difficulty": 2,
            "timeEstimate": 90,
            "misconceptionMap": [
              {
                "pattern": "subtract_reverse",
                "exampleAnswer": "25",
                "explanation": "Odjąłeś $6 - 1$ zamiast wykonać pożyczkę przy odejmowaniu jedności."
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Ile to $6 + 7$?",
            "tag": "step_1",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_000",
          "description": "Znajomość cyfr 0-9"
        },
        "nextTopicConnection": {
          "skillRef": "skill_002",
          "description": "Ułamki zwykłe – wprowadzenie do części całości"
        },
        "estimatedTime": 900
      },
      "misconceptionPatterns": [
        {
          "pattern": "addition_instead_multiplication",
          "description": "Uczeń dodaje zamiast mnożyć",
          "exampleError": "$3 \\times 4 = 7$ zamiast $12$",
          "intervention": "Przypomnij, że mnożenie to powtarzane dodawanie tego samego składnika"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Sklep spożywczy",
          "problem": "Masz 3 paczki ciastek po 4 zł każda. Ile zapłacisz za wszystkie paczki?",
          "ageGroup": "4-6",
          "connection": "Mnożenie jako powtarzane dodawanie identycznych wartości"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    },
    {
      "skillId": "skill_002",
      "skillName": "Ułamki zwykłe",
      "class_level": 4,
      "department": "real_numbers",
      "generatorParams": {
        "microSkill": "real_numbers_fraction_operations",
        "difficultyRange": [1, 3],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Ułamek zwykły to część całości zapisana w postaci $\\frac{a}{b}$, gdzie $a$ (licznik) to liczba części, a $b$ (mianownik) to liczba wszystkich równych części całości. Np. $\\frac{1}{2}$ oznacza połowę całości. Ułamki można porównywać i przedstawiać graficznie (np. kolorując część figury). Warto wiedzieć, że $\\frac{a}{a} = 1$ (całość) i można skracać ułamki: np. $\\frac{2}{4} = \\frac{1}{2}$. Przy dodawaniu ułamków o takich samych mianownikach dodajemy liczniki: $\\frac{1}{4} + \\frac{2}{4} = \\frac{3}{4}$.",
          "keyFormulas": ["$\\frac{a}{a} = 1$", "$\\frac{a}{m} + \\frac{b}{m} = \\frac{a+b}{m}$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_002_01",
            "problemStatement": "$\\frac{1}{4} + \\frac{2}{4} = ?$",
            "solution": {
              "steps": [
                "Mianowniki są takie same (4), więc dodajemy liczniki: $1 + 2 = 3$.",
                "Mianownik pozostaje bez zmian: 4.",
                "Zapisujemy sumę jako $\\frac{3}{4}$."
              ],
              "finalAnswer": "$\\frac{3}{4}$",
              "explanation": "Dodaliśmy liczniki 1 i 2, a mianownik pozostał wspólny (4), więc razem to trzy czwarte całości."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_002_01",
            "problemStatement": "$\\frac{1}{3} + \\frac{1}{3} = ?$",
            "expectedAnswer": "2/3",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": [
              {
                "pattern": "add_num_and_den",
                "exampleAnswer": "2/6",
                "explanation": "Dodałeś licznik i mianownik zamiast tylko liczniki (mianownik powinien pozostać 3)."
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Ile to $1 + 2$ (liczniki)?",
            "tag": "step_1",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_001",
          "description": "Podstawowe operacje na liczbach naturalnych"
        },
        "nextTopicConnection": {
          "skillRef": "skill_005",
          "description": "Liczby dziesiętne – ułamki w zapisie dziesiętnym"
        },
        "estimatedTime": 900
      },
      "misconceptionPatterns": [
        {
          "pattern": "add_num_and_den",
          "description": "Uczeń dodaje lub odejmuje licznik i mianownik zamiast tylko liczniki",
          "exampleError": "$\\frac{1}{3} + \\frac{1}{3} = \\frac{2}{6}$",
          "intervention": "Podkreśl, że przy wspólnym mianowniku dodajemy tylko liczniki, a mianownik zostaje ten sam"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Pieczenie pizzy",
          "problem": "Pizza pokrojona jest na 8 równych kawałków. Zjadłeś 3 z nich. Jaką część pizzy zjadłeś?",
          "ageGroup": "4-6",
          "connection": "Ułamki jako opis zjedzonej części całości (3/8 całej pizzy)"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    },
    {
      "skillId": "skill_003",
      "skillName": "Figury geometryczne",
      "class_level": 4,
      "department": "geometry",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 3],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Poznajemy podstawowe figury geometryczne: m.in. kwadrat, prostokąt, trójkąt i koło. Kwadrat i prostokąt to czworokąty (mają 4 boki), trójkąt ma 3 boki, a koło jest okrągłe (nie ma boków ani wierzchołków). Czworokąty mogą mieć kąty proste ($90^{\\circ}$) w wierzchołkach, jeśli boki są prostopadłe. Obwód figury to suma długości jej boków. Np. obwód prostokąta o bokach $a$ i $b$ wynosi $2a + 2b$.",
          "keyFormulas": ["$P_{prostokąta} = 2a + 2b$", "$P_{kwadratu} = 4a$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_003_01",
            "problemStatement": "Oblicz obwód prostokąta o bokach 5 cm i 3 cm.",
            "solution": {
              "steps": [
                "Korzystamy ze wzoru na obwód: $P = 2a + 2b$.",
                "Podstawiamy $a = 5\\text{ cm}$, $b = 3\\text{ cm}$: $2 \\cdot 5\\,\\text{cm} + 2 \\cdot 3\\,\\text{cm} = 10\\,\\text{cm} + 6\\,\\text{cm}$.",
                "Sumujemy: $10\\,\\text{cm} + 6\\,\\text{cm} = 16\\,\\text{cm}$."
              ],
              "finalAnswer": "$16\\text{ cm}$",
              "explanation": "Obwód to suma długości wszystkich boków figury, tutaj $2 \\cdot 5\\,\\text{cm} + 2 \\cdot 3\\,\\text{cm} = 16\\,\\text{cm}$."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_003_01",
            "problemStatement": "Figura ma 3 boki. Jak nazywa się ta figura?",
            "expectedAnswer": "trójkąt",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": []
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Ile to $2 \\cdot 5\\text{ cm}$?",
            "tag": "step_2",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_001",
          "description": "Podstawowe obliczenia arytmetyczne (dodawanie, mnożenie)"
        },
        "nextTopicConnection": {
          "skillRef": "skill_007",
          "description": "Pola figur – obliczanie powierzchni figur płaskich"
        },
        "estimatedTime": 900
      },
      "misconceptionPatterns": [
        {
          "pattern": "confuse_square_rectangle",
          "description": "Uczeń nie rozróżnia kwadratu i prostokąta",
          "exampleError": "Nazywa kwadrat prostokątem mimo równych boków",
          "intervention": "Podkreśl, że każdy kwadrat jest prostokątem, ale nie każdy prostokąt jest kwadratem"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Ogrodzenie ogrodu",
          "problem": "Ogród ma kształt prostokąta 6 m na 4 m. Ile metrów siatki potrzeba, aby ogrodzić cały ogród?",
          "ageGroup": "4-6",
          "connection": "Obwód prostokąta jako długość ogrodzenia wokół działki"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    },
    {
      "skillId": "skill_004",
      "skillName": "Pomiary długości",
      "class_level": 4,
      "department": "geometry",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 3],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Długość mierzymy w jednostkach takich jak milimetry (mm), centymetry (cm), metry (m) i kilometry (km). 1 m to 100 cm, 1 cm to 10 mm, a 1 km to 1000 m. Małe odcinki mierzymy linijką (cm, mm), a większe taśmą mierniczą (m). Przy dodawaniu lub porównywaniu długości ważne jest sprowadzenie ich do tych samych jednostek (np. $2\\text{ m} + 30\\text{ cm} = 230\\text{ cm}$).",
          "keyFormulas": ["$1\\text{ m} = 100\\text{ cm}$", "$1\\text{ cm} = 10\\text{ mm}$", "$1\\text{ km} = 1000\\text{ m}$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_004_01",
            "problemStatement": "Zamień 5 m 20 cm na centymetry.",
            "solution": {
              "steps": [
                "1 m = 100 cm, więc 5 m = 500 cm.",
                "Dodajemy pozostałe 20 cm: $500\\text{ cm} + 20\\text{ cm} = 520\\text{ cm}$."
              ],
              "finalAnswer": "520 cm",
              "explanation": "Najpierw zamieniamy metry na centymetry, a potem dodajemy pozostałe centymetry: łącznie $520\\text{ cm}$."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_004_01",
            "problemStatement": "Ile to 3 m w centymetrach?",
            "expectedAnswer": "300 cm",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": [
              {
                "pattern": "conversion_factor_error",
                "exampleAnswer": "3000 cm",
                "explanation": "1 m = 100 cm, więc 3 m = 3*100 = 300 cm (nie 3000 cm)."
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Ile centymetrów to 5 metrów?",
            "tag": "step_1",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_001",
          "description": "Umiejętność mnożenia i dodawania prostych wartości"
        },
        "nextTopicConnection": {
          "skillRef": "skill_008",
          "description": "Jednostki miar – konwersje między różnymi jednostkami (długość, masa, objętość)"
        },
        "estimatedTime": 900
      },
      "misconceptionPatterns": [
        {
          "pattern": "unit_mismatch",
          "description": "Uczeń działa na długościach bez ujednolicenia jednostek",
          "exampleError": "$3\\text{ m} + 45\\text{ cm} = 48\\text{ cm}$",
          "intervention": "Zwróć uwagę, by przed dodawaniem zamienić wszystko na jedną jednostkę (np. na cm)"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Biegi sportowe",
          "problem": "Bieg na 1000 m to ile kilometrów? (1000 m = 1 km)",
          "ageGroup": "4-6",
          "connection": "Konwersja jednostek długości w kontekście sportowym"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    },
    {
      "skillId": "skill_005",
      "skillName": "Liczby dziesiętne",
      "class_level": 5,
      "department": "real_numbers",
      "generatorParams": {
        "microSkill": "real_numbers_decimal_operations",
        "difficultyRange": [1, 3],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Liczby dziesiętne zapisujemy z przecinkiem, który oddziela część całkowitą od ułamkowej. Np. 2,5 oznacza 2 całe i 5 dziesiątych (czyli 2 + 0,5). Miejsca po przecinku to kolejno części: dziesiąte (0,1 = 1/10), setne (0,01 = 1/100), tysięczne (0,001 = 1/1000) itd. Przy dodawaniu lub odejmowaniu liczb dziesiętnych wyrównujemy je do przecinka (piszemy jedna pod drugą z przecinkami w kolumnie). Mnożenie lub dzielenie przez 10, 100, ... przesuwa przecinek w prawo lub lewo (np. 3,5 × 10 = 35).",
          "keyFormulas": ["$0.1 = \\frac{1}{10}$", "$0.01 = \\frac{1}{100}$", "$3.5 \\times 10 = 35$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_005_01",
            "problemStatement": "$5{,}4 + 2{,}35 = ?$",
            "solution": {
              "steps": [
                "Zapisujemy 5,4 jako 5,40 (wyrównujemy miejsca po przecinku).",
                "Dodajemy wartości: 5,40 + 2,35 = 7,75."
              ],
              "finalAnswer": "7,75",
              "explanation": "Przy dodawaniu wyrównujemy przecinki, dlatego dopisaliśmy zero: 5,4 → 5,40. Następnie dodaliśmy liczby jak pisemnie."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_005_01",
            "problemStatement": "Ile to $\\frac{1}{2}$ jako liczba dziesiętna?",
            "expectedAnswer": "0,5",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": []
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Jak zapisać 5,4 z dwoma miejscami po przecinku?",
            "tag": "step_1",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_002",
          "description": "Zrozumienie ułamków zwykłych (np. 1/10 jako jedna dziesiąta)"
        },
        "nextTopicConnection": {
          "skillRef": "skill_006",
          "description": "Procenty – ułamki ze 100 części (zapis procentowy)"
        },
        "estimatedTime": 1000
      },
      "misconceptionPatterns": [
        {
          "pattern": "compare_by_digits",
          "description": "Uczeń porównuje liczby dziesiętne po przecinku jak całkowite",
          "exampleError": "$0,65 > 0,7$ (bo 65 > 7)",
          "intervention": "Porównuj kolejno cyfry na tych samych pozycjach dziesiętnych"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Zakupy na wagę",
          "problem": "Cena jabłek to 3,5 zł za kilogram. Ile zapłacisz za 2,0 kg jabłek?",
          "ageGroup": "5-6",
          "connection": "Mnożenie liczby dziesiętnej (cena za 1 kg) przez liczbę kilogramów"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    },
    {
      "skillId": "skill_006",
      "skillName": "Procenty podstawowe",
      "class_level": 5,
      "department": "real_numbers",
      "generatorParams": {
        "microSkill": "real_numbers_percentage_calculations",
        "difficultyRange": [1, 3],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Procent oznacza 'na sto'. 1% to jedna setna całości (1/100). Np. 50% to połowa (50/100 = 1/2), a 25% to ćwierć (25/100 = 1/4). 100% oznacza całość. Aby obliczyć dany procent z liczby, zamieniamy procent na ułamek (dziesiętny lub zwykły) i mnożymy przez tę liczbę. Np. 20% z 60 to 0,2 × 60 = 12.",
          "keyFormulas": ["$x\\% = \\frac{x}{100}$", "$50\\% = \\frac{1}{2}$", "$x\\% \\cdot Y = \\frac{x}{100} \\cdot Y$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_006_01",
            "problemStatement": "Oblicz 25% z 80.",
            "solution": {
              "steps": [
                "25% to $\\frac{25}{100} = \\frac{1}{4}$.",
                "Obliczamy $\\frac{1}{4} \\cdot 80 = 20$."
              ],
              "finalAnswer": "20",
              "explanation": "25% z 80 to jedna czwarta z 80, czyli 20."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_006_01",
            "problemStatement": "Ile procent to 0,5 (jako ułamek dziesiętny)?",
            "expectedAnswer": "50%",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": []
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Jakim ułamkiem (zwykłym) jest 25%?",
            "tag": "step_1",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_002",
          "description": "Rozumienie ułamków (np. 1/2 = 50%)"
        },
        "nextTopicConnection": {
          "skillRef": "skill_010",
          "description": "Proporcjonalność – porównywanie części do całości w innych sytuacjach"
        },
        "estimatedTime": 1000
      },
      "misconceptionPatterns": [
        {
          "pattern": "percent_of_denominator",
          "description": "Uczeń myli procent z mianownikiem ułamka",
          "exampleError": "$\\frac{1}{5} = 5\\%$ (błędne założenie)",
          "intervention": "Zamień ułamek na równoważny o mianowniku 100 (1/5 = 20/100 = 20%)"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Wyprzedaż w sklepie",
          "problem": "Telewizor kosztuje 2000 zł, ale jest przeceniony o 25%. Ile wynosi nowa cena?",
          "ageGroup": "5-6",
          "connection": "Obliczanie ceny po obniżce procentowej (znalezienie 25% wartości i odjęcie od początkowej ceny)"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    },
    {
      "skillId": "skill_007",
      "skillName": "Pola figur",
      "class_level": 5,
      "department": "geometry",
      "generatorParams": {
        "microSkill": "area_calculation",
        "difficultyRange": [1, 3],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Pole figury to wielkość jej powierzchni, którą mierzymy w jednostkach kwadratowych (np. cm², m²). Pole prostokąta obliczamy mnożąc długości jego boków ($P = a \\cdot b$). Pole kwadratu o boku $a$ wynosi $P = a \\cdot a = a^2$. Pole innych wielokątów można znaleźć, dzieląc je na prostokąty lub stosując odpowiednie wzory. Pamiętaj, że 1 m² = 10000 cm².",
          "keyFormulas": ["$P_{prostokąta} = a \\cdot b$", "$P_{kwadratu} = a^2$", "$1\\text{ m}^2 = 10000\\text{ cm}^2$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_007_01",
            "problemStatement": "Oblicz pole prostokąta o bokach 7 cm i 5 cm.",
            "solution": {
              "steps": [
                "Korzystamy ze wzoru: $P = a \\cdot b$.",
                "Podstawiamy: $7\\text{ cm} \\cdot 5\\text{ cm} = 35\\text{ cm}^2$."
              ],
              "finalAnswer": "35 cm^2",
              "explanation": "Mnożymy długości boków: $7 \\times 5 = 35$, wynik w jednostkach kwadratowych: $35\\text{ cm}^2$."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_007_01",
            "problemStatement": "Oblicz pole kwadratu o boku 5 cm.",
            "expectedAnswer": "25 cm^2",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": [
              {
                "pattern": "confuse_perimeter_area",
                "exampleAnswer": "20 cm^2",
                "explanation": "Zastosowano wzór na obwód (4*5=20) zamiast wzoru na pole (5*5)."
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Ile to $7 * 5$?",
            "tag": "step_2",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_003",
          "description": "Znajomość prostokątów i kwadratów (boki, kąty proste)"
        },
        "nextTopicConnection": {
          "skillRef": "skill_019",
          "description": "Bryły geometryczne – obliczanie objętości (rozwinięcie pojęcia pola w 3D)"
        },
        "estimatedTime": 1000
      },
      "misconceptionPatterns": [
        {
          "pattern": "confuse_perimeter_area",
          "description": "Uczeń myli wzór na pole z wzorem na obwód",
          "exampleError": "Pole kwadratu o boku 5 cm podano jako 20 cm^2 (pomylono z obwodem)",
          "intervention": "Podkreśl różnicę: obwód (długość krawędzi), pole (powierzchnia wewnątrz)"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Malowanie ścian",
          "problem": "Pokój ma wymiary 4 m na 3 m. Ile farby potrzeba, aby pomalować podłogę o powierzchni tego pokoju (12 m^2)?",
          "ageGroup": "5-6",
          "connection": "Obliczanie powierzchni pomieszczenia i przekładanie jej na rzeczywiste zastosowanie (ilość farby/płytek)"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    },
    {
      "skillId": "skill_008",
      "skillName": "Jednostki miar",
      "class_level": 5,
      "department": "real_numbers",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 3],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Istnieją różne jednostki mierzenia wielkości: długości (km, m, cm, mm), masy (kg, g), objętości (l, ml) i czasu (h, min, s). W systemie metrycznym zmiana jednostki wiąże się z mnożeniem lub dzieleniem przez 10, 100 lub 1000. Np. 1 km = 1000 m, 1 m = 100 cm, 1 kg = 1000 g, 1 l = 1000 ml. Dla czasu: 1 h = 60 min, 1 min = 60 s (inny system). Przy konwersji jednostek zamieniamy większe jednostki na mniejsze mnożąc, a mniejsze na większe dzieląc przez odpowiedni czynnik.",
          "keyFormulas": ["$1\\text{ km} = 1000\\text{ m}$", "$1\\text{ kg} = 1000\\text{ g}$", "$1\\text{ l} = 1000\\text{ ml}$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_008_01",
            "problemStatement": "Ile kilogramów to 3000 g?",
            "solution": {
              "steps": [
                "1 kg = 1000 g, więc 3000 g = $\\frac{3000}{1000}$ kg.",
                "Obliczamy: $\\frac{3000}{1000} = 3$, czyli 3 kg."
              ],
              "finalAnswer": "3 kg",
              "explanation": "Dzielimy liczbę gramów przez 1000, aby otrzymać kilogramy: 3000 g = 3 kg."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_008_01",
            "problemStatement": "Zamień 2 kg na gramy.",
            "expectedAnswer": "2000 g",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": [
              {
                "pattern": "conversion_factor_error",
                "exampleAnswer": "200 g",
                "explanation": "1 kg = 1000 g, więc 2 kg = 2*1000 = 2000 g (nie 200 g)."
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Ile to $3000 \\div 1000$?",
            "tag": "step_1",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_004",
          "description": "Podstawy konwersji jednostek (np. cm na m)"
        },
        "nextTopicConnection": {
          "skillRef": "skill_010",
          "description": "Proporcjonalność – przeliczenia bardziej złożonych jednostek i wartości"
        },
        "estimatedTime": 900
      },
      "misconceptionPatterns": [
        {
          "pattern": "conversion_factor_error",
          "description": "Uczeń myli czynnik przeliczeniowy jednostek",
          "exampleError": "2 kg = 200 g (zamiast 2000 g)",
          "intervention": "Przypomnij tabelę przedrostków: kilo- oznacza 1000 jednostek bazowych, centy- oznacza 1/100, itp."
        }
      ],
      "realWorldApplications": [
        {
          "context": "Przepisy kulinarne",
          "problem": "Przepis wymaga 250 g mąki, a Ty masz wagę kuchenną w kilogramach. Ile to będzie kilogramów (0,25 kg)?",
          "ageGroup": "5-6",
          "connection": "Przeliczanie jednostek masy w praktycznym zastosowaniu"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    },
    {
      "skillId": "skill_009",
      "skillName": "Liczby ujemne",
      "class_level": 6,
      "department": "real_numbers",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 2],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Liczby ujemne to liczby mniejsze od zera (np. -1, -5). Na osi liczbowej leżą na lewo od 0. Dodając liczbę ujemną do dodatniej, faktycznie odejmujemy (np. 5 + (-3) = 5 - 3 = 2). Odejmowanie liczby ujemnej zmienia się w dodawanie (np. 4 - (-2) = 4 + 2 = 6). Przy mnożeniu: iloczyn dwóch liczb ujemnych jest dodatni (np. (-3) * (-2) = 6), a iloczyn liczby ujemnej i dodatniej jest ujemny. Przy porównywaniu: liczby ujemne tym mniejsze, im większa ich wartość bezwzględna (np. -5 < -2).",
          "keyFormulas": ["$-(-a) = a$", "$a + (-a) = 0$", "$(-1) \\cdot (-1) = 1$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_009_01",
            "problemStatement": "$5 + (-8) = ?$",
            "solution": {
              "steps": [
                "Dodawanie liczby ujemnej zamieniamy na odejmowanie: $5 + (-8) = 5 - 8$.",
                "Obliczamy: $5 - 8 = -3$."
              ],
              "finalAnswer": "-3",
              "explanation": "Ponieważ 8 jest większe od 5, a ma znak minus, wynik jest -3."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_009_01",
            "problemStatement": "$7 + (-10) = ?$",
            "expectedAnswer": "-3",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": [
              {
                "pattern": "sign_ignore",
                "exampleAnswer": "3",
                "explanation": "Zignorowano znak minus i obliczono 7 + 10 zamiast 7 + (-10)."
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Jak inaczej zapisać $5 + (-8)$?",
            "tag": "step_1",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_001",
          "description": "Biegłość w dodawaniu i odejmowaniu liczb naturalnych"
        },
        "nextTopicConnection": {
          "skillRef": "skill_013",
          "description": "Równania liniowe – rozwiązywanie równań z wykorzystaniem liczb ujemnych"
        },
        "estimatedTime": 1000
      },
      "misconceptionPatterns": [
        {
          "pattern": "sign_ignore",
          "description": "Uczeń ignoruje znak ujemny przy dodawaniu",
          "exampleError": "7 + (-10) = 3",
          "intervention": "Uświadom, że dodawanie ujemnej liczby zmniejsza wynik (to jak odejmowanie)"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Temperatura na dworze",
          "problem": "Rano było -2°C, a wieczorem -7°C. O ile stopni spadła temperatura?",
          "ageGroup": "6-8",
          "connection": "Różnica temperatur z użyciem liczb ujemnych (|-2 - (-7)| = 5)"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    },
    {
      "skillId": "skill_010",
      "skillName": "Proporcjonalność",
      "class_level": 6,
      "department": "real_numbers",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 2],
        "fallbackTrigger": true
      },
      "teachingFlow": ["theory", "example", "guided_practice", "independent_practice"],
      "content": {
        "theory": {
          "text": "Proporcjonalność wprost oznacza, że dwie wielkości zmieniają się w tym samym stosunku. Jeśli jedna rośnie dwukrotnie, druga też rośnie dwukrotnie. Stosunek jednej do drugiej jest stały. Np. 2 kg jabłek kosztują 8 zł, więc 1 kg kosztuje 4 zł, a 3 kg – 12 zł (cena ∼ waga). Aby rozwiązać zadanie z proporcjonalnością, można ułożyć proporcję $a:b = c:d$ i znaleźć brakującą wartość, korzystając z iloczynu krzyżowego ($a \\cdot d = b \\cdot c$).",
          "keyFormulas": ["$\\frac{a}{b} = \\frac{c}{d}$", "$a \\cdot d = b \\cdot c$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "id": "ex_010_01",
            "problemStatement": "2 kg jabłek kosztują 8 zł. Ile zapłacisz za 5 kg jabłek?",
            "solution": {
              "steps": [
                "Najpierw obliczamy cenę 1 kg: $8\\text{ zł} / 2 = 4\\text{ zł}$ za 1 kg.",
                "Następnie mnożymy przez 5: $4\\text{ zł} * 5 = 20\\text{ zł}.$",
                "Odpowiedź: 20 zł."
              ],
              "finalAnswer": "20 zł",
              "explanation": "Cena rośnie proporcjonalnie do wagi: 5 kg to 2,5 raza więcej niż 2 kg, więc kosztuje 2,5 razy więcej (20 zł)."
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "id": "practice_010_01",
            "problemStatement": "3 książki kosztują 12 zł. Ile kosztuje 1 książka?",
            "expectedAnswer": "4 zł",
            "difficulty": 1,
            "timeEstimate": 60,
            "misconceptionMap": []
          }
        ]
      },
      "pedagogicalNotes": {
        "scaffoldingQuestions": [
          {
            "question": "Ile kosztuje 1 kg jabłek w zadaniu?",
            "tag": "step_1",
            "difficulty": "easy"
          }
        ],
        "prerequisiteCheck": {
          "skillRef": "skill_006",
          "description": "Podstawy obliczeń procentowych (proporcje na 100%)"
        },
        "nextTopicConnection": {
          "skillRef": "skill_014",
          "description": "Funkcja liniowa – uogólnienie zależności proporcjonalnych na wzór y = ax"
        },
        "estimatedTime": 900
      },
      "misconceptionPatterns": [
        {
          "pattern": "additive_thinking",
          "description": "Uczeń stosuje strategię addytywną zamiast proporcjonalnej",
          "exampleError": "Z 5 książek (20 zł) na 8 książek dodał 3 zł (28 zł)",
          "intervention": "Przypomnij, że przy proporcjach rośnie mnożnik, nie dodatek stały"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Gotowanie",
          "problem": "Przepis na ciasto jest na 2 osoby. Jak zmienić ilość składników na 5 osób?",
          "ageGroup": "6-8",
          "connection": "Proporcjonalne skalowanie ilości składników w przepisie"
        }
      ],
      "assessmentRubric": {
        "scope": "Zestaw 10 zadań testowych",
        "masteryThreshold": 80,
        "skillLevels": {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi",
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        }
      }
    }
  ]
};

export async function importAllSkillContent() {
  const results = [];
  
  for (let i = 0; i < contentDatabase.contentDatabase.length; i++) {
    const skillData = contentDatabase.contentDatabase[i];
    const result = await importSkillContent(skillData);
    results.push({ 
      skillName: skillData.skillName, 
      result,
      progress: ((i + 1) / contentDatabase.contentDatabase.length) * 100
    });
  }
  
  return results;
}

// Auto-import function for immediate execution
export async function autoImportSkills() {
  console.log('Starting auto-import of all skills...');
  const results = await importAllSkillContent();
  console.log('Import completed:', results);
  return results;
}