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

// Content database to import
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
          },
          {
            "question": "Co otrzymasz po dodaniu przeniesionej jedynki do $5 + 2$?",
            "tag": "step_3",
            "difficulty": "medium"
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
        },
        {
          "pattern": "forget_to_carry",
          "description": "Uczeń pomija przeniesienie w dodawaniu pisemnym",
          "exampleError": "Dodając 27 + 35 otrzymuje 52 zamiast $62$",
          "intervention": "Ucz przechodzenia do wyższego rzędu na prostych przykładach"
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
    }
    // Add more skills here - this is just the first one for demo
  ]
};

export async function importAllSkillContent() {
  const results = [];
  
  for (const skillData of contentDatabase.contentDatabase) {
    const result = await importSkillContent(skillData);
    results.push({ skillName: skillData.skillName, result });
  }
  
  return results;
}