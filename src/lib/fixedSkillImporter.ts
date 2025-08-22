import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface SkillData {
  skillId: string;
  skillName: string;
  class_level: number;
  department: string;
  generatorParams: any;
  teachingFlow: any;
  content: any;
  pedagogicalNotes: any;
  misconceptionPatterns: any;
  realWorldApplications: any;
  assessmentRubric: any;
}

export async function importSingleSkill(skill: SkillData) {
  try {
    console.log(`=== Importing skill: ${skill.skillName} ===`);
    
    // Generate proper UUID for skill_id
    const skillUuid = uuidv4();
    
    // Prepare content data with complete structure
    const contentData = {
      skillName: skill.skillName,
      theory: skill.content?.theory ? {
        theory_text: skill.content.theory.introduction || '',
        key_formulas: skill.content.theory.keyConceptsLaTex || [],
        time_estimate: skill.content.theory.timeEstimate || 0,
        difficulty_level: skill.generatorParams?.difficulty || 1,
        created_at: new Date().toISOString()
      } : null,
      examples: skill.content?.examples?.map((example: any) => ({
        example_code: example.title || '',
        problem_statement: example.problem || '',
        solution_steps: example.solution?.steps || (example.solution ? [example.solution] : []),
        final_answer: example.expectedAnswer || '',
        explanation: example.maturaConnection || '',
        difficulty_level: example.difficulty || skill.generatorParams?.difficulty || 1,
        time_estimate: example.timeEstimate || 0
      })) || [],
      exercises: skill.content?.practiceExercises?.map((exercise: any) => ({
        exercise_code: exercise.exerciseId || '',
        problem_statement: exercise.problem || '',
        expected_answer: exercise.expectedAnswer || '',
        difficulty_level: exercise.difficulty || 1,
        time_estimate: exercise.timeEstimate || 0,
        misconception_map: exercise.misconceptionTriggers || {},
        hints: exercise.hints || []
      })) || [],
      pedagogical_notes: skill.pedagogicalNotes ? {
        scaffolding_questions: skill.pedagogicalNotes.teachingTips || [],
        teaching_flow: ["theory", "examples", "practice", "assessment"],
        estimated_total_time: skill.pedagogicalNotes.estimatedTime || 3600,
        prerequisite_description: skill.pedagogicalNotes.prerequisites?.join(', ') || '',
        next_topic_description: skill.pedagogicalNotes.universityConnection || ''
      } : null,
      assessment_rubric: {
        mastery_threshold: 80,
        skill_levels: {
          "beginner": "0-40% poprawnych odpowiedzi",
          "developing": "41-70% poprawnych odpowiedzi", 
          "proficient": "71-90% poprawnych odpowiedzi",
          "advanced": "91-100% poprawnych odpowiedzi"
        },
        total_questions: 10,
        scope_description: skill.skillName
      },
      phases: []
    };

    const metadata = {
      skill_name: skill.skillName,
      description: skill.skillName,
      department: skill.department || 'matematyka',
      level: 'high_school',
      class_level: skill.class_level || 1,
      men_code: skill.skillId || '',
      difficulty_rating: skill.generatorParams?.difficulty || 1,
      estimated_time_minutes: 30,
      prerequisites: [],
      learning_objectives: [],
      chapter_tag: skill.department || ''
    };

    // Check if content is complete
    const isComplete = !!(
      contentData.theory?.theory_text && 
      contentData.examples?.length > 0 &&
      contentData.exercises?.length > 0
    );
    
    console.log(`Content completeness for ${skill.skillName}:`);
    console.log('- Theory:', contentData.theory?.theory_text ? 'YES' : 'NO');
    console.log('- Examples:', contentData.examples?.length || 0);
    console.log('- Exercises:', contentData.exercises?.length || 0);
    console.log('- Is Complete:', isComplete);

    // Insert into unified_skill_content
    const { data, error } = await supabase
      .from('unified_skill_content')
      .insert([{
        skill_id: skillUuid,
        content_data: contentData,
        metadata: metadata,
        is_complete: isComplete,
        version: 1
      }])
      .select();

    if (error) {
      console.error(`Error inserting ${skill.skillName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log(`✅ Successfully imported: ${skill.skillName}`);
    return {
      success: true,
      skillId: skillUuid
    };

  } catch (error) {
    console.error(`Failed to import ${skill.skillName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runCompleteImport() {
  console.log('🚀 Starting complete skill import...');
  
  // Complete skill data - 4 skills that should be imported
  const skills = [
    {
      "skillId": "ca3234d8-547f-4c26-ba93-903b5465abfe",
      "skillName": "Wartość bezwzględna",
      "class_level": 1,
      "department": "algebra",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [2, 7]
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
          "introduction": "Wartość bezwzględna liczby to jej odległość od zera na osi liczbowej. Dla liczby a, wartość bezwzględna |a| to a, gdy a ≥ 0, oraz -a, gdy a < 0. Wartość bezwzględna jest zawsze nieujemna.",
          "keyConceptsLaTex": [
            "|a| = a \\text{ gdy } a \\geq 0",
            "|a| = -a \\text{ gdy } a < 0", 
            "|-a| = |a|",
            "|a \\cdot b| = |a| \\cdot |b|",
            "\\left|\\frac{a}{b}\\right| = \\frac{|a|}{|b|} \\text{ dla } b \\neq 0"
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Obliczanie wartości bezwzględnej",
            "problem": "Oblicz |3 - 7| + |-2|",
            "solution": {
              "steps": [
                "Oblicz 3 - 7 = -4",
                "Znajdź |-4| = 4",
                "Znajdź |-2| = 2", 
                "Dodaj wyniki: 4 + 2 = 6"
              ]
            },
            "expectedAnswer": "6",
            "timeEstimate": 300
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "abs_01",
            "difficulty": 3,
            "problem": "Oblicz |5 - 8| - |-3|",
            "expectedAnswer": "0",
            "timeEstimate": 240
          }
        ]
      },
      "pedagogicalNotes": {
        "teachingTips": ["Używaj osi liczbowej do wizualizacji", "Podkreślaj interpretację geometryczną"],
        "prerequisites": ["Liczby całkowite", "Operacje arytmetyczne"],
        "estimatedTime": 5400
      },
      "misconceptionPatterns": [],
      "realWorldApplications": [],
      "assessmentRubric": {}
    },
    {
      "skillId": "19a5a036-cdc3-4deb-b821-2ceea5ca4b42", 
      "skillName": "Nierówności kwadratowe",
      "class_level": 2,
      "department": "algebra",
      "generatorParams": {
        "microSkill": "quadratic_equations",
        "difficultyRange": [4, 8]
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2000,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania", 
          "duration": 2800,
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
          "introduction": "Nierówności kwadratowe to nierówności postaci ax² + bx + c > 0 (lub <, ≥, ≤), gdzie a ≠ 0. Rozwiązujemy je znajdując miejsca zerowe funkcji kwadratowej i analizując znak funkcji w poszczególnych przedziałach.",
          "keyConceptsLaTex": [
            "ax^2 + bx + c > 0 \\text{ gdzie } a \\neq 0",
            "\\Delta = b^2 - 4ac", 
            "x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}",
            "\\text{Analiza znaku na przedziałach}"
          ],
          "timeEstimate": 2000
        },
        "examples": [
          {
            "title": "Rozwiązywanie nierówności kwadratowej",
            "problem": "Rozwiąż nierówność x² - 5x + 6 > 0",
            "solution": {
              "steps": [
                "Znajdź miejsca zerowe: x² - 5x + 6 = 0",
                "Δ = 25 - 24 = 1, x₁ = 2, x₂ = 3",
                "Narysuj parabolę (ramiona w górę, bo a = 1 > 0)",
                "Funkcja dodatnia dla x ∈ (-∞, 2) ∪ (3, +∞)"
              ]
            },
            "expectedAnswer": "x ∈ (-∞, 2) ∪ (3, +∞)",
            "timeEstimate": 480
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "quad_ineq_01",
            "difficulty": 5,
            "problem": "Rozwiąż nierówność x² - 4x - 5 ≤ 0", 
            "expectedAnswer": "x ∈ [-1, 5]",
            "timeEstimate": 420
          }
        ]
      },
      "pedagogicalNotes": {
        "teachingTips": ["Zawsze rysuj wykres paraboli", "Sprawdzaj znak w każdym przedziale"],
        "prerequisites": ["Funkcja kwadratowa", "Równania kwadratowe"],
        "estimatedTime": 6200
      },
      "misconceptionPatterns": [],
      "realWorldApplications": [],
      "assessmentRubric": {}
    },
    {
      "skillId": "b3fe8aca-d74e-4fcc-b5b2-4d583c4f8d23",
      "skillName": "Równania i nierówności z wartością bezwzględną",
      "class_level": 2,
      "department": "algebra", 
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [3, 8]
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
          "duration": 1300,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Równania i nierówności z wartością bezwzględną rozwiązujemy metodą przedziałów lub wykorzystując definicję wartości bezwzględnej. Kluczowe jest znalezienie punktów, w których wyrażenia pod wartością bezwzględną zmieniają znak.",
          "keyConceptsLaTex": [
            "|f(x)| = g(x) \\Rightarrow f(x) = g(x) \\text{ lub } f(x) = -g(x)",
            "|f(x)| > g(x) \\text{ dla } g(x) \\geq 0",
            "|f(x)| < g(x) \\Rightarrow -g(x) < f(x) < g(x)"
          ],
          "timeEstimate": 1900
        },
        "examples": [
          {
            "title": "Równanie z wartością bezwzględną",
            "problem": "Rozwiąż równanie |2x - 3| = 5",
            "solution": {
              "steps": [
                "Przypadek 1: 2x - 3 = 5, więc 2x = 8, x = 4",
                "Przypadek 2: 2x - 3 = -5, więc 2x = -2, x = -1",
                "Sprawdzenie: |2·4 - 3| = |5| = 5 ✓",
                "Sprawdzenie: |2·(-1) - 3| = |-5| = 5 ✓"
              ]
            },
            "expectedAnswer": "x = -1 lub x = 4",
            "timeEstimate": 360
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "abs_eq_01",
            "difficulty": 4,
            "problem": "Rozwiąż nierówność |x + 2| < 3",
            "expectedAnswer": "x ∈ (-5, 1)",
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "teachingTips": ["Używaj osi liczbowej do przedziałów", "Zawsze sprawdzaj rozwiązania"],
        "prerequisites": ["Wartość bezwzględna", "Nierówności liniowe"],
        "estimatedTime": 5700
      },
      "misconceptionPatterns": [],
      "realWorldApplications": [],
      "assessmentRubric": {}
    },
    {
      "skillId": "18963f1c-db53-4834-a917-9ad2656490b0",
      "skillName": "Zastosowania całki oznaczonej",
      "class_level": 3,
      "department": "calculus",
      "generatorParams": {
        "microSkill": "integrals", 
        "difficultyRange": [5, 9]
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2100,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2700,
          "activities": ["practice", "problem_solving", "feedback"]
        },
        "phase3": {
          "name": "Przygotowanie maturalne",
          "duration": 1500,
          "activities": ["exam_tasks", "complex_problems", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "Całka oznaczona ma liczne zastosowania: obliczanie pól figur płaskich, objętości brył obrotowych, długości łuków krzywych, pracy i momentów. Podstawowe twierdzenie rachunku różniczkowego i całkowego łączy pochodną z całką.",
          "keyConceptsLaTex": [
            "\\int_a^b f(x) dx = F(b) - F(a)",
            "S = \\int_a^b |f(x)| dx",
            "V = \\pi \\int_a^b [f(x)]^2 dx",
            "L = \\int_a^b \\sqrt{1 + [f'(x)]^2} dx"
          ],
          "timeEstimate": 2100
        },
        "examples": [
          {
            "title": "Pole figury płaskiej",
            "problem": "Oblicz pole figury ograniczonej krzywymi y = x² i y = 2x",
            "solution": {
              "steps": [
                "Znajdź punkty przecięcia: x² = 2x, więc x(x-2) = 0, x = 0 lub x = 2",
                "Pole = ∫₀² (2x - x²) dx",
                "= [x² - x³/3]₀²", 
                "= (4 - 8/3) - 0 = 4/3"
              ]
            },
            "expectedAnswer": "4/3",
            "timeEstimate": 540
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "definite_int_01",
            "difficulty": 6,
            "problem": "Oblicz objętość bryły powstałej z obrotu krzywej y = √x wokół osi x dla x ∈ [0,4]",
            "expectedAnswer": "8π",
            "timeEstimate": 480
          }
        ]
      },
      "pedagogicalNotes": {
        "teachingTips": ["Rysuj zawsze wykres", "Sprawdzaj, która funkcja jest większa"],
        "prerequisites": ["Całka nieoznaczona", "Podstawowe funkcje"],
        "estimatedTime": 6300
      },
      "misconceptionPatterns": [],
      "realWorldApplications": [],
      "assessmentRubric": {}
    }
  ];

  const results = [];
  let successful = 0;
  let failed = 0;

  // Clear any existing incomplete records first
  try {
    await supabase
      .from('unified_skill_content')
      .delete()
      .eq('is_complete', false);
    console.log('Cleared incomplete records');
  } catch (error) {
    console.log('No incomplete records to clear');
  }

  for (const skill of skills) {
    console.log(`\n--- Processing: ${skill.skillName} ---`);
    const result = await importSingleSkill(skill);
    
    results.push({
      skillName: skill.skillName,
      result
    });

    if (result.success) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log(`\n🎉 Import completed: ${successful}/${skills.length} successful`);
  
  return {
    totalProcessed: skills.length,
    successful,
    failed,
    details: results
  };
}