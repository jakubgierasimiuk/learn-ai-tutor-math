import { supabase } from "@/integrations/supabase/client";

export interface SkillContentData {
  skillId: string;
  skillName: string;
  class_level: number;
  department: string;
  generatorParams: {
    microSkill: string;
    difficultyRange: number[];
    fallbackTrigger: boolean | string;
  };
  teachingFlow: any;
  content: {
    theory: {
      text?: string;
      introduction?: string;
      keyFormulas?: string[];
      keyConceptsLaTex?: string[];
      mainPoints?: string[];
      formalDefinitions?: string[];
      theorems?: Array<{
        name: string;
        statement: string;
        proof_outline: string;
      }>;
      timeEstimate: number;
    };
    examples: Array<{
      id?: string;
      title?: string;
      problemStatement?: string;
      problem?: string;
      solution: {
        steps?: string[] | Array<{
          step: string;
          latex: string;
          explanation: string;
          justification: string;
        }>;
        finalAnswer?: string;
        explanation?: string;
      };
      maturaConnection?: string;
      timeEstimate: number;
    }>;
    practiceExercises: Array<{
      id?: string;
      exerciseId?: string;
      problemStatement?: string;
      problem?: string;
      expectedAnswer: string;
      difficulty: number;
      examLevel?: string;
      timeEstimate: number;
      hints?: Array<{
        level: number;
        hint: string;
        timeEstimate: number;
      }>;
      misconceptionMap?: Array<{
        pattern: string;
        exampleAnswer: string;
        explanation: string;
      }>;
    }>;
  };
  pedagogicalNotes: {
    scaffoldingQuestions?: Array<{
      question: string;
      tag: string;
      difficulty: string;
    }>;
    commonMistakes?: string[];
    teachingTips?: string[];
    prerequisites?: string[];
    estimatedTime: number;
    maturaPreparation?: string;
    universityConnection?: string;
    prerequisiteCheck?: {
      skillRef: string;
      description: string;
    };
    nextTopicConnection?: {
      skillRef: string;
      description: string;
    };
  };
  misconceptionPatterns: Array<{
    pattern: string;
    description: string;
    exampleError?: string;
    feedback?: string;
    remediation?: string;
    prerequisiteGap?: string;
    intervention?: string;
  }>;
  realWorldApplications: Array<{
    context: string;
    problem?: string;
    example?: string;
    practicalUse?: string;
    careerConnection?: string;
    ageGroup?: string;
    connection?: string;
  }>;
  assessmentRubric: {
    scope: string;
    masteryThreshold?: number;
    criteria?: Array<{
      skill: string;
      podstawowy?: string;
      rozszerzony?: string;
      uniwersytecki?: string;
      beginning?: string;
      developing?: string;
      proficient?: string;
      advanced?: string;
    }>;
    skillLevels?: {
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
        theory_text: skillData.content.theory.text || skillData.content.theory.introduction || '',
        key_formulas: skillData.content.theory.keyFormulas || skillData.content.theory.keyConceptsLaTex || [],
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
          example_code: example.id || example.title || `ex_${Date.now()}`,
          problem_statement: example.problemStatement || example.problem || '',
          solution_steps: Array.isArray(example.solution.steps) ? example.solution.steps : [example.solution.explanation || ''],
          final_answer: example.solution.finalAnswer || '',
          explanation: example.solution.explanation || '',
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
          exercise_code: exercise.id || exercise.exerciseId || `ex_${Date.now()}`,
          problem_statement: exercise.problemStatement || exercise.problem || '',
          expected_answer: exercise.expectedAnswer,
          difficulty_level: exercise.difficulty,
          time_estimate: exercise.timeEstimate,
          misconception_map: exercise.misconceptionMap || [],
          hints: exercise.hints || []
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
          example_error: misconception.exampleError || misconception.feedback || '',
          intervention_strategy: misconception.intervention || misconception.remediation || ''
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
          problem_description: application.problem || application.example || '',
          age_group: application.ageGroup || 'liceum',
          connection_explanation: application.connection || application.practicalUse || '',
          difficulty_level: 1
        }, { onConflict: 'skill_id, context' });

      if (applicationError) throw applicationError;
    }

    // 7. Import pedagogical notes
    const { error: pedagogicalError } = await supabase
      .from('skill_pedagogical_notes')
      .upsert({
        skill_id: skillId,
        scaffolding_questions: skillData.pedagogicalNotes.scaffoldingQuestions || [],
        prerequisite_description: skillData.pedagogicalNotes.prerequisiteCheck?.description || skillData.pedagogicalNotes.prerequisites?.join(', ') || '',
        next_topic_description: skillData.pedagogicalNotes.nextTopicConnection?.description || '',
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
        mastery_threshold: skillData.assessmentRubric.masteryThreshold || 80,
        skill_levels: skillData.assessmentRubric.skillLevels || skillData.assessmentRubric.criteria || {}
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
    },
    // HIGH SCHOOL (LICEUM) CONTENT - 5 SKILLS FOR GRADE 1
    {
      "skillId": "8b2a3e3e-7e8e-4f5d-9a21-73d5e6a1c101",
      "skillName": "Funkcje — definicja i własności",
      "class_level": 1,
      "department": "mathematics",
      "generatorParams": {
        "microSkill": "advanced_graphing",
        "difficultyRange": [3, 8],
        "fallbackTrigger": "use_canonical_when_generator_uncertain"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 1800,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2400,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1200,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Funkcja przyporządkowuje każdemu elementowi z dziedziny dokładnie jedną wartość. Opisujemy ją wzorem, tabelą, wykresem lub słownie. Badamy dziedzinę, zbiór wartości, miejsca zerowe, monotoniczność i ekstrema. Przekształcenia wykresu obejmują przesunięcia, odbicia i skalowania. Złożenie funkcji łączy wyniki jednej jako argumenty drugiej.",
          "keyConceptsLaTex": ["$f: X\\to Y$", "$f(x)=ax+b$", "$f(g(x))$", "$f(x-a)+b$", "$x_0: f(x_0)=0$"],
          "mainPoints": [
            "Funkcja to odwzorowanie, które każdemu $x$ z dziedziny $D$ przypisuje dokładnie jedną wartość $f(x)$ w zbiorze wartości.",
            "Miejsce zerowe funkcji to taka liczba $x_0$, że $f(x_0)=0$. Funkcja rośnie, gdy dla $x_1<x_2$ mamy $f(x_1)\\le f(x_2)$."
          ],
          "theorems": [
            {
              "name": "Monotoniczność liniowej",
              "statement": "Dla $f(x)=ax+b$ funkcja rośnie, gdy $a>0$, maleje, gdy $a<0$.",
              "proof_outline": "Wybierz $x_1<x_2$. Wtedy $f(x_2)-f(x_1)=a(x_2-x_1)$. Jeśli $a>0$, to różnica jest dodatnia, więc wartości rosną wraz z argumentem. Dla $a<0$ różnica jest ujemna, więc funkcja maleje. Dla $a=0$ jest stała."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Szkic wykresu funkcji liniowej",
            "problem": "Narysuj wykres $f(x)=2x-3$, wyznacz miejsca zerowe i przekształcenia względem $y=x$.",
            "solution": {
              "steps": [
                {
                  "step": "Zapisz postać i odczytaj współczynniki nachylenia i wyrazu wolnego.",
                  "latex": "$f(x)=2x-3$",
                  "explanation": "Nachylenie wynosi 2, przecina oś $y$ w punkcie $-3$.",
                  "justification": "Postać $ax+b$ określa nachylenie i przecięcie z osią $y$."
                },
                {
                  "step": "Wyznacz miejsce zerowe, rozwiązując równanie $f(x)=0$.",
                  "latex": "$2x-3=0$",
                  "explanation": "Po przekształceniu otrzymujemy $x=1{,}5$.",
                  "justification": "Miejsce zerowe spełnia równanie funkcji równe zero."
                }
              ],
              "explanation": "Względem $y=x$ mamy zwiększone nachylenie i przesunięcie w dół o 3."
            },
            "maturaConnection": "Zadania wymagają odczytu własności z wykresu, obliczania miejsc zerowych oraz interpretacji współczynników we wzorze liniowym.",
            "timeEstimate": 360
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "f1_ex_01",
            "difficulty": 3,
            "examLevel": "podstawowy",
            "problem": "Dla $f(x)=3x+6$ oblicz miejsce zerowe i wartość dla $x=-2$.",
            "expectedAnswer": "Miejsce zerowe: x=-2; f(-2)=0.",
            "hints": [
              {
                "level": 1,
                "hint": "Ustaw $f(x)=0$ i rozwiąż równanie; potem podstaw $x=-2$ do wzoru.",
                "timeEstimate": 120
              }
            ],
            "timeEstimate": 420
          },
          {
            "exerciseId": "f1_ex_02",
            "difficulty": 4,
            "examLevel": "podstawowy",
            "problem": "Podaj przesunięcie wykresu $g(x)=f(x-1)+2$ dla $f(x)=x^2$.",
            "expectedAnswer": "Przesunięcie o 1 w prawo i o 2 w górę.",
            "hints": [
              {
                "level": 1,
                "hint": "Argument $x-1$ to przesunięcie w prawo; dodanie liczby to przesunięcie w górę.",
                "timeEstimate": 120
              }
            ],
            "timeEstimate": 480
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Mylenie przesunięcia poziomego z pionowym przy zapisie $f(x-a)+b$.",
          "Wnioskowanie o monotoniczności z pojedynczego punktu zamiast z parametru $a$."
        ],
        "teachingTips": [
          "Zacznij od interpretacji geometrycznej współczynnika przy $x$ jako nachylenia oraz wyrazu wolnego jako przecięcia z osią $y$.",
          "Ćwicz szybkie szkicowanie wykresu z dwóch punktów: miejsce zerowe i punkt przecięcia z osią $y$."
        ],
        "prerequisites": ["Algebra: równania liniowe", "Własności prostej na płaszczyźnie"],
        "estimatedTime": 5400,
        "maturaPreparation": "Przećwicz rozpoznawanie własności funkcji ze wzoru i wykresu: miejsca zerowe, monotoniczność, ekstrema lokalne w prostych przypadkach. Opanuj przesunięcia i skalowania, bo często pojawiają się w krótkich podpunktach.",
        "universityConnection": "Podstawy analizy funkcji są niezbędne w analizie matematycznej, ekonomii (funkcje kosztu, popytu) i informatyce (złożoność funkcji)."
      },
      "misconceptionPatterns": [
        {
          "pattern": "shift_direction_confusion",
          "description": "Uczeń myli kierunek przesunięcia dla $f(x-a)$ i $f(x)+b$.",
          "feedback": "Zwróć uwagę: $x-a$ przesuwa w prawo o $a$, a dodanie $b$ przesuwa wykres w górę.",
          "remediation": "Narysuj najpierw wykres bazowy, potem zaznacz nową oś argumentów $x-a$ i dorysuj skutek dodania $b$ jako przesunięcie pionowe.",
          "prerequisiteGap": "Transformacje wykresów funkcji"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Ekonomia — model kosztu",
          "example": "Koszt produkcji zależy liniowo od liczby sztuk: $C(x)=ax+b$; $b$ to koszt stały, $a$ to koszt jednostkowy.",
          "practicalUse": "Szacowanie opłacalności przy zmianach skali produkcji.",
          "careerConnection": "Ekonomista, analityk danych"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Identyfikacja własności funkcji ze wzoru i wykresu",
            "podstawowy": "Rozpoznaje miejsca zerowe i odczytuje wartości z prostych wykresów.",
            "rozszerzony": "Analizuje przekształcenia wykresu i porównuje funkcje.",
            "uniwersytecki": "Dowodzi własności i buduje modele funkcyjne z danych."
          }
        ]
      }
    },
    {
      "skillId": "c2c6b0a0-4f8f-4a1f-8b3e-2d8d7d0c1a02",
      "skillName": "Równania i nierówności kwadratowe",
      "class_level": 1,
      "department": "mathematics",
      "generatorParams": {
        "microSkill": "quadratic_equations",
        "difficultyRange": [3, 9],
        "fallbackTrigger": "discriminant_edge_cases"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 1800,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2400,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1200,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Równanie kwadratowe ma postać $ax^2+bx+c=0$ z $a\\ne0$. Rozwiązujemy je przez wzory kwadratowe, deltę, rozkład na czynniki lub podstawienie. Nierówności kwadratowe analizujemy znakiem funkcji kwadratowej, zwykle przez szkic i parabolę. Kluczowe jest rozpoznanie liczby pierwiastków na podstawie wartości delty.",
          "keyConceptsLaTex": ["$ax^2+bx+c=0$", "$\\Delta=b^2-4ac$", "$x=\\frac{-b\\pm\\sqrt{\\Delta}}{2a}$"],
          "mainPoints": [
            "Równanie kwadratowe to równanie wielomianowe stopnia drugiego, w którym współczynnik przy $x^2$ jest niezerowy.",
            "Nierówność kwadratowa to warunek postaci $ax^2+bx+c\\,\\#\\,0$ (z $\\#,\\in\\{<,\\le,>,\\ge\\}$), badany poprzez znak funkcji."
          ],
          "theorems": [
            {
              "name": "Kryterium delty",
              "statement": "$\\Delta>0$ dwa pierwiastki, $\\Delta=0$ jeden, $\\Delta<0$ brak pierwiastków.",
              "proof_outline": "Wzór kwadratowy określa pierwiastki przez pierwiastek z delty. Gdy $\\Delta>0$, mamy dwie różne wartości. Gdy $\\Delta=0$, pierwiastek jest podwójny. Gdy $\\Delta<0$, brak rzeczywistych rozwiązań."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Rozwiązanie równania metodą delty",
            "problem": "Rozwiąż $2x^2-3x-2=0$.",
            "solution": {
              "steps": [
                {
                  "step": "Oblicz deltę z definicji dla podanych współczynników.",
                  "latex": "$\\Delta=b^2-4ac$",
                  "explanation": "Dla $a=2$, $b=-3$, $c=-2$ mamy $\\Delta=9+16=25$.",
                  "justification": "Definicja delty dla równania kwadratowego."
                },
                {
                  "step": "Zastosuj wzór kwadratowy do obliczenia rozwiązań.",
                  "latex": "$x=\\frac{-b\\pm\\sqrt{\\Delta}}{2a}$",
                  "explanation": "Otrzymujemy $x=\\frac{3\\pm5}{4}$, czyli $x=2$ lub $x=-\\tfrac{1}{2}$.",
                  "justification": "Wzór działa dla $a\\ne0$ i $\\Delta\\ge0$."
                }
              ]
            },
            "maturaConnection": "Typowe zadania: rozwiązywanie równań, analiza delty, znaku funkcji i przedziałów spełniania nierówności.",
            "timeEstimate": 360
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "q1_ex_01",
            "difficulty": 4,
            "examLevel": "podstawowy",
            "problem": "Rozwiąż nierówność $x^2-4x+3\\le0$.",
            "expectedAnswer": "Przedział rozwiązania: [1,3].",
            "hints": [
              {
                "level": 1,
                "hint": "Wyznacz miejsca zerowe trójmianu i sprawdź znak na przedziałach.",
                "timeEstimate": 180
              }
            ],
            "timeEstimate": 540
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Mylenie znaku przy obliczaniu delty i nieuważne podstawienia współczynników.",
          "Pomijanie dziedziny przy skracaniu wyrażeń wymiernych i analizie nierówności."
        ],
        "teachingTips": [
          "Ćwicz najpierw pełny algorytm: identyfikacja $a,b,c$, delta, wzór, a dopiero potem skracanie i tricki.",
          "W nierównościach naucz testu znaku na przedziałach rozdzielonych miejscami zerowymi."
        ],
        "prerequisites": ["Algebra: wzory skróconego mnożenia", "Operacje na ułamkach algebraicznych"],
        "estimatedTime": 5400,
        "maturaPreparation": "Opanuj rozwiązywanie równań i nierówności, parametryzację przez deltę oraz analizę znaku na przedziałach. To częsty motyw w zadaniach otwartych i zamkniętych.",
        "universityConnection": "Podstawa do algebry liniowej i analizy, pojawia się w modelowaniu fizycznym, optymalizacji i ekonomii."
      },
      "misconceptionPatterns": [
        {
          "pattern": "delta_sign_error",
          "description": "Niepoprawne podstawienie znaków do delty $b^2-4ac$ i błędny wynik.",
          "feedback": "Zapisz wyraźnie $a,b,c$. Wstawiaj nawiasy przy liczbach ujemnych.",
          "remediation": "Porównaj dwa przykłady krok po kroku i zaznacz miejsca, gdzie nawias zmienia znak iloczynu.",
          "prerequisiteGap": "Porządek działań i nawiasy"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Fizyka — ruch jednostajnie przyspieszony",
          "example": "Wyznaczanie czasu spadku z równania $\\tfrac{1}{2}gt^2+v_0t-h=0$.",
          "practicalUse": "Analiza trajektorii i czasu lotu w prostych modelach.",
          "careerConnection": "Inżynier, fizyk"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Równania i nierówności kwadratowe",
            "podstawowy": "Poprawnie liczy deltę i stosuje wzór kwadratowy.",
            "rozszerzony": "Analizuje parametry i znak funkcji na przedziałach.",
            "uniwersytecki": "Stosuje faktoryzację i dyskryminant w uogólnieniach."
          }
        ]
      }
    },
    {
      "skillId": "6f1a7e22-3a9b-4b55-9f8c-2a0c1b8e7f03",
      "skillName": "Trygonometria — funkcje i wzory",
      "class_level": 1,
      "department": "mathematics",
      "generatorParams": {
        "microSkill": "advanced_identities",
        "difficultyRange": [4, 9],
        "fallbackTrigger": "identity_simplification_ambiguous"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 1800,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2400,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1200,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Funkcje trygonometryczne opisują zależności kątów i długości w trójkątach oraz ruch okresowy. Kluczowe są definicje w trójkącie prostokątnym i na okręgu jednostkowym, tożsamości oraz okresowość. W zadaniach upraszczamy wyrażenia, rozwiązujemy równania i wykorzystujemy wykresy sinusoidy oraz cosinusoidy.",
          "keyConceptsLaTex": ["$\\sin^2x+\\cos^2x=1$", "$\\tan x=\\frac{\\sin x}{\\cos x}$", "$\\sin(-x)=-\\sin x$", "$\\cos(-x)=\\cos x$"],
          "mainPoints": [
            "Dla kąta $x$ na okręgu jednostkowym $\\sin x$ to rzędna, a $\\cos x$ to odcięta punktu odpowiadającego kątowi.",
            "Tożsamość to równość prawdziwa dla wszystkich $x$ w dziedzinie, np. $\\sin^2x+\\cos^2x=1$."
          ],
          "theorems": [
            {
              "name": "Okresowość sinusa",
              "statement": "$\\sin(x+2\\pi)=\\sin x$ dla każdego $x$.",
              "proof_outline": "Na okręgu jednostkowym dodanie pełnego kąta $2\\pi$ zwraca do tego samego punktu, więc rzędna pozostaje taka sama dla każdego argumentu."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Uproszczenie wyrażenia trygonometrycznego",
            "problem": "Uprość $\\frac{1-\\cos 2x}{\\sin x\\cos x}$ w dziedzinie $\\sin x\\cos x\\ne0$.",
            "solution": {
              "steps": [
                {
                  "step": "Użyj tożsamości $1-\\cos 2x=2\\sin^2x$.",
                  "latex": "$1-\\cos2x=2\\sin^2x$",
                  "explanation": "Z tożsamości podwójnego kąta otrzymujemy prostszy licznik.",
                  "justification": "Znana tożsamość dla cosinusa podwójnego kąta."
                },
                {
                  "step": "Skróć czynnik $\\sin x$ w liczniku i mianowniku.",
                  "latex": "$\\frac{2\\sin^2x}{\\sin x\\cos x}$",
                  "explanation": "Po skróceniu dostajemy $\\frac{2\\sin x}{\\cos x}=2\\tan x$.",
                  "justification": "Dla $\\sin x\\cos x\\ne0$ skracanie jest dozwolone."
                }
              ]
            },
            "maturaConnection": "Częste zadania: uproszczenia, rozwiązywanie równań i analiza okresowości funkcji trygonometrycznych.",
            "timeEstimate": 420
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "t1_ex_01",
            "difficulty": 4,
            "examLevel": "podstawowy",
            "problem": "Rozwiąż $\\sin x=\\tfrac{\\sqrt{3}}{2}$ w $\\langle 0,2\\pi)$.",
            "expectedAnswer": "x=\\tfrac{\\pi}{3} lub x=\\tfrac{2\\pi}{3}.",
            "hints": [
              {
                "level": 1,
                "hint": "Użyj wartości szczególnych sinusa i symetrii względem $\\tfrac{\\pi}{2}$.",
                "timeEstimate": 120
              }
            ],
            "timeEstimate": 420
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Skracanie przez funkcję równą zero bez sprawdzenia dziedziny.",
          "Mylenie parzystości: traktowanie $\\cos(-x)$ jak $-\\cos x$."
        ],
        "teachingTips": [
          "Wprowadź tabelę wartości szczególnych i kwadranty, ćwicz rysowanie na okręgu jednostkowym.",
          "Ucz algorytmu: identyfikuj tożsamość → transformuj → sprawdź dziedzinę."
        ],
        "prerequisites": ["Geometria: okrąg jednostkowy", "Algebra: przekształcenia równań"],
        "estimatedTime": 5400,
        "maturaPreparation": "Zadania obejmują tożsamości, równania i identyfikację rozwiązań w przedziałach. Opanuj wartości szczególne i operacje na przedziałach.",
        "universityConnection": "Podstawa do analizy sygnałów, fal, modeli okresowych oraz równań różniczkowych."
      },
      "misconceptionPatterns": [
        {
          "pattern": "cancel_zero_divisor",
          "description": "Uczeń skraca przez wyrażenie, które może być równe zero.",
          "feedback": "Zanim skrócisz, zapisz warunki: $\\sin x\\ne0$, $\\cos x\\ne0$.",
          "remediation": "Ćwiczenia z wykluczeniami i testem dziedziny przed skracaniem.",
          "prerequisiteGap": "Dziedzina funkcji trygonometrycznych"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Inżynieria — drgania",
          "example": "Model $y=A\\sin(\\omega t+\\varphi)$ opisuje ruch harmoniczny.",
          "practicalUse": "Analiza wibracji i fal w mechanice i elektronice.",
          "careerConnection": "Inżynier mechanik, elektronik"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Operacje na tożsamościach i równaniach trygonometrycznych",
            "podstawowy": "Stosuje proste tożsamości i odczytuje rozwiązania z okręgu.",
            "rozszerzony": "Upraszcza złożone wyrażenia i rozwiązuje układy równań.",
            "uniwersytecki": "Łączy tożsamości w dowodach i analizie okresowości."
          }
        ]
      }
    },
    {
      "skillId": "a1d7f4c0-2b9d-4f2e-8e0b-1c3e6d7a9b04",
      "skillName": "Ciągi arytmetyczne i geometryczne",
      "class_level": 1,
      "department": "mathematics",
      "generatorParams": {
        "microSkill": "recursive",
        "difficultyRange": [3, 8],
        "fallbackTrigger": "sum_formula_or_recursion_conflict"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 1800,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2400,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1200,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Ciąg arytmetyczny ma stałą różnicę między kolejnymi wyrazami, ciąg geometryczny — stały iloraz. Stosujemy wzory na wyraz ogólny i sumę n pierwszych wyrazów. Ważne są oba opisy: rekurencyjny i jawny. W zadaniach maturalnych często łączymy warunki na sumy i wyrazy.",
          "keyConceptsLaTex": ["$a_{n}=a_1+(n-1)r$", "$S_n=\\tfrac{n(a_1+a_n)}{2}$", "$a_{n}=a_1q^{n-1}$", "$S_n=a_1\\tfrac{1-q^n}{1-q}$"],
          "mainPoints": [
            "Ciąg arytmetyczny spełnia $a_{n+1}-a_n=r$ dla stałego $r$.",
            "Ciąg geometryczny spełnia $\\tfrac{a_{n+1}}{a_n}=q$ dla stałego $q$ i $a_n\\ne0$."
          ],
          "theorems": [
            {
              "name": "Suma arytmetycznego",
              "statement": "$S_n=\\tfrac{n(a_1+a_n)}{2}$ dla $n\\in\\mathbb{N}$.",
              "proof_outline": "Sparuj wyrazy od początku i końca: każda para daje tę samą sumę $a_1+a_n$. Mamy $n/2$ par (dla parzystych $n$) lub używamy uogólnienia dla dowolnego $n$."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Wyraz ogólny i suma ciągu arytmetycznego",
            "problem": "Dany jest ciąg arytmetyczny o $a_1=3$ i $r=5$. Znajdź $a_{10}$ i $S_{10}$.",
            "solution": {
              "steps": [
                {
                  "step": "Zastosuj wzór na wyraz ogólny dla $n=10$.",
                  "latex": "$a_{10}=a_1+9r$",
                  "explanation": "Podstaw: $a_{10}=3+9\\cdot5=48$.",
                  "justification": "Definicja wyrazu ogólnego w arytmetycznym."
                },
                {
                  "step": "Użyj wzoru na sumę pierwszych $n$ wyrazów.",
                  "latex": "$S_{10}=\\tfrac{10(a_1+a_{10})}{2}$",
                  "explanation": "Podstaw: $S_{10}=\\tfrac{10(3+48)}{2}=255$.",
                  "justification": "Wzór sumy oparty na parowaniu wyrazów."
                }
              ]
            },
            "maturaConnection": "Typowe zadania o wyrazie ogólnym, sumach, warunkach na parametry i mieszanych opisach rekurencyjno-jawnych.",
            "timeEstimate": 360
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "s1_ex_01",
            "difficulty": 3,
            "examLevel": "podstawowy",
            "problem": "Ciąg arytm. $a_1=7$, $r=-2$. Oblicz $a_6$.",
            "expectedAnswer": "a6=-3.",
            "hints": [
              {
                "level": 1,
                "hint": "Użyj $a_n=a_1+(n-1)r$ i podstaw $n=6$.",
                "timeEstimate": 120
              }
            ],
            "timeEstimate": 360
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Mylenie $r$ z $q$ i stosowanie złych wzorów do danego typu ciągu.",
          "Błędne podstawienie indeksów przy opisie rekurencyjnym."
        ],
        "teachingTips": [
          "Porównuj równolegle dwa typy ciągów, wyróżnij różnicę i iloraz innym kolorem.",
          "Zawsze sprawdzaj, czy wynik pasuje do rosnącego lub malejącego charakteru ciągu."
        ],
        "prerequisites": ["Algebra: równania liniowe", "Potęgi i własności potęg"],
        "estimatedTime": 5400,
        "maturaPreparation": "Ćwicz mieszane zadania: wyraz ogólny, suma oraz warunki między wyrazami. Często pojawia się rekursja i sumy częściowe.",
        "universityConnection": "Podstawa szeregów i analizy dyskretnej, ważne w informatyce i ekonomii."
      },
      "misconceptionPatterns": [
        {
          "pattern": "swap_r_and_q",
          "description": "Uczeń używa wzorów geometrycznych dla arytmetycznego lub odwrotnie.",
          "feedback": "Sprawdź, czy różnica jest stała (arytm.) czy iloraz (geom.).",
          "remediation": "Stwórz tabelę decyzji: pytanie o różnicę lub iloraz przed wyborem wzoru.",
          "prerequisiteGap": "Rozpoznawanie typu ciągu"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Finanse — procent składany",
          "example": "Kapitał rośnie geometrycznie z ilorazem $q=1+r$.",
          "practicalUse": "Szacowanie wzrostu inwestycji i rat oszczędnościowych.",
          "careerConnection": "Analityk finansowy"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Analiza ciągów i obliczenia sum",
            "podstawowy": "Rozpoznaje typ ciągu i liczy wyraz ogólny.",
            "rozszerzony": "Rozwiązuje układy warunków i sumy częściowe.",
            "uniwersytecki": "Modeluje procesy dyskretne i dowodzi własności."
          }
        ]
      }
    },
    {
      "skillId": "e4f0c9b1-7a5d-4c2e-9f33-5b2c6a8d9f05",
      "skillName": "Prawdopodobieństwo warunkowe",
      "class_level": 1,
      "department": "mathematics",
      "generatorParams": {
        "microSkill": "combinatorics_advanced",
        "difficultyRange": [4, 9],
        "fallbackTrigger": "conditional_tree_or_bayes_needed"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 1800,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2400,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1200,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Prawdopodobieństwo warunkowe opisuje szansę zdarzenia przy założeniu, że inne zdarzenie już zaszło. Używamy definicji przez iloraz oraz drzewek i tabel. Z twierdzeniem Bayesa odwracamy warunek. Ważna jest niezależność, gdy warunek nie zmienia prawdopodobieństwa.",
          "keyConceptsLaTex": ["$P(A\\mid B)=\\tfrac{P(A\\cap B)}{P(B)}$", "$P(A\\cap B)=P(A\\mid B)P(B)$", "$P(A\\mid B)=P(A)$"],
          "mainPoints": [
            "Dla $P(B)>0$ definiujemy $P(A\\mid B)=\\tfrac{P(A\\cap B)}{P(B)}$ jako prawd. $A$ pod warunkiem $B$.",
            "Zdarzenia $A$ i $B$ są niezależne, gdy $P(A\\cap B)=P(A)P(B)$."
          ],
          "theorems": [
            {
              "name": "Twierdzenie Bayesa",
              "statement": "$P(A\\mid B)=\\tfrac{P(B\\mid A)P(A)}{P(B)}$ dla $P(B)>0$.",
              "proof_outline": "Zapisz $P(A\\cap B)$ na dwa sposoby: $P(A\\mid B)P(B)$ oraz $P(B\\mid A)P(A)$. Porównaj i przekształć, otrzymując wzór Bayesa."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Drzewo prawdopodobieństw i Bayes",
            "problem": "W urnie: 60% białych, 40% czarnych. Test wykrywa białą kulę z czułością 90%, myli się przy czarnej w 5%. Oblicz $P(Biała\\mid Test{+})$.",
            "solution": {
              "steps": [
                {
                  "step": "Zapisz dane: $P(B)=0{,}6$, $P(C)=0{,}4$, $P(T+\\mid B)=0{,}9$, $P(T+\\mid C)=0{,}05$.",
                  "latex": "$P(T+)=?$",
                  "explanation": "Potrzebny jest mianownik we wzorze Bayesa.",
                  "justification": "Wzór Bayesa wymaga $P(T+)$."
                },
                {
                  "step": "Policz $P(T+)=P(T+\\mid B)P(B)+P(T+\\mid C)P(C)$.",
                  "latex": "$P(T+)=0{,}9\\cdot0{,}6+0{,}05\\cdot0{,}4$",
                  "explanation": "Otrzymujemy $0{,}54+0{,}02=0{,}56$.",
                  "justification": "Prawo totalne prawdopodobieństwa."
                },
                {
                  "step": "Zastosuj Bayesa do obliczenia szukanego prawdopodobieństwa.",
                  "latex": "$P(B\\mid T+)=\\tfrac{0{,}9\\cdot0{,}6}{0{,}56}$",
                  "explanation": "Wynik $\\approx0{,}9643$.",
                  "justification": "Bezpośrednie podstawienie do wzoru."
                }
              ]
            },
            "maturaConnection": "Zadania z drzewem, tablicą częstości i Bayesem pojawiają się na rozszerzeniu, często w wersjach słownych.",
            "timeEstimate": 480
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "p1_ex_01",
            "difficulty": 4,
            "examLevel": "podstawowy",
            "problem": "Rzut monetą i kostką. Oblicz $P(parzysta\\mid orzeł)$.",
            "expectedAnswer": "P=1/2.",
            "hints": [
              {
                "level": 1,
                "hint": "Warunek orzeł nie wpływa na wynik kostki — zdarzenia niezależne.",
                "timeEstimate": 90
              }
            ],
            "timeEstimate": 360
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Mylenie $P(A\\mid B)$ z $P(B\\mid A)$ i niepoprawne podstawienie do wzoru.",
          "Brak normalizacji mianownika we wzorze Bayesa i pomijanie prawa całkowitego."
        ],
        "teachingTips": [
          "Zawsze rysuj drzewo zdarzeń i oznaczaj gałęzie wartościami, a liście prawdopodobieństwami.",
          "Używaj tabel kontyngencji do szybkiej wizualizacji zależności."
        ],
        "prerequisites": ["Kombinatoryka: iloczyn i suma zdarzeń", "Operacje na zdarzeniach i zbiory"],
        "estimatedTime": 5400,
        "maturaPreparation": "Ćwicz Bayesa z danymi procentowymi, drzewka losowań z błędami testów i zadania o niezależności. Częste w arkuszach rozszerzonych.",
        "universityConnection": "Klucz do statystyki, uczenia maszynowego i przetwarzania sygnałów; fundament analizy danych."
      },
      "misconceptionPatterns": [
        {
          "pattern": "swap_condition",
          "description": "Uczeń zamienia $P(A\\mid B)$ z $P(B\\mid A)$ i używa złego wzoru.",
          "feedback": "Sprawdź, co jest warunkiem, a co zdarzeniem. Zastosuj Bayesa poprawnie.",
          "remediation": "Ćwicz identyfikację kierunku warunku na prostych przykładach z tabelą i drzewem.",
          "prerequisiteGap": "Interpretacja warunku w prawdopodobieństwie"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Medycyna — testy diagnostyczne",
          "example": "Szacowanie $P(choroba\\mid wynik\\,pozytywny)$ z czułości i swoistości.",
          "practicalUse": "Interpretacja badań i decyzje kliniczne.",
          "careerConnection": "Analityk danych, lekarz"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Obliczenia prawdopodobieństwa warunkowego i Bayesa",
            "podstawowy": "Posługuje się definicją i prostymi drzewami.",
            "rozszerzony": "Rozwiązuje złożone zadania z danymi warunkowymi.",
            "uniwersytecki": "Stosuje Bayesa w modelach i analizuje niezależność."
          }
        ]
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

// New batch content for class 2 liceum - Funkcja wykładnicza/logarytmiczna & Geometria analityczna
export const newBatchContentDatabase = {
  "contentDatabase": [
    {
      "skillId": "skill_014",
      "skillName": "Rozkłady prawdopodobieństwa — dyskretne i ciągłe",
      "class_level": 3,
      "department": "statistics",
      "generatorParams": {
        "microSkill": "distributions",
        "difficultyRange": [4, 9],
        "fallbackTrigger": "use_canonical_distributions_when_needed"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2000,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2600,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1400,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Rozkład prawdopodobieństwa opisuje, jakie wartości może przyjmować zmienna losowa i z jakimi szansami. W liceum najważniejsze to rozkład dwumianowy, Poissona i normalny. Uczymy się liczyć prawdopodobieństwa, wartości oczekiwane i wariancje oraz stosować standaryzację i aproksymacje.",
          "keyConceptsLaTex": ["$X\\sim\\text{Bin}(n,p)$", "$P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}$", "$E(X)=np$", "$Var(X)=np(1-p)$", "$X\\sim\\text{Poisson}(\\lambda)$", "$P(X=k)=e^{-\\lambda}\\lambda^k/k!$", "$Z\\sim\\mathcal{N}(0,1)$"],
          "formalDefinitions": [
            "Zmienna losowa dyskretna ma rozkład określony przez funkcję $P(X=k)$, a zmienna ciągła — przez gęstość, której całka na dowolnym przedziale daje prawdopodobieństwo.",
            "Rozkład dwumianowy modeluje liczbę sukcesów w $n$ próbach Bernoulliego z prawdopodobieństwem sukcesu $p$."
          ],
          "theorems": [
            {
              "name": "Prawo wielkich liczb",
              "statement": "Średnia z prób i.i.d. zbiega do $E(X)$ wraz z $n\\to\\infty$.",
              "proof_outline": "Szkic: wykorzystaj liniowość wartości oczekiwanej i malejącą wariancję średniej $\\bar{X}_n$ równą $Var(X)/n$. Następnie zastosuj nierówność Czebyszewa do pokazania zbieżności w prawdopodobieństwie. Omawiamy intuicję: uśrednianie stabilizuje losowe wahania."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Prawdopodobieństwo w rozkładzie dwumianowym",
            "problem": "W 10 próbach, $p=0{,}3$. Oblicz $P(X=4)$ dla $X\\sim\\text{Bin}(10,0{,}3)$.",
            "solution": {
              "steps": [
                {
                  "step": "Zastosuj wzór na prawdopodobieństwo w rozkładzie dwumianowym.",
                  "latex": "$P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}$",
                  "explanation": "Podstawiamy $n=10$, $k=4$, $p=0{,}3$ do wzoru.",
                  "justification": "Definicja rozkładu dwumianowego."
                },
                {
                  "step": "Podstaw liczby i oblicz wartość numeryczną.",
                  "latex": "$\\binom{10}{4}0{,}3^4\\cdot0{,}7^6$",
                  "explanation": "Wynik liczbowy otrzymasz z kalkulatorem lub CAS.",
                  "justification": "Obliczenia arytmetyczne po podstawieniu."
                }
              ]
            },
            "maturaConnection": "Typowe: obliczenia w rozkładzie dwumianowym, wartości oczekiwane oraz wariancje; często w zadaniach z kontekstem eksperymentu.",
            "timeEstimate": 420
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "dist3_ex_01",
            "difficulty": 5,
            "examLevel": "rozszerzony",
            "problem": "Dla $X\\sim\\text{Poisson}(2)$ oblicz $P(X=3)$.",
            "expectedAnswer": "$e^{-2}\\cdot2^3/3!$",
            "hints": [
              {
                "level": 1,
                "hint": "Użyj wzoru Poissona $P(X=k)=e^{-\\lambda}\\lambda^k/k!$.",
                "timeEstimate": 120
              }
            ],
            "timeEstimate": 540
          },
          {
            "exerciseId": "dist3_ex_02",
            "difficulty": 6,
            "examLevel": "rozszerzony",
            "problem": "W $X\\sim\\text{Bin}(50,0{,}5)$ oszacuj $P(X\\ge30)$ metodą normalną.",
            "expectedAnswer": "Zastosuj $Z\\sim\\mathcal{N}(25,12{,}5)$ i standaryzację z ciągłością.",
            "hints": [
              {
                "level": 1,
                "hint": "Użyj $\\mu=np$, $\\sigma=\\sqrt{np(1-p)}$ i korekty ciągłości.",
                "timeEstimate": 180
              }
            ],
            "timeEstimate": 720
          },
          {
            "exerciseId": "dist3_ex_03",
            "difficulty": 4,
            "examLevel": "podstawowy",
            "problem": "Dla $X\\sim\\text{Bin}(n,p)$ podaj $E(X)$ i $Var(X)$.",
            "expectedAnswer": "$E(X)=np$, $Var(X)=np(1-p)$",
            "hints": [
              {
                "level": 1,
                "hint": "Skorzystaj z poznanych wzorów na średnią i wariancję.",
                "timeEstimate": 90
              }
            ],
            "timeEstimate": 360
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Pominięcie korekty ciągłości przy aproksymacji normalnej rozkładu dwumianowego.",
          "Mylenie parametrów: średnia i wariancja dla dwumianowego lub Poissona."
        ],
        "teachingTips": [
          "Twórz tabelki z parametrami $E$, $Var$ i warunkami stosowalności aproksymacji.",
          "Wykorzystaj wykresy słupkowe i krzywe dzwonowe do intuicji kształtu rozkładów."
        ],
        "prerequisites": ["Kombinatoryka i prawdopodobieństwo", "Algebra: potęgi i silnie"],
        "estimatedTime": 6000,
        "maturaPreparation": "Ćwicz rozpoznawanie właściwego rozkładu, obliczanie $P(X=k)$, a także przybliżenia normalne i interpretacje parametrów.",
        "universityConnection": "Fundament statystyki matematycznej, wnioskowania i uczenia maszynowego."
      },
      "misconceptionPatterns": [
        {
          "pattern": "wrong_parameters",
          "description": "Uczeń myli $n,p$ lub $\\lambda$ i stosuje złe wzory.",
          "feedback": "Zapisz parametry obok nazwy rozkładu, zanim zaczniesz liczyć.",
          "remediation": "Ćwicz krótkie zadania: rozpoznaj rozkład i wypisz parametry.",
          "prerequisiteGap": "Identyfikacja rozkładu i jego parametrów"
        },
        {
          "pattern": "no_continuity_correction",
          "description": "Brak korekty ciągłości przy aproksymacji dyskretnego rozkładu normalnym.",
          "feedback": "Dodaj $\\pm0{,}5$ przy przejściu do zmiennej ciągłej.",
          "remediation": "Zadania porównawcze: z i bez korekty, omów różnicę.",
          "prerequisiteGap": "Standaryzacja i aproksymacja normalna"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Telekomunikacja i kolejki",
          "example": "Rozkład Poissona modeluje liczbę zdarzeń w jednostce czasu (np. pakiety).",
          "practicalUse": "Projektowanie przepustowości i szacowanie opóźnień.",
          "careerConnection": "Informatyka, inżynieria systemów"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Praca z rozkładami prawdopodobieństwa",
            "podstawowy": "Dobiera wzory i liczy $E$, $Var$ w prostych przypadkach.",
            "rozszerzony": "Stosuje przybliżenia i rozwiązuje zadania z parametrami.",
            "uniwersytecki": "Analizuje graniczne własności i łączy rozkłady w modelach."
          }
        ]
      }
    },
    {
      "skillId": "skill_015",
      "skillName": "Równania różniczkowe — podstawy (separowalne i liniowe)",
      "class_level": 3,
      "department": "calculus",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [4, 9],
        "fallbackTrigger": "use_canonical_methods_for_ode"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2000,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2600,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1400,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Równania różniczkowe opisują zależność między funkcją a jej pochodnymi. W liceum poznajemy równania separowalne i liniowe rzędu pierwszego. Rozwiązujemy je przez separację zmiennych lub metodę czynnika całkującego. Modele: wzrost/zanik wykładniczy, chłodzenie, proste kinetyki.",
          "keyConceptsLaTex": ["$y'=f(x)y$", "$y=Ce^{\\int f(x)dx}$", "$y'+py=q$", "$\\mu(x)=e^{\\int p(x)dx}$", "$\\frac{dy}{dx}=f(x)g(y)$"],
          "formalDefinitions": [
            "Równanie separowalne: $\\frac{dy}{dx}=f(x)g(y)$, które rozwiązuje się przez rozdzielenie zmiennych i całkowanie po stronach.",
            "Równanie liniowe I rzędu: $y'+p(x)y=q(x)$; rozwiązujemy przez mnożenie czynnikiem całkującym i całkowanie."
          ],
          "theorems": [
            {
              "name": "Istnienie i jednoznaczność",
              "statement": "Gdy $f$ jest Lipschitz w otoczeniu punktu, rozwiązanie jest jednoznaczne.",
              "proof_outline": "Szkic: zastosuj twierdzenie Picarda–Lindelöfa. Definiuj operator całkowy na przestrzeni funkcji i wykaż, że jest kontrakcją w odpowiedniej normie. Następnie użyj zasady Banacha do uzyskania istnienia i jednoznaczności."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Separacja zmiennych — wzrost wykładniczy",
            "problem": "Rozwiąż $y'=ky$, $k$ stałe.",
            "solution": {
              "steps": [
                {
                  "step": "Rozdziel zmienne: przenieś $y$ do lewej i całkuj obie strony.",
                  "latex": "$\\int \\frac{1}{y}dy=\\int k\\,dx$",
                  "explanation": "Otrzymujemy $\\ln|y|=kx+C$.",
                  "justification": "Separacja i całkowanie funkcji elementarnych."
                },
                {
                  "step": "Zapisz rozwiązanie ogólne i stałą multiplikatywną.",
                  "latex": "$y=Ce^{kx}$",
                  "explanation": "Stała $C$ wynika z przekształcenia wykładniczego.",
                  "justification": "Równoważny zapis po eksponentacji."
                }
              ]
            },
            "maturaConnection": "Często: modele wzrostu i zaniku, zadania tekstowe przekładające się na ODE separowalne.",
            "timeEstimate": 420
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "ode3_ex_01",
            "difficulty": 6,
            "examLevel": "rozszerzony",
            "problem": "Rozwiąż $y'+2y=e^{x}$ z warunkiem $y(0)=1$.",
            "expectedAnswer": "$y=\\tfrac{1}{3}e^{x}+\\tfrac{2}{3}e^{-2x}$",
            "hints": [
              {
                "level": 1,
                "hint": "Użyj czynnika całkującego $\\mu=e^{\\int2dx}=e^{2x}$.",
                "timeEstimate": 180
              }
            ],
            "timeEstimate": 720
          },
          {
            "exerciseId": "ode3_ex_02",
            "difficulty": 5,
            "examLevel": "podstawowy",
            "problem": "Rozwiąż $\\frac{dy}{dx}=x\\,y$.",
            "expectedAnswer": "$y=Ce^{x^2/2}$",
            "hints": [
              {
                "level": 1,
                "hint": "Separuj: $\\tfrac{1}{y}dy=x\\,dx$ i całkuj.",
                "timeEstimate": 150
              }
            ],
            "timeEstimate": 600
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Błędne rozdzielanie zmiennych, np. dzielenie przez wyrażenie mogące być zerem.",
          "Pominięcie stałej całkowania lub warunku początkowego."
        ],
        "teachingTips": [
          "Twórz schemat: typ równania → metoda → kroki weryfikacji.",
          "Zawsze sprawdzaj rozwiązanie przez różniczkowanie i podstawienie do ODE."
        ],
        "prerequisites": ["Całki nieoznaczone", "Pochodne i reguła łańcuchowa"],
        "estimatedTime": 6000,
        "maturaPreparation": "Zadania tekstowe modelujące wzrost/zanik oraz proste równania liniowe/separowalne. Ćwicz interpretację parametrów.",
        "universityConnection": "Wprowadzenie do równań różniczkowych w fizyce, biologii i ekonomii."
      },
      "misconceptionPatterns": [
        {
          "pattern": "lost_constant",
          "description": "Uczeń traci stałą całkowania lub myli się przy warunku początkowym.",
          "feedback": "Po całkowaniu dodaj $+C$, następnie wyznacz $C$ z warunku.",
          "remediation": "Ćwiczenia z jawnie zapisanym etapem wyznaczania $C$.",
          "prerequisiteGap": "Relacja całkowania i równania ogólnego"
        },
        {
          "pattern": "illegal_division",
          "description": "Dzielenie przez funkcję $g(y)$ bez sprawdzenia, czy może być równa zero.",
          "feedback": "Zapisz osobno przypadki $g(y)=0$ i rozważ rozwiązania stałe.",
          "remediation": "Dodaj krok: analiza zbioru zer $g(y)$ przed separacją.",
          "prerequisiteGap": "Dziedzina i zera funkcji"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Modelowanie — wzrost populacji",
          "example": "Równanie $y'=ky$ opisuje wzrost lub rozpad w czasie.",
          "practicalUse": "Prognozowanie trendów i czasów połowicznego zaniku.",
          "careerConnection": "Ekonomia, biologia, inżynieria"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Rozwiązywanie ODE separowalnych i liniowych",
            "podstawowy": "Rozpoznaje typ i wykonuje podstawowe kroki.",
            "rozszerzony": "Stosuje czynnik całkujący i rozwiązuje z warunkiem.",
            "uniwersytecki": "Analizuje istnienie, jednoznaczność i stabilność rozwiązań."
          }
        ]
      }
    }
  ]
};
        "fallbackTrigger": "use_canonical_when_generator_fails"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 1800,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2400,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1200,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Funkcja wykładnicza ma postać $f(x)=a^x$ dla $a>0$, $a\\neq1$. Funkcja logarytmiczna $f(x)=\\log_a(x)$ jest odwrotnością funkcji wykładniczej. Obie funkcje mają kluczowe znaczenie w matematyce, fizyce, ekonomii i informatyce.",
          "keyConceptsLaTex": ["$f(x)=a^x$", "$f(x)=\\log_a(x)$"],
          "formalDefinitions": [
            "Funkcja wykładnicza: odwzorowanie zbioru liczb rzeczywistych w liczby dodatnie, dla którego $f(x)=a^x$ przy $a>0$ i $a\\neq1$.",
            "Funkcja logarytmiczna: odwrotność funkcji wykładniczej, definiowana dla $x>0$ jako $\\log_a(x)=y$ wtedy i tylko wtedy, gdy $a^y=x$."
          ],
          "theorems": [
            {
              "name": "Monotoniczność",
              "statement": "Dla $a>1$ funkcja $a^x$ jest rosnąca, dla $0<a<1$ jest malejąca.",
              "proof_outline": "Rozważ pochodną $f(x)=a^x$ równą $f'(x)=a^x\\ln a$. Ponieważ $a^x>0$, znak pochodnej zależy od $\\ln a$. Dla $a>1$, $\\ln a>0$ → funkcja rosnąca. Dla $0<a<1$, $\\ln a<0$ → funkcja malejąca."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Rozwiązywanie równania wykładniczego",
            "problem": "Rozwiąż równanie $2^x=16$",
            "solution": {
              "steps": [
                {
                  "step": "Zapisz $16$ jako potęgę liczby $2$",
                  "latex": "$16=2^4$",
                  "explanation": "Rozpoznaj, że 16 jest potęgą liczby 2.",
                  "justification": "Podstawowe własności potęg."
                },
                {
                  "step": "Porównaj wykładniki",
                  "latex": "$x=4$",
                  "explanation": "Jeżeli $2^x=2^4$, to $x=4$.",
                  "justification": "Jednoznaczność zapisu w postaci wykładniczej."
                }
              ]
            },
            "maturaConnection": "Typowe równanie na maturze podstawowej, sprawdza znajomość własności potęg.",
            "timeEstimate": 300
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "ex6_1",
            "difficulty": 4,
            "examLevel": "podstawowy",
            "problem": "Oblicz $\\log_2(32)$",
            "expectedAnswer": "5",
            "hints": [
              {
                "level": 1,
                "hint": "Znajdź potęgę $2$, która daje $32$.",
                "timeEstimate": 120
              }
            ],
            "timeEstimate": 480
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Uczeń myli podstawę logarytmu z wykładnikiem.", "Brak świadomości, że logarytm nie jest zdefiniowany dla liczb ujemnych."],
        "teachingTips": ["Pokaż wizualnie wykresy $a^x$ i $\\log_a(x)$.", "Użyj przykładów z procentami składanymi i wzrostem populacji."],
        "prerequisites": ["skill_013", "skill_014"],
        "estimatedTime": 5400,
        "maturaPreparation": "Na maturze rozszerzonej często pojawiają się zadania z logarytmami i przekształceniami wykładniczymi.",
        "universityConnection": "Logarytmy i funkcje wykładnicze są fundamentem rachunku różniczkowego i teorii informacji."
      },
      "misconceptionPatterns": [
        {
          "pattern": "log_of_negative",
          "description": "Uczeń próbuje obliczyć $\\log_a(-x)$",
          "feedback": "Logarytm z liczby ujemnej nie istnieje w zbiorze liczb rzeczywistych.",
          "remediation": "Wprowadź pojęcie logarytmu zespolonego lub ogranicz domenę.",
          "prerequisiteGap": "Znajomość dziedziny funkcji logarytmicznej."
        }
      ],
      "realWorldApplications": [
        {
          "context": "Ekonomia i finanse",
          "example": "Obliczanie czasu potrzebnego na podwojenie kapitału przy stałej stopie procentowej.",
          "practicalUse": "Wzór na procent składany wykorzystuje funkcje wykładnicze i logarytmy.",
          "careerConnection": "Bankowość, ekonomia, analityka danych."
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Rozwiązywanie równań wykładniczych i logarytmicznych",
            "podstawowy": "Uczeń rozpoznaje proste równania wykładnicze.",
            "rozszerzony": "Uczeń rozwiązuje zadania złożone z logarytmami.",
            "uniwersytecki": "Uczeń analizuje asymptoty i granice funkcji wykładniczych i logarytmicznych."
          }
        ]
      }
    },
    {
      "skillId": "skill_007",
      "skillName": "Geometria analityczna – okrąg i parabola",
      "class_level": 2,
      "department": "mathematics",
      "generatorParams": {
        "microSkill": "conic_sections",
        "difficultyRange": [3, 8],
        "fallbackTrigger": "use_canonical_examples"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 1800,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2400,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1200,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Okrąg i parabola są podstawowymi krzywymi stożkowymi w geometrii analitycznej. Okrąg ma równanie $(x-a)^2+(y-b)^2=r^2$, a parabola równanie $y=ax^2+bx+c$. Ich własności i zastosowania są kluczowe w wielu dziedzinach matematyki i fizyki.",
          "keyConceptsLaTex": ["$(x-a)^2+(y-b)^2=r^2$", "$y=ax^2+bx+c$"],
          "formalDefinitions": [
            "Okrąg: zbiór punktów równoodległych od jednego punktu, zwanego środkiem.",
            "Parabola: zbiór punktów równoodległych od prostej i punktu nieleżącego na niej."
          ],
          "theorems": [
            {
              "name": "Ogniskowa paraboli",
              "statement": "Dla paraboli $y=ax^2$ ognisko ma współrzędne $(0,\\frac{1}{4a})$.",
              "proof_outline": "Korzystając z definicji paraboli jako zbioru punktów równoodległych od ogniska i kierownicy, wyznacz współrzędne ogniska przy pomocy geometrii analitycznej."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Równanie okręgu",
            "problem": "Znajdź równanie okręgu o środku w $(2,3)$ i promieniu $5$.",
            "solution": {
              "steps": [
                {
                  "step": "Podstaw wzór ogólny okręgu.",
                  "latex": "$(x-a)^2+(y-b)^2=r^2$",
                  "explanation": "Wzór ogólny opisuje każdy okrąg w płaszczyźnie.",
                  "justification": "Definicja okręgu."
                },
                {
                  "step": "Podstaw wartości $a=2$, $b=3$, $r=5$.",
                  "latex": "$(x-2)^2+(y-3)^2=25$",
                  "explanation": "Podstawienie danych do wzoru.",
                  "justification": "Podstawienie liczb."
                }
              ]
            },
            "maturaConnection": "Często spotykane zadanie w geometrii analitycznej na maturze.",
            "timeEstimate": 360
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "ex7_1",
            "difficulty": 5,
            "examLevel": "rozszerzony",
            "problem": "Wyznacz wierzchołek paraboli $y=2x^2-4x+1$",
            "expectedAnswer": "$(1,-1)$",
            "hints": [
              {
                "level": 1,
                "hint": "Skorzystaj z wzoru na wierzchołek $(-b/2a, f(-b/2a))$.",
                "timeEstimate": 180
              }
            ],
            "timeEstimate": 600
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Mylenie równania ogólnego okręgu z równaniem kanonicznym.", "Błędne obliczanie wierzchołka paraboli."],
        "teachingTips": ["Wizualizuj wykresy na siatce współrzędnych.", "Ćwicz przekształcanie równań do postaci kanonicznej."],
        "prerequisites": ["skill_009"],
        "estimatedTime": 5400,
        "maturaPreparation": "Umiejętność wyznaczania równań krzywych stożkowych i ich własności.",
        "universityConnection": "Podstawa geometrii analitycznej i algebry liniowej."
      },
      "misconceptionPatterns": [
        {
          "pattern": "sign_error",
          "description": "Uczeń myli znak w równaniu okręgu $(x-a)^2+(y-b)^2=r^2$.",
          "feedback": "Zwróć uwagę na poprawne podstawianie współrzędnych środka.",
          "remediation": "Ćwicz podstawianie na prostych przykładach.",
          "prerequisiteGap": "Podstawy działań algebraicznych."
        }
      ],
      "realWorldApplications": [
        {
          "context": "Fizyka i inżynieria",
          "example": "Trajektoria pocisku balistycznego przy braku oporu powietrza jest parabolą.",
          "practicalUse": "Analiza ruchu w polu grawitacyjnym.",
          "careerConnection": "Balistyka, inżynieria, mechanika."
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Wyznaczanie równań okręgu i paraboli",
            "podstawowy": "Uczeń potrafi podać równanie okręgu dla prostych danych.",
            "rozszerzony": "Uczeń oblicza własności paraboli i okręgu w zadaniach maturalnych.",
            "uniwersytecki": "Uczeń analizuje uogólnione równania krzywych stożkowych."
          }
        ]
      }
    },
    {
      "skillId": "skill_008",
      "skillName": "Granica funkcji",
      "class_level": 2,
      "department": "calculus",
      "generatorParams": {
        "microSkill": "limits",
        "difficultyRange": [3, 9],
        "fallbackTrigger": "canonical_examples_when_generator_fails"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 1800,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2400,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1200,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Granica funkcji opisuje zachowanie funkcji w pobliżu danego punktu lub przy dążeniu zmiennej do nieskończoności. Formalna definicja granicy wymaga precyzji w zapisie, ale intuicyjnie chodzi o to, do jakiej wartości zbliża się funkcja.",
          "keyConceptsLaTex": ["$\\lim_{x \\to a} f(x)$", "$\\lim_{x \\to \\infty} f(x)$"],
          "formalDefinitions": [
            "Granica funkcji $f(x)$ w punkcie $a$ istnieje i równa się $L$, jeśli dla dowolnego $\\varepsilon>0$ istnieje $\\delta>0$, takie że dla $0<|x-a|<\\delta$ zachodzi $|f(x)-L|<\\varepsilon$."
          ],
          "theorems": [
            {
              "name": "Granica sumy",
              "statement": "$\\lim_{x \\to a}(f(x)+g(x))=\\lim_{x \\to a}f(x)+\\lim_{x \\to a}g(x)$",
              "proof_outline": "Korzystamy z definicji granicy i własności wartości bezwzględnej, sumując nierówności i pokazując, że suma granic istnieje i jest równa granicy sumy."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Granica prostej funkcji",
            "problem": "Oblicz $\\lim_{x \\to 2}(3x+1)$",
            "solution": {
              "steps": [
                {
                  "step": "Podstaw $x=2$ do wzoru",
                  "latex": "$3(2)+1=7$",
                  "explanation": "Funkcja liniowa jest ciągła, więc granica w punkcie równa się wartości funkcji.",
                  "justification": "Własność ciągłości funkcji liniowej."
                }
              ]
            },
            "maturaConnection": "Typowe zadanie na maturze podstawowej sprawdzające rozumienie granic prostych funkcji.",
            "timeEstimate": 300
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "ex8_1",
            "difficulty": 5,
            "examLevel": "rozszerzony",
            "problem": "Oblicz $\\lim_{x \\to \\infty} \\frac{2x+1}{x-3}$",
            "expectedAnswer": "2",
            "hints": [
              {
                "level": 1,
                "hint": "Podziel licznik i mianownik przez $x$.",
                "timeEstimate": 120
              }
            ],
            "timeEstimate": 600
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Uczeń podstawia wartość bezpośrednio, gdy nie jest to dozwolone.", "Mylenie granicy w nieskończoności z wartością funkcji."],
        "teachingTips": ["Zacznij od graficznych ilustracji zbliżania się funkcji do wartości.", "Stopniowo wprowadzaj formalizm epsilon-delta."],
        "prerequisites": ["skill_006"],
        "estimatedTime": 5400,
        "maturaPreparation": "Zadania z granic występują na maturze rozszerzonej, szczególnie przy ciągach i funkcjach wymiernych.",
        "universityConnection": "Podstawowy koncept rachunku różniczkowego i całkowego."
      },
      "misconceptionPatterns": [
        {
          "pattern": "direct_substitution_error",
          "description": "Uczeń próbuje podstawić $x$ do mianownika, uzyskując dzielenie przez zero.",
          "feedback": "Granica nie oznacza podstawienia, lecz badanie zachowania funkcji.",
          "remediation": "Wyjaśnij różnicę między wartością a granicą funkcji.",
          "prerequisiteGap": "Rozumienie dziedziny funkcji."
        }
      ],
      "realWorldApplications": [
        {
          "context": "Fizyka",
          "example": "Obliczanie prędkości chwilowej jako granicy średniej prędkości.",
          "practicalUse": "Definicja pochodnej korzysta z granicy różnicy ilorazowej.",
          "careerConnection": "Fizyka, inżynieria, matematyka stosowana."
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Obliczanie granic funkcji",
            "podstawowy": "Uczeń oblicza granice funkcji ciągłych w punkcie.",
            "rozszerzony": "Uczeń oblicza granice w nieskończoności i granice jednostronne.",
            "uniwersytecki": "Uczeń stosuje formalizm epsilon-delta w dowodach."
          }
        ]
      }
    },
    {
      "skillId": "skill_009",
      "skillName": "Kombinatoryka zaawansowana",
      "class_level": 2,
      "department": "statistics",
      "generatorParams": {
        "microSkill": "combinatorics_advanced",
        "difficultyRange": [4, 9],
        "fallbackTrigger": "use_fallback_for_complex_enumerations"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2000,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2600,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1400,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Kombinatoryka bada sposoby wyboru i uporządkowania elementów w zbiorach. W liceum zaawansowanym omawia się permutacje, kombinacje i wariacje z powtórzeniami oraz twierdzenie Newtona.",
          "keyConceptsLaTex": ["$n!$", "$\\binom{n}{k}$"],
          "formalDefinitions": [
            "Permutacja: uporządkowany układ wszystkich elementów zbioru.",
            "Kombinacja: wybór $k$ elementów ze zbioru $n$ elementowego, bez uwzględniania kolejności."
          ],
          "theorems": [
            {
              "name": "Twierdzenie Newtona",
              "statement": "$(a+b)^n=\\sum_{k=0}^n \\binom{n}{k} a^{n-k}b^k$",
              "proof_outline": "Dowód opiera się na zasadach kombinatorycznych i liczbie sposobów wyboru wyrazów w rozwinięciu potęgi dwumianu."
            }
          ],
          "timeEstimate": 2000
        },
        "examples": [
          {
            "title": "Kombinacje bez powtórzeń",
            "problem": "Ile jest kombinacji 3-elementowych ze zbioru 5-elementowego?",
            "solution": {
              "steps": [
                {
                  "step": "Użyj wzoru na kombinacje.",
                  "latex": "$\\binom{5}{3}$",
                  "explanation": "Wzór określa liczbę kombinacji k-elementowych.",
                  "justification": "Definicja kombinacji."
                },
                {
                  "step": "Oblicz wartość.",
                  "latex": "$10$",
                  "explanation": "Z 5 elementów można utworzyć 10 kombinacji 3-elementowych.",
                  "justification": "Podstawienie liczb do wzoru."
                }
              ]
            },
            "maturaConnection": "Zadania tego typu pojawiają się na maturze rozszerzonej, często z kontekstem praktycznym.",
            "timeEstimate": 420
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "ex9_1",
            "difficulty": 6,
            "examLevel": "rozszerzony",
            "problem": "Ile jest permutacji 6-elementowych, w których 2 elementy są identyczne?",
            "expectedAnswer": "360",
            "hints": [
              {
                "level": 1,
                "hint": "Użyj wzoru $n!/k!$ dla elementów powtarzających się.",
                "timeEstimate": 180
              }
            ],
            "timeEstimate": 720
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Mylenie permutacji z kombinacjami.", "Błędne stosowanie wzoru przy powtórzeniach."],
        "teachingTips": ["Podawaj przykłady w kontekście kart, loterii, gier planszowych.", "Ćwicz rozpoznawanie, czy kolejność ma znaczenie."],
        "prerequisites": ["skill_005"],
        "estimatedTime": 6000,
        "maturaPreparation": "Na maturze rozszerzonej często pojawiają się zadania kombinatoryczne wymagające twórczego podejścia.",
        "universityConnection": "Podstawa teorii prawdopodobieństwa i statystyki matematycznej."
      },
      "misconceptionPatterns": [
        {
          "pattern": "wrong_formula_use",
          "description": "Uczeń używa wzoru na kombinacje zamiast permutacji.",
          "feedback": "Zwróć uwagę, czy kolejność elementów ma znaczenie.",
          "remediation": "Rozróżnij permutacje i kombinacje na prostych przykładach.",
          "prerequisiteGap": "Podstawy rachunku prawdopodobieństwa."
        }
      ],
      "realWorldApplications": [
        {
          "context": "Informatyka",
          "example": "Tworzenie haseł jako uporządkowane wybory znaków.",
          "practicalUse": "Bezpieczeństwo komputerowe opiera się na zasadach kombinatoryki.",
          "careerConnection": "Cyberbezpieczeństwo, informatyka, kryptografia."
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Zastosowanie permutacji i kombinacji",
            "podstawowy": "Uczeń oblicza proste kombinacje i permutacje.",
            "rozszerzony": "Uczeń stosuje kombinacje i permutacje z powtórzeniami.",
            "uniwersytecki": "Uczeń stosuje kombinatorykę w dowodach matematycznych."
          }
        ]
      }
    },
    {
      "skillId": "skill_010",
      "skillName": "Liczby zespolone",
      "class_level": 2,
      "department": "algebra",
      "generatorParams": {
        "microSkill": "operations",
        "difficultyRange": [4, 9],
        "fallbackTrigger": "use_canonical_for_complex_numbers"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2000,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2600,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1400,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Liczby zespolone mają postać $z=a+bi$, gdzie $i^2=-1$. Rozszerzają zbiór liczb rzeczywistych, pozwalając rozwiązywać równania bez pierwiastków rzeczywistych.",
          "keyConceptsLaTex": ["$z=a+bi$", "$i^2=-1$"],
          "formalDefinitions": [
            "Liczba zespolona to para uporządkowana liczb rzeczywistych $(a,b)$ z działaniami dodawania i mnożenia zdefiniowanymi poprzez $i^2=-1$."
          ],
          "theorems": [
            {
              "name": "Wzór Eulera",
              "statement": "$e^{i\\theta}=\\cos\\theta+i\\sin\\theta$",
              "proof_outline": "Dowód wykorzystuje rozwinięcia szeregowe funkcji wykładniczej, cosinusa i sinusa, pokazując równość wyraz po wyrazie."
            }
          ],
          "timeEstimate": 2000
        },
        "examples": [
          {
            "title": "Dodawanie liczb zespolonych",
            "problem": "Oblicz $(2+3i)+(4-2i)$",
            "solution": {
              "steps": [
                {
                  "step": "Dodaj części rzeczywiste.",
                  "latex": "2+4=6",
                  "explanation": "Dodajemy współczynniki przy części rzeczywistej.",
                  "justification": "Definicja dodawania liczb zespolonych."
                },
                {
                  "step": "Dodaj części urojone.",
                  "latex": "3i-2i=i",
                  "explanation": "Dodajemy współczynniki przy $i$.",
                  "justification": "Definicja dodawania liczb zespolonych."
                }
              ]
            },
            "maturaConnection": "Zadania wprowadzające na maturze rozszerzonej, często związane z równaniami kwadratowymi.",
            "timeEstimate": 360
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "ex10_1",
            "difficulty": 5,
            "examLevel": "rozszerzony",
            "problem": "Oblicz moduł liczby $z=3+4i$",
            "expectedAnswer": "5",
            "hints": [
              {
                "level": 1,
                "hint": "Skorzystaj z wzoru $|z|=\\sqrt{a^2+b^2}$.",
                "timeEstimate": 180
              }
            ],
            "timeEstimate": 600
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Uczeń zapomina, że $i^2=-1$.", "Mylenie modułu z częścią rzeczywistą."],
        "teachingTips": ["Stosuj reprezentację geometryczną w płaszczyźnie zespolonej.", "Wprowadź liczby zespolone przez rozwiązywanie równań kwadratowych."],
        "prerequisites": ["skill_006", "skill_007"],
        "estimatedTime": 6000,
        "maturaPreparation": "Podstawowe działania na liczbach zespolonych i moduł liczby pojawiają się na maturze rozszerzonej.",
        "universityConnection": "Podstawa analizy zespolonej, elektrotechniki i teorii sygnałów."
      },
      "misconceptionPatterns": [
        {
          "pattern": "treat_i_as_variable",
          "description": "Uczeń traktuje $i$ jak niewiadomą zamiast jednostkę urojoną.",
          "feedback": "$i$ jest stałą spełniającą $i^2=-1$.",
          "remediation": "Pokaż różnicę między zmienną a jednostką urojoną.",
          "prerequisiteGap": "Podstawy algebry."
        }
      ],
      "realWorldApplications": [
        {
          "context": "Elektrotechnika",
          "example": "Reprezentacja sygnałów sinusoidalnych za pomocą liczb zespolonych.",
          "practicalUse": "Ułatwia obliczenia w analizie obwodów elektrycznych.",
          "careerConnection": "Inżynieria elektryczna, telekomunikacja, fizyka."
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Podstawowe operacje na liczbach zespolonych",
            "podstawowy": "Uczeń dodaje i odejmuje liczby zespolone.",
            "rozszerzony": "Uczeń oblicza moduł i sprzężenie liczby zespolonej.",
            "uniwersytecki": "Uczeń stosuje wzór Eulera i reprezentację trygonometryczną."
          }
        ]
      }
    },
    {
      "skillId": "skill_011",
      "skillName": "Pochodna funkcji — definicja, obliczanie, interpretacje",
      "class_level": 3,
      "department": "calculus",
      "generatorParams": {
        "microSkill": "derivatives_advanced",
        "difficultyRange": [4, 9],
        "fallbackTrigger": "use_canonical_rules_for_edge_cases"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2000,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2600,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1400,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Pochodna mierzy szybkość zmian funkcji. Formalnie to granica ilorazu różnicowego, jeśli istnieje. Reguły rachunkowe (suma, iloczyn, łańcuch) upraszczają obliczenia. Geometrycznie pochodna to nachylenie stycznej do wykresu. Interpretacje obejmują prędkość chwilową i tempo wzrostu.",
          "keyConceptsLaTex": ["$f'(x)$", "$\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}$", "$\\frac{d}{dx}(x^n)=nx^{n-1}$", "$(fg)'=f'g+fg'$", "$(f\\circ g)'=f'(g)g'$"],
          "formalDefinitions": [
            "Pochodną $f$ w punkcie $x$ definiujemy jako $f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}$, jeśli granica istnieje.",
            "Funkcja różniczkowalna w przedziale ma pochodną w każdym jego punkcie."
          ],
          "theorems": [
            {
              "name": "Zasada łańcuchowa",
              "statement": "Dla $y=f(g(x))$ mamy $\\frac{dy}{dx}=f'(g(x))\\cdot g'(x)$.",
              "proof_outline": "Rozpisz przyrost $f(g(x+h)) - f(g(x))$ i zastosuj definicję pochodnej wraz z granicą ilorazu różnicowego dla $g$ oraz liniową aproksymację $f$ w otoczeniu $g(x)$."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Pochodna funkcji wielomianowej",
            "problem": "Oblicz $f'(x)$ dla $f(x)=3x^4-5x^2+2x-7$.",
            "solution": {
              "steps": [
                {
                  "step": "Zastosuj regułę potęgową i liniowość operatora pochodnej.",
                  "latex": "$\\frac{d}{dx}(x^n)=nx^{n-1}$",
                  "explanation": "Liczymy pochodne składników i sumujemy wyniki.",
                  "justification": "Pochodna sumy to suma pochodnych."
                },
                {
                  "step": "Oblicz pochodną każdego składnika.",
                  "latex": "$12x^3-10x+2$",
                  "explanation": "Stała ma pochodną równą 0.",
                  "justification": "Reguły rachunku różniczkowego."
                }
              ]
            },
            "maturaConnection": "Standardowe zadania: pochodne wielomianów, funkcji złożonych i interpretacja pochodnej jako nachylenia stycznej.",
            "timeEstimate": 420
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "der3_ex_01",
            "difficulty": 5,
            "examLevel": "rozszerzony",
            "problem": "Oblicz pochodną $f(x)=\\sqrt{3x^2+1}$.",
            "expectedAnswer": "$f'(x)=\\frac{3x}{\\sqrt{3x^2+1}}$",
            "hints": [
              {
                "level": 1,
                "hint": "Użyj zasady łańcuchowej dla $\\sqrt{u}$ i $u=3x^2+1$.",
                "timeEstimate": 150
              }
            ],
            "timeEstimate": 720
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Pominięcie zasady łańcuchowej przy funkcjach złożonych.",
          "Błędne traktowanie stałych jak zmiennych w pochodnej."
        ],
        "teachingTips": [
          "Ćwicz rozpoznawanie struktury złożenia przed obliczeniami.",
          "Porównuj wykres i znak pochodnej, aby spiąć rachunek z geometrią."
        ],
        "prerequisites": ["skill_008", "Algebra: potęgi i pierwiastki"],
        "estimatedTime": 6000,
        "maturaPreparation": "Zadania obejmują rachunek pochodnych, monotoniczność, ekstrema lokalne i styczne. Warto trenować analizę znaków pochodnej.",
        "universityConnection": "Niezbędne w analizie, optymalizacji, fizyce i ekonomii."
      },
      "misconceptionPatterns": [
        {
          "pattern": "forget_chain_rule",
          "description": "Uczeń różniczkuje zewnętrzną funkcję i pomija mnożnik pochodnej wewnętrznej.",
          "feedback": "Zapisz $u=g(x)$, policz $\\frac{df}{du}$ i pomnóż przez $u'(x)$.",
          "remediation": "Wprowadź schemat: oznacz u, policz dwie pochodne, połącz wyniki.",
          "prerequisiteGap": "Składanie funkcji i notacja"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Fizyka — prędkość i przyspieszenie",
          "example": "Prędkość to pochodna położenia, przyspieszenie to pochodna prędkości.",
          "practicalUse": "Analiza ruchu i dynamiki układów.",
          "careerConnection": "Inżynieria, fizyka, robotyka"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Rachunek pochodnych i zastosowania",
            "podstawowy": "Liczy pochodne prostych funkcji.",
            "rozszerzony": "Stosuje łańcuch, iloczyn i iloraz.",
            "uniwersytecki": "Analizuje ekstrema i buduje modele różniczkowe."
          }
        ]
      }
    },
    {
      "skillId": "skill_012",
      "skillName": "Całka nieoznaczona — podstawowe techniki",
      "class_level": 3,
      "department": "calculus",
      "generatorParams": {
        "microSkill": "integrals_advanced",
        "difficultyRange": [4, 9],
        "fallbackTrigger": "use_canonical_antiderivatives"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2000,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2600,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1400,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Całka nieoznaczona to rodzina funkcji pierwotnych. Odwraca działanie pochodnej i dodaje stałą całkowania. Kluczowe techniki to podstawienie i częściowe całkowanie. W prostych przypadkach korzystamy z tabeli podstawowych całek.",
          "keyConceptsLaTex": ["$\\int f'(x)dx=f(x)+C$", "$\\int x^n dx=\\frac{x^{n+1}}{n+1}+C$", "$\\int e^x dx=e^x+C$", "$\\int \\cos x dx=\\sin x+C$"],
          "formalDefinitions": [
            "Funkcję $F$ nazywamy pierwotną $f$, gdy $F'(x)=f(x)$ dla każdego $x$ z dziedziny.",
            "Całka nieoznaczona $\\int f(x)dx$ jest rodziną wszystkich pierwotnych funkcji $f$."
          ],
          "theorems": [
            {
              "name": "Całkowanie przez części",
              "statement": "$\\int u\\,dv=uv-\\int v\\,du$",
              "proof_outline": "Wynika bezpośrednio z reguły iloczynu dla pochodnych poprzez scałkowanie obu stron równania i przekształcenie składników."
            }
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Prosta całka wielomianu",
            "problem": "Oblicz $\\int (6x^2-4x+3)dx$.",
            "solution": {
              "steps": [
                {
                  "step": "Zastosuj liniowość całki i wzór na całkę potęgi.",
                  "latex": "$\\int x^n dx=\\frac{x^{n+1}}{n+1}+C$",
                  "explanation": "Całkujemy każdy składnik osobno i sumujemy wyniki.",
                  "justification": "Liniowość operatora całkowania."
                },
                {
                  "step": "Zapisz wynik sumaryczny.",
                  "latex": "$2x^3-2x^2+3x+C$",
                  "explanation": "Stałą całkowania dodajemy raz.",
                  "justification": "Definicja całki nieoznaczonej."
                }
              ]
            },
            "maturaConnection": "Typowe zadania: proste całkowanie, podstawienie, częściowe całkowanie przy funkcjach elementarnych.",
            "timeEstimate": 420
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "int3_ex_01",
            "difficulty": 6,
            "examLevel": "rozszerzony",
            "problem": "Oblicz $\\int x\\,e^{x}dx$.",
            "expectedAnswer": "$(x-1)e^x+C$",
            "hints": [
              {
                "level": 1,
                "hint": "Użyj części: $u=x$, $dv=e^x dx$.",
                "timeEstimate": 180
              }
            ],
            "timeEstimate": 720
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Brak stałej całkowania w odpowiedzi.",
          "Złe podstawienie w metodzie podstawienia lub pominięcie $dx$."
        ],
        "teachingTips": [
          "Wprowadź checklistę: wybór techniki → formalne podstawienie → powrót do zmiennej x → +C.",
          "Ćwicz rozpoznawanie par $(u,dv)$ do części."
        ],
        "prerequisites": ["skill_011", "Algebra: przekształcenia równań"],
        "estimatedTime": 6000,
        "maturaPreparation": "Zadania obejmują całki funkcji elementarnych, podstawienia i częściowe. Ważna jest ekonomia rachunku.",
        "universityConnection": "Podstawa rozwiązywania równań różniczkowych i obliczania pól/objętości."
      },
      "misconceptionPatterns": [
        {
          "pattern": "missing_constant_C",
          "description": "Uczeń zapomina dodać stałej całkowania w wyniku.",
          "feedback": "Zawsze dodaj $+C$ na końcu całki nieoznaczonej.",
          "remediation": "Weryfikuj wynik po zróżniczkowaniu — brak $C$ zmienia rodzinę rozwiązań.",
          "prerequisiteGap": "Relacja całki i pochodnej"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Fizyka — praca siły",
          "example": "Praca to całka z siły po drodze: $W=\\int F\\,ds$.",
          "practicalUse": "Obliczanie energii i pól pod wykresami.",
          "careerConnection": "Inżynieria, fizyka techniczna"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Całkowanie funkcji elementarnych",
            "podstawowy": "Rozpoznaje i całkuje proste funkcje.",
            "rozszerzony": "Stosuje podstawienie i częściowe.",
            "uniwersytecki": "Łączy techniki i weryfikuje przez różniczkowanie."
          }
        ]
      }
    },
    {
      "skillId": "skill_013",
      "skillName": "Stereometria — objętości i pola powierzchni",
      "class_level": 3,
      "department": "geometry",
      "generatorParams": {
        "microSkill": "transformations_3d",
        "difficultyRange": [3, 8],
        "fallbackTrigger": "use_canonical_3d_formulas_when_needed"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 1900,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2500,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1400,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "W stereometrii obliczamy pola powierzchni i objętości brył: graniastosłupów, ostrosłupów, walców, stożków i kul. Kluczowe są przekroje, siatki oraz wzory, a także podobieństwo i skalowanie w 3D.",
          "keyConceptsLaTex": ["$V_{walca}=\\pi r^2h$", "$V_{sto\\dot{z}}=\\tfrac{1}{3}\\pi r^2h$", "$V_{kuli}=\\tfrac{4}{3}\\pi r^3$", "$P_{kuli}=4\\pi r^2$"],
          "formalDefinitions": [
            "Objętość to miara zajmowanej przestrzeni przez bryłę w 3D.",
            "Pole powierzchni całkowitej to suma pól wszystkich ścian bryły."
          ],
          "theorems": [
            {
              "name": "Podobieństwo brył",
              "statement": "Dla podobnych brył skala pól to $k^2$, a objętości $k^3$.",
              "proof_outline": "Wynika z podobieństwa figur na przekrojach i skalowania wymiarów: pola rosną z kwadratem skali, a objętości z sześcianem."
            }
          ],
          "timeEstimate": 1600
        },
        "examples": [
          {
            "title": "Objętość i pole stożka ściętego",
            "problem": "Stożek ścięty ma wysokość $h$, promienie $R$ i $r$. Oblicz objętość.",
            "solution": {
              "steps": [
                {
                  "step": "Wyraź objętości dwóch stożków i odejmij mniejszy od większego.",
                  "latex": "$V=\\tfrac{1}{3}\\pi h(R^2+Rr+r^2)$",
                  "explanation": "Wzór wynika z podobieństwa i odejmowania brył.",
                  "justification": "Znany wzór dla stożka ściętego."
                }
              ]
            },
            "maturaConnection": "Częste: zadania o skalowaniu, przekrojach i mieszanych obliczeniach pola i objętości.",
            "timeEstimate": 420
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "st3_ex_01",
            "difficulty": 5,
            "examLevel": "rozszerzony",
            "problem": "Walec o $r=3$ i $h=10$. Oblicz $V$ i $P_{bocz}$.",
            "expectedAnswer": "$V=90\\pi$, $P_{bocz}=60\\pi$",
            "hints": [
              {
                "level": 1,
                "hint": "Użyj $V=\\pi r^2h$ oraz $P_{bocz}=2\\pi rh$.",
                "timeEstimate": 150
              }
            ],
            "timeEstimate": 660
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": [
          "Mylenie jednostek dla pola i objętości.",
          "Pominięcie pola podstaw przy walcu czy stożku."
        ],
        "teachingTips": [
          "Zachęcaj do rysowania przekrojów i siatek brył.",
          "Sprawdzaj jednostki i sens wyniku w kontekście skali."
        ],
        "prerequisites": ["Geometria: podobieństwo figur", "Algebra: wzory i podstawienia"],
        "estimatedTime": 5800,
        "maturaPreparation": "Zadania na rozszerzeniu często łączą kilka wzorów i wymagają analizy przekrojów.",
        "universityConnection": "Wstęp do geometrii obliczeniowej i modelowania 3D."
      },
      "misconceptionPatterns": [
        {
          "pattern": "area_volume_confusion",
          "description": "Uczeń myli wzory i jednostki pól oraz objętości.",
          "feedback": "Pola w jednostkach kwadratowych, objętości w sześciennych.",
          "remediation": "Tabelka wzorów z jednostkami i przykłady kontrolne.",
          "prerequisiteGap": "Jednostki miary i skalowanie"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Inżynieria — projektowanie zbiorników",
          "example": "Obliczenia pojemności zbiorników cylindrycznych i stożkowych.",
          "practicalUse": "Dobór wymiarów i materiałów na podstawie $V$ i $P$.",
          "careerConnection": "Inżynieria procesowa, budownictwo"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena przygotowania maturalnego - 15 zadań różnego poziomu",
        "criteria": [
          {
            "skill": "Obliczenia pól i objętości brył",
            "podstawowy": "Stosuje podstawowe wzory poprawnie.",
            "rozszerzony": "Łączy wzory i analizuje przekroje.",
            "uniwersytecki": "Modeluje złożone bryły i skaluje wyniki."
          }
        ]
      }
    }
  ]
};

// Function to import only new batch content
export async function importNewBatchContent() {
  const results = [];
  
  for (let i = 0; i < newBatchContentDatabase.contentDatabase.length; i++) {
    const skillData = newBatchContentDatabase.contentDatabase[i];
    const result = await importSkillContent(skillData);
    results.push({ 
      skillName: skillData.skillName, 
      result,
      progress: ((i + 1) / newBatchContentDatabase.contentDatabase.length) * 100
    });
  }
  
  return results;
}

// Auto-import function for immediate execution (legacy - all skills)
export async function autoImportSkills() {
  console.log('Starting auto-import of all skills...');
  const results = await importAllSkillContent();
  console.log('Import completed:', results);
  return results;
}

// Auto-import function for new batch
export async function autoImportNewBatch() {
  console.log('Starting auto-import of new batch skills (class 2 liceum)...');
  const results = await importNewBatchContent();
  console.log('New batch import completed:', results);
  return results;
}