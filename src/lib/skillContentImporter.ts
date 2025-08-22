import { supabase } from '@/integrations/supabase/client';

// Type definitions
export interface SkillImportResult {
  skillName: string;
  result: {
    success: boolean;
    skillId?: string;
    error?: string;
  };
}

export interface BatchImportResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  details: SkillImportResult[];
}

interface ChatGPTSkillContent {
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

export interface BatchImportResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  details: SkillImportResult[];
}

interface ChatGPTSkillContent {
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

interface SkillContent {
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

// Import individual skill with all its content
async function importSkillWithContent(skill: SkillContent) {
  try {
    console.log(`Importing skill: ${skill.skillName}`);
    
    // Check if skill already exists
    const { data: existingSkill } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skill.skillName)
      .single();

    let skillData;
    let skillError;

    if (existingSkill) {
      console.log(`Skill ${skill.skillName} already exists, updating...`);
      // Update existing skill
      const { data, error } = await supabase
        .from('skills')
        .update({
          class_level: skill.class_level,
          department: skill.department,
          generator_params: skill.generatorParams || {},
          teaching_flow: skill.teachingFlow?.phase1 ? [
            skill.teachingFlow.phase1.activities,
            skill.teachingFlow.phase2?.activities || [],
            skill.teachingFlow.phase3?.activities || []
          ].flat() : ["theory", "example", "guided_practice", "independent_practice"],
          content_data: skill.content || {},
          description: skill.content?.theory?.introduction || skill.skillName,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSkill.id)
        .select()
        .single();
      
      skillData = data;
      skillError = error;
    } else {
      console.log(`Creating new skill: ${skill.skillName}`);
      // Insert new skill
      const { data, error } = await supabase
        .from('skills')
        .insert([{
          name: skill.skillName,
          class_level: skill.class_level,
          department: skill.department,
          generator_params: skill.generatorParams || {},
          teaching_flow: skill.teachingFlow?.phase1 ? [
            skill.teachingFlow.phase1.activities,
            skill.teachingFlow.phase2?.activities || [],
            skill.teachingFlow.phase3?.activities || []
          ].flat() : ["theory", "example", "guided_practice", "independent_practice"],
          content_data: skill.content || {},
          description: skill.content?.theory?.introduction || skill.skillName
        }])
        .select()
        .single();
      
      skillData = data;
      skillError = error;
    }

    if (skillError) {
      console.error(`Error inserting skill ${skill.skillName}:`, skillError);
      return {
        success: false,
        error: `Skill insert error: ${skillError.message}`
      };
    }

    const skillId = skillData?.id;
    if (!skillId) {
      return {
        success: false,
        error: 'No skill ID returned from insert'
      };
    }

    // Import to unified skill content table
    const unifiedContentData = {
      theory: skill.content?.theory ? {
        theory_text: skill.content.theory.introduction || '',
        key_formulas: skill.content.theory.keyConceptsLaTex || [],
        time_estimate: skill.content.theory.timeEstimate || 0,
        difficulty_level: skill.generatorParams?.difficulty || 1,
        created_at: new Date().toISOString()
      } : null,
      examples: skill.content?.examples?.map(example => ({
        example_code: example.title || '',
        problem_statement: example.problem || '',
        solution_steps: example.solution?.steps || [],
        final_answer: example.solution?.final_answer || example.expectedAnswer || '',
        explanation: example.maturaConnection || '',
        difficulty_level: example.difficulty || skill.generatorParams?.difficulty || 1,
        time_estimate: example.timeEstimate || 0
      })) || [],
      exercises: skill.content?.practiceExercises?.map(exercise => ({
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
      description: skill.skillName, // Use skillName as description since description doesn't exist
      department: skill.department || 'matematyka',
      level: 'high_school', // Default level since it doesn't exist in interface
      class_level: skill.class_level || 1,
      men_code: skill.skillId || '', // Use skillId as men_code since menCode doesn't exist
      difficulty_rating: skill.generatorParams?.difficulty || 1,
      estimated_time_minutes: 30, // Default since estimatedTime doesn't exist
      prerequisites: [], // Default since prerequisites doesn't exist
      learning_objectives: [], // Default since learningObjectives doesn't exist
      chapter_tag: skill.department || '' // Use department since chapterTag doesn't exist
    };

    // Check if content is complete
    const isComplete = !!(
      unifiedContentData.theory?.theory_text && 
      unifiedContentData.examples?.length > 0 &&
      unifiedContentData.exercises?.length > 0
    );

    const { error: unifiedError } = await supabase
      .from('unified_skill_content')
      .upsert([{
        skill_id: skillId,
        content_data: unifiedContentData,
        metadata: metadata,
        is_complete: isComplete,
        version: 1
      }]);

    if (unifiedError) {
      console.error(`Error inserting unified content for ${skill.skillName}:`, unifiedError);
      return {
        success: false,
        error: `Failed to import unified content: ${unifiedError.message}`
      };
    }
    console.log(`Successfully imported unified content for skill: ${skill.skillName}`);

    // Import real world applications
    if (skill.realWorldApplications) {
      for (const application of skill.realWorldApplications) {
        const { error: applicationError } = await supabase
          .from('skill_real_world_applications')
          .upsert([{
            skill_id: skillId,
            context: application.context || '',
            problem_description: application.example || '',
            connection_explanation: application.practicalUse || '',
            age_group: application.careerConnection || ''
          }]);

        if (applicationError) {
          console.error(`Error inserting application for ${skill.skillName}:`, applicationError);
        }
      }
    }

    console.log(`Successfully imported skill: ${skill.skillName}`);
    return {
      success: true,
      skillId: skillId
    };

  } catch (error) {
    console.error(`Failed to import skill ${skill.skillName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// New batch skills (class 3) - Latest skills to import
const newBatchSkills = {
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
          "timeEstimate": 2000
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
          "timeEstimate": 2000
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

// Automated import functions
async function importNewBatchContent(): Promise<SkillImportResult[]> {
  console.log('Starting new batch content import...');
  
  const results: SkillImportResult[] = [];
  
  for (const skill of newBatchSkills.contentDatabase) {
    try {
      const result = await importSkillWithContent(skill);
      results.push({
        skillName: skill.skillName,
        result: result
      });
    } catch (error) {
      console.error(`Failed to import new batch skill ${skill.skillName}:`, error);
      results.push({
        skillName: skill.skillName,
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }
  
  return results;
}

// Single JSON import function
export async function importSingleSkillFromJSON(jsonData: any): Promise<SkillImportResult> {
  try {
    // Map JSON structure to our internal format
    const mappedSkill: SkillContent = {
      skillId: jsonData.skillId,
      skillName: jsonData.skillName,
      class_level: jsonData.class_level,
      department: jsonData.department,
      generatorParams: jsonData.generator_params,
      teachingFlow: jsonData.teaching_flow,
      content: {
        theory: {
          introduction: jsonData.content?.theory?.theory_text || '',
          keyConceptsLaTex: jsonData.content?.theory?.key_formulas || [],
          timeEstimate: jsonData.content?.theory?.time_estimate || 0
        },
        examples: jsonData.content?.examples?.map((ex: any) => ({
          title: ex.example_code || '',
          problem: ex.problem_statement || '',
          solution: {
            steps: ex.solution_steps || [],
            final_answer: ex.final_answer || ''
          },
          expectedAnswer: ex.final_answer || '',
          maturaConnection: ex.explanation || '',
          timeEstimate: ex.time_estimate || 0
        })) || [],
        practiceExercises: jsonData.content?.practice_exercises?.map((ex: any) => ({
          exerciseId: ex.exercise_code || '',
          difficulty: ex.difficulty_level || 1,
          problem: ex.problem_statement || '',
          expectedAnswer: ex.expected_answer || '',
          hints: ex.hints || [],
          timeEstimate: ex.time_estimate || 0
        })) || []
      },
      pedagogicalNotes: {
        commonMistakes: jsonData.pedagogical_notes?.common_mistakes || [],
        teachingTips: jsonData.pedagogical_notes?.teaching_tips || [],
        prerequisites: jsonData.pedagogical_notes?.prerequisites || [],
        estimatedTime: jsonData.pedagogical_notes?.estimated_time || 3600,
        maturaPreparation: jsonData.pedagogical_notes?.difficulty_progression || ''
      },
      misconceptionPatterns: jsonData.misconception_patterns || [],
      realWorldApplications: jsonData.real_world_applications?.map((app: any) => ({
        context: app.context || '',
        example: app.problem_description || '',
        practicalUse: app.connection_explanation || '',
        careerConnection: app.age_group || ''
      })) || [],
      assessmentRubric: jsonData.assessment_rubric || {}
    };

    // Use existing import function
    const result = await importSkillWithContent(mappedSkill);
    
    return {
      skillName: jsonData.skillName,
      result: result
    };

  } catch (error) {
    console.error('Failed to import JSON skill:', error);
    return {
      skillName: jsonData.skillName || 'Unknown',
      result: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

// Export data for compatibility
export const contentDatabase = { contentDatabase: [] };
export const newBatchContentDatabase = newBatchSkills;

// Export functions for compatibility
export const importAllSkillContent = async () => ({ success: false, error: 'Legacy function disabled' });
export const importSkillContent = async (skill: any) => ({ success: false, error: 'Legacy function disabled' });

// Main export functions
export async function autoImportSkills(): Promise<SkillImportResult[]> {
  console.log('Starting auto-import of skills...');
  return await autoImportNewBatch();
}

export async function autoImportNewBatch(): Promise<SkillImportResult[]> {
  console.log('Starting auto-import of new batch skills (class 3)...');
  const results = await importNewBatchContent();
  console.log('New batch import completed:', results);
  return results;
}

// Import linear inequalities skill
export async function importLinearInequalitiesSkill(): Promise<SkillImportResult> {
  const fixedJsonData = {
    "skillId": "inequalities-linear-one-variable-cl1",
    "skillName": "Nierówności liniowe z jedną niewiadomą",
    "class_level": 1,
    "department": "algebra",
    "generator_params": {
      "microSkill": "linear_equations",
      "difficultyRange": [1, 5],
      "fallbackTrigger": "use_basic_linear_patterns"
    },
    "teaching_flow": {
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
    "content": {
      "theory": {
        "theory_text": "Nierówność to porównanie dwóch wyrażeń, np. $x>2$, które określa zbiór liczb spełniających warunek. Działania: można dodawać lub odejmować tę samą liczbę po obu stronach bez zmiany znaku. Przy mnożeniu lub dzieleniu przez liczbę dodatnią znak się nie zmienia, a przy liczbie ujemnej znak nierówności należy odwrócić. Rozwiązania przedstawiamy symbolem i na osi liczbowej: kółko otwarte dla $>$ lub $<$, zamknięte dla $\\geq$ lub $\\leq$, ze strzałką w odpowiednią stronę. Zawsze warto sprawdzić wynik, podstawiając wartość graniczną i liczbę z wnętrza zbioru.",
        "key_formulas": ["$x > a$", "$x \\leq b$", "$ax + b > c$"],
        "time_estimate": 240,
        "difficulty_level": 1
      },
      "examples": [
        {
          "example_code": "IEQ_001",
          "problem_statement": "Rozwiąż nierówność: $x + 3 > 7$",
          "solution_steps": [
            {
              "step": "Odejmujemy 3 od obu stron",
              "latex": "$x + 3 - 3 > 7 - 3$",
              "explanation": "Usuwamy stałą po lewej, wykonując tę samą operację po obu stronach."
            },
            {
              "step": "Upraszczamy",
              "latex": "$x > 4$", 
              "explanation": "Otrzymujemy zbiór wszystkich liczb większych od 4."
            }
          ],
          "final_answer": "$x > 4$",
          "explanation": "Na osi liczbowej kółko otwarte w 4 i strzałka w prawo.",
          "time_estimate": 120,
          "difficulty_level": 1
        },
        {
          "example_code": "IEQ_002",
          "problem_statement": "Rozwiąż nierówność: $2x - 1 \\leq 5$",
          "solution_steps": [
            {
              "step": "Dodajemy 1 do obu stron",
              "latex": "$2x \\leq 5 + 1$",
              "explanation": "Przenosimy $-1$ na prawą stronę jako $+1$."
            },
            {
              "step": "Dzielimy przez 2 (liczba dodatnia)",
              "latex": "$x \\leq 3$",
              "explanation": "Znak nierówności pozostaje bez zmian."
            }
          ],
          "final_answer": "$x \\leq 3$",
          "explanation": "Kółko zamknięte w 3 i strzałka w lewo.",
          "time_estimate": 140,
          "difficulty_level": 2
        }
      ],
      "practice_exercises": [
        {
          "exercise_code": "IEQ_EX_001",
          "problem_statement": "Rozwiąż: $3x - 5 \\geq 10$",
          "expected_answer": "$x \\geq 5$",
          "difficulty_level": 2,
          "time_estimate": 180,
          "misconception_map": {
            "$x \\geq -5$": {
              "type": "sign_error",
              "feedback": "Przenosząc $-5$ na prawą stronę, dodaj 5: $3x \\geq 15$, nie $3x \\geq 10-(-5)$."
            },
            "$x > 5$": {
              "type": "boundary_confusion", 
              "feedback": "Symbol $\\geq$ oznacza także równość; punkt 5 należy do rozwiązania."
            }
          }
        },
        {
          "exercise_code": "IEQ_EX_002",
          "problem_statement": "Rozwiąż: $5 - 2x < 9$", 
          "expected_answer": "$x > -2$",
          "difficulty_level": 3,
          "time_estimate": 200,
          "misconception_map": {
            "$x < -2$": {
              "type": "sign_flip_missing",
              "feedback": "Po podzieleniu przez $-2$ znak powinien się odwrócić."
            }
          }
        }
      ]
    },
    "misconception_patterns": [
      {
        "pattern_code": "INEQ_SIGN_FLIP",
        "description": "Zapomnienie o odwróceniu znaku przy mnożeniu/dzieleniu przez liczbę ujemną",
        "example_error": "$-2x < 4 \\Rightarrow x < -2$",
        "intervention_strategy": "Podkreśl regułę odwracania znaku i pokaż przykład krok po kroku."
      }
    ],
    "real_world_applications": [
      {
        "context": "Budżet domowy",
        "problem_description": "Ile maksymalnie można wydać na rozrywkę, jeśli dochód to 3000 zł, a wydatki stałe to 2200 zł?",
        "age_group": "liceum", 
        "connection_explanation": "Nierówność: wydatki_stałe + rozrywka $\\leq$ dochód."
      }
    ],
    "pedagogical_notes": {
      "common_mistakes": [
        "Brak odwrócenia znaku przy dzieleniu przez liczbę ujemną",
        "Błędne przenoszenie składników na drugą stronę"
      ],
      "teaching_tips": [
        "Używaj osi liczbowej do wizualizacji rozwiązań",
        "Zawsze sprawdzaj wartość graniczną i przykład ze środka zbioru"
      ],
      "prerequisites": ["Rozwiązywanie równań liniowych", "Działania na liczbach rzeczywistych"],
      "estimated_time": 2700,
      "difficulty_progression": "Start: $x>a$; dalej: $ax>b$; finał: $ax+b>c$, także z liczbami ujemnymi."
    }
  };

  return await importSingleSkillFromJSON(fixedJsonData);
};

// Absolute value skill import function
export const importAbsoluteValueSkill = async (): Promise<SkillImportResult> => {
  const skill = {
    skillId: "absolute-value-definition-cl1",
    skillName: "Wartość bezwzględna - definicja i własności",
    department: "algebra",
    class_level: 1,
    estimated_duration: 2700,
    generator_params: {
      microSkill: "default",
      difficultyRange: [1, 4],
      fallbackTrigger: "use_basic_absolute_patterns"
    },
    theory: {
      theory_text: "Wartość bezwzględna liczby to jej odległość od zera na osi liczbowej. Zawsze jest nieujemna: $|a|\\geq 0$, przy czym $|a|=|-a|$. Dla liczb $a,b$ zachodzi $|ab|=|a||b|$. Definicja kawałkowa: $|x|=x$ dla $x\\geq 0$ oraz $|x|=-x$ dla $x<0$. Graficznie: liczby o tej samej odległości od zera mają tę samą wartość bezwzględną, np. $|-3|=|3|=3$.",
      key_formulas: ["$|a|\\geq 0$", "$|ab|=|a||b|$", "$|x|=x\\ (x\\geq0)$", "$|x|=-x\\ (x<0)$"],
      time_estimate: 300,
      difficulty_level: 1
    },
    examples: [
      {
        example_code: "ABS_001",
        problem_statement: "Oblicz: $|5|$, $|-3|$, $|0|$.",
        solution_steps: [
          { step: "Zastosuj definicję odległości od zera", latex: "$|5|=5$", explanation: "Pięć jest 5 jednostek od zera." },
          { step: "Zastosuj symetrię względem zera", latex: "$|-3|=3$", explanation: "Odległość $-3$ od zera wynosi 3." },
          { step: "Zauważ, że zero jest w punkcie 0", latex: "$|0|=0$", explanation: "Odległość zera od zera to 0." }
        ],
        final_answer: "$|5|=5$, $|-3|=3$, $|0|=0$",
        explanation: "Wartość bezwzględna jest nieujemna i oznacza odległość od 0.",
        time_estimate: 120,
        difficulty_level: 1
      },
      {
        example_code: "ABS_002",
        problem_statement: "Oblicz: $|2-5|$ oraz $|\\pi-4|$.",
        solution_steps: [
          { step: "Uprość wyrażenie wewnątrz kreski", latex: "$2-5=-3$", explanation: "Najpierw licz w środku." },
          { step: "Weź wartość bezwzględną", latex: "$|-3|=3$", explanation: "Odległość od 0 to 3." },
          { step: "Oceń znak $\\pi-4$", latex: "$\\pi-4<0$", explanation: "Bo $\\pi\\approx3{,}14$." },
          { step: "Zapisz bezwzględną w formie dodatniej", latex: "$|\\pi-4|=4-\\pi$", explanation: "Przeciwieństwo liczby ujemnej." }
        ],
        final_answer: "$|2-5|=3$, $|\\pi-4|=4-\\pi$",
        explanation: "Najpierw licz wewnątrz, potem stosuj definicję $|x|$.",
        time_estimate: 150,
        difficulty_level: 2
      },
      {
        example_code: "ABS_003",
        problem_statement: "Zapisz $|x-2|$ w postaci kawałkowej.",
        solution_steps: [
          { step: "Ustal warunki znaku", latex: "$x-2\\geq0\\Leftrightarrow x\\geq2$", explanation: "Dla $x\\geq2$ wyrażenie nieujemne." },
          { step: "Zastosuj definicję dla $x\\geq2$", latex: "$|x-2|=x-2$", explanation: "Nie zmieniamy znaku." },
          { step: "Dla $x<2$ wyrażenie ujemne", latex: "$|x-2|=2-x$", explanation: "Przeciwny znak usuwa minus." }
        ],
        final_answer: "$|x-2|=\\begin{cases}x-2,&x\\geq2\\\\2-x,&x<2\\end{cases}$",
        explanation: "Definicja kawałkowa zależy od znaku $x-2$.",
        time_estimate: 160,
        difficulty_level: 2
      },
      {
        example_code: "ABS_004",
        problem_statement: "Wykorzystaj własność $|ab|=|a||b|$ dla $a=-3$, $b=4$.",
        solution_steps: [
          { step: "Policz iloczyn", latex: "$ab=-12$", explanation: "Iloczyn liczb o przeciwnych znakach." },
          { step: "Weź wartość bezwzględną iloczynu", latex: "$|-12|=12$", explanation: "Odległość 12 od 0 to 12." },
          { step: "Porównaj z iloczynem wartości", latex: "$|a||b|=3\\cdot4=12$", explanation: "Zgadza się z $|ab|$." }
        ],
        final_answer: "$|-12|=|{-3}\\cdot4|=|{-3}|\\cdot|4|=12$",
        explanation: "Własność $|ab|=|a||b|$ ułatwia obliczenia.",
        time_estimate: 130,
        difficulty_level: 2
      },
      {
        example_code: "ABS_005",
        problem_statement: "Porównaj $|-7|$ i $|5|$.",
        solution_steps: [
          { step: "Oblicz wartości bezwzględne", latex: "$|-7|=7$", explanation: "Odległość 7 od zera." },
          { step: "Oblicz drugą wartość", latex: "$|5|=5$", explanation: "Odległość 5 od zera." },
          { step: "Porównaj liczby", latex: "$7>5$", explanation: "Wynika $|-7|>|5|$." }
        ],
        final_answer: "$|-7|>|5|$",
        explanation: "Większa odległość od zera oznacza większą wartość bezwzględną.",
        time_estimate: 120,
        difficulty_level: 1
      }
    ],
    practice_exercises: [
      {
        exercise_code: "ABS_EX_001",
        problem_statement: "Oblicz: $|-12|$, $|0|$, $|7|$.",
        expected_answer: "12, 0, 7",
        difficulty_level: 1,
        time_estimate: 150,
        misconception_map: [
          {
            incorrect_answer: "-12, 0, 7",
            misconception_type: "sign_confusion",
            feedback: "Wartość bezwzględna jest nieujemna: $|-12|=12$."
          },
          {
            incorrect_answer: "12, undefined, 7",
            misconception_type: "zero_confusion",
            feedback: "$|0|=0$, bo odległość zera od zera to 0."
          }
        ]
      },
      {
        exercise_code: "ABS_EX_002",
        problem_statement: "Oblicz: $|3-10|$ oraz $|4-\\pi|$.",
        expected_answer: "7, $4-\\pi$",
        difficulty_level: 2,
        time_estimate: 170,
        misconception_map: [
          {
            incorrect_answer: "-7, $\\pi-4$",
            misconception_type: "order_error",
            feedback: "Najpierw policz w środku: $3-10=-7$, więc $|-7|=7$."
          },
          {
            incorrect_answer: "7, $\\pi-4$",
            misconception_type: "sign_confusion",
            feedback: "Ponieważ $4>\\pi$, to $|4-\\pi|=4-\\pi$ (liczba dodatnia)."
          }
        ]
      },
      {
        exercise_code: "ABS_EX_003",
        problem_statement: "Zapisz bez wartości bezwzględnej: $|x-3|$.",
        expected_answer: "$x-3$ dla $x\\geq3$, $3-x$ dla $x<3$",
        difficulty_level: 2,
        time_estimate: 180,
        misconception_map: [
          {
            incorrect_answer: "$x-3$",
            misconception_type: "piecewise_missing",
            feedback: "Podaj dwa przypadki w zależności od znaku $x-3$."
          },
          {
            incorrect_answer: "$x-3$ dla $x\\geq3$, $x-3$ dla $x<3$",
            misconception_type: "sign_flip",
            feedback: "Dla $x<3$ masz $x-3<0$, więc $|x-3|=-(x-3)=3-x$."
          }
        ]
      },
      {
        exercise_code: "ABS_EX_004",
        problem_statement: "Rozwiąż nierówność: $|x|\\leq5$.",
        expected_answer: "$-5\\leq x\\leq 5$",
        difficulty_level: 3,
        time_estimate: 200,
        misconception_map: [
          {
            incorrect_answer: "$x\\leq5$",
            misconception_type: "interval_error",
            feedback: "$|x|\\leq5$ oznacza odległość od 0 nie większą niż 5, czyli przedział domknięty."
          },
          {
            incorrect_answer: "$-5< x< 5$",
            misconception_type: "strict_non_strict",
            feedback: "Znak $\\leq$ obejmuje równość, więc $x=\\pm5$ też spełnia."
          }
        ]
      },
      {
        exercise_code: "ABS_EX_005",
        problem_statement: "Rozwiąż: $|x-2|<3$.",
        expected_answer: "$-1<x<5$",
        difficulty_level: 3,
        time_estimate: 220,
        misconception_map: [
          {
            incorrect_answer: "$x<5$",
            misconception_type: "two_sided_setup",
            feedback: "Ustaw nierówność podwójną: $-3<x-2<3$, a potem dodaj 2."
          },
          {
            incorrect_answer: "$-1\\leq x\\leq 5$",
            misconception_type: "strict_non_strict",
            feedback: "Znak $<$ daje przedział otwarty: końce $-1$ i $5$ nie należą."
          }
        ]
      },
      {
        exercise_code: "ABS_EX_006",
        problem_statement: "Uprość wyrażenie: $|{-2}x|$.",
        expected_answer: "$2|x|$",
        difficulty_level: 2,
        time_estimate: 160,
        misconception_map: [
          {
            incorrect_answer: "$-2|x|$",
            misconception_type: "product_property",
            feedback: "Użyj $|ab|=|a||b|$: $|{-2}x|=|{-2}||x|=2|x|$."
          },
          {
            incorrect_answer: "$2x$",
            misconception_type: "drop_abs",
            feedback: "Nie wolno usuwać kresek bez analizy znaku: $|x|\\neq x$ dla $x<0$."
          }
        ]
      }
    ],
    misconception_patterns: [
      {
        pattern_code: "ABS_SIGN_NEG",
        description: "Błędne przekonanie, że $|{-a}|=-|a|$",
        example_error: "$|-7|=-7$",
        intervention_strategy: "Wracamy do definicji odległości od 0 i przykładów symetrycznych: $|-7|=7$."
      },
      {
        pattern_code: "ABS_SUM_ALWAYS",
        description: "Założenie, że $|a+b|=|a|+|b|$ zawsze",
        example_error: "$|2+(-3)|=|2|+|{-3}|$",
        intervention_strategy: "Kontrprzykład: $|2-3|=1$, lecz $|2|+|{-3}|=5$."
      },
      {
        pattern_code: "ABS_EQUALS_X",
        description: "Mylenie $|x|$ z $x$ dla $x<0$",
        example_error: "$|x|=x$ dla wszystkich $x$",
        intervention_strategy: "Wprowadź definicję kawałkową i liczby ujemne jako kontrprzykłady."
      },
      {
        pattern_code: "ABS_DISTANCE_ZERO",
        description: "Brak rozumienia odległości od zera",
        example_error: "$|-3|<0$",
        intervention_strategy: "Wizualizacja na osi: odległość nie może być ujemna."
      }
    ],
    real_world_applications: [
      {
        context: "Temperatura i odchylenia",
        problem_description: "Różnica temperatury od 0°C: dzień zimniejszy o 7°C ma odchylenie 7.",
        age_group: "liceum",
        connection_explanation: "Odległość od 0: $|{-7}|=7$ stopni."
      },
      {
        context: "Błąd pomiaru w fizyce",
        problem_description: "Wynik $x$ z niepewnością $\\pm0{,}2$ m.",
        age_group: "liceum",
        connection_explanation: "Błąd zapiszemy jako $|x-x_0|\\leq0{,}2$."
      },
      {
        context: "GPS i odległość na osi",
        problem_description: "Pozycja auta na prostej drodze względem punktu 0.",
        age_group: "liceum",
        connection_explanation: "Odległość od punktu 0: $|x|$ km."
      },
      {
        context: "Kontrola jakości",
        problem_description: "Długość śruby ma być w granicach $10\\pm0{,}1$ mm.",
        age_group: "liceum",
        connection_explanation: "Warunek jakości: $|x-10|\\leq0{,}1$."
      }
    ],
    pedagogical_notes: {
      common_mistakes: [
        "Traktowanie $|{-a}|$ jako $-{|a|}$",
        "Pomijanie przypadku ujemnego w definicji kawałkowej",
        "Zakładanie $|a+b|=|a|+|b|$ bez warunków",
        "Błędna interpretacja odległości na osi jako liczby ze znakiem"
      ],
      teaching_tips: [
        "Zaczynaj od intuicji odległości i osi liczbowej.",
        "Ćwicz definicję kawałkową krótkimi zadaniami na progi.",
        "Dawaj kontrprzykłady dla własności sumy.",
        "Proś ucznia o werbalny opis: \"jak daleko od zera?\""
      ],
      prerequisites: ["Działania na liczbach rzeczywistych", "Porządek liczb na osi liczbowej"],
      estimated_time: 2700,
      difficulty_progression: "Start: obliczanie $|a|$; dalej: wyrażenia $|u(a)|$; następnie definicja kawałkowa $|x-c|$; proste nierówności z $|x|$."
    },
    assessment_rubric: {
      scope: "Ocena zestawu 10 zadań z wartości bezwzględnej (poziom klasa 1)",
      criteria: [
        {
          skill: "Obliczanie wartości bezwzględnych",
          beginner: "Poprawnie oblicza $|a|$ dla $a\\in\\{-10..10\\}$ w 6/10 przypadków.",
          intermediate: "Poprawnie oblicza $|u|$ dla prostych wyrażeń w 8/10 przypadków.",
          advanced: "Bez błędów i z uzasadnieniem porównuje $|a|$, $|b|$ oraz ocenia znaki."
        },
        {
          skill: "Definicja kawałkowa",
          beginner: "Częściowo rozróżnia przypadki dla $|x-c|$.",
          intermediate: "Poprawnie tworzy dwa przypadki i przechodzi między formami.",
          advanced: "Sprawnie stosuje definicję w zadaniach z progami i nierównościami."
        },
        {
          skill: "Interpretacja geometryczna",
          beginner: "Rysuje punkt na osi, ale myli odległość ze znakiem.",
          intermediate: "Poprawnie odczytuje odległość od 0 i progu $c$.",
          advanced: "Samodzielnie modeluje sytuacje praktyczne jako $|x-c|\\leq r$."
        },
        {
          skill: "Własności",
          beginner: "Używa $|a|\\geq0$ i $|a|=|-a|$ w prostych przykładach.",
          intermediate: "Stosuje $|ab|=|a||b|$ oraz poprawnie upraszcza wyrażenia.",
          advanced: "Rozpoznaje, kiedy własności sumy nie działają; podaje kontrprzykłady."
        }
      ]
    }
  };

  return await importSingleSkillFromJSON(skill);
};

// Quadratic Inequalities skill import function
export const importQuadraticInequalitiesSkill = async (): Promise<SkillImportResult> => {
  const skillData = {
    "skillId": "quadratic-inequalities-cl1",
    "skillName": "Nierówności kwadratowe",
    "class_level": 1,
    "department": "algebra",
    "generator_params": {
      "microSkill": "quadratic_inequality_solving",
      "difficultyRange": [2, 5],
      "fallbackTrigger": "use_basic_quadratic_patterns"
    },
    "teaching_flow": {
      "phase1": { "name": "Wprowadzenie", "duration": 1200, "activities": ["theory", "guided_examples"] },
      "phase2": { "name": "Ćwiczenia", "duration": 1800, "activities": ["practice", "feedback"] },
      "phase3": { "name": "Utrwalanie", "duration": 900, "activities": ["mastery_tasks", "assessment"] }
    },
    "content": {
      "theory": {
        "theory_text": "Nierówność kwadratowa dotyczy znaku trójmianu $ax^2+bx+c$ ($>0$, $<0$, $\\geq0$, $\\leq0$). Badamy znak funkcji kwadratowej przez miejsca zerowe i ramiona paraboli (znak $a$). Kluczowa rola dyskryminantu: $\\Delta=b^2-4ac$. Gdy $\\Delta>0$, mamy dwa pierwiastki $x_1<x_2$ i znak zmienia się na zewnątrz/wewnątrz zgodnie z $a$. Gdy $\\Delta=0$, jeden pierwiastek podwójny: znak jak $a$, a równość tylko w punkcie. Gdy $\\Delta<0$, brak miejsc zerowych: znak stały jak $a$. W postaci iloczynowej $a(x-x_1)(x-x_2)$ łatwo odczytać schemat znaków i przedziały rozwiązań na osi OX.",
        "key_formulas": ["$\\Delta=b^2-4ac$", "$ax^2+bx+c=a(x-x_1)(x-x_2)$", "$\\text{sgn}(ax^2+bx+c)$ zależy od $a$ i pierwiastków"],
        "time_estimate": 460,
        "difficulty_level": 3
      },
      "examples": [
        {
          "example_code": "QUAD_INE_001",
          "problem_statement": "Rozwiąż: $x^2-5x+6>0$.",
          "solution_steps": [
            { "step": "Rozkład na czynniki", "latex": "$x^2-5x+6=(x-2)(x-3)$", "explanation": "Łatwe czynniki o sumie 5 i iloczynie 6." },
            { "step": "Wyznacz miejsca zerowe", "latex": "$x_1=2,\\ x_2=3$", "explanation": "Parabola przecina oś OX w 2 i 3." },
            { "step": "Oceń znak dla $a>0$", "latex": "$a=1>0$", "explanation": "Parabola w górę: dodatnia na zewnątrz pierwiastków." },
            { "step": "Zapisz rozwiązanie", "latex": "$x\\in(-\\infty,2)\\cup(3,\\infty)$", "explanation": "Poza przedziałem między pierwiastkami." }
          ],
          "final_answer": "$(-\\infty,2)\\cup(3,\\infty)$",
          "explanation": "Graficznie parabola powyżej osi poza przedziałem $[2,3]$.",
          "time_estimate": 200,
          "difficulty_level": 2
        },
        {
          "example_code": "QUAD_INE_002",
          "problem_statement": "Rozwiąż: $2x^2+3x+5>0$.",
          "solution_steps": [
            { "step": "Policz dyskryminant", "latex": "$Δ=3^2-4\\cdot2\\cdot5=-31<0$", "explanation": "Brak miejsc zerowych." },
            { "step": "Ustal znak trójmianu", "latex": "$a=2>0$", "explanation": "Parabola w górę: funkcja zawsze dodatnia." },
            { "step": "Wniosek", "latex": "$2x^2+3x+5>0\\ \\forall x\\in\\mathbb{R}$", "explanation": "Prawdziwe dla wszystkich liczb rzeczywistych." }
          ],
          "final_answer": "$\\mathbb{R}$",
          "explanation": "Wykres leży cały czas nad osią OX.",
          "time_estimate": 190,
          "difficulty_level": 2
        },
        {
          "example_code": "QUAD_INE_003",
          "problem_statement": "Rozwiąż: $x^2-2x+1≤0$.",
          "solution_steps": [
            { "step": "Zauważ postać kwadratu", "latex": "$x^2-2x+1=(x-1)^2$", "explanation": "Pierwiastek podwójny $x=1$ ($Δ=0$)." },
            { "step": "Analiza znaku kwadratu", "latex": "$(x-1)^2≥0$", "explanation": "Kwadrat jest nieujemny dla każdego $x$." },
            { "step": "Zastosuj $≤0$", "latex": "$(x-1)^2≤0\\Rightarrow x=1$", "explanation": "Równość tylko w punkcie styku." }
          ],
          "final_answer": "$\\{1\\}$",
          "explanation": "Parabola styka oś w $x=1$; poniżej osi tylko w tym punkcie (z równością).",
          "time_estimate": 200,
          "difficulty_level": 3
        },
        {
          "example_code": "QUAD_INE_004",
          "problem_statement": "Rozwiąż: $-x^2+4x-3≤0$.",
          "solution_steps": [
            { "step": "Wyznacz pierwiastki", "latex": "-x^2+4x-3=0\\ \\Leftrightarrow\\ x^2-4x+3=0\\Rightarrow x=1,3", "explanation": "Przekształcenie przez $-1$ i rozkład." },
            { "step": "Oceń ramiona", "latex": "$a=-1<0$", "explanation": "Parabola w dół: dodatnia wewnątrz $[1,3]$, ujemna na zewnątrz." },
            { "step": "Zapisz rozwiązanie", "latex": "$x\\in(-\\infty,1]\\cup[3,\\infty)$", "explanation": "Warunek $≤0$ obejmuje końce przedziałów." }
          ],
          "final_answer": "$(-\\infty,1]\\cup[3,\\infty)$",
          "explanation": "Wykres poniżej lub na osi poza $[1,3]$.",
          "time_estimate": 210,
          "difficulty_level": 3
        },
        {
          "example_code": "QUAD_INE_005",
          "problem_statement": "Rozwiąż: $(x+1)(x-4)>2x$.",
          "solution_steps": [
            { "step": "Przenieś wszystko na jedną stronę", "latex": "$(x+1)(x-4)-2x>0$", "explanation": "Sprowadzamy do trójmianu." },
            { "step": "Upraszczaj", "latex": "$x^2-3x-4-2x=x^2-5x-4$", "explanation": "Redukcja wyrazów podobnych." },
            { "step": "Policz pierwiastki", "latex": "$Δ=25+16=41,\\ x=\\frac{5\\pm\\sqrt{41}}{2}$", "explanation": "Dwa miejsca zerowe." },
            { "step": "Oceń znak dla $a>0$", "latex": "$x\\in(-\\infty,\\tfrac{5-\\sqrt{41}}{2})\\cup(\\tfrac{5+\\sqrt{41}}{2},\\infty)$", "explanation": "Parabola w górę: dodatnia na zewnątrz." }
          ],
          "final_answer": "$(-\\infty,\\tfrac{5-\\sqrt{41}}{2})\\cup(\\tfrac{5+\\sqrt{41}}{2},\\infty)$",
          "explanation": "Graficznie parabola nad osią poza przedziałem między pierwiastkami.",
          "time_estimate": 220,
          "difficulty_level": 4
        }
      ],
      "practice_exercises": [
        {
          "exercise_code": "QUAD_EX_001",
          "problem_statement": "Rozwiąż: $x^2-x-6≥0$.",
          "expected_answer": "$x\\in(-\\infty,-2]\\cup[3,\\infty)$",
          "difficulty_level": 2,
          "time_estimate": 200,
          "misconception_map": {
            "incorrect_answer_1": { "type": "interval_in_out", "feedback": "Dla $a>0$ warunek $≥0$ spełniony poza przedziałem między pierwiastkami." },
            "incorrect_answer_2": { "type": "factoring_error", "feedback": "Poprawny rozkład: $(x-3)(x+2)$." }
          }
        },
        {
          "exercise_code": "QUAD_EX_002",
          "problem_statement": "Rozwiąż: $-2x^2+8x-6>0$.",
          "expected_answer": "$x\\in(1,3)$",
          "difficulty_level": 3,
          "time_estimate": 210,
          "misconception_map": {
            "incorrect_answer_1": { "type": "leading_sign", "feedback": "Przy $a<0$ dodatnie wartości są między pierwiastkami." },
            "incorrect_answer_2": { "type": "flip_wrong", "feedback": "Mnożąc przez $-1$ przy przekształceniach pamiętaj o odwróceniu znaku nierówności tylko wtedy, gdy naprawdę mnożysz/dzielisz obie strony przez liczbę ujemną." }
          }
        },
        {
          "exercise_code": "QUAD_EX_003",
          "problem_statement": "Rozwiąż: $x^2-6x+9≤0$.",
          "expected_answer": "$x=3$",
          "difficulty_level": 3,
          "time_estimate": 180,
          "misconception_map": {
            "incorrect_answer_1": { "type": "endpoint_missing", "feedback": "Dla $≤0$ uwzględnij równość: $(x-3)^2≤0$ tylko dla $x=3$." },
            "incorrect_answer_2": { "type": "all_reals", "feedback": "Kwadrat nie jest ujemny dla innych $x$." }
          }
        },
        {
          "exercise_code": "QUAD_EX_004",
          "problem_statement": "Rozwiąż: $x^2+4x+5<0$.",
          "expected_answer": "Brak rozwiązań",
          "difficulty_level": 3,
          "time_estimate": 200,
          "misconception_map": {
            "incorrect_answer_1": { "type": "discriminant_ignored", "feedback": "$Δ=16-20<0$ i $a>0$ $\\Rightarrow$ trójmian zawsze dodatni." },
            "incorrect_answer_2": { "type": "wrong_all_reals", "feedback": "Nierówność $<0$ nie może być spełniona przez wszystkie $x$ przy paraboli w górę bez zer." }
          }
        },
        {
          "exercise_code": "QUAD_EX_005",
          "problem_statement": "Rozwiąż: $(x-2)(x+1)≤x+5$.",
          "expected_answer": "$x\\in\\big[1-2\\sqrt{2},\\ 1+2\\sqrt{2}\\big]$",
          "difficulty_level": 4,
          "time_estimate": 230,
          "misconception_map": {
            "incorrect_answer_1": { "type": "algebra_transform", "feedback": "Sprowadź do trójmianu: $x^2-2x-7≤0$ i użyj $Δ=32$." },
            "incorrect_answer_2": { "type": "interval_in_out", "feedback": "Dla $a>0$ warunek $≤0$ daje przedział między pierwiastkami (z końcami włączonymi)." }
          }
        },
        {
          "exercise_code": "QUAD_EX_006",
          "problem_statement": "Firma osiąga zysk $P(x)=-x^2+10x-21$. Dla jakich $x$ zysk jest nieujemny ($P(x)≥0$)?",
          "expected_answer": "$x\\in[3,7]$",
          "difficulty_level": 4,
          "time_estimate": 230,
          "misconception_map": {
            "incorrect_answer_1": { "type": "orientation_error", "feedback": "Przy $a<0$ wartości $≥0$ występują między pierwiastkami." },
            "incorrect_answer_2": { "type": "endpoint_missing", "feedback": "Warunek $≥0$ obejmuje $x=3$ i $x=7$." }
          }
        }
      ]
    },
    "misconception_patterns": [
      {
        "pattern_code": "QUAD_LEADING_SIGN",
        "description": "Pomijanie znaku współczynnika przy $x^2$ i błędny wybór \"wewnątrz\" vs \"na zewnątrz\".",
        "example_error": "Dla $-x^2+4x-3>0$ podanie $(-\\infty,1)\\cup(3,\\infty)$ zamiast $(1,3)$.",
        "intervention_strategy": "Narysuj szkic paraboli dla $a<0$ (ramiona w dół); podkreśl, że dodatnie wartości są między pierwiastkami."
      },
      {
        "pattern_code": "QUAD_FLIP_CONFUSION",
        "description": "Mylenie kierunku nierówności przy mnożeniu przez $-1$ podczas przekształceń.",
        "example_error": "$-2x^2+8x-6>0\\ \\Rightarrow\\ 2x^2-8x+6>0$ (zamiast $<0$).",
        "intervention_strategy": "Przypomnienie: gdy mnożysz/dzielisz CAŁĄ nierówność przez liczbę ujemną, odwracasz znak."
      },
      {
        "pattern_code": "QUAD_ENDPOINTS",
        "description": "Ignorowanie równości w nierównościach nieostrych ($≤,\\ ≥$).",
        "example_error": "Dla $(x-3)^2≤0$ odpowiedź $\\varnothing$ lub $x\\in(-\\infty,3)\\cup(3,\\infty)$.",
        "intervention_strategy": "Zaznacz końce przedziałów pełnym kółkiem; sprawdź wartości graniczne w podstawieniu."
      },
      {
        "pattern_code": "QUAD_GRAPH_ORIENTATION",
        "description": "Błędna interpretacja graficzna (ramiona w dół/górę).",
        "example_error": "Dla $a>0$ przyjęcie, że trójmian $>0$ między pierwiastkami.",
        "intervention_strategy": "Ćwiczenia ze szkicowaniem wykresów dla $a>0$ i $a<0$ + tablica znaków."
      },
      {
        "pattern_code": "QUAD_SIGN_TABLE_MISREAD",
        "description": "Nieprawidłowe odczytanie przedziałów z tablicy znaków.",
        "example_error": "Odwrotne przypisanie znaków dla przedziałów wyznaczonych przez pierwiastki.",
        "intervention_strategy": "Użyj test-point: sprawdź jeden punkt w każdym przedziale, potwierdź znak."
      }
    ],
    "real_world_applications": [
      {
        "context": "Optymalizacja zysku",
        "problem_description": "Zysk modelowany $P(x)=-ax^2+bx+c$. Znajdź zakres sprzedaży $x$, dla którego $P(x)≥0$.",
        "age_group": "liceum",
        "connection_explanation": "Nierówność kwadratowa $P(x)≥0$ wyznacza opłacalny przedział."
      },
      {
        "context": "Ruch ciała",
        "problem_description": "Wysokość $h(t)=-\\tfrac{1}{2}gt^2+v_0t+h_0$. Dla jakich $t$ obiekt jest nad ziemią ($h(t)≥0$)?",
        "age_group": "liceum",
        "connection_explanation": "Rozwiązujemy $h(t)≥0$ – zakres czasu między pierwiastkami."
      },
      {
        "context": "Geometria i pole",
        "problem_description": "Warunek na dodatniość pola trójkąta w zależności od parametru $x$ sprowadza się do trójmianu.",
        "age_group": "liceum",
        "connection_explanation": "Nierówność $ax^2+bx+c>0$ gwarantuje dodatnie pole."
      },
      {
        "context": "Kontrola jakości",
        "problem_description": "Parametr produktu spełnia $q(x)=ax^2+bx+c≤0$ w granicach tolerancji.",
        "age_group": "liceum",
        "connection_explanation": "Przedział akceptacji to część osi wyznaczona przez nierówność kwadratową."
      }
    ],
    "pedagogical_notes": {
      "common_mistakes": [
        "Nieodróżnianie roli znaku $a$ (ramiona paraboli).",
        "Pominięcie równości w $\\leq,\\ \\geq$ i błędne końce przedziałów.",
        "Zamiana \"wewnątrz\" i \"na zewnątrz\" dla $a>0$/$a<0$.",
        "Błędy w $\\Delta$ i w obliczaniu pierwiastków."
      ],
      "teaching_tips": [
        "Zawsze zaczynaj od szkicu paraboli i tablicy znaków.",
        "Po wyznaczeniu pierwiastków użyj punktu testowego w każdym przedziale.",
        "Ucz kontrprzykładów: $\\Delta<0$ z $a>0$ $\\Rightarrow$ brak rozwiązań dla $<0$, ale $>0$ dla wszystkich $x$.",
        "Podkreślaj różnicę między $>$/$<$ a $\\geq$/$\\leq$ (otwarte vs domknięte końce)."
      ],
      "prerequisites": ["Równania kwadratowe i $\\Delta$", "Rozkład na czynniki", "Nierówności liniowe i zapis przedziałów"],
      "estimated_time": 3900,
      "difficulty_progression": "Start: rozpoznawanie znaku dla $\\Delta<0/==0/>0$; dalej: iloczynowa i tablica znaków; finał: przekształcenia do trójmianu i zadania aplikacyjne."
    },
    "assessment_rubric": {
      "scope": "Ocena zestawu 10 zadań z nierówności kwadratowych (klasa 1).",
      "criteria": [
        {
          "skill": "Identyfikacja znaku i szkic paraboli",
          "beginner": "Rozpoznaje znak $a$ i orientację paraboli w 5/10 zadań.",
          "intermediate": "Poprawnie szkicuje i wskazuje obszary $>0/<0$ w 8/10 zadań.",
          "advanced": "Bez szkicu potrafi odczytać przedziały z tablicy znaków i uzasadnić wybór."
        },
        {
          "skill": "Obliczanie pierwiastków i użycie $Δ$",
          "beginner": "Liczy $Δ$ z drobnymi błędami rachunkowymi.",
          "intermediate": "Poprawnie wyznacza pierwiastki i kolejność $x_1<x_2$.",
          "advanced": "Sprawnie rozpoznaje przypadki $\\Delta\\leq0$ i wyciąga wnioski o zbiorze rozwiązań."
        },
        {
          "skill": "Zapis rozwiązań i granice",
          "beginner": "Myli zapis przedziałów i nie uwzględnia równości.",
          "intermediate": "Poprawnie zapisuje przedziały, zwykle z poprawnymi końcami.",
          "advanced": "Konsekwentnie poprawny zapis, kontrola końców i test punktu."
        },
        {
          "skill": "Przekształcenia algebraiczne",
          "beginner": "Trudności ze sprowadzaniem do trójmianu.",
          "intermediate": "Sprowadza poprawnie i rozwiązuje większość zadań.",
          "advanced": "Sprawnie upraszcza złożone nierówności i interpretuje wyniki w kontekście."
        }
      ]
    }
  };

  return await importSingleSkillFromJSON(skillData);
};

// Absolute Value Equations and Inequalities skill import function
export const importAbsoluteValueEquationsSkill = async (): Promise<SkillImportResult> => {
  const skillData = {
    "skillId": "equations-inequalities-absolute-value-cl2",
    "skillName": "Równania i nierówności z wartością bezwzględną",
    "class_level": 2,
    "department": "algebra",
    "generator_params": {
      "microSkill": "absolute_value_equations_inequalities",
      "difficultyRange": [2, 5],
      "fallbackTrigger": "use_basic_absolute_equation_patterns"
    },
    "teaching_flow": {
      "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] },
      "phase2": { "name": "Ćwiczenia", "duration": 1800, "activities": ["practice", "feedback"] },
      "phase3": { "name": "Utrwalanie", "duration": 900, "activities": ["mastery_tasks", "assessment"] }
    },
    "content": {
      "theory": {
        "theory_text": "Wartość bezwzględną traktujemy jako odległość od zera. Równania $|f(x)|=a$: gdy $a>0$, rozwiązujemy $f(x)=a$ lub $f(x)=-a$; gdy $a=0$, rozwiązujemy $f(x)=0$; gdy $a<0$, brak rozwiązań. Dla $|f(x)|=|g(x)|$ mamy dwa przypadki: $f(x)=g(x)$ lub $f(x)=-g(x)$. Nierówności: $|f(x)|<a$ (z $a>0$) daje $-a<f(x)<a$, a $|f(x)|>a$ daje $f(x)<-a$ lub $f(x)>a$. Dla $|f(x)|<|g(x)|$ korzystamy z równoważności $f(x)^2<g(x)^2$. Interpretacja geometryczna: $|x-c|\\leq r$ opisuje punkty na osi w odległości najwyżej $r$ od $c$.",
        "key_formulas": [
          "$|x|=\\begin{cases}x,&x≥0\\\\-x,&x<0\\end{cases}$",
          "$|f(x)|=a\\Rightarrow f(x)=a\\ \\text{lub}\\ f(x)=-a$",
          "$|f(x)|=|g(x)|\\Rightarrow f(x)=g(x)\\ \\text{lub}\\ f(x)=-g(x)$",
          "$|x|<a\\ (a>0)\\Rightarrow -a<x<a$",
          "$|x|>a\\ (a>0)\\Rightarrow x<-a\\ \\text{lub}\\ x>a$",
          "$|f(x)|<|g(x)|\\Rightarrow f(x)^2<g(x)^2$"
        ],
        "time_estimate": 460,
        "difficulty_level": 3
      },
      "examples": [
        {
          "example_code": "ABS_EQ_001",
          "problem_statement": "Rozwiąż równanie $|x|=3$.",
          "solution_steps": [
            { "step": "Zastosuj definicję równania z modułem", "latex": "$|x|=3\\Rightarrow x=3\\ \\text{lub}\\ x=-3$", "explanation": "Odległość od 0 równa 3." },
            { "step": "Sprawdzenie", "latex": "$|3|=3,\\ |-3|=3$", "explanation": "Obie wartości spełniają równanie." }
          ],
          "final_answer": "$x=3\\ \\text{lub}\\ x=-3$",
          "explanation": "Dwie liczby w odległości 3 od zera.",
          "time_estimate": 130,
          "difficulty_level": 1
        },
        {
          "example_code": "ABS_EQ_002",
          "problem_statement": "Rozwiąż równanie $|x-2|=5$.",
          "solution_steps": [
            { "step": "Dwa przypadki", "latex": "$x-2=5\\ \\text{lub}\\ x-2=-5$", "explanation": "Odległość od 2 równa 5." },
            { "step": "Rozwiąż oba", "latex": "$x=7\\ \\text{lub}\\ x=-3$", "explanation": "Proste równania liniowe." },
            { "step": "Kontrola", "latex": "$|7-2|=5,\\ |-3-2|=5$", "explanation": "Obie liczby spełniają." }
          ],
          "final_answer": "$x=7\\ \\text{lub}\\ x=-3$",
          "explanation": "Punkty oddalone o 5 od liczby 2.",
          "time_estimate": 150,
          "difficulty_level": 1
        },
        {
          "example_code": "ABS_EQ_003",
          "problem_statement": "Rozwiąż równanie $|2x+1|=7$.",
          "solution_steps": [
            { "step": "Dwa przypadki", "latex": "$2x+1=7\\ \\text{lub}\\ 2x+1=-7$", "explanation": "Definicja wartości bezwzględnej." },
            { "step": "Rozwiąż", "latex": "$x=3\\ \\text{lub}\\ x=-4$", "explanation": "Dzielimy przez 2 po odjęciu 1." },
            { "step": "Sprawdzenie", "latex": "$|2\\cdot3+1|=7,\\ |2\\cdot(-4)+1|=7$", "explanation": "Oba wyniki poprawne." }
          ],
          "final_answer": "$x=3\\ \\text{lub}\\ x=-4$",
          "explanation": "Równanie liniowe w obu gałęziach.",
          "time_estimate": 170,
          "difficulty_level": 2
        },
        {
          "example_code": "ABS_EQ_004",
          "problem_statement": "Rozwiąż nierówność $|x|≤4$.",
          "solution_steps": [
            { "step": "Zamień na nierówność podwójną", "latex": "$-4≤x≤4$", "explanation": "Odległość od 0 nie większa niż 4." },
            { "step": "Zapis przedziału", "latex": "$x\\in[-4,4]$", "explanation": "Końce włączone przez $≤$." }
          ],
          "final_answer": "$x\\in[-4,4]$",
          "explanation": "Punkty na osi w promieniu 4 od zera.",
          "time_estimate": 140,
          "difficulty_level": 2
        },
        {
          "example_code": "ABS_EQ_005",
          "problem_statement": "Rozwiąż nierówność $|x-3|>2$.",
          "solution_steps": [
            { "step": "Rozbij na sumę przedziałów", "latex": "$x-3>2\\ \\text{lub}\\ x-3<-2$", "explanation": "Odległość większa niż 2." },
            { "step": "Rozwiąż", "latex": "$x>5\\ \\text{lub}\\ x<1$", "explanation": "Dodaj 3 do obu stron." },
            { "step": "Zapis zbioru", "latex": "$x\\in(-\\infty,1)\\cup(5,\\infty)$", "explanation": "Przedziały rozłączne." }
          ],
          "final_answer": "$(-\\infty,1)\\cup(5,\\infty)$",
          "explanation": "Poza kulą o promieniu 2 wokół 3.",
          "time_estimate": 160,
          "difficulty_level": 3
        },
        {
          "example_code": "ABS_EQ_006",
          "problem_statement": "Rozwiąż równanie $|x-1|=|x+2|$.",
          "solution_steps": [
            { "step": "Użyj równoważności", "latex": "$(x-1)^2=(x+2)^2$", "explanation": "Kwadraty wartości bezwzględnych są równe." },
            { "step": "Rozwiń i uprość", "latex": "$x^2-2x+1=x^2+4x+4$", "explanation": "Redukcja $x^2$ po obu stronach." },
            { "step": "Rozwiąż liniowe", "latex": "$-6x=3\\Rightarrow x=-\\tfrac{1}{2}$", "explanation": "Jedno rozwiązanie." }
          ],
          "final_answer": "$x=-\\tfrac{1}{2}$",
          "explanation": "Punkt równo odległy od $1$ i $-2$ to ich środek.",
          "time_estimate": 180,
          "difficulty_level": 4
        }
      ],
      "practice_exercises": [
        {
          "exercise_code": "ABS_EQ_EX_001",
          "problem_statement": "Rozwiąż równanie $|x|=6$.",
          "expected_answer": "$x=6\\ \\text{lub}\\ x=-6$",
          "difficulty_level": 1,
          "time_estimate": 180,
          "misconception_map": {
            "incorrect_answer_1": { "type": "two_cases_missing", "feedback": "Pamiętaj o dwóch przypadkach: $x=\\pm6$." },
            "incorrect_answer_2": { "type": "sign_confusion", "feedback": "Wartość bezwzględna jest nieujemna; $|-6|=6$." }
          }
        },
        {
          "exercise_code": "ABS_EQ_EX_002",
          "problem_statement": "Rozwiąż równanie $|x+4|=1$.",
          "expected_answer": "$x=-5\\ \\text{lub}\\ x=-3$",
          "difficulty_level": 2,
          "time_estimate": 200,
          "misconception_map": {
            "incorrect_answer_1": { "type": "shift_error", "feedback": "Po rozwiązaniu $x+4=\\pm1$ odejmij 4: $x=-5$ lub $x=-3$." },
            "incorrect_answer_2": { "type": "a_lt_0_error", "feedback": "Sprawdź $a$: tu $a=1>0$, więc rozwiązania istnieją." }
          }
        },
        {
          "exercise_code": "ABS_EQ_EX_003",
          "problem_statement": "Rozwiąż równanie $|2x-3|=5$.",
          "expected_answer": "$x=4\\ \\text{lub}\\ x=-1$",
          "difficulty_level": 2,
          "time_estimate": 220,
          "misconception_map": {
            "incorrect_answer_1": { "type": "divide_error", "feedback": "Po $2x-3=\\pm5$ dodaj 3 i podziel przez 2." },
            "incorrect_answer_2": { "type": "two_cases_missing", "feedback": "Uwzględnij oba przypadki: $+5$ i $-5$." }
          }
        },
        {
          "exercise_code": "ABS_INE_EX_004",
          "problem_statement": "Rozwiąż nierówność $|x-2|≤7$.",
          "expected_answer": "$-5≤x≤9$",
          "difficulty_level": 3,
          "time_estimate": 240,
          "misconception_map": {
            "incorrect_answer_1": { "type": "strict_non_strict", "feedback": "Symbol $≤$ włącza końce: $x=-5$ i $x=9$ są dozwolone." },
            "incorrect_answer_2": { "type": "double_inequality_setup", "feedback": "Zapisz $-7≤x-2≤7$ i dodaj 2." }
          }
        },
        {
          "exercise_code": "ABS_INE_EX_005",
          "problem_statement": "Rozwiąż nierówność $|3x+2|>8$.",
          "expected_answer": "$x>2\\ \\text{lub}\\ x<-\\tfrac{10}{3}$",
          "difficulty_level": 3,
          "time_estimate": 240,
          "misconception_map": {
            "incorrect_answer_1": { "type": "union_vs_intersection", "feedback": "Warunek $|\\cdot|>a$ daje sumę przedziałów, nie część wspólną." },
            "incorrect_answer_2": { "type": "algebra_error", "feedback": "Po $3x+2>8$ lub $3x+2<-8$ odejmij 2 i podziel przez 3." }
          }
        },
        {
          "exercise_code": "ABS_CMP_EX_006",
          "problem_statement": "Rozwiąż nierówność $|x-1|≥|2x+3|$.",
          "expected_answer": "$x\\in[-4,-\\tfrac{2}{3}]$",
          "difficulty_level": 4,
          "time_estimate": 260,
          "misconception_map": {
            "incorrect_answer_1": { "type": "squaring_misuse", "feedback": "Możesz podnieść obie strony do kwadratu: $(x-1)^2≥(2x+3)^2$, bo obie strony są nieujemne." },
            "incorrect_answer_2": { "type": "interval_in_out", "feedback": "Po uzyskaniu $3x^2+14x+8≤0$ wybierz przedział między pierwiastkami." }
          }
        },
        {
          "exercise_code": "ABS_MIX_EX_007",
          "problem_statement": "Rozwiąż nierówność $|2x+1|-|x-2|≤3$.",
          "expected_answer": "$x\\in[-6,\\tfrac{4}{3}]$",
          "difficulty_level": 5,
          "time_estimate": 300,
          "misconception_map": {
            "incorrect_answer_1": { "type": "case_partition", "feedback": "Rozważ trzy obszary: $x<-\\tfrac{1}{2}$, $-\\tfrac{1}{2}≤x<2$, $x≥2$ i w każdym usuń moduły." },
            "incorrect_answer_2": { "type": "endpoint_check", "feedback": "Sprawdź końce: $x=-6$ i $x=\\tfrac{4}{3}$ spełniają nierówność." }
          }
        },
        {
          "exercise_code": "ABS_CMP_EX_008",
          "problem_statement": "Rozwiąż nierówność $|x+1|<|2x-5|$.",
          "expected_answer": "$x<\\tfrac{4}{3}\\ \\text{lub}\\ x>6$",
          "difficulty_level": 4,
          "time_estimate": 260,
          "misconception_map": {
            "incorrect_answer_1": { "type": "squaring_direction", "feedback": "Ponieważ moduły są nieujemne, $|\\cdot|<|\\cdot|$ jest równoważne $\\big(x+1\\big)^2<\\big(2x-5\\big)^2$." },
            "incorrect_answer_2": { "type": "interval_union_error", "feedback": "Parabola w górę $>0$ poza pierwiastkami, więc rozwiązanie to dwa przedziały." }
          }
        }
      ]
    },
    "misconception_patterns": [
      {
        "pattern_code": "ABS_TWO_CASES_MISSING",
        "description": "Pomijanie jednego z przypadków w $|f(x)|=a$.",
        "example_error": "$|x-2|=5\\Rightarrow x=7$ (brak $x=-3$).",
        "intervention_strategy": "Stosuj schemat: $f(x)=a$ LUB $f(x)=-a$ i sprawdź oba wyniki."
      },
      {
        "pattern_code": "ABS_STRICT_NONSTRICT",
        "description": "Mylenie $<$/$>$ z $≤$/$≥$ w końcach przedziałów.",
        "example_error": "$|x|≤4\\Rightarrow (-4,4)$.",
        "intervention_strategy": "Przypominaj: $≤,\\ ≥$ włączają końce (kropka pełna)."
      },
      {
        "pattern_code": "ABS_UNION_INTERSECTION",
        "description": "Błędne łączenie przedziałów dla $|x|>a$ i $|x|<a$.",
        "example_error": "$|x-3|>2\\Rightarrow (1,5)$.",
        "intervention_strategy": "Użyj modelu odległości: $>$ — poza kulą; $<$ — wewnątrz kuli."
      },
      {
        "pattern_code": "ABS_EQUAL_ABS_CONFUSION",
        "description": "Błąd przy $|f(x)|=|g(x)|$ (pomijanie przypadku z minusem).",
        "example_error": "$|x-1|=|x+2|\\Rightarrow x-1=x+2$.",
        "intervention_strategy": "Wypisz oba: $f=g$ LUB $f=-g$; ewentualnie porównaj kwadraty."
      },
      {
        "pattern_code": "ABS_GEOMETRY_MISREAD",
        "description": "Niepoprawna interpretacja odległości na osi.",
        "example_error": "$|x-2|≤3\\Rightarrow x\\in(-\\infty,5]$.",
        "intervention_strategy": "Rysuj oś: promień $3$ wokół $2$ daje $[-1,5]$."
      }
    ],
    "real_world_applications": [
      {
        "context": "Fizyka i pomiary",
        "problem_description": "Dokładność urządzenia $\\pm0{,}2$ m: wyznacz dopuszczalny błąd względem wartości $x_0$.",
        "age_group": "liceum",
        "connection_explanation": "Warunek jakości: $|x-x_0|≤0{,}2$."
      },
      {
        "context": "Geografia/GPS",
        "problem_description": "Punkty w odległości najwyżej $r$ km od bazy przy drodze liniowej.",
        "age_group": "liceum",
        "connection_explanation": "Model 1D: $|x-x_{\\text{baza}}|≤r$."
      },
      {
        "context": "Ekonomia domowa",
        "problem_description": "Odchylenie wydatków od budżetu $B$ nie powinno przekroczyć 10%.",
        "age_group": "liceum",
        "connection_explanation": "Warunek: $\\big|\\tfrac{W-B}{B}\\big|≤0{,}1$."
      },
      {
        "context": "Technologia/produkcja",
        "problem_description": "Tolerancja wymiaru $d$: $d_0\\pm0{,}05$ mm.",
        "age_group": "liceum",
        "connection_explanation": "Spełnienie normy: $|d-d_0|≤0{,}05$."
      }
    ],
    "pedagogical_notes": {
      "common_mistakes": [
        "Pomijanie jednego z przypadków w równaniach $|f(x)|=a$.",
        "Błędne włączanie/wyłączanie końców przedziału przy $≤/≥$.",
        "Mylenie sumy i części wspólnej przedziałów w $|x|>a$.",
        "Niewłaściwe użycie potęgowania przy porównywaniu modułów.",
        "Brak interpretacji geometrycznej jako odległości."
      ],
      "teaching_tips": [
        "Zawsze zaczynaj od rysunku osi i interpretacji odległości.",
        "Stosuj tabelę przypadków przed usuwaniem modułów.",
        "Dla porównań modułów używaj kwadratów i uzasadnij nieujemność.",
        "Weryfikuj rozwiązania przez podstawienie i rysunek.",
        "Dawaj kontrprzykłady, by obalić fałszywe uogólnienia."
      ],
      "prerequisites": ["Równania i nierówności liniowe", "Wartość bezwzględna – definicja kawałkowa", "Operacje na przedziałach"],
      "estimated_time": 3600,
      "difficulty_progression": "Start: proste równania $|x|=a$; dalej: przesunięcia $|x-c|=a$ i $|ax+b|=a$; następnie nierówności $|x-c|≤r$, $|x-c|>r$; finał: porównania $|f(x)|\\lessgtr|g(x)|$ i zadania mieszane."
    },
    "assessment_rubric": {
      "scope": "Ocena 10 zadań z równań i nierówności z wartością bezwzględną (klasa 2).",
      "criteria": [
        {
          "skill": "Rozwiązywanie równań z wartością bezwzględną",
          "beginner": "Rozwiązuje proste $|x|=a$ i $|x-c|=a$ w 5/10 przypadków.",
          "intermediate": "Poprawnie rozwiązuje $|ax+b|=a$ i sprawdza wyniki.",
          "advanced": "Sprawnie rozwiązuje $|f(x)|=|g(x)|$ i uzasadnia oba przypadki."
        },
        {
          "skill": "Rozwiązywanie nierówności z wartością bezwzględną",
          "beginner": "Poprawnie przepisuje $|x|≤a$ na $-a≤x≤a$ w prostych zadaniach.",
          "intermediate": "Radzi sobie z $|x-c|\\gtrless r$ oraz łączy przedziały poprawnie.",
          "advanced": "Rozwiązuje porównania $|f(x)|\\lessgtr|g(x)|$ metodą kwadratów lub przypadków."
        },
        {
          "skill": "Interpretacja geometryczna",
          "beginner": "Opisuje $|x-c|≤r$ jako odległość, ale myli końce.",
          "intermediate": "Poprawnie wskazuje i rysuje przedziały rozwiązań.",
          "advanced": "Samodzielnie modeluje sytuacje praktyczne modułem i interpretuje wyniki."
        },
        {
          "skill": "Analiza przypadków i weryfikacja",
          "beginner": "Niepełna tabela przypadków; rzadkie sprawdzanie rozwiązań.",
          "intermediate": "Tworzy kompletne przypadki i zwykle weryfikuje wyniki.",
          "advanced": "Konsekwentnie buduje przypadki, sprawdza końce i testuje punkty wewnątrz."
        }
      ]
    }
  };

  return await importSingleSkillFromJSON(skillData);
};

// Import "Definite Integral Applications" skill
export const importDefiniteIntegralApplicationsSkill = async () => {
  const skillData = {
    "skillId": "applications-definite-integral-cl3",
    "skillName": "Zastosowania całki oznaczonej (pola, objętości)",
    "class_level": 3,
    "department": "analiza_matematyczna",
    "generatorParams": {
      "microSkill": "definite_integral_applications",
      "difficultyRange": [3, 5],
      "fallbackTrigger": "use_basic_area_volume_patterns"
    },
    "teachingFlow": {
      "phase1": { "name": "Wprowadzenie", "duration": 1500, "activities": ["theory", "guided_examples"] },
      "phase2": { "name": "Ćwiczenia", "duration": 2400, "activities": ["practice", "feedback"] },
      "phase3": { "name": "Utrwalanie", "duration": 1200, "activities": ["mastery_tasks", "assessment"] }
    },
    "content": {
      "theory": {
        "theory_text": "Całka oznaczona modeluje wielkości geometryczne i fizyczne. Pole obszaru między krzywymi na przedziale to całka z różnicy funkcji górnej i dolnej. W układzie parametrycznym pole obliczamy przez całkę z iloczynu y(t) i pochodnej x'(t). Objętość bryły obrotowej wyznaczamy metodą krążków lub pierścieni. Dla przekrojów poprzecznych objętość to całka z pola przekroju A(x). Długość łuku funkcji różniczkowalnej to całka ze sqrt(1+f'(x)^2). We wszystkich zastosowaniach kluczowe są poprawne granice całkowania, właściwa funkcja górna/dolna, dobór metody i kontrola jednostek.",
        "key_formulas": [
          "A=∫|f-g|dx",
          "A=∫y(t)x'(t)dt", 
          "V=π∫f(x)²dx",
          "V=π∫(R²-r²)dx",
          "V=∫A(x)dx",
          "L=∫√{1+f'(x)²}dx"
        ],
        "time_estimate": 600,
        "difficulty_level": 4
      },
      "examples": [
        {
          "example_code": "INT_APP_001",
          "problem_statement": "Oblicz pole obszaru między y=x² i y=x+2.",
          "solution_steps": [
            { "step": "Punkty przecięcia", "latex": "x²=x+2", "explanation": "Rozwiąż x²-x-2=0 → x=-1,2." },
            { "step": "Funkcja górna/dolna", "latex": "x+2≥x²", "explanation": "Na [-1,2] prosta leży wyżej (np. w 0: 2>0)." },
            { "step": "Całka pola", "latex": "A=∫(x+2-x²)dx", "explanation": "Różnica górna–dolna na wspólnym przedziale." },
            { "step": "Oblicz całkę", "latex": "A=9/2", "explanation": "Po całkowaniu i podstawieniu granic wychodzi 9/2." }
          ],
          "final_answer": "9/2",
          "explanation": "Pole to całka z różnicy prosta–parabola od -1 do 2.",
          "time_estimate": 280,
          "difficulty_level": 3
        }
      ],
      "practice_exercises": [
        {
          "exercise_code": "INT_EX_001",
          "problem_statement": "Pole pod y=sin x nad OX na [0,π].",
          "expected_answer": "2",
          "difficulty_level": 3,
          "time_estimate": 320,
          "misconception_map": {
            "incorrect_answer_1": { "type": "integration_bounds_error", "feedback": "Upewnij się, że granice to 0 i π; całkuj sin x." }
          }
        }
      ]
    },
    "misconceptionPatterns": [
      {
        "pattern_code": "INT_BOUNDS_ERROR",
        "description": "Błędny wybór lub kolejność granic całkowania.",
        "example_error": "Błędne granice dla pola między krzywymi.",
        "intervention_strategy": "Zaznacz obszar na rysunku, wypisz punkty przecięcia i ustaw granice rosnąco."
      }
    ],
    "realWorldApplications": [
      {
        "context": "Inżynieria",
        "problem_description": "Wyznacz objętość zbiornika obrotowego o profilu y=f(x).",
        "age_group": "liceum/studia",
        "connection_explanation": "Zastosuj V=π∫f(x)²dx dla odpowiednich granic."
      }
    ],
    "pedagogicalNotes": {
      "common_mistakes": [
        "Niepoprawne granice całkowania i brak podziału przedziału.",
        "Mylenie metod: krążki vs pierścienie."
      ],
      "teaching_tips": [
        "Zawsze zaczynaj od rysunku i punktu testowego dla znaku/rzędu funkcji.",
        "Decyzję o metodzie (krążki/pierścienie) podejmuj po szkicu przekroju."
      ],
      "prerequisites": [
        "Całka oznaczona i podstawowe techniki całkowania",
        "Pochodna i interpretacja geometryczna"
      ],
      "estimated_time": 5100,
      "difficulty_progression": "Start: pola i proste bryły (krążki). Środek: pierścienie i przekroje. Finał: długość łuku i ujęcia parametryczne."
    },
    "assessmentRubric": {
      "scope": "Ocena 10 zadań z zastosowań całki oznaczonej (klasa 3/studia).",
      "criteria": [
        {
          "skill": "Pola między krzywymi",
          "beginner": "Poprawnie ustala granice i funkcję górną/dolną w 5/10.",
          "intermediate": "Dzieli przedział w punktach przecięcia, poprawnie całkuje.",
          "advanced": "Sprawnie rozwiązuje złożone obszary z podziałem i modułem."
        }
      ]
    }
  };

  return await importSingleSkillFromJSON(skillData);
};

// Import "Definite Integral Basics" skill
export const importDefiniteIntegralBasicsSkill = async () => {
  const skillData = {
    "skillName": "Całka oznaczona - definicja i obliczanie",
    "class_level": 3,
    "department": "analiza_matematyczna",
    "generator_params": {
      "microSkill": "definite_integral_basics",
      "difficultyRange": [3, 5],
      "fallbackTrigger": "use_basic_integration_patterns"
    },
    "teaching_flow": {
      "phase1": { "name": "Wprowadzenie", "duration": 1500, "activities": ["theory", "guided_examples"] },
      "phase2": { "name": "Ćwiczenia", "duration": 2400, "activities": ["practice", "feedback"] },
      "phase3": { "name": "Utrwalanie", "duration": 1200, "activities": ["mastery_tasks", "assessment"] }
    },
    "content": {
      "theory": {
        "theory_text": "Całka oznaczona ∫_a^b f(x) dx to granica sum Riemanna, czyli granica sum wartości funkcji na małych podprzedziałach pomnożonych przez ich długości, gdy maksymalna długość podprzedziału dąży do zera. Intuicyjnie jest to uogólnione pole pod wykresem funkcji f między x=a i x=b (z uwzględnieniem znaków: obszary poniżej osi OX dają ujemny wkład). Fundamentalne powiązanie różniczkowania i całkowania daje wzór Leibniza–Newtona: jeśli F jest dowolną pierwotną funkcji f na [a,b], to ∫_a^b f(x) dx = F(b) − F(a). Własności: liniowość względem funkcji (stałe można wyciągać przed znak całki, całkowanie sum rozkłada się na sumę), addytywność względem przedziału (∫_a^c = ∫_a^b + ∫_b^c), zmiana orientacji (∫_a^a = 0, ∫_a^b = −∫_b^a). Różnica między całką nieoznaczoną a oznaczoną: całka nieoznaczona to rodzina pierwotnych F(x)+C, a całka oznaczona to konkretna liczba zależna od f i granic a,b. Warunki istnienia: każda funkcja ciągła na przedziale domkniętym jest całkowalna (w sensie Riemanna); funkcje ograniczone z niewieloma punktami nieciągłości także są całkowalne. W praktyce obliczamy całki oznaczone, znajdując pierwotną i stosując wzór F(b)−F(a), ewentualnie używając własności, symetrii, podziału przedziału lub podstawienia zmiennej. Kluczowe kroki: dobór metody, poprawne granice i orientacja, weryfikacja wyniku (jednostki, znak, oszacowanie wielkości).",
        "key_formulas": [
          "$\\int_a^b f(x) dx = F(b) − F(a)$",
          "$\\int_a^b [\\alpha f(x) + \\beta g(x)] dx = \\alpha \\int_a^b f(x) dx + \\beta \\int_a^b g(x) dx$",
          "$\\int_a^c f(x) dx = \\int_a^b f(x) dx + \\int_b^c f(x) dx$",
          "$\\int_a^a f(x) dx = 0$",
          "$\\int_a^b f(x) dx = −\\int_b^a f(x) dx$",
          "Jeśli f ciągła na [a,b], to $\\int_a^b f(x) dx$ istnieje"
        ],
        "time_estimate": 600,
        "difficulty_level": 4
      },
      "examples": [
        {
          "example_code": "INT_DEF_001",
          "problem_statement": "Oblicz $\\int_0^1 x^2 dx$.",
          "solution_steps": [
            { "step": "Pierwotna", "latex": "$F(x) = \\frac{x^3}{3}$", "explanation": "Pierwotna x² to x³/3." },
            { "step": "Zastosuj wzór", "latex": "$F(1) − F(0) = \\frac{1}{3} − 0$", "explanation": "Wzór Leibniza–Newtona." },
            { "step": "Wynik", "latex": "$\\frac{1}{3}$", "explanation": "Pole pod rosnącą funkcją na [0,1]." }
          ],
          "final_answer": "$\\frac{1}{3}$",
          "explanation": "Bezpośrednie całkowanie potęgowe i podstawienie granic.",
          "time_estimate": 260,
          "difficulty_level": 3
        },
        {
          "example_code": "INT_DEF_002",
          "problem_statement": "Oblicz $\\int_0^{\\pi/2} \\sin x dx$.",
          "solution_steps": [
            { "step": "Pierwotna", "latex": "$F(x) = −\\cos x$", "explanation": "Pochodna cos x to −sin x, więc pierwotna sin x to −cos x." },
            { "step": "Podstaw granice", "latex": "$F(\\pi/2) − F(0) = (−\\cos(\\pi/2)) − (−\\cos 0)$", "explanation": "cos(π/2)=0, cos 0=1." },
            { "step": "Wynik", "latex": "$0 − (−1) = 1$", "explanation": "Pole dodatnie na [0,π/2]." }
          ],
          "final_answer": "$1$",
          "explanation": "Całka trygonometryczna przez pierwotną −cos x.",
          "time_estimate": 280,
          "difficulty_level": 3
        },
        {
          "example_code": "INT_DEF_003",
          "problem_statement": "Oblicz $\\int_0^2 (3x^2 − 2x + 1) dx$, używając liniowości.",
          "solution_steps": [
            { "step": "Rozdziel całkę", "latex": "$3\\int_0^2 x^2 dx − 2\\int_0^2 x dx + \\int_0^2 1 dx$", "explanation": "Liniowość i stałe przed całką." },
            { "step": "Oblicz składowe", "latex": "$3 \\cdot \\frac{8}{3} − 2 \\cdot 2 + 2$", "explanation": "∫₀² x² = 8/3, ∫₀² x = 2, ∫₀² 1 = 2." },
            { "step": "Zsumuj", "latex": "$8 − 4 + 2 = 6$", "explanation": "Dodaj wyniki składowych." }
          ],
          "final_answer": "$6$",
          "explanation": "Liniowość upraszcza obliczenia na sumie wielomianów.",
          "time_estimate": 300,
          "difficulty_level": 3
        },
        {
          "example_code": "INT_DEF_004",
          "problem_statement": "Pokaż addytywność: oblicz $\\int_0^3 (x − 1) dx$, dzieląc w punkcie 1.",
          "solution_steps": [
            { "step": "Podział przedziału", "latex": "$\\int_0^1 (x−1) dx + \\int_1^3 (x−1) dx$", "explanation": "Addytywność względem przedziału." },
            { "step": "Pierwotna", "latex": "$F(x)=\\frac{x^2}{2} − x$", "explanation": "Pierwotna (x−1)." },
            { "step": "Wartości", "latex": "$[F(1)−F(0)] + [F(3)−F(1)]$", "explanation": "Podstaw granice w obu częściach." },
            { "step": "Oblicz", "latex": "$(\\frac{1}{2}−1) − 0 + (\\frac{9}{2}−3) − (\\frac{1}{2}−1) = \\frac{3}{2}$", "explanation": "Suma części daje 3/2." }
          ],
          "final_answer": "$\\frac{3}{2}$",
          "explanation": "Podział przedziału nie zmienia wartości całki.",
          "time_estimate": 320,
          "difficulty_level": 3
        },
        {
          "example_code": "INT_DEF_005",
          "problem_statement": "Zinterpretuj znak: oblicz $\\int_0^2 (−x − 1) dx$.",
          "solution_steps": [
            { "step": "Pierwotna", "latex": "$F(x)= −\\frac{x^2}{2} − x$", "explanation": "Całka z −x i −1." },
            { "step": "Podstaw granice", "latex": "$F(2) − F(0) = (−2 − 2) − 0$", "explanation": "Wartość ujemna, bo wykres poniżej OX." },
            { "step": "Wynik", "latex": "$−4$", "explanation": "Ujemna \"pole-zorientowane\" odpowiada obszarowi pod osią." }
          ],
          "final_answer": "$−4$",
          "explanation": "Obszary poniżej osi OX wnoszą ujemny wkład do całki.",
          "time_estimate": 280,
          "difficulty_level": 3
        },
        {
          "example_code": "INT_DEF_006",
          "problem_statement": "Oblicz $\\int_0^1 2x \\cdot \\cos(x^2) dx$, stosując podstawienie.",
          "solution_steps": [
            { "step": "Podstawienie", "latex": "$u = x^2, du = 2x dx$", "explanation": "Zastępcza zmienna upraszcza całkę." },
            { "step": "Granice w u", "latex": "$x: 0→1 ⇒ u: 0→1$", "explanation": "Zmień granice zgodnie z u." },
            { "step": "Całka w u", "latex": "$\\int_0^1 \\cos u du = \\sin u |_0^1$", "explanation": "Pierwotna cos u to sin u." },
            { "step": "Wynik", "latex": "$\\sin 1 − 0 = \\sin 1$", "explanation": "Wartość liczbowa w radianach." }
          ],
          "final_answer": "$\\sin 1$",
          "explanation": "Klasyczny przykład podstawienia u = x² i zmiany granic.",
          "time_estimate": 340,
          "difficulty_level": 4
        }
      ],
      "practice_exercises": [
        {
          "exercise_code": "INT_DEF_EX_001",
          "problem_statement": "Oblicz $\\int_0^2 x dx$.",
          "expected_answer": "$2$",
          "difficulty_level": 3,
          "time_estimate": 300,
          "misconception_map": {
            "incorrect_answer_1": { "type": "wrong_antiderivative", "feedback": "Pierwotna x to x²/2, nie x². Zastosuj F(2)−F(0)." },
            "incorrect_answer_2": { "type": "bounds_order_error", "feedback": "Granice mają kolejność 0→2. Nie odwracaj bez zmiany znaku." }
          }
        },
        {
          "exercise_code": "INT_DEF_EX_002",
          "problem_statement": "Oblicz $\\int_0^\\pi \\sin x dx$.",
          "expected_answer": "$2$",
          "difficulty_level": 3,
          "time_estimate": 320,
          "misconception_map": {
            "incorrect_answer_1": { "type": "sign_area_confusion", "feedback": "Na [0,π] sin x ≥ 0, więc wynik dodatni. Użyj pierwotnej −cos x." },
            "incorrect_answer_2": { "type": "eval_error", "feedback": "Oblicz: (−cos π) − (−cos 0) = 1 − (−1) = 2." }
          }
        },
        {
          "exercise_code": "INT_DEF_EX_003",
          "problem_statement": "Oblicz $\\int_1^e \\frac{1}{x} dx$.",
          "expected_answer": "$1$",
          "difficulty_level": 4,
          "time_estimate": 340,
          "misconception_map": {
            "incorrect_answer_1": { "type": "log_rules_error", "feedback": "Pierwotna 1/x to ln|x|. Wynik: ln e − ln 1 = 1 − 0." },
            "incorrect_answer_2": { "type": "constant_drop", "feedback": "Stała całkowania nie pojawia się w całce oznaczonej po podstawieniu granic." }
          }
        },
        {
          "exercise_code": "INT_DEF_EX_004",
          "problem_statement": "Oblicz $\\int_0^{\\pi/2} (2 \\sin x − \\cos x) dx$.",
          "expected_answer": "$1$",
          "difficulty_level": 4,
          "time_estimate": 340,
          "misconception_map": {
            "incorrect_answer_1": { "type": "linearity_misuse", "feedback": "Rozdziel: 2∫ sin x − ∫ cos x. Policz każdą całkę osobno." },
            "incorrect_answer_2": { "type": "trig_eval_error", "feedback": "∫₀^(π/2) sin x = 1, ∫₀^(π/2) cos x = 1, więc 2·1 − 1 = 1." }
          }
        },
        {
          "exercise_code": "INT_DEF_EX_005",
          "problem_statement": "Oblicz $\\int_{-1}^1 x^3 dx$.",
          "expected_answer": "$0$",
          "difficulty_level": 3,
          "time_estimate": 300,
          "misconception_map": {
            "incorrect_answer_1": { "type": "symmetry_ignored", "feedback": "Funkcja nieparzysta na [−a,a] całkuje się do 0. Ewentualnie policz F(x)=x⁴/4 i podstaw granice." },
            "incorrect_answer_2": { "type": "sign_mistake", "feedback": "Pamiętaj: F(−1) = 1/4, F(1) = 1/4. Różnica daje 0." }
          }
        },
        {
          "exercise_code": "INT_DEF_EX_006",
          "problem_statement": "Oblicz $\\int_0^1 (3x^2 + 4x) dx$.",
          "expected_answer": "$3$",
          "difficulty_level": 3,
          "time_estimate": 300,
          "misconception_map": {
            "incorrect_answer_1": { "type": "coeff_omitted", "feedback": "Stałe 3 i 4 przenosimy przed całkę. Całkuj składniki oddzielnie." },
            "incorrect_answer_2": { "type": "power_rule_error", "feedback": "∫ x² = x³/3, ∫ x = x²/2. Podstaw granice." }
          }
        },
        {
          "exercise_code": "INT_DEF_EX_007",
          "problem_statement": "Oblicz $\\int_0^1 \\frac{x}{1 + x^2} dx$ (podstawienie).",
          "expected_answer": "$\\frac{1}{2} \\ln 2$",
          "difficulty_level": 5,
          "time_estimate": 380,
          "misconception_map": {
            "incorrect_answer_1": { "type": "substitution_limits", "feedback": "Użyj u = 1 + x², du = 2x dx i zmień granice: u: 1→2." },
            "incorrect_answer_2": { "type": "log_rules_error", "feedback": "Po całkowaniu otrzymasz (1/2) ln(1 + x²) |₀¹ = (1/2) ln 2." }
          }
        },
        {
          "exercise_code": "INT_DEF_EX_008",
          "problem_statement": "Oblicz $\\int_0^3 (x − 1) dx$, porównując z podziałem w x=1.",
          "expected_answer": "$\\frac{3}{2}$",
          "difficulty_level": 4,
          "time_estimate": 320,
          "misconception_map": {
            "incorrect_answer_1": { "type": "additivity_ignored", "feedback": "Możesz policzyć bezpośrednio lub jako sumę ∫₀¹ i ∫₁³. Wynik musi być spójny." },
            "incorrect_answer_2": { "type": "evaluation_error", "feedback": "F(x)=x²/2 − x. Oblicz F(3) − F(0) poprawnie." }
          }
        }
      ]
    },
    "misconception_patterns": [
      {
        "pattern_code": "INT_WRONG_ANTIDERIVATIVE",
        "description": "Błędny dobór pierwotnej (np. ∫ x dx = x² zamiast x²/2).",
        "intervention_strategy": "Przypomnij regułę potęgową i sprawdzaj przez różniczkowanie F'(x)=f(x)."
      },
      {
        "pattern_code": "INT_BOUNDS_ORDER",
        "description": "Zamiana kolejności granic bez zmiany znaku (∫ᵦᵃ = −∫ₐᵦ).",
        "intervention_strategy": "Zaznacz orientację na osi i stosuj własność ∫ₐᵦ = −∫ᵦₐ."
      },
      {
        "pattern_code": "INT_LINEARITY_MISUSE",
        "description": "Niewłaściwe użycie liniowości (gubienie współczynników, brak rozdzielenia).",
        "intervention_strategy": "Wyciągaj stałe przed całkę i rozpisz sumę na osobne całki."
      },
      {
        "pattern_code": "INT_SIGN_AREA",
        "description": "Mylenie znaku wyniku z \"polem dodatnim\" dla części poniżej OX.",
        "intervention_strategy": "Rozróżnij pole zorientowane od pola geometrycznego; szkicuj wykres."
      },
      {
        "pattern_code": "INT_SUBSTITUTION_LIMITS",
        "description": "Brak zmiany granic po podstawieniu zmiennej.",
        "intervention_strategy": "Zawsze przelicz granice w nowej zmiennej lub wróć do x przed podstawieniem."
      },
      {
        "pattern_code": "INT_SYMMETRY_IGNORED",
        "description": "Ignorowanie symetrii dla funkcji parzystych/nieparzystych na [−a,a].",
        "intervention_strategy": "Rozpoznawaj parzystość/nieparzystość i stosuj odpowiednie skróty obliczeń."
      }
    ],
    "real_world_applications": [
      {
        "context": "Fizyka",
        "problem_description": "Droga jako pole pod wykresem prędkości v(t) na przedziale czasu.",
        "age_group": "liceum/studia",
        "connection_explanation": "s = ∫_{t1}^{t2} v(t) dt; analogicznie praca z siły zmiennej w(t) = ∫ F dx."
      },
      {
        "context": "Geometria",
        "problem_description": "Pole obszaru ograniczonego wykresem funkcji i osią OX.",
        "age_group": "liceum/studia",
        "connection_explanation": "Pole zorientowane to ∫ₐᵦ f(x) dx; dla pola geometrycznego uwzględnij moduł."
      },
      {
        "context": "Ekonomia",
        "problem_description": "Przychód skumulowany jako całka z funkcji przychodu w czasie.",
        "age_group": "liceum/studia",
        "connection_explanation": "Przychód całkowity R = ∫ r(t) dt na danym okresie."
      },
      {
        "context": "Inżynieria",
        "problem_description": "Bilans ciepła/masy przez całkowanie strumienia po czasie.",
        "age_group": "liceum/studia",
        "connection_explanation": "Ilość zgromadzona Q = ∫ q(t) dt; sprawdzenie jednostek zapewnia poprawność."
      }
    ],
    "pedagogical_notes": {
      "common_mistakes": [
        "Błędne pierwotne i pomijanie sprawdzenia przez różniczkowanie.",
        "Zamiana granic bez zmiany znaku całki.",
        "Niepoprawne użycie liniowości i gubienie współczynników.",
        "Brak rozróżnienia między polem zorientowanym a geometrycznym.",
        "Niezmienione granice po podstawieniu zmiennej.",
        "Ignorowanie własności symetrii dla funkcji parzystych/nieparzystych."
      ],
      "teaching_tips": [
        "Zawsze szkicuj wykres i oceniaj znak funkcji przed obliczeniami.",
        "Po wyznaczeniu wyniku zrób kontrolę sensu: znak, jednostki, przybliżone oszacowanie.",
        "Ucz systematycznego zapisu: pierwotna → podstawienie granic → wynik.",
        "W podstawieniach natychmiast zamieniaj granice lub wracaj do zmiennej x przed oceną.",
        "Wykorzystuj symetrię, by skracać obliczenia na [−a,a]."
      ],
      "prerequisites": [
        "Różniczkowanie funkcji elementarnych",
        "Własności funkcji (ciągłość, parzystość/nieparzystość)",
        "Algebra symboliczna i przekształcenia wyrażeń"
      ],
      "estimated_time": 5100,
      "difficulty_progression": "Start: proste całki potęgowe i trygonometryczne (poziom 3). Dalej: własności (liniowość, addytywność) i ocena znaku (poziom 4). Finał: technika podstawienia i wykorzystanie symetrii (poziom 5)."
    },
    "assessment_rubric": {
      "scope": "Ocena 10 zadań z całki oznaczonej (definicja i obliczanie).",
      "criteria": [
        {
          "skill": "Dobór metody i pierwotnej",
          "beginner": "Dobiera pierwotną dla prostych funkcji z pomocą, popełnia drobne błędy.",
          "intermediate": "Samodzielnie dobiera pierwotne i poprawnie podstawia granice.",
          "advanced": "Sprawnie rozwiązuje złożone całki i weryfikuje wynik przez różniczkowanie."
        },
        {
          "skill": "Własności całki i operacje na przedziale",
          "beginner": "Zna liniowość w prostych przypadkach.",
          "intermediate": "Stosuje liniowość i addytywność do upraszczania obliczeń.",
          "advanced": "Elastycznie wykorzystuje własności (orientacja, podział, symetria) w złożonych zadaniach."
        },
        {
          "skill": "Podstawienie i granice",
          "beginner": "Wykonuje podstawienie, ale myli granice.",
          "intermediate": "Poprawnie zmienia granice lub wraca do x przed oceą.",
          "advanced": "Dobiera skuteczne podstawienia i kontroluje poprawność granic."
        },
        {
          "skill": "Interpretacja i weryfikacja",
          "beginner": "Rzadko ocenia sens wyniku.",
          "intermediate": "Sprawdza znak i przybliżoną wielkość wyniku.",
          "advanced": "Łączy interpretację geometryczną z rachunkiem i wykrywa niespójności."
        }
      ]
    }
  };

  return await importSingleSkillFromJSON(skillData);
};

export const importExponentialLogarithmicFunctionsSkill = async (): Promise<SkillImportResult> => {
  const skillData = {
    "skillId": "exponential-logarithmic-functions-cl3",
    "skillName": "Funkcje wykładnicze i logarytmiczne", 
    "class_level": 3,
    "department": "analiza_matematyczna",
    "generator_params": {
      "microSkill": "exp_log_functions",
      "difficultyRange": [2, 5],
      "fallbackTrigger": "use_basic_explog_patterns"
    },
    "teaching_flow": {
      "phase1": { "name": "Wprowadzenie", "duration": 1500, "activities": ["theory", "guided_examples"] },
      "phase2": { "name": "Ćwiczenia", "duration": 2400, "activities": ["practice", "feedback"] },
      "phase3": { "name": "Utrwalanie", "duration": 1200, "activities": ["mastery_tasks", "assessment"] }
    },
    "content": {
      "theory": {
        "theory_text": "Funkcje wykładnicze i logarytmiczne stanowią parę funkcji wzajemnie odwrotnych i są filarem analizy na poziomie liceum rozszerzonego oraz studiów. Funkcja wykładnicza o podstawie a, gdzie a>0 i a≠1, ma postać y=a^x. Jej dziedziną jest zbiór liczb rzeczywistych, a przeciwdziedziną zbiór liczb dodatnich. Dla a>1 funkcja jest rosnąca, dla 0<a<1 malejąca. Wykres przecina oś OY w punkcie (0,1), ponieważ a^0=1. Funkcja nie przyjmuje wartości ujemnych i ma asymptotę poziomą y=0. Funkcja logarytmiczna jest odwrotnością wykładniczej: y=log_a(x) to liczba, do której należy podnieść a, aby otrzymać x. Warunki: a>0, a≠1, x>0. Dziedziną logarytmu są liczby dodatnie, a przeciwdziedziną wszystkie liczby rzeczywiste. Z definicji log_a(a)=1 oraz log_a(1)=0. Do kluczowych własności logarytmów należą: log_a(xy)=log_a(x)+log_a(y), log_a(x/y)=log_a(x)-log_a(y), log_a(x^r)=r*log_a(x) dla x>0.",
        "key_formulas": [
          "$a>0, a \\neq 1$",
          "$y=a^x$", 
          "$y=\\log_a(x)$",
          "$\\log_a b=c \\iff a^c=b$",
          "$\\log_a(xy)=\\log_a x+\\log_a y$",
          "$\\log_a(x/y)=\\log_a x-\\log_a y$",
          "$\\log_a(x^r)=r\\log_a x$",
          "$\\log_a 1=0$",
          "$\\log_a a=1$"
        ],
        "time_estimate": 600,
        "difficulty_level": 4
      },
      "examples": [
        {
          "example_code": "EXPLOG_001",
          "problem_statement": "Rozwiąż równanie $2^x=8$.",
          "solution_steps": [
            { "step": "Sprowadź do wspólnej podstawy", "expression": "$8=2^3$", "explanation": "Obie strony w tej samej podstawie 2." },
            { "step": "Porównaj wykładniki", "expression": "$2^x=2^3 \\Rightarrow x=3$", "explanation": "Funkcja $2^x$ jest różnowartościowa." }
          ],
          "final_answer": "$x=3$",
          "explanation": "Najprostsze równanie wykładnicze przez porównanie wykładników.",
          "time_estimate": 260,
          "difficulty_level": 3
        },
        {
          "example_code": "EXPLOG_002", 
          "problem_statement": "Rozwiąż równanie $\\log_3(x)=2$.",
          "solution_steps": [
            { "step": "Przejdź do postaci wykładniczej", "expression": "$\\log_3 x=2 \\iff 3^2=x$", "explanation": "Definicja logarytmu." },
            { "step": "Wyznacz x", "expression": "$x=9$", "explanation": "Sprawdzenie dziedziny: $x>0$ spełnione." }
          ],
          "final_answer": "$x=9$",
          "explanation": "Użyto równoważności $\\log_a x=c \\iff a^c=x$.",
          "time_estimate": 280,
          "difficulty_level": 3
        }
      ],
      "practice_exercises": [
        {
          "exercise_code": "EXPLOG_EX_001",
          "problem_statement": "Rozwiąż $4^x=\\frac{1}{8}$.",
          "expected_answer": "$x=-\\frac{3}{2}$",
          "difficulty_level": 3,
          "time_estimate": 300,
          "misconception_map": {
            "incorrect_answer_1": { "type": "base_handling", "feedback": "Zapisz $\\frac{1}{8}=2^{-3}$ i $4=2^2$, wtedy $2^{2x}=2^{-3}$." },
            "incorrect_answer_2": { "type": "sign_error", "feedback": "Uważaj na znak wykładnika: $2x=-3 \\Rightarrow x=-\\frac{3}{2}$." }
          }
        },
        {
          "exercise_code": "EXPLOG_EX_002",
          "problem_statement": "Oblicz $\\log_5 125$.",
          "expected_answer": "$3$",
          "difficulty_level": 3,
          "time_estimate": 310,
          "misconception_map": {
            "incorrect_answer_1": { "type": "definition_confusion", "feedback": "Szukasz $c$ z $5^c=125$. Ponieważ $125=5^3$, wynik to 3." },
            "incorrect_answer_2": { "type": "inverse_error", "feedback": "Nie myl $\\log_5 125$ z $\\log_{125} 5$." }
          }
        }
      ]
    },
    "misconception_patterns": [
      {
        "pattern_code": "EXPLOG_DOMAIN_NEG",
        "description": "Ignorowanie dziedziny logarytmu: próby liczenia log_a(x) dla x≤0.",
        "intervention_strategy": "Zawsze wypisz warunki: argument logarytmu musi być dodatni; sprawdzaj je przed przekształceniami."
      },
      {
        "pattern_code": "LOG_SUM_FALLACY", 
        "description": "Błędne utożsamienie log(a+b) z log a + log b.",
        "intervention_strategy": "Kontrprzykład liczbowy i utrwalanie praw: tylko iloczyn/wiloraz/potęga mają proste wzory."
      }
    ],
    "real_world_applications": [
      {
        "context": "Ekonomia - procent składany",
        "problem_description": "Kapitał K_0 rośnie do K(t)=K_0(1+r)^t lub K_0*e^(rt).",
        "age_group": "liceum/studia",
        "connection_explanation": "Model wykładniczy opisuje wzrost/kapitalizację; logarytm służy do wyznaczania czasu lub stopy."
      }
    ]
  };
  
  return await importSingleSkillFromJSON(skillData);
};

export const importNumberSequencesSkill = async (): Promise<SkillImportResult> => {
  const skillData = {
    "skillId": "number-sequences-cl2",
    "skillName": "Ciągi liczbowe",
    "class_level": 2,
    "department": "algebra",
    "generator_params": {
      "microSkill": "sequences_basics",
      "difficultyRange": [2, 5],
      "fallbackTrigger": "use_basic_sequences_patterns"
    },
    "teaching_flow": {
      "phase1": { "name": "Wprowadzenie", "duration": 1500, "activities": ["theory", "guided_examples"] },
      "phase2": { "name": "Ćwiczenia", "duration": 2400, "activities": ["practice", "feedback"] },
      "phase3": { "name": "Utrwalanie", "duration": 1200, "activities": ["mastery_tasks", "assessment"] }
    },
    "content": {
      "theory": {
        "theory_text": "Ciąg liczbowy to funkcja określona na zbiorze liczb naturalnych dodatnich (czasem z zerem), której wartości nazywamy wyrazami ciągu. Zapisujemy go najczęściej jako $(a_n)$ lub $(a_n)_{n∈ℕ}$, gdzie $a_n$ oznacza n-ty wyraz. Istnieją dwa podstawowe sposoby definiowania ciągów: jawnie (przez wzór na wyraz ogólny $a_n$) oraz rekurencyjnie (każdy wyraz określony na podstawie poprzednich, np. $a_{n+1}=f(a_n)$ wraz z warunkiem początkowym). Już na poziomie liceum kluczowe są dwa szczególne rodzaje ciągów: arytmetyczne i geometryczne.\n\nCiąg arytmetyczny to taki, w którym różnica dowolnych dwóch kolejnych wyrazów jest stała. Jeśli $r$ oznacza różnicę ciągu, to $a_{n+1}-a_n=r$ dla każdego $n$. Najważniejszy jest wzór na wyraz ogólny: $a_n=a_1+(n-1)r$. Wynika on z wielokrotnego dodawania różnicy: $a_2=a_1+r$, $a_3=a_1+2r$, itd. Dodatkowo korzystamy z wzoru na sumę $n$ pierwszych wyrazów: $S_n=a_1+a_2+\\ldots+a_n=\\frac{n}{2}(a_1+a_n)$, co po podstawieniu $a_n=a_1+(n-1)r$ daje drugą użyteczną postać $S_n=\\frac{n}{2}[2a_1+(n-1)r]$.\n\nCiąg geometryczny charakteryzuje stały iloraz kolejnych wyrazów: istnieje $q≠0$, takie że $\\frac{a_{n+1}}{a_n}=q$. Wówczas wyraz ogólny ma postać $a_n=a_1\\,q^{\\,n-1}$. Suma $n$ pierwszych wyrazów (dla $q≠1$) to $S_n=a_1\\,\\frac{1-q^n}{1-q}$; dla $q=1$ suma jest po prostu $S_n=na_1$. Jeśli $|q|<1$ i chcemy zsumować nieskończenie wiele wyrazów od $a_1$, istnieje granica sum częściowych równa $S_∞=\\frac{a_1}{1-q}$ (warunek bezwzględnie konieczny i wystarczający: $|q|<1$).",
        "key_formulas": [
          "$a_n=a_1+(n-1)r$",
          "$S_n=\\frac{n}{2}(a_1+a_n)$",
          "$S_n=\\frac{n}{2}[2a_1+(n-1)r]$",
          "$a_n=a_1\\,q^{\\,n-1}$",
          "$S_n=a_1\\frac{1-q^n}{1-q}$",
          "$S_∞=\\frac{a_1}{1-q}$",
          "$r=\\frac{a_m-a_k}{m-k}$",
          "$S_n=na_1 \\text{ dla } q=1$"
        ],
        "time_estimate": 600,
        "difficulty_level": 4
      },
      "examples": [
        {
          "example_code": "SEQ_001",
          "problem_statement": "Dany jest ciąg arytmetyczny o $a_1=3$ i $r=2$. Oblicz $a_{10}$ oraz $S_{10}$.",
          "solution_steps": [
            { "step": "Wyraz ogólny", "expression": "$a_n=a_1+(n-1)r$", "explanation": "Definicja ciągu arytmetycznego." },
            { "step": "Oblicz $a_{10}$", "expression": "$a_{10}=3+9\\cdot2=21$", "explanation": "Dodajemy różnicę 9 razy." },
            { "step": "Suma 10 wyrazów", "expression": "$S_{10}=\\frac{10}{2}(a_1+a_{10})$", "explanation": "Klasyczny wzór na sumę." },
            { "step": "Wynik $S_{10}$", "expression": "$S_{10}=5\\cdot(3+21)=120$", "explanation": "Mnożenie daje 120." }
          ],
          "final_answer": "$a_{10}=21$, $S_{10}=120$",
          "explanation": "Zastosowano wzory na $a_n$ i $S_n$ dla ciągu arytmetycznego.",
          "time_estimate": 280,
          "difficulty_level": 3
        },
        {
          "example_code": "SEQ_002",
          "problem_statement": "W ciągu arytmetycznym $a_3=5$ i $a_8=20$. Wyznacz $r$ i $a_1$.",
          "solution_steps": [
            { "step": "Różnica z dwóch wyrazów", "expression": "$a_8-a_3=(8-3)r$", "explanation": "Różnice między dalekimi wyrazami sumują się do $(m-k)r$." },
            { "step": "Oblicz $r$", "expression": "$20-5=5r\\Rightarrow r=3$", "explanation": "Prosty rachunek liniowy." },
            { "step": "Wyznacz $a_1$", "expression": "$a_3=a_1+2r$", "explanation": "Podstaw $a_3=5$, $r=3$." },
            { "step": "Wynik $a_1$", "expression": "$5=a_1+6\\Rightarrow a_1=-1$", "explanation": "Odejmujemy 6 od obu stron." }
          ],
          "final_answer": "$r=3$, $a_1=-1$",
          "explanation": "Skorzystano z liniowej struktury różnic i wzoru na $a_n$.",
          "time_estimate": 300,
          "difficulty_level": 3
        }
      ],
      "practice_exercises": [
        {
          "exercise_code": "SEQ_EX_001",
          "problem_statement": "W arytmetycznym $a_1=7$, $r=-2$. Oblicz $a_{15}$.",
          "expected_answer": "$a_{15}=7+14\\cdot(-2)=-21$",
          "difficulty_level": 3,
          "time_estimate": 300,
          "misconception_map": {
            "incorrect_answer_1": { "type": "index_shift", "feedback": "Użyj $a_{15}=a_1+14r$, nie $a_1+15r$." },
            "incorrect_answer_2": { "type": "sign_error", "feedback": "Pamiętaj, że $r=-2$: dodajesz liczbę ujemną 14 razy." }
          }
        },
        {
          "exercise_code": "SEQ_EX_002", 
          "problem_statement": "Ciąg geometryczny: $a_1=-3$, $q=-\\frac{1}{2}$. Oblicz $a_6$.",
          "expected_answer": "$a_6=-3\\cdot(-\\frac{1}{2})^{5}=\\frac{3}{32}$",
          "difficulty_level": 3,
          "time_estimate": 320,
          "misconception_map": {
            "incorrect_answer_1": { "type": "parity_sign", "feedback": "Nieparzysty wykładnik potęgi ujemnej daje wynik ujemny – tu wykładnik 5, ale całość z $-3$ zmienia znak." },
            "incorrect_answer_2": { "type": "index_shift", "feedback": "Użyj potęgi $q^{n-1}$: dla $n=6$ jest $q^5$." }
          }
        }
      ]
    },
    "misconception_patterns": [
      {
        "pattern_code": "SEQ_R_VS_Q_CONFUSION",
        "description": "Mylenie różnicy $r$ z ilorazem $q$ i stosowanie niewłaściwych wzorów.",
        "intervention_strategy": "Najpierw identyfikuj typ ciągu; przygotuj tabelę: arytmetyczny → $a_n=a_1+(n-1)r$, geometryczny → $a_n=a_1q^{n-1}$."
      },
      {
        "pattern_code": "SEQ_INDEX_SHIFT",
        "description": "Błąd o jeden w wykładniku $(n-1)$ lub w liczbie składników przy sumie.",
        "intervention_strategy": "Rozpisz pierwsze wyrazy i sprawdź: dla $n=1$ masz $a_1$; w sumie $S_n$ jest dokładnie $n$ składników."
      }
    ],
    "real_world_applications": [
      {
        "context": "Finanse osobiste",
        "problem_description": "Kapitalizacja roczna i raty rosnące: oblicz wartość konta po $n$ latach lub sumę wpłat.",
        "age_group": "liceum/studia",
        "connection_explanation": "Wzrost procentowy to ciąg geometryczny; raty rosną o stałą kwotę – ciąg arytmetyczny."
      }
    ]
  };
  
  return await importSingleSkillFromJSON(skillData);
}

export async function importLimitsFunctionsSkill(): Promise<SkillImportResult> {
  const skillData = {
    "skillId": "limits-functions-cl3",
    "skillName": "Granice funkcji",
    "class_level": 3,
    "department": "analiza_matematyczna",
    "generator_params": {
      "microSkill": "limits_functions",
      "difficultyRange": [2, 5],
      "fallbackTrigger": "use_basic_limits_patterns"
    },
    "teaching_flow": {
      "phase1": { "name": "Wprowadzenie", "duration": 1500, "activities": ["theory", "guided_examples"] },
      "phase2": { "name": "Ćwiczenia", "duration": 2400, "activities": ["practice", "feedback"] },
      "phase3": { "name": "Utrwalanie", "duration": 1200, "activities": ["mastery_tasks", "assessment"] }
    },
    "content": {
      "theory": {
        "theory_text": "Granica funkcji opisuje zachowanie wartości funkcji, gdy argument zbliża się do pewnej liczby (lub do nieskończoności). Intuicyjnie mówimy, że granica funkcji f(x) w punkcie a wynosi L, jeśli wartości f(x) dają się dowolnie przybliżyć przez L, gdy x jest dostatecznie blisko a. Formalna definicja (ε–δ) bywa używana na studiach, lecz w liceum koncentrujemy się na rachunku granic poprzez prawa działań na granicach, przekształcenia algebraiczne i znane granice wzorcowe. Ważne rozróżnienie: granica funkcji w punkcie a jest pojęciem niezależnym od wartości f(a); funkcja może nie być zdefiniowana w a, a granica może istnieć (tzw. nieciągłość usuwalna).",
        "key_formulas": [
          "$\\lim_{x\\to a}(f\\pm g)=\\lim f\\pm\\lim g$",
          "$\\lim(fg)=(\\lim f)(\\lim g)$",
          "$\\lim \\frac{f}{g}=\\frac{\\lim f}{\\lim g}\\ (\\lim g\\neq0)$",
          "$\\lim_{x\\to0}\\frac{\\sin x}{x}=1$",
          "$\\lim_{x\\to0}\\frac{1-\\cos x}{x^2}=\\frac12$",
          "$\\lim_{x\\to0}\\frac{e^x-1}{x}=1$",
          "$\\lim_{x\\to0}\\frac{\\ln(1+x)}{x}=1$",
          "$y=y_0\\iff \\lim_{x\\to\\pm\\infty}f(x)=y_0$",
          "$x=a\\iff \\lim_{x\\to a}f(x)=\\pm\\infty$"
        ],
        "time_estimate": 600,
        "difficulty_level": 4
      },
      "examples": [
        {
          "example_code": "LIM_001",
          "problem_statement": "Oblicz $\\lim_{x\\to2}(3x^2-5x+1)$.",
          "solution_steps": [
            { "step": "Ciągłość wielomianu", "latex": "$\\lim f(x)=f(2)$", "explanation": "Wielomiany są ciągłe w całej dziedzinie." },
            { "step": "Podstawienie", "latex": "$3\\cdot2^2-5\\cdot2+1$", "explanation": "Wstaw bezpośrednio $x=2$." },
            { "step": "Wynik", "latex": "$12-10+1=3$", "explanation": "Prosty rachunek arytmetyczny." }
          ],
          "final_answer": "$3$",
          "explanation": "Dla funkcji ciągłych granica równa jest wartości w punkcie.",
          "time_estimate": 260,
          "difficulty_level": 3
        },
        {
          "example_code": "LIM_002",
          "problem_statement": "Oblicz $\\lim_{x\\to1}\\frac{x^2-1}{x-1}$.",
          "solution_steps": [
            { "step": "Rozpoznaj $0/0$", "latex": "$x\\to1\\Rightarrow 0/0$", "explanation": "Forma nieoznaczona – trzeba przekształcić." },
            { "step": "Rozkład", "latex": "$x^2-1=(x-1)(x+1)$", "explanation": "Użyj wzoru skróconego mnożenia." },
            { "step": "Skrócenie", "latex": "$\\frac{(x-1)(x+1)}{x-1}=x+1$", "explanation": "Dla $x\\neq1$ funkcje równoważne." },
            { "step": "Granica", "latex": "$\\lim_{x\\to1}(x+1)=2$", "explanation": "Teraz już funkcja ciągła." }
          ],
          "final_answer": "$2$",
          "explanation": "Usunięto nieciągłość przez rozkład i skrócenie.",
          "time_estimate": 300,
          "difficulty_level": 3
        },
        {
          "example_code": "LIM_003",
          "problem_statement": "Oblicz $\\lim_{x\\to0}\\frac{\\sqrt{1+x}-1}{x}$.",
          "solution_steps": [
            { "step": "Sprzężenie", "latex": "\\cdot\\frac{\\sqrt{1+x}+1}{\\sqrt{1+x}+1}", "explanation": "Usuwa pierwiastek z licznika." },
            { "step": "Uproszczenie", "latex": "$\\frac{(1+x)-1}{x(\\sqrt{1+x}+1)}$", "explanation": "Różnica kwadratów w liczniku." },
            { "step": "Skróć $x$", "latex": "$\\frac{1}{\\sqrt{1+x}+1}$", "explanation": "Dla $x\\neq0$ skrócenie jest poprawne." },
            { "step": "Granica", "latex": "$\\frac{1}{1+1}=\\frac12$", "explanation": "Podstaw $x\\to0$ po uproszczeniu." }
          ],
          "final_answer": "$\\frac{1}{2}$",
          "explanation": "Mnożenie przez sprzężenie likwiduje formę $0/0$.",
          "time_estimate": 320,
          "difficulty_level": 4
        }
      ],
      "practice_exercises": [
        {
          "exercise_code": "LIM_EX_001",
          "problem_statement": "Oblicz $\\lim_{x\\to-1}(2x^3+x^2-5)$.",
          "expected_answer": "$-6$",
          "difficulty_level": 3,
          "time_estimate": 300,
          "misconception_map": {
            "incorrect_answer_1": { "type": "substitution_arithmetic", "feedback": "Podstaw $x=-1$ starannie: $2(-1)^3+(-1)^2-5=-2+1-5=-6$." },
            "incorrect_answer_2": { "type": "method_confusion", "feedback": "To wielomian – wystarczy podstawienie, bez dodatkowych sztuczek." }
          }
        },
        {
          "exercise_code": "LIM_EX_002",
          "problem_statement": "Oblicz $\\lim_{x\\to3}\\frac{x^2-9}{x-3}$.",
          "expected_answer": "$6$",
          "difficulty_level": 3,
          "time_estimate": 320,
          "misconception_map": {
            "incorrect_answer_1": { "type": "zero_over_zero_accept", "feedback": "Najpierw rozłóż $x^2-9=(x-3)(x+3)$ i skróć, potem podstaw." },
            "incorrect_answer_2": { "type": "cancel_wrong", "feedback": "Nie skracaj x z x – skracamy identyczne czynniki, nie składniki sumy." }
          }
        },
        {
          "exercise_code": "LIM_EX_003",
          "problem_statement": "Oblicz $\\lim_{x\\to0}\\frac{\\sqrt{4+x}-2}{x}$.",
          "expected_answer": "$\\frac{1}{4}$",
          "difficulty_level": 3,
          "time_estimate": 320,
          "misconception_map": {
            "incorrect_answer_1": { "type": "no_conjugate", "feedback": "Pomnóż przez sprzężenie $\\sqrt{4+x}+2$ i skróć $x$ po uproszczeniu." },
            "incorrect_answer_2": { "type": "substitution_zero_zero", "feedback": "Bez przekształcenia dostajesz $0/0$. Użyj sprzężenia." }
          }
        }
      ]
    },
    "misconception_patterns": [
      {
        "pattern_code": "LIMIT_ALGEBRA_ZERO_ZERO",
        "description": "Ignorowanie formy $0/0$ i błędne podstawienie bez przekształceń.",
        "intervention_strategy": "Zidentyfikuj formę nieoznaczoną, następnie rozkład na czynniki/sprzężenie i skracanie dopiero po przekształceniu."
      },
      {
        "pattern_code": "LIMIT_RATIONALIZATION_MISS",
        "description": "Brak mnożenia przez sprzężenie w wyrażeniach z pierwiastkiem.",
        "intervention_strategy": "Stosuj \\cdot\\frac{\\text{sprzężenie}}{\\text{sprzężenie}} aby usunąć pierwiastek i skrócić $x$."
      },
      {
        "pattern_code": "LIMIT_TRIG_ID",
        "description": "Używanie granicy $\\sin x / x$ bez radianów lub błędne skalowanie argumentu.",
        "intervention_strategy": "Pracuj w radianach i stosuj $\\frac{\\sin(kx)}{kx}\\to1$; wyciągnij czynnik $k$."
      }
    ],
    "real_world_applications": [
      {
        "context": "Fizyka – ruch i prędkość chwilowa",
        "problem_description": "Zdefiniuj prędkość chwilową jako granicę średniej prędkości na krótkim odcinku czasu.",
        "age_group": "liceum/studia",
        "connection_explanation": "Iloraz różnicowy i granica Δs/Δt gdy Δt→0 prowadzi do pochodnej."
      },
      {
        "context": "Ekonomia – koszt krańcowy",
        "problem_description": "Koszt krańcowy jako granica przyrostu kosztu na jednostkę produkcji.",
        "age_group": "liceum/studia",
        "connection_explanation": "Granica ΔC/Δq dla Δq→0 uzasadnia pojęcie pochodnej i marginaliów."
      }
    ],
    "pedagogical_notes": {
      "common_mistakes": [
        "Podstawianie w formie $0/0$ bez przekształceń.",
        "Brak radianów przy granicach trygonometrycznych.",
        "Mylenie asymptot i porównania stopni w nieskończoności.",
        "Ignorowanie kierunku granicy jednostronnej i dziedziny.",
        "Niepoprawne skracanie składników zamiast czynników."
      ],
      "teaching_tips": [
        "Wprowadzaj mapę decyzji: typ granicy → diagnoza formy → wybór techniki.",
        "Ćwicz sprzężenie i rozkład na czynniki na krótkich, celowanych przykładach.",
        "Stale używaj radianów i przypominaj granice wzorcowe.",
        "Zachęcaj do szkiców i analizy dominujących składników przy $x\\to\\infty$.",
        "Po każdym wyniku: kontrola sensu (znak, asymptota, rząd wielkości)."
      ],
      "prerequisites": [
        "Algebra: rozkłady, wzory skróconego mnożenia, ułamki algebraiczne",
        "Funkcje elementarne: wykładnicza, logarytmiczna, trygonometryczne",
        "Podstawy ciągłości i własności funkcji"
      ],
      "estimated_time": 5100,
      "difficulty_progression": "Start: granice funkcji ciągłych i proste przekształcenia (poziom 3). Dalej: sprzężenia, wzorce trygo/log/exp i granice w nieskończoności (poziom 4). Finał: granice jednostronne, asymptoty i wyrażenia złożone (poziom 5)."
    },
    "assessment_rubric": {
      "scope": "Ocena opanowania granic funkcji: rachunek, interpretacja i asymptoty.",
      "criteria": [
        {
          "skill": "Diagnoza i dobór techniki",
          "beginner": "Rozpoznaje granice funkcji ciągłych i stosuje podstawienie.",
          "intermediate": "Identyfikuje formy nieoznaczone i dobiera właściwe przekształcenia.",
          "advanced": "Łączy kilka technik w złożonych wyrażeniach, uzasadnia każdy krok."
        },
        {
          "skill": "Granice wzorcowe i trygonometryczne",
          "beginner": "Zna podstawową granicę $\\sin x/x$ w radianach.",
          "intermediate": "Stosuje granice wzorcowe z przeskalowaniem argumentu.",
          "advanced": "Wykorzystuje rozwinięcia przybliżone i zasadę ściskania."
        },
        {
          "skill": "Granice w nieskończoności i asymptoty",
          "beginner": "Porównuje stopnie i wyznacza proste granice.",
          "intermediate": "Wyznacza asymptoty poziome i pionowe funkcji wymiernych.",
          "advanced": "Analizuje ukośne asymptoty i zachowanie jednostronne przy przerwach."
        }
      ]
    }
  };

  return await importSingleSkillFromJSON(skillData);
};

export async function importTrigonometricFunctionsSkill() {
  console.log('Starting import of Trigonometric Functions skill...');
  
  try {
    const skillData = {
      skillName: "Funkcje trygonometryczne",
      class_level: 2,
      department: "funkcje_elementarne",
      generator_params: {
        microSkill: "trigonometric_functions",
        difficultyRange: [2, 5],
        fallbackTrigger: "use_basic_trig_patterns"
      },
      teaching_flow: {
        phase1: { name: "Wprowadzenie", duration: 1500, activities: ["theory", "guided_examples"] },
        phase2: { name: "Ćwiczenia", duration: 2400, activities: ["practice", "feedback"] },
        phase3: { name: "Utrwalanie", duration: 1200, activities: ["mastery_tasks", "assessment"] }
      },
      content: {
        theory: {
          theory_text: "Funkcje trygonometryczne opisują zjawiska okresowe i obrót na okręgu jednostkowym. Podstawowe funkcje to sinus, cosinus, tangens i cotangens. Definicja geometryczna opiera się na okręgu jednostkowym: dla kąta x (w radianach) punkt P=(cos x, sin x) leży na okręgu o promieniu 1. Zatem cos x to współrzędna x punktu P, a sin x to współrzędna y. Tangens i cotangens definiujemy jako tan x=sin x/cos x (dla cos x≠0) oraz cot x=cos x/sin x (dla sin x≠0). Warto pracować w radianach, ponieważ upraszczają one wzory i analizę. Konwersja między stopniami a radianami: 180°=π, więc x°=x·π/180, a t radianów odpowiada t·180/π stopni. Dziedzina i wartości: sin x oraz cos x są określone dla wszystkich x∈ℝ i przyjmują wartości w przedziale [−1,1]. Funkcja tan x jest określona dla x≠π/2+kπ i ma wartości w ℝ (okres π), a cot x dla x≠kπ (okres także π). Okresy: sin(x+2π)=sin x, cos(x+2π)=cos x, zaś tan(x+π)=tan x i cot(x+π)=cot x. Podstawowe symetrie i parzystość: sin(−x)=−sin x (nieparzysta), cos(−x)=cos x (parzysta), tan(−x)=−tan x, cot(−x)=−cot x. Te własności pozwalają szybko upraszczać wyrażenia i sprawdzać sens wyników.",
          key_formulas: [
            "$180^\\circ=\\pi$",
            "$x^\\circ=x\\frac{\\pi}{180}$",
            "$\\sin^2x+\\cos^2x=1$",
            "$\\tan x=\\frac{\\sin x}{\\cos x}$",
            "$\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta$",
            "$\\cos(\\alpha\\pm\\beta)=\\cos\\alpha\\cos\\beta\\mp\\sin\\alpha\\sin\\beta$",
            "$\\sin 2x=2\\sin x\\cos x$",
            "$\\cos 2x=1-2\\sin^2 x=2\\cos^2 x-1$",
            "$\\sin(x+2\\pi)=\\sin x$",
            "$\\cos(x+2\\pi)=\\cos x$",
            "$\\tan(x+\\pi)=\\tan x$",
            "$T=\\frac{2\\pi}{\\omega}$",
            "$\\sin x=a\\Rightarrow x=\\arcsin a\\vee x=\\pi-\\arcsin a$",
            "$\\cos x=a\\Rightarrow x=\\pm\\arccos a$",
            "$\\tan x=a\\Rightarrow x=\\arctan a+k\\pi$",
            "$y=A\\sin(\\omega x+\\varphi)+D$"
          ],
          time_estimate: 600,
          difficulty_level: 4
        },
        examples: [
          {
            example_code: "TRIG_001",
            problem_statement: "Wyznacz $\\sin\\frac{\\pi}{6}$, $\\cos\\frac{\\pi}{3}$, $\\tan\\frac{\\pi}{4}$.",
            solution_steps: [
              { step: "Wartości szczególne", latex: "$\\sin\\frac{\\pi}{6}=\\frac{1}{2}$", explanation: "Trójkąt 30°–60°–90°." },
              { step: "Cosinus", latex: "$\\cos\\frac{\\pi}{3}=\\frac{1}{2}$", explanation: "Symetryczna wartość dla 60°." },
              { step: "Tangens", latex: "$\\tan\\frac{\\pi}{4}=1$", explanation: "Bo $\\sin=\\cos=\\frac{\\sqrt{2}}{2}$." }
            ],
            final_answer: "$\\frac{1}{2},\\ \\frac{1}{2},\\ 1$",
            explanation: "Użyto wartości z okręgu jednostkowego.",
            time_estimate: 260,
            difficulty_level: 3
          },
          {
            example_code: "TRIG_002",
            problem_statement: "Rozwiąż $\\sin x=\\frac{1}{2}$ dla $x\\in[0,2\\pi]$ oraz podaj rozwiązanie ogólne.",
            solution_steps: [
              { step: "Kąt główny", latex: "$x_0=\\arcsin\\frac{1}{2}=\\frac{\\pi}{6}$", explanation: "W I ćwiartce sinus dodatni." },
              { step: "Symetria II ćwiartka", latex: "$x=\\pi-\\frac{\\pi}{6}=\\frac{5\\pi}{6}$", explanation: "Sinus ma tę samą wartość." },
              { step: "Okresowość", latex: "$x=x_0+2k\\pi\\ \\vee\\ x=\\pi-x_0+2k\\pi$", explanation: "Pełne rozwiązanie ogólne." }
            ],
            final_answer: "$x\\in\\{\\frac{\\pi}{6},\\frac{5\\pi}{6}\\}$ i $x=\\frac{\\pi}{6}+2k\\pi$ lub $x=\\frac{5\\pi}{6}+2k\\pi$",
            explanation: "Dwie pozycje w $[0,2\\pi]$ oraz dodanie okresu $2\\pi$.",
            time_estimate: 300,
            difficulty_level: 3
          },
          {
            example_code: "TRIG_003",
            problem_statement: "Rozwiąż $2\\sin x-\\sqrt{3}=0$.",
            solution_steps: [
              { step: "Izoluj sinus", latex: "$\\sin x=\\frac{\\sqrt{3}}{2}$", explanation: "Dodaj $\\sqrt{3}$ i podziel przez 2." },
              { step: "Kąty w $[0,2\\pi]$", latex: "$x=\\frac{\\pi}{3},\\frac{2\\pi}{3}$", explanation: "Sinus dodatni w I i II ćwiartce." },
              { step: "Ogólne", latex: "$x=\\frac{\\pi}{3}+2k\\pi\\ \\vee\\ x=\\frac{2\\pi}{3}+2k\\pi$", explanation: "Okres $2\\pi$." }
            ],
            final_answer: "$x=\\frac{\\pi}{3}+2k\\pi$ lub $x=\\frac{2\\pi}{3}+2k\\pi$",
            explanation: "Użyto wartości szczególnych sinusa.",
            time_estimate: 320,
            difficulty_level: 4
          },
          {
            example_code: "TRIG_004",
            problem_statement: "Rozwiąż $\\cos(2x)=\\frac{1}{2}$ dla $x\\in[0,2\\pi]$.",
            solution_steps: [
              { step: "Równanie dla $2x$", latex: "$2x=\\pm\\frac{\\pi}{3}+2k\\pi$", explanation: "Bo $\\cos t=\\frac{1}{2}$ dla $t=\\pm\\pi/3+2k\\pi$." },
              { step: "Podziel przez 2", latex: "$x=\\pm\\frac{\\pi}{6}+k\\pi$", explanation: "Okres dla $2x$ to $2\\pi$, więc dla $x$ okres $\\pi$." },
              { step: "Wypisz w $[0,2\\pi]$", latex: "$x\\in\\{\\frac{\\pi}{6},\\frac{5\\pi}{6},\\frac{7\\pi}{6},\\frac{11\\pi}{6}\\}$", explanation: "Cztery rozwiązania." }
            ],
            final_answer: "$x=\\pm\\frac{\\pi}{6}+k\\pi$; w $[0,2\\pi]$: $\\{\\frac{\\pi}{6},\\frac{5\\pi}{6},\\frac{7\\pi}{6},\\frac{11\\pi}{6}\\}$",
            explanation: "Wzór podwójnego kąta i okresowość argumentu.",
            time_estimate: 330,
            difficulty_level: 4
          },
          {
            example_code: "TRIG_005",
            problem_statement: "Udowodnij tożsamość $2\\sin x\\cos x=\\sin 2x$ i zastosuj do obliczenia $\\sin(60^\\circ)$.",
            solution_steps: [
              { step: "Wzór na sinus sumy", latex: "$\\sin(\\alpha+\\beta)=\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta$", explanation: "Podstawowa tożsamość." },
              { step: "Ustaw $\\alpha=\\beta=x$", latex: "$\\sin(2x)=2\\sin x\\cos x$", explanation: "Zsumowanie dwóch identycznych składników." },
              { step: "Oblicz $\\sin 60^\\circ$", latex: "$\\sin 60^\\circ=\\sin(2\\cdot30^\\circ)$", explanation: "Użyj podwójnego kąta." },
              { step: "Zastosowanie", latex: "$2\\sin30^\\circ\\cos30^\\circ=2\\cdot\\frac{1}{2}\\cdot\\frac{\\sqrt{3}}{2}=\\frac{\\sqrt{3}}{2}$", explanation: "Wartości tablicowe." }
            ],
            final_answer: "$\\sin 60^\\circ=\\frac{\\sqrt{3}}{2}$",
            explanation: "Dowód z definicji sinus sumy i obliczenie przez podwójny kąt.",
            time_estimate: 320,
            difficulty_level: 4
          },
          {
            example_code: "TRIG_006",
            problem_statement: "Dla $y=3\\sin(2x-\\frac{\\pi}{3})+1$ wyznacz amplitudę, okres, przesunięcie fazowe i oś średnią.",
            solution_steps: [
              { step: "Amplituda", latex: "$A=3$", explanation: "Współczynnik przy sin." },
              { step: "Okres", latex: "$T=\\frac{2\\pi}{2}=\\pi$", explanation: "Dla $\\sin(\\omega x)$ okres to $2\\pi/\\omega$." },
              { step: "Faza", latex: "$2x-\\frac{\\pi}{3}=2(x-\\frac{\\pi}{6})$", explanation: "Przesunięcie w prawo o $\\frac{\\pi}{6}$." },
              { step: "Oś średnia", latex: "$y=D=1$", explanation: "Stała dodana przesuwa wykres pionowo." }
            ],
            final_answer: "Amplituda $3$, okres $\\pi$, przesunięcie $\\frac{\\pi}{6}$ w prawo, oś $y=1$",
            explanation: "Parametry odczytano z postaci $A\\sin(\\omega x+\\varphi)+D$.",
            time_estimate: 340,
            difficulty_level: 5
          }
        ],
        practice_exercises: [
          {
            exercise_code: "EX_TRIG_001",
            problem_statement: "Oblicz: $\\cos0$, $\\sin\\pi$, $\\tan\\frac{\\pi}{3}$.",
            expected_answer: "$1,\\ 0,\\ \\sqrt{3}$",
            difficulty_level: 3,
            time_estimate: 300,
            misconception_map: {
              incorrect_answer_1: { type: "special_values_confusion", feedback: "Sprawdź wartości tablicowe: $\\cos0=1$, $\\sin\\pi=0$, $\\tan\\frac{\\pi}{3}=\\sqrt{3}$." },
              incorrect_answer_2: { type: "unit_circle_sign", feedback: "Zweryfikuj znaki z okręgu jednostkowego i ćwiartek." }
            }
          },
          {
            exercise_code: "EX_TRIG_002",
            problem_statement: "Przekształć kąt: $150^\\circ$ na radiany i oblicz $\\sin150^\\circ$.",
            expected_answer: "$\\frac{5\\pi}{6},\\ \\frac{1}{2}$",
            difficulty_level: 3,
            time_estimate: 310,
            misconception_map: {
              incorrect_answer_1: { type: "deg_rad_confusion", feedback: "Użyj $x^\\circ=x\\frac{\\pi}{180}$. Dla 150° otrzymasz $5\\pi/6$." },
              incorrect_answer_2: { type: "quadrant_sign_error", feedback: "W II ćwiartce sinus dodatni: $\\sin150^\\circ=\\sin30^\\circ$." }
            }
          },
          {
            exercise_code: "EX_TRIG_003",
            problem_statement: "Rozwiąż $\\tan x=1$ w $[0,2\\pi]$ i podaj rozwiązanie ogólne.",
            expected_answer: "$x=\\frac{\\pi}{4},\\frac{5\\pi}{4}$; ogólnie $x=\\frac{\\pi}{4}+k\\pi$",
            difficulty_level: 3,
            time_estimate: 320,
            misconception_map: {
              incorrect_answer_1: { type: "tan_period_error", feedback: "Pamiętaj, że okres $\\tan$ to $\\pi$, więc dodaj $k\\pi$, nie $2k\\pi$." },
              incorrect_answer_2: { type: "missing_solution", feedback: "W IV ćwiartce $\\tan$ ujemny, ale w III dodatni: dodaj $5\\pi/4$." }
            }
          },
          {
            exercise_code: "EX_TRIG_004",
            problem_statement: "Rozwiąż $\\cos x=-\\frac{\\sqrt{2}}{2}$ w $[0,2\\pi]$.",
            expected_answer: "$x=\\frac{3\\pi}{4},\\frac{5\\pi}{4}$",
            difficulty_level: 4,
            time_estimate: 330,
            misconception_map: {
              incorrect_answer_1: { type: "quadrant_sign_error", feedback: "Ujemny cosinus w II i III ćwiartce. Wartość odpowiada $45^\\circ$ od osi." },
              incorrect_answer_2: { type: "principal_only", feedback: "Nie podawaj jednego kąta – w $[0,2\\pi]$ są dwie pozycje." }
            }
          },
          {
            exercise_code: "EX_TRIG_005",
            problem_statement: "Oblicz $\\sin75^\\circ$ korzystając z $\\sin(\\alpha+\\beta)$.",
            expected_answer: "$\\frac{\\sqrt{6}+\\sqrt{2}}{4}$",
            difficulty_level: 4,
            time_estimate: 340,
            misconception_map: {
              incorrect_answer_1: { type: "identity_misuse", feedback: "Użyj $75^\\circ=45^\\circ+30^\\circ$ i wzoru na sinus sumy." },
              incorrect_answer_2: { type: "value_table_error", feedback: "Sprawdź: $\\sin45=\\frac{\\sqrt{2}}{2}$, $\\cos30=\\frac{\\sqrt{3}}{2}$ itd." }
            }
          },
          {
            exercise_code: "EX_TRIG_006",
            problem_statement: "Rozwiąż $\\sin(2x)=\\frac{\\sqrt{3}}{2}$ dla $x\\in[0,2\\pi]$.",
            expected_answer: "$x=\\frac{\\pi}{6},\\frac{5\\pi}{6},\\frac{7\\pi}{6},\\frac{11\\pi}{6}$",
            difficulty_level: 4,
            time_estimate: 350,
            misconception_map: {
              incorrect_answer_1: { type: "argument_scaling", feedback: "Najpierw rozwiąż dla $2x$: $2x=\\frac{\\pi}{3},\\frac{2\\pi}{3},\\ldots$ i dopiero dziel przez 2." },
              incorrect_answer_2: { type: "missing_period_solutions", feedback: "Dla $2x$ masz 4 rozwiązania w $[0,4\\pi)$; po podzieleniu otrzymasz 4 w $[0,2\\pi]$." }
            }
          },
          {
            exercise_code: "EX_TRIG_007",
            problem_statement: "Dla $y=2\\cos(x-\\frac{\\pi}{4})-1$ wyznacz max, min i okres.",
            expected_answer: "Max $y=1$ (dla $\\cos=1$), min $y=-3$ (dla $\\cos=-1$), $T=2\\pi$",
            difficulty_level: 5,
            time_estimate: 370,
            misconception_map: {
              incorrect_answer_1: { type: "amplitude_shift_confusion", feedback: "Amplituda $|A|=2$, oś $y=-1$: max $-1+2=1$, min $-1-2=-3$." },
              incorrect_answer_2: { type: "period_param_error", feedback: "Brak mnożnika przy x oznacza $\\omega=1$, więc $T=2\\pi$." }
            }
          },
          {
            exercise_code: "EX_TRIG_008",
            problem_statement: "Rozwiąż $\\cos(3x)=0$ w $[0,2\\pi]$ i podaj rozwiązanie ogólne.",
            expected_answer: "$x=\\frac{\\pi}{6},\\frac{\\pi}{2},\\frac{5\\pi}{6},\\frac{7\\pi}{6},\\frac{3\\pi}{2},\\frac{11\\pi}{6}$; ogólnie $x=\\frac{\\pi}{2}\\frac{1+2k}{3}$",
            difficulty_level: 5,
            time_estimate: 380,
            misconception_map: {
              incorrect_answer_1: { type: "argument_scaling", feedback: "Dla $3x$ równania $\\cos t=0$ mamy $t=\\frac{\\pi}{2}+k\\pi$, więc $x=\\frac{\\pi}{6}+\\frac{k\\pi}{3}$." },
              incorrect_answer_2: { type: "counting_solutions", feedback: "W $[0,2\\pi]$ powinno wyjść 6 rozwiązań – przelicz po podzieleniu przez 3." }
            }
          }
        ]
      },
      misconception_patterns: [
        {
          pattern_code: "TRIG_DEG_RAD_CONFUSION",
          description: "Mylenie stopni i radianów (np. użycie 180 zamiast $\\pi$).",
          intervention_strategy: "Zawsze konwertuj: $x^\\circ=x\\frac{\\pi}{180}$. Dodaj kontrolę jednostek w rozwiązaniu."
        },
        {
          pattern_code: "TRIG_QUADRANT_SIGN",
          description: "Błędne znaki funkcji w ćwiartkach (np. $\\cos$ ujemny w II i III).",
          intervention_strategy: "Użyj okręgu jednostkowego i reguły ćwiartek; testuj przykładowy kąt z przedziału."
        },
        {
          pattern_code: "TRIG_PRINCIPAL_ONLY",
          description: "Podawanie tylko rozwiązania głównego bez okresu.",
          intervention_strategy: "Po znalezieniu kąta dodaj $+2k\\pi$ (lub $+k\\pi$ dla $\\tan$). Zapisz oba ramiona dla $\\sin$."
        },
        {
          pattern_code: "TRIG_IDENTITY_MISUSE",
          description: "Niepoprawne tożsamości (np. $\\sin(a+b)=\\sin a+\\sin b$).",
          intervention_strategy: "Ucz wzorów sumy/różnicy i weryfikuj przez podstawienie $x=\\frac{\\pi}{4}$."
        },
        {
          pattern_code: "TRIG_ARGUMENT_SCALING",
          description: "Ignorowanie mnożnika przy argumencie (np. w $\\sin(2x)$).",
          intervention_strategy: "Najpierw rozwiąż równanie dla nowej zmiennej $t=2x$, potem podziel przez 2 i policz liczbę rozwiązań."
        },
        {
          pattern_code: "TRIG_PHASE_PARAM",
          description: "Mylenie amplitudy z przesunięciem pionowym i fazą.",
          intervention_strategy: "Stosuj schemat $A,\\ \\omega,\\ \\varphi,\\ D$ i wypełnij tabelę parametrów przed odpowiedzią."
        }
      ],
      real_world_applications: [
        {
          context: "Fizyka – fale i drgania",
          problem_description: "Model ruchu harmonijnego $y=A\\sin(\\omega t+\\varphi)$, wyznaczanie okresu i amplitudy.",
          age_group: "liceum/studia",
          connection_explanation: "Parametry sinusoidy odpowiadają amplitudzie i częstotliwości drgań."
        },
        {
          context: "Inżynieria – prąd przemienny",
          problem_description: "Analiza napięcia $u(t)=U_m\\cos(\\omega t)$, obliczanie wartości skutecznej.",
          age_group: "liceum/studia",
          connection_explanation: "Funkcje trygonometryczne opisują przebiegi AC; okres i faza są kluczowe."
        },
        {
          context: "Astronomia – wysokość Słońca",
          problem_description: "Zmiany dobowej wysokości kątowej modelowane kosinusem.",
          age_group: "liceum/studia",
          connection_explanation: "Okres $2\\pi$ odpowiada dobie, przesunięcia fazowe – porom roku i długości geograficznej."
        },
        {
          context: "Informatyka – grafika i animacja",
          problem_description: "Ruch wahadła/efekty falowe w shaderach i animacjach.",
          age_group: "liceum/studia",
          connection_explanation: "Sinus i cosinus generują płynne, okresowe ruchy i deformacje."
        }
      ],
      pedagogical_notes: {
        common_mistakes: [
          "Mylone stopnie i radiany w obliczeniach.",
          "Błędne znaki funkcji w różnych ćwiartkach.",
          "Brak dodania okresu do rozwiązań równań.",
          "Użycie nieistniejących tożsamości (np. suma sinusów).",
          "Ignorowanie mnożnika w argumencie funkcji.",
          "Nieprawidłowe odczyty parametrów sinusoidy."
        ],
        teaching_tips: [
          "Stała praca z okręgiem jednostkowym: zaznaczaj kąty i znaki.",
          "Twórz tabelę wartości szczególnych i powtarzaj konwersje jednostek.",
          "Ćwicz pełny zapis rozwiązań z $k\\in\\mathbb{Z}$, potem zawężaj do przedziałów.",
          "Stosuj test podstawienia liczby do sprawdzenia tożsamości.",
          "Ucz analizy $A,\\omega,\\varphi,D$ przed rysowaniem sinusoidy."
        ],
        prerequisites: [
          "Podstawy geometrii i okręgu jednostkowego",
          "Algebra: równania liniowe i proste przekształcenia",
          "Konwersja jednostek kątowych (stopnie–radiany)"
        ],
        estimated_time: 5100,
        difficulty_progression: "Start: wartości szczególne i konwersje (poziom 3). Dalej: równania podstawowe i tożsamości (poziom 4). Finał: parametryzacja sinusoidy, mnożnik argumentu i modelowanie (poziom 5)."
      },
      assessment_rubric: {
        scope: "Ocena opanowania funkcji trygonometrycznych: wartości, tożsamości, równania, wykresy i zastosowania.",
        criteria: [
          {
            skill: "Wartości i konwersje",
            beginner: "Zna podstawowe wartości i konwersję stopnie–radiany z pomocą.",
            intermediate: "Sprawnie oblicza wartości w typowych kątach i znaki w ćwiartkach.",
            advanced: "Używa symetrii i redukcji kątów do szybkich obliczeń nietypowych."
          },
          {
            skill: "Tożsamości i przekształcenia",
            beginner: "Stosuje prostą tożsamość Pitagorasa.",
            intermediate: "Wykorzystuje sumę/różnicę i podwójny kąt do upraszczania.",
            advanced: "Łączy wiele tożsamości i weryfikuje poprawność przez testy numeryczne."
          },
          {
            skill: "Równania i okresowość",
            beginner: "Rozwiązuje sin x=a, cos x=a w zadanych przedziałach.",
            intermediate: "Zapisuje rozwiązania ogólne i obsługuje mnożnik w argumencie.",
            advanced: "Rozwiązuje złożone układy i zadania z parametrami, poprawnie liczy liczbę rozwiązań."
          },
          {
            skill: "Wykresy i modelowanie",
            beginner: "Rozpoznaje podstawowy kształt sinusoidy.",
            intermediate: "Odczytuje/wyznacza $A,\\omega,\\varphi,D$ i okres.",
            advanced: "Modeluje zjawiska okresowe, interpretuje parametry fizycznie i sprawdza sens wyników."
          }
        ]
      }
    };

    return await importSingleSkillFromJSON(skillData);
  } catch (error) {
    console.error('Error importing Trigonometric Functions skill:', error);
    throw error;
  }
};

export const importDerivativeFunctionSkill = async () => {
  const skillData = {
    skillName: "Pochodna funkcji",
    class_level: 3,
    department: "analiza_matematyczna",
    generator_params: {
      microSkill: "derivative_basics",
      difficultyRange: [2, 5],
      fallbackTrigger: "use_basic_derivative_patterns"
    },
    teaching_flow: {
      phase1: { name: "Wprowadzenie", duration: 1500, activities: ["theory", "guided_examples"] },
      phase2: { name: "Ćwiczenia", duration: 2400, activities: ["practice", "feedback"] },
      phase3: { name: "Utrwalanie", duration: 1200, activities: ["mastery_tasks", "assessment"] }
    },
    content: {
      theory: {
        theory_text: `Pochodna funkcji opisuje chwilową szybkość zmiany wartości funkcji względem argumentu oraz nachylenie stycznej do wykresu. Intuicyjnie, jeśli f(x) przedstawia położenie ciała w czasie x, to f′(x) jest prędkością chwilową, a f″(x) przyspieszeniem. Definicja graniczna pochodnej w punkcie a to granica ilorazu różnicowego: porównujemy średnie tempo zmian na coraz mniejszych przedziałach i badamy, do jakiej liczby dąży. W praktyce licealnej korzystamy zarówno z definicji, jak i z reguł rachunkowych, które pozwalają obliczać pochodne szybko i niezawodnie. Pochodna istnieje, gdy granica jest skończona i funkcja nie ma w punkcie "ostrza" ani pionowej stycznej. Pojęcia te łączą się z ciągłością: jeśli funkcja jest różniczkowalna w a, to jest też ciągła w a, lecz odwrotność nie zawsze zachodzi. 

Interpretacja geometryczna: f′(a) to współczynnik kierunkowy prostej stycznej do wykresu y=f(x) w punkcie (a,f(a)). Jeśli f′(a)>0, wykres lokalnie rośnie; jeśli f′(a)<0, maleje; jeśli f′(a)=0, mamy punkt krytyczny (kandydat na ekstremum lokalne lub punkt przegięcia poziomego). Analiza znaku pochodnej na przedziałach prowadzi do wniosków o monotoniczności. Dalsza analiza z f″ (drugą pochodną) pozwala opisać wypukłość: gdy f″>0 na przedziale, wykres jest wypukły w górę (uśmiechnięty), a gdy f″<0 – wypukły w dół. Punkt, w którym zmienia się znak f″, to kandydat na punkt przegięcia. 

Rachunkowe reguły: liniowość pochodnej (pochodna sumy i wielokrotności), reguła iloczynu, ilorazu i łańcuchowa. Dzięki nim obliczamy pochodne złożonych wyrażeń bez wracania do definicji granicznej. W połączeniu z tablicą pochodnych funkcji elementarnych (potęgowe, wykładnicze, logarytmiczne, trygonometryczne) otrzymujemy kompletny zestaw narzędzi. Warto zapamiętać najczęstsze pochodne: (x^n)′=n x^{n−1}, (e^x)′=e^x, (a^x)′=a^x ln a, (ln x)′=1/x dla x>0, (sin x)′=cos x, (cos x)′=−sin x, (tan x)′=1/cos^2 x. Reguła łańcuchowa pozwala obliczać pochodne złożeń, np. (sin(x^2))′=cos(x^2)·2x. 

Związek z ekstremami: aby znaleźć ekstrema lokalne, wyznaczamy punkty krytyczne (f′=0 lub brak pochodnej przy ciągłości) i badamy znak pochodnej po obu stronach punktu albo stosujemy test drugiej pochodnej: jeśli f′(a)=0 i f″(a)>0, mamy minimum lokalne; jeśli f″(a)<0, maksimum lokalne; gdy f″(a)=0, test nie rozstrzyga. W zastosowaniach optymalizacyjnych dodatkowo uwzględniamy krańce dziedziny (np. przedziału domkniętego) i porównujemy wartości funkcji. Pochodna pozwala także wyznaczać równania stycznych: mając f′(a) i f(a), piszemy y=f′(a)(x−a)+f(a). 

Aspekty praktyczne i typowe pułapki: po pierwsze, zawsze kontrolujemy dziedzinę (np. (ln x)′ dotyczy x>0). Po drugie, przy trygonometrii pracujemy w radianach – tylko wtedy wzory pochodnych przyjmują podane proste postacie. Po trzecie, ostrożnie stosujemy reguły – najczęstsze błędy to mylenie iloczynu z ilorazem lub "wchłanianie" pochodnej do potęg bez zastosowania łańcuchowej. Pamiętamy, że pochodna stałej wynosi 0, a pochodna funkcji liniowej ax+b jest stałą a. Przy funkcjach wymiernych korzystamy z ilorazu i prostych rozkładów na czynniki; przy funkcjach mieszanych (np. wielomian razy sin) używamy reguły iloczynu; przy złożeniach – łańcuchowej. 

Związki z innymi działami: pochodna jest formalnie zdefiniowana przez granicę, więc opanowanie rachunku granic jest kluczowe. Pochodna wiąże się z monotonicznością i ekstremami (badanie przebiegu zmienności), a także z całką (twierdzenie Newtona–Leibniza). W zadaniach z fizyki pochodna to prędkość/tempo zmian; w ekonomii – koszt/marginalny zysk; w geometrii analitycznej – nachylenie stycznej i normalnej. 

Strategia rozwiązywania: (1) Rozpoznaj typ wyrażenia i wybierz odpowiednie reguły (linowość, iloczyn, iloraz, łańcuch). (2) Wypisz pochodne funkcji elementarnych wchodzących w skład złożenia. (3) Zadbaj o kolejność działań i nawiasy; przy łańcuchowej pamiętaj o mnożniku pochodnej "wnętrza". (4) Po obliczeniu uprość wyrażenie i – jeśli to potrzebne – wyznacz miejsca zerowe pochodnej dla analizy ekstremów. (5) Zapisz równanie stycznej, jeśli jest wymagane. Stosuj kontrolę sensowności: np. dla funkcji rosnącej oczekujemy dodatniego f′ na danym przedziale; porównuj też jednostki w kontekstach fizycznych.`,
        key_formulas: [
          "$f'(a)=\\lim_{h\\to0}\\tfrac{f(a+h)-f(a)}{h}$",
          "$\\dfrac{d}{dx}(c)=0$",
          "$\\dfrac{d}{dx}(x^n)=n x^{n-1}$",
          "$\\dfrac{d}{dx}(e^x)=e^x$",
          "$\\dfrac{d}{dx}(a^x)=a^x\\ln a$",
          "$\\dfrac{d}{dx}(\\ln x)=\\tfrac{1}{x}$",
          "$\\dfrac{d}{dx}(\\sin x)=\\cos x$",
          "$\\dfrac{d}{dx}(\\cos x)=-\\sin x$",
          "$\\dfrac{d}{dx}(\\tan x)=\\tfrac{1}{\\cos^2 x}$",
          "$(fg)'=f'g+fg'$",
          "$\\left(\\tfrac{f}{g}\\right)'=\\tfrac{f'g-fg'}{g^2}$",
          "$\\dfrac{d}{dx}f(g(x))=f'(g(x))\\cdot g'(x)$",
          "$y_{\\text{stycz}}=f'(a)(x-a)+f(a)$",
          "$f'(x)=0\\ \\Rightarrow\\ \\text{punkt krytyczny}$",
          "$f''(a)>0\\Rightarrow\\min,\\ f''(a)<0\\Rightarrow\\max$"
        ],
        time_estimate: 600,
        difficulty_level: 4
      },
      examples: [
        {
          example_code: "DER_001",
          problem_statement: "Oblicz pochodną $f(x)=3x^4-5x+2$.",
          solution_steps: [
            { step: "Zastosuj liniowość", latex: "$(au+bv)'=a\\,u'+b\\,v'$", explanation: "Pochodna sumy to suma pochodnych, stałe wyciągamy." },
            { step: "Pochodne składników", latex: "$(x^4)'=4x^3$, $(x)'=1$, $(2)'=0$", explanation: "Wzór potęgowy i podstawowe pochodne." },
            { step: "Złóż wynik", latex: "$f'(x)=3\\cdot4x^3-5\\cdot1+0$", explanation: "Mnożymy przez stałe współczynniki." },
            { step: "Uprość", latex: "$f'(x)=12x^3-5$", explanation: "Postać ostateczna." }
          ],
          final_answer: "$f'(x)=12x^3-5$",
          explanation: "Prosty rachunek z użyciem reguły potęgowej i liniowości.",
          time_estimate: 280,
          difficulty_level: 3
        },
        {
          example_code: "DER_002",
          problem_statement: "Wyznacz pochodną $f(x)=(2x-1)\\sin x$.",
          solution_steps: [
            { step: "Reguła iloczynu", latex: "$(fg)'=f'g+fg'$", explanation: "Użyj dla $f(x)=2x-1$, $g(x)=\\sin x$." },
            { step: "Pochodne czynników", latex: "$(2x-1)'=2$, $(\\sin x)'=\\cos x$", explanation: "Podstawowe pochodne." },
            { step: "Złóż", latex: "$f'(x)=2\\sin x+(2x-1)\\cos x$", explanation: "Wstaw do wzoru i uporządkuj." }
          ],
          final_answer: "$f'(x)=2\\sin x+(2x-1)\\cos x$",
          explanation: "Iloczyn wymaga zsumowania dwóch składników z reguły produktu.",
          time_estimate: 300,
          difficulty_level: 3
        },
        {
          example_code: "DER_003",
          problem_statement: "Oblicz pochodną $f(x)=\\dfrac{\\ln x}{x^2}$ dla $x>0$.",
          solution_steps: [
            { step: "Reguła ilorazu", latex: "$(f/g)'=\\tfrac{f'g-fg'}{g^2}$", explanation: "Nie mnożymy \"osobno\" - używamy wzoru." },
            { step: "Pochodne", latex: "$(\\ln x)'=\\tfrac{1}{x}$, $(x^2)'=2x$", explanation: "Standardowe pochodne." },
            { step: "Wstaw do wzoru", latex: "$f'(x)=\\tfrac{\\tfrac{1}{x}\\cdot x^2-\\ln x\\cdot2x}{x^4}$", explanation: "Zastosuj definicję ilorazu." },
            { step: "Uprość", latex: "$f'(x)=\\tfrac{x-2x\\ln x}{x^4}=\\tfrac{1-2\\ln x}{x^3}$", explanation: "Skróć wspólny czynnik x." }
          ],
          final_answer: "$f'(x)=\\dfrac{1-2\\ln x}{x^3}$",
          explanation: "Uważne uproszczenie po podstawieniu do reguły ilorazu.",
          time_estimate: 320,
          difficulty_level: 4
        },
        {
          example_code: "DER_004",
          problem_statement: "Policz pochodną $f(x)=\\sin(x^2+1)$.",
          solution_steps: [
            { step: "Rozpoznaj złożenie", latex: "$f(x)=\\sin(u)$, $u=x^2+1$", explanation: "Potrzebna reguła łańcuchowa." },
            { step: "Zastosuj łańcuchową", latex: "$f'=\\cos(u)\\cdot u'$", explanation: "Pochodna sinusa razy pochodna wnętrza." },
            { step: "Policz $u'$", latex: "$(x^2+1)'=2x$", explanation: "Pochodna wielomianu." },
            { step: "Podstaw", latex: "$f'(x)=\\cos(x^2+1)\\cdot2x$", explanation: "Wynik końcowy." }
          ],
          final_answer: "$f'(x)=2x\\cos(x^2+1)$",
          explanation: "Klasyczne złożenie funkcji: sinus z kwadratem.",
          time_estimate: 320,
          difficulty_level: 4
        },
        {
          example_code: "DER_005",
          problem_statement: "Wyznacz pochodną $f(x)=e^{3x}\\cdot\\cos x$.",
          solution_steps: [
            { step: "Iloczyn funkcji", latex: "$(fg)'=f'g+fg'$", explanation: "Użyj iloczynu dla $e^{3x}$ i $\\cos x$." },
            { step: "Pochodne składników", latex: "$(e^{3x})'=3e^{3x}$, $(\\cos x)'=-\\sin x$", explanation: "Reguła łańcuchowa i podstawowa pochodna cos." },
            { step: "Złóż", latex: "$f'=3e^{3x}\\cos x+e^{3x}(-\\sin x)$", explanation: "Zastosuj wzór produktu." },
            { step: "Wspólny czynnik", latex: "$f'=e^{3x}(3\\cos x-\\sin x)$", explanation: "Uproszczenie ułatwia dalsze użycie." }
          ],
          final_answer: "$f'(x)=e^{3x}(3\\cos x-\\sin x)$",
          explanation: "Połączenie reguły łańcuchowej i iloczynu.",
          time_estimate: 330,
          difficulty_level: 4
        },
        {
          example_code: "DER_006",
          problem_statement: "Znajdź równanie stycznej do wykresu $y=\\ln(x^2+1)$ w punkcie o argumencie $x=0$.",
          solution_steps: [
            { step: "Wartość funkcji", latex: "$y_0=\\ln(0^2+1)=0$", explanation: "Punkt styczności to (0,0)." },
            { step: "Pochodna funkcji", latex: "$y'=\\tfrac{1}{x^2+1}\\cdot2x$", explanation: "Reguła łańcuchowa dla ln." },
            { step: "Nachylenie", latex: "$m=y'(0)=0$", explanation: "Podstaw $x=0$ do pochodnej." },
            { step: "Równanie stycznej", latex: "$y=m(x-0)+y_0=0$", explanation: "Styczna: $y=0$ (oś OX)." }
          ],
          final_answer: "$y=0$",
          explanation: "Styczna ma nachylenie 0, więc pokrywa się z osią OX.",
          time_estimate: 340,
          difficulty_level: 5
        }
      ],
      practice_exercises: [
        {
          exercise_code: "EX_DER_001",
          problem_statement: "Oblicz $\\dfrac{d}{dx}(5x^3-2x+7)$.",
          expected_answer: "$15x^2-2$",
          difficulty_level: 3,
          time_estimate: 300,
          misconception_map: {
            incorrect_answer_1: { type: "constant_rule", feedback: "Pamiętaj, że pochodna stałej jest 0, więc 7 znika." },
            incorrect_answer_2: { type: "power_rule_error", feedback: "Zastosuj $\\dfrac{d}{dx}x^3=3x^2$, a potem pomnóż przez 5." }
          }
        },
        {
          exercise_code: "EX_DER_002",
          problem_statement: "Wyznacz pochodną $f(x)=(x^2-1)(x+4)$.",
          expected_answer: "$f'(x)=2x(x+4)+(x^2-1)$",
          difficulty_level: 3,
          time_estimate: 310,
          misconception_map: {
            incorrect_answer_1: { type: "product_as_sum", feedback: "To iloczyn, nie suma. Użyj $(fg)'=f'g+fg'$." },
            incorrect_answer_2: { type: "algebra_simplify", feedback: "Możesz też najpierw wymnożyć i zróżniczkować, ale zachowaj poprawność rachunkową." }
          }
        },
        {
          exercise_code: "EX_DER_003",
          problem_statement: "Policz $\\dfrac{d}{dx}\\left(\\dfrac{\\sin x}{x}\\right)$ dla $x\\neq0$.",
          expected_answer: "$\\dfrac{x\\cos x-\\sin x}{x^2}$",
          difficulty_level: 3,
          time_estimate: 320,
          misconception_map: {
            incorrect_answer_1: { type: "quotient_missing", feedback: "Nie różnicz licznika i mianownika osobno. Użyj wzoru na iloraz." },
            incorrect_answer_2: { type: "sign_error", feedback: "Uważaj na kolejność $f'g-fg'$ w liczniku." }
          }
        },
        {
          exercise_code: "EX_DER_004",
          problem_statement: "Oblicz $y'$ dla $y=\\ln(3x-2)$.",
          expected_answer: "$y'=\\dfrac{3}{3x-2}$",
          difficulty_level: 4,
          time_estimate: 330,
          misconception_map: {
            incorrect_answer_1: { type: "chain_rule_miss", feedback: "Stosuj łańcuchową: $(\\ln u)'=u'/u$ z $u=3x-2$." },
            incorrect_answer_2: { type: "domain_check", feedback: "Pamiętaj o dziedzinie: $3x-2>0$." }
          }
        },
        {
          exercise_code: "EX_DER_005",
          problem_statement: "Wyznacz pochodną $f(x)=e^{2x}\\tan x$.",
          expected_answer: "$f'(x)=e^{2x}(2\\tan x+\\tfrac{1}{\\cos^2 x})$",
          difficulty_level: 4,
          time_estimate: 350,
          misconception_map: {
            incorrect_answer_1: { type: "product_chain_mix", feedback: "Użyj $(fg)'=f'g+fg'$, a $(e^{2x})'=2e^{2x}$." },
            incorrect_answer_2: { type: "trig_derivative_error", feedback: "$(\\tan x)'=1/\\cos^2 x$, nie $\\cos x$ ani $\\sin x$." }
          }
        },
        {
          exercise_code: "EX_DER_006",
          problem_statement: "Dla $f(x)=x^3-3x$ znajdź punkty krytyczne i określ ich typ.",
          expected_answer: "Punkty: $x=-1,1$; $f''(x)=6x$, więc w $-1$ maksimum, w $1$ minimum",
          difficulty_level: 4,
          time_estimate: 360,
          misconception_map: {
            incorrect_answer_1: { type: "critical_points_find", feedback: "Policz $f'(x)=3x^2-3$ i rozwiąż $f'(x)=0$." },
            incorrect_answer_2: { type: "second_derivative_test", feedback: "Zastosuj test: $f''(-1)=-6<0$ (max), $f''(1)=6>0$ (min)." }
          }
        },
        {
          exercise_code: "EX_DER_007",
          problem_statement: "Napisz równanie stycznej do $y=\\sqrt{x}$ w punkcie $x=4$.",
          expected_answer: "$y=\\tfrac{1}{4}(x-4)+2$",
          difficulty_level: 5,
          time_estimate: 370,
          misconception_map: {
            incorrect_answer_1: { type: "chain_derivative_root", feedback: "$(\\sqrt{x})'=\\tfrac{1}{2\\sqrt{x}}$. Podstaw $x=4$." },
            incorrect_answer_2: { type: "tangent_formula", feedback: "Użyj $y=f'(a)(x-a)+f(a)$ z $a=4$, $f(4)=2$, $f'(4)=1/4$." }
          }
        },
        {
          exercise_code: "EX_DER_008",
          problem_statement: "Dla $g(x)=\\ln x - x/2$ znajdź przedziały monotoniczności.",
          expected_answer: "g'(x)=1/x-1/2; rośnie na $(0,2)$, maleje na $(2,\\infty)$",
          difficulty_level: 5,
          time_estimate: 380,
          misconception_map: {
            incorrect_answer_1: { type: "sign_table_error", feedback: "Zaznacz miejsce zerowe $g'(x)=0\\Rightarrow x=2$ i zrób tabelę znaków." },
            incorrect_answer_2: { type: "domain_ignore", feedback: "Dziedzina to $x>0$; nie rozpatruj wartości nie-dodatnich." }
          }
        }
      ],
      misconception_patterns: [
        {
          pattern_code: "DER_PRODUCT_AS_SIMPLE",
          description: "Mylenie reguły iloczynu z \"różniczkowaniem każdego czynnika osobno\".",
          intervention_strategy: "Utrwal $(fg)'=f'g+fg'$ na prostych przykładach i kontrprzykładach liczbowych."
        },
        {
          pattern_code: "DER_QUOTIENT_AS_SIMPLE",
          description: "Różniczkowanie ilorazu bez wzoru lub z błędną kolejnością $f'g-fg'$.",
          intervention_strategy: "Stale zapisuj licznik jako $f'g-fg'$ i ćwicz kontrolę znaku oraz nawiasów."
        },
        {
          pattern_code: "DER_CHAIN_RULE_MISS",
          description: "Brak mnożnika od pochodnej wewnętrznej funkcji w złożeniach.",
          intervention_strategy: "Wprowadź substytucję $u=g(x)$, policz $f'(u)\\cdot u'$ i dopiero wróć do x."
        },
        {
          pattern_code: "DER_TRIG_RADIANS",
          description: "Stosowanie stopni zamiast radianów w pochodnych trygonometrycznych.",
          intervention_strategy: "Przypominaj, że wzory obowiązują w radianach; w razie potrzeby zamień jednostki."
        },
        {
          pattern_code: "DER_DOMAIN_IGNORED",
          description: "Ignorowanie dziedziny (np. $\\ln x$ dla $x\\le0$) przy analizie pochodnych i monotoniczności.",
          intervention_strategy: "Zawsze wypisz warunki dziedziny przed obliczeniami i analizą znaków."
        },
        {
          pattern_code: "DER_SECOND_TEST_MISUSE",
          description: "Błędna interpretacja testu drugiej pochodnej lub użycie przy $f''=0$.",
          intervention_strategy: "Gdy $f''(a)=0$, test nie rozstrzyga – użyj badania znaku $f'$ lub wyższych pochodnych."
        }
      ],
      real_world_applications: [
        {
          context: "Fizyka – ruch prostoliniowy",
          problem_description: "Wyznacz prędkość i przyspieszenie z położenia $s(t)$.",
          age_group: "liceum/studia",
          connection_explanation: "Pochodna $s'(t)$ to prędkość, a $s''(t)$ to przyspieszenie."
        },
        {
          context: "Ekonomia – koszt i zysk krańcowy",
          problem_description: "Określ marginalne zmiany kosztu przy produkcji o 1 jednostkę więcej.",
          age_group: "liceum/studia",
          connection_explanation: "Pochodna funkcji kosztu $C'(q)$ przybliża przyrost kosztu na jednostkę."
        },
        {
          context: "Inżynieria – optymalizacja",
          problem_description: "Minimalizacja zużycia materiału przy zadanych ograniczeniach geometrycznych.",
          age_group: "liceum/studia",
          connection_explanation: "Ekstrema lokalne wyznaczamy z równań $f'(x)=0$ i porównania wartości."
        },
        {
          context: "Biologia – tempo wzrostu",
          problem_description: "Analiza chwilowego tempa wzrostu populacji lub biomasy.",
          age_group: "liceum/studia",
          connection_explanation: "Pochodna modelu wzrostu daje szybkość zmian w czasie."
        }
      ],
      pedagogical_notes: {
        common_mistakes: [
          "Mylenie reguł: iloczyn/iloraz/łańcuchowa.",
          "Brak uwzględnienia dziedziny przed analizą pochodnej.",
          "Pominięcie mnożnika wewnętrznego w regule łańcuchowej.",
          "Stosowanie stopni zamiast radianów przy pochodnych trygonometrycznych.",
          "Niewłaściwe wnioski z testu drugiej pochodnej przy $f''=0$."
        ],
        teaching_tips: [
          "Twórz mapy myśli: wybór reguły w zależności od struktury wyrażenia.",
          "Ćwicz krótkie substytucje $u=g(x)$ przy każdym złożeniu.",
          "Po obliczeniu pochodnej wykonuj kontrolę: znak, dziedzina, sens fizyczny.",
          "Wprowadzaj zadania mieszane (wielomiany z trygonometrią/wykładniczą) by automatyzować wybór reguł.",
          "Wykorzystuj równanie stycznej do interpretacji graficznej wyniku."
        ],
        prerequisites: [
          "Rachunek granic (formy nieoznaczone i techniki)",
          "Funkcje elementarne i ich własności",
          "Algebra: przekształcenia, ułamki algebraiczne"
        ],
        estimated_time: 5100,
        difficulty_progression: "Start: pochodne funkcji elementarnych i liniowość (poziom 3). Dalej: reguła iloczynu/ilorazu i pierwsze złożenia (poziom 4). Finał: analiza ekstremów, styczne i zadania aplikacyjne (poziom 5)."
      },
      assessment_rubric: {
        scope: "Ocena opanowania pochodnej: obliczanie, interpretacja, ekstremum i styczna.",
        criteria: [
          {
            skill: "Rachunek pochodnych",
            beginner: "Liczy pochodne funkcji potęgowych i prostych sum.",
            intermediate: "Stosuje reguły iloczynu, ilorazu i łańcuchową w zadaniach standardowych.",
            advanced: "Sprawnie łączy reguły w złożonych wyrażeniach i upraszcza wynik."
          },
          {
            skill: "Analiza przebiegu zmienności",
            beginner: "Wskazuje punkty krytyczne z równania $f'(x)=0$.",
            intermediate: "Tworzy tabelę znaków $f'$ i wyznacza monotoniczność.",
            advanced: "Diagnozuje typy ekstremów z użyciem $f''$ i analizuje przegięcia."
          },
          {
            skill: "Interpretacja geometryczna i fizyczna",
            beginner: "Zapisuje równanie stycznej w danym punkcie.",
            intermediate: "Łączy pochodną z prędkością i nachyleniem wykresu.",
            advanced: "Modeluje proste problemy optymalizacyjne i interpretuje wynik w kontekście."
          },
          {
            skill: "Precyzja i kontrola",
            beginner: "Popełnia drobne błędy w znakach lub nawiasach.",
            intermediate: "Sprawdza dziedzinę i jednostki, koryguje błędy rachunkowe.",
            advanced: "Uzasadnia każdy krok i weryfikuje sens końcowego wyrażenia."
          }
        ]
      }
    }
  };

  return await importSingleSkillFromJSON(skillData);
};

export async function importPolynomialEquationsSkill() {
  console.log('Starting import for Równania i nierówności wielomianowe...');
  
  const skillData = {
    skillName: "Równania i nierówności wielomianowe",
    class_level: 2,
    department: "algebra",
    generator_params: {
      microSkill: "polynomial_equations_inequalities",
      difficultyRange: [2, 5],
      fallbackTrigger: "use_basic_polynomial_patterns"
    },
    teaching_flow: {
      phase1: { name: "Wprowadzenie", duration: 1500, activities: ["theory", "guided_examples"] },
      phase2: { name: "Ćwiczenia", duration: 2400, activities: ["practice", "feedback"] },
      phase3: { name: "Utrwalanie", duration: 1200, activities: ["mastery_tasks", "assessment"] }
    },
    content: {
      theory: {
        theory_text: "Wielomian to wyrażenie postaci P(x)=a_n*x^n+...+a_1*x+a_0 (gdzie a_n≠0), określone dla wszystkich x∈R. Podstawowe zadania licealne obejmują: rozwiązywanie równań wielomianowych P(x)=0 oraz nierówności wielomianowych P(x)>0, P(x)<0, P(x)≥0, P(x)≤0. Kluczowa idea: dla równań szukamy miejsc zerowych wielomianu (pierwiastków), dla nierówności badamy znak wielomianu na przedziałach wyznaczonych przez te miejsca zerowe. Najczęściej wykorzystujemy rozkład na czynniki, własność iloczynu równego zeru oraz tablicę znaków (metodę przedziałów). Równanie wielomianowe zaczynamy od uporządkowania i faktoryzacji. W praktyce: (1) wyłącz wspólny czynnik (np. x), (2) użyj wzorów skróconego mnożenia (x²-y²=(x-y)(x+y), (x±a)²=x²±2ax+a²), (3) dla kwadratowych zastosuj deltę Δ=b²-4ac i wzory x₁,₂=(-b±√Δ)/(2a), (4) przy sześciennych spróbuj grupować składniki lub sprawdzić racjonalne pierwiastki. Gdy znajdziesz pierwiastek x₀, możesz podzielić wielomian przez (x-x₀) by obniżyć stopień. Nierówności wielomianowe rozwiązujemy przez: (A) przeniesienie wszystkich składników na jedną stronę, (B) faktoryzację P(x), (C) wyznaczenie miejsc zerowych z krotnością, (D) analizę znaku na przedziałach. Reguła zmiany znaku: gdy przechodzimy przez pierwiastek o krotności nieparzystej, znak iloczynu zmienia się; przy krotności parzystej – nie zmienia. W metodzie przedziałów sprowadź do postaci P(x)>0 lub P(x)<0 i korzystaj z tabeli znaków. Dla rozstrzygnięcia o włączeniu końców przedziałów pamiętaj: przy nierównościach ostrych (>,<) pierwiastków nie włączamy; przy nieostrych (≥,≤) pierwiastki należą do rozwiązania.",
        key_formulas: [
          "$ab=0\\iff a=0\\vee b=0$",
          "$x^2-y^2=(x-y)(x+y)$",
          "$\\Delta=b^2-4ac$",
          "$x_{1,2}=\\tfrac{-b\\pm\\sqrt\\Delta}{2a}$",
          "$P(x)\\,\\square\\,0\\Rightarrow P(x)=\\prod (x-a_i)^{k_i}$",
          "$k\\text{ parz.}\\Rightarrow\\text{brak zmiany znaku}$",
          "$k\\text{ nieparz.}\\Rightarrow\\text{zmiana znaku}$",
          "$t=x^2\\ \\text{(podstawienie)}$",
          "$P>0:\\ \\text{nad osią},\\ P<0:\\ \\text{pod osią}$",
          "$x^4-y^4=(x^2-y^2)(x^2+y^2)$"
        ],
        time_estimate: 600,
        difficulty_level: 4
      },
      examples: [
        {
          example_code: "POLYINEQ_001",
          problem_statement: "Rozwiąż równanie $x^2-5x+6=0$.",
          solution_steps: [
            { step: "Wzór skróconego mnożenia", latex: "$x^2-5x+6=(x-2)(x-3)$", explanation: "Szukamy dwóch liczb o sumie 5 i iloczynie 6." },
            { step: "Iloczyn równy zeru", latex: "$(x-2)(x-3)=0$", explanation: "Co najmniej jeden czynnik musi być zerem." },
            { step: "Rozwiązania", latex: "$x=2\\ \\vee\\ x=3$", explanation: "Odczytujemy pierwiastki z liniowych czynników." }
          ],
          final_answer: "$\\{2,3\\}$",
          explanation: "Faktoryzacja kwadratowa i własność iloczynu równego zeru.",
          time_estimate: 280,
          difficulty_level: 3
        },
        {
          example_code: "POLYINEQ_002", 
          problem_statement: "Rozwiąż równanie $x^3-x^2-x+1=0$.",
          solution_steps: [
            { step: "Grupowanie", latex: "$x^2(x-1)-(x-1)$", explanation: "Wyłączamy wspólny czynnik $(x-1)$." },
            { step: "Rozkład", latex: "$(x-1)(x^2-1)$", explanation: "Drugi czynnik to różnica kwadratów." },
            { step: "Dalszy rozkład", latex: "$(x-1)^2(x+1)$", explanation: "$x^2-1=(x-1)(x+1)$." },
            { step: "Pierwiastki i krotności", latex: "$x=1\\ (k=2),\\ x=-1\\ (k=1)$", explanation: "Krotność 2 przy $x=1$." }
          ],
          final_answer: "$\\{-1,1\\}$",
          explanation: "Równanie ma pierwiastki $-1$ i $1$ (ten drugi podwójny).",
          time_estimate: 300,
          difficulty_level: 3
        }
      ],
      practice_exercises: [
        {
          exercise_code: "EX_POLY_001",
          problem_statement: "Rozwiąż równanie $x(x-4)=0$.",
          expected_answer: "$\\{0,4\\}$",
          difficulty_level: 3,
          time_estimate: 300,
          misconception_map: {
            "incorrect_answer_1": { type: "zero_product_miss", feedback: "Użyj $ab=0\\iff a=0\\vee b=0$: sprawdź oba czynniki." },
            "incorrect_answer_2": { type: "lost_root", feedback: "Nie pomijaj $x=0$ – to pełnoprawne rozwiązanie." }
          }
        }
      ]
    },
    misconception_patterns: [
      {
        pattern_code: "POLY_MOVE_ONE_SIDE",
        description: "Analiza bez przeniesienia wszystkiego na jedną stronę (P(x)=0).",
        intervention_strategy: "Zawsze sprowadzaj do P(x)=0, dopiero potem rozkładaj i analizuj znak."
      }
    ],
    real_world_applications: [
      {
        context: "Fizyka – rzut pionowy",
        problem_description: "Dla modelu h(t)=-gt^2+v_0t+h_0 wyznacz czasy, gdy h(t)≥H.",
        age_group: "liceum/studia",
        connection_explanation: "Nierówność kwadratowa w czasie decyduje o przedziale, gdy wysokość jest powyżej progu."
      }
    ],
    pedagogical_notes: {
      common_mistakes: [
        "Brak sprowadzenia do P(x)=0 przed analizą.",
        "Błędna faktoryzacja i pomijanie wspólnych czynników.",
        "Mylenie ostrych i nieostrych nierówności przy włączaniu końców."
      ],
      teaching_tips: [
        "Ucz schematu: przenieś → rozłóż → wypisz korzenie z krotnościami → tablica znaków → odczyt."
      ],
      prerequisites: [
        "Wzory skróconego mnożenia i faktoryzacja trójmianu kwadratowego",
        "Rozwiązywanie równań liniowych i kwadratowych"
      ],
      estimated_time: 5100,
      difficulty_progression: "Start: równania i proste nierówności kwadratowe (poziom 3). Dalej: iloczyny z krotnościami i układy korzeni (poziom 4). Finał: wyższe stopnie, podstawienia i parametry (poziom 5)."
    },
    assessment_rubric: {
      scope: "Ocena biegłości w rozwiązywaniu równań i nierówności wielomianowych z użyciem faktoryzacji i metody przedziałów.",
      criteria: [
        {
          skill: "Faktoryzacja i identyfikacja",
          beginner: "Rozpoznaje wzory skróconego mnożenia i wyłącza wspólne czynniki.",
          intermediate: "Sprawnie rozkłada trójmian i proste wielomiany wyższych stopni.",
          advanced: "Stosuje grupowanie, podstawienia i Hornera do systematycznej faktoryzacji."
        }
      ]
    }
  };

  return await importSingleSkillFromJSON(skillData);
};

export async function importPlaneGeometrySkill() {
  const skillData = {
    skillName: "Planimetria – wielokąty i okręgi",
    class_level: 2,
    department: "geometria",
    generator_params: {
      microSkill: "plane_geometry_polygons_circles",
      difficultyRange: [2, 5],
      fallbackTrigger: "use_basic_geometry_patterns"
    },
    teaching_flow: {
      phase1: { name: "Wprowadzenie", duration: 1500, activities: ["theory", "guided_examples"] },
      phase2: { name: "Ćwiczenia", duration: 2400, activities: ["practice", "feedback"] },
      phase3: { name: "Utrwalanie", duration: 1200, activities: ["mastery_tasks", "assessment"] }
    },
    content: {
      theory: {
        theory_text: "Planimetria bada własności figur płaskich: wielokątów (trójkąty, czworokąty, wielokąty foremne) oraz figur krzywoliniowych, przede wszystkim okręgu i koła. Kluczowe kompetencje licealne obejmują: obliczanie obwodów i pól, rozpoznawanie i stosowanie podobieństwa, pracę z kątami w wielokątach, własnościami okręgu (kąty wpisane i środkowe, styczne, cięciwy), a także wykorzystanie twierdzeń Ptolemeusza, Talesa, Pitagorasa i zależności trygonometrycznych w trójkątach. Wielokąty: suma kątów wewnętrznych n-kąta wynosi (n−2)·180°, a kąt wewnętrzny w n-kącie foremnym ma miarę ((n−2)·180°)/n. Kąty zewnętrzne w dowolnym wielokącie sumują się do 360°. W trójkącie suma kątów to 180°, wysokości przecinają się w ortocentrum, symetralne boków w środku okręgu opisanego, a dwusieczne w środku okręgu wpisanego. Pole trójkąta najczęściej liczymy ze wzoru S=(1/2)·a·h_a lub z Herona, gdy znamy boki. W prostokątnym trójkącie działa twierdzenie Pitagorasa a^2+b^2=c^2 oraz zależności na promienie okręgów wpisanego i opisanego. Dla czworokątów: pole równoległoboku to S=a·h lub S=|u×v| interpretowane geometrycznie, pole trapezu S=((a+b)/2)·h, a pole rombu S=(e·f)/2 (e,f – przekątne). Podobieństwo: figury podobne mają zgodne kąty i boki w stałym stosunku k. Obwody skalują się jak k, pola jak k^2. Podobieństwo jest podstawą wielu obliczeń pośrednich: gdy nie znamy bezpośrednio długości, ale możemy zbudować trójkąty podobne, wyznaczymy niewiadome przez proporcje. Okrąg i koło: okrąg to zbiór punktów w równej odległości r od środka; koło to obszar wewnętrzny. Długość okręgu to 2πr, pole koła πr^2. Długość łuku o kącie środkowym α (w stopniach) wynosi l=(α/360°)·2πr, a pole wycinka S=(α/360°)·πr^2. Promień jest prostopadły do stycznej w punkcie styczności. Cięciwa łączy dwa punkty okręgu; średnica jest najdłuższą cięciwą. Kąt środkowy oparty na tym samym łuku jest dwa razy większy od kąta wpisanego: ∠środkowy = 2·∠wpisany. Kąt między styczną a cięciwą równy jest kątowi wpisanemu opartemu na tym samym łuku. Potęga punktu: dla punktu P i dwóch cięciw przecinających okrąg w A,B oraz C,D zachodzi PA·PB=PC·PD. Dla stycznej PT i cięciwy przez P: PT^2=PA·PB. Te zależności pozwalają obliczać długości bez bezpośredniego mierzenia. Twierdzenie Talesa: jeśli punkty A,B,C leżą na okręgu, a AB to średnica, to ∠ACB=90°. W praktyce ułatwia to rozpoznawanie trójkątów prostokątnych wpisanych w okrąg. Z kolei dla trójkątów równoramiennych (a=b) kąty przy podstawie są równe; w równobocznym każdy kąt ma 60°, wysokość jest jednocześnie dwusieczną i symetralną. Strategie rozwiązywania: (1) Narysuj czytelny szkic z oznaczeniami. (2) Zidentyfikuj informacje o kątach (sumy w wielokątach, równości w figurach szczególnych). (3) Sprawdź możliwość podobieństwa (AAA, bądź kombinacje bok–kąt). (4) Przy okręgu sprawdź relacje: kąt wpisany–środkowy, styczna–promień, potęga punktu. (5) W obliczeniach pól zdecyduj o najwygodniejszym wzorze (wysokość, przekątne, Heron, rozbicie na proste figury). (6) Kontroluj jednostki i sens wyniku (pole >0, długości dodatnie). Typowe pułapki: mylenie kątów wpisanych opartych na różnych łukach (szczególnie położonych po drugiej stronie cięciwy), zapominanie o przeliczeniu stopni na radiany w zadaniach łączonych z analizą, niewłaściwe podstawienie do Herona (p – semiperimetr, nie obwód), błędna identyfikacja podobieństwa (zbieżność jednego kąta nie wystarcza), nieuwzględnienie krotności rozwiązań (np. dwa możliwe trójkąty przy danych bokach i kącie). W praktyce egzaminacyjnej dominują zadania wielokrokowe: najpierw wykazujemy pewne własności (np. prostopadłość stycznej i promienia), potem stosujemy podobieństwo, a na końcu obliczamy żądaną długość, kąt lub pole. Precyzyjny rysunek, konsekwentne oznaczenia i świadome korzystanie z podstawowych twierdzeń to klucz do sukcesu.",
        key_formulas: [
          "$\\sum \\alpha_{\\text{wew}}=(n-2)\\cdot180^\\circ$",
          "$\\alpha_{\\text{foremny}}=\\tfrac{(n-2)\\cdot180^\\circ}{n}$",
          "$P_{\\text{koła}}=\\pi r^2$",
          "$L_{\\text{okr}}=2\\pi r$",
          "$l=\\tfrac{\\alpha}{360^\\circ}\\cdot2\\pi r$",
          "$S_{\\text{wyc}}=\\tfrac{\\alpha}{360^\\circ}\\cdot\\pi r^2$",
          "$a^2+b^2=c^2$",
          "$S_{\\triangle}=\\tfrac12 a h_a$",
          "$S_{\\text{trapez}}=\\tfrac{a+b}{2}\\cdot h$",
          "$S_{\\text{romb}}=\\tfrac{e\\cdot f}{2}$",
          "$S_{\\triangle}=\\sqrt{p(p-a)(p-b)(p-c)}$",
          "$k=\\tfrac{a'}{a},\\ P' = kP,\\ S' = k^2 S$",
          "$\\angle_{\\text{wpis}}=\\tfrac12\\,\\angle_{\\text{środk}}$",
          "$PT^2=PA\\cdot PB$",
          "$PA\\cdot PB=PC\\cdot PD$",
          "$\\text{Tales: } AB\\text{ średnica }\\Rightarrow \\angle ACB=90^\\circ$"
        ],
        time_estimate: 600,
        difficulty_level: 4
      },
      examples: [
        {
          example_code: "PLAN_001",
          problem_statement: "Trójkąt ma bok $a=10\\,\\text{cm}$ i wysokość $h_a=6\\,\\text{cm}$. Oblicz pole.",
          solution_steps: [
            { step: "Wybór wzoru", latex: "$S=\\tfrac12 a h_a$", explanation: "Pole trójkąta jako połowa iloczynu boku i odpowiadającej mu wysokości." },
            { step: "Podstawienie", latex: "$S=\\tfrac12\\cdot10\\cdot6$", explanation: "Podstaw wartości z zadania." },
            { step: "Obliczenie", latex: "$S=30\\,\\text{cm}^2$", explanation: "Prosty rachunek." }
          ],
          final_answer: "$30\\,\\text{cm}^2$",
          explanation: "Najprostszy wzór na pole trójkąta przy znanych $a$ i $h_a$.",
          time_estimate: 280,
          difficulty_level: 3
        },
        {
          example_code: "PLAN_002",
          problem_statement: "W trójkącie prostokątnym przyprostokątne mają $3$ i $4$. Oblicz przeciwprostokątną i obwód.",
          solution_steps: [
            { step: "Twierdzenie Pitagorasa", latex: "$c=\\sqrt{3^2+4^2}$", explanation: "Zależność $a^2+b^2=c^2$." },
            { step: "Obliczenie $c$", latex: "$c=\\sqrt{9+16}=5$", explanation: "Klasyczny trójkąt 3–4–5." },
            { step: "Obwód", latex: "$O=3+4+5=12$", explanation: "Suma długości boków." }
          ],
          final_answer: "$c=5$, $O=12$",
          explanation: "Bezpośrednie użycie Pitagorasa i definicji obwodu.",
          time_estimate: 300,
          difficulty_level: 3
        }
      ],
      practice_exercises: [
        {
          exercise_code: "EX_PLAN_001",
          problem_statement: "Oblicz sumę kątów wewnętrznych siedmiokąta.",
          expected_answer: "$(7-2)\\cdot180^\\circ=900^\\circ$",
          difficulty_level: 3,
          time_estimate: 300,
          misconception_map: {
            "incorrect_answer_1": { type: "wrong_formula", feedback: "Użyj $(n-2)\\cdot180^\\circ$, nie $n\\cdot180^\\circ$." },
            "incorrect_answer_2": { type: "arithmetic_error", feedback: "Policz $5\\cdot180^\\circ=900^\\circ$ uważnie." }
          }
        },
        {
          exercise_code: "EX_PLAN_002",
          problem_statement: "Wielokąt foremny ma kąt wewnętrzny $150^\\circ$. Wyznacz liczbę boków $n$.",
          expected_answer: "$150=\\tfrac{(n-2)\\cdot180}{n}\\Rightarrow n=12$",
          difficulty_level: 3,
          time_estimate: 310,
          misconception_map: {
            "incorrect_answer_1": { type: "invert_fraction", feedback: "Pomnóż obustronnie przez $n$, a dopiero potem rozwiązuj równanie." },
            "incorrect_answer_2": { type: "angle_misuse", feedback: "Nie używaj $360^\\circ/n$ – to kąt środkowy, nie wewnętrzny." }
          }
        }
      ]
    },
    misconception_patterns: [
      {
        pattern_code: "GEO_INNER_ANGLE_SUM",
        description: "Stosowanie błędnej sumy kątów w wielokącie (np. $n\\cdot180^\\circ$).",
        intervention_strategy: "Zawsze rysuj podział na $(n-2)$ trójkąty i stosuj $(n-2)\\cdot180^\\circ$."
      },
      {
        pattern_code: "GEO_SIMILARITY_CONFUSION", 
        description: "Mylenie zgodności jednego kąta z podobieństwem całych trójkątów.",
        intervention_strategy: "Wymagaj co najmniej AAA; zaznacz odpowiadające sobie wierzchołki i sprawdź proporcje boków."
      }
    ],
    real_world_applications: [
      {
        context: "Architektura i budownictwo",
        problem_description: "Dobór promienia łuku i długości stycznych w sklepieniach i mostach.",
        age_group: "liceum/studia",
        connection_explanation: "Długości łuków i wycinków oraz potęga punktu modelują relacje w łukach i podporach."
      }
    ],
    pedagogical_notes: {
      common_mistakes: [
        "Użycie złych wzorów na kąty wewnętrzne i zewnętrzne.",
        "Mylenie wzorów na łuk i wycinek koła.",
        "Błędne parowanie odcinków w potędze punktu.",
        "Niepoprawne rozpoznanie podobieństwa i ról odpowiadających sobie boków.",
        "Pomyłki rachunkowe w Heronie (semiperimetr vs obwód)."
      ],
      teaching_tips: [
        "Zawsze zaczynaj od rysunku i oznaczeń – jasne schematy minimalizują błędy.",
        "Stosuj kolorowanie odpowiadających sobie kątów/boków przy podobieństwie.",
        "Twórz tabele wzorów: obwody/pola figur, łuk/wycinek, potęga punktu – z przykładem liczbowym.",
        "Ucz rozkładania figur na prostsze (trójkąty, trapezy) i sumowania pól.",
        "Ćwicz krótkie dowody własności okręgu, by świadomie używać twierdzeń."
      ],
      prerequisites: [
        "Algebra: proporcje, rozwiązywanie równań liniowych i prostych równań kwadratowych",
        "Trygonometria podstawowa w trójkącie",
        "Umiejętność pracy z jednostkami i przybliżeniami liczbowymi"
      ],
      estimated_time: 5100,
      difficulty_progression: "Start: obwody i pola podstawowych figur oraz suma kątów (poziom 3). Dalej: okrąg – kąty wpisane/środkowe, łuki i wycinki, potęga punktu (poziom 4). Finał: zadania z podobieństwem i łączeniem wielu własności w jednym rozwiązaniu (poziom 5)."
    },
    assessment_rubric: {
      scope: "Ocena kompetencji w planimetrii: obwody, pola, własności okręgu i podobieństwo.",
      criteria: [
        {
          skill: "Obwody i pola figur",
          beginner: "Stosuje podstawowe wzory dla trójkąta, koła i trapezu.",
          intermediate: "Dobiera właściwy wzór do sytuacji i poprawnie podstawia dane.",
          advanced: "Rozbija figury złożone na proste i sumuje pola, kontrolując jednostki."
        },
        {
          skill: "Własności okręgu",
          beginner: "Rozpoznaje kąty wpisane i środkowe oraz ich relację.",
          intermediate: "Stosuje styczność, potęgę punktu i relacje cięciw.",
          advanced: "Łączy kilka własności w jednym zadaniu dowodowym/obliczeniowym."
        }
      ]
    }
  };

  try {
    console.log('Starting import for Planimetria – wielokąty i okręgi...');
    return await importSingleSkillFromJSON(skillData);
  } catch (error) {
    console.error('Error importing Planimetria – wielokąty i okręgi:', error);
    throw error;
  }
};

// Import function for Stereometria – bryły
export const importSolidGeometrySkill = async (): Promise<SkillImportResult> => {
  const skillData = {
    skillName: "Stereometria – bryły",
    class_level: 3,
    department: "geometria",
    generatorParams: {
      microSkill: "solid_geometry_solids",
      difficultyRange: [2, 5],
      fallbackTrigger: "use_basic_geometry_patterns"
    },
    teachingFlow: {
      phase1: { name: "Wprowadzenie", duration: 1500, activities: ["theory", "guided_examples"] },
      phase2: { name: "Ćwiczenia", duration: 2400, activities: ["practice", "feedback"] },
      phase3: { name: "Utrwalanie", duration: 1200, activities: ["mastery_tasks", "assessment"] }
    },
    content: {
      theory: {
        introduction: "Stereometria bada figury w przestrzeni: bryły wielościenne (graniastosłupy, ostrosłupy) oraz obrotowe (walec, stożek, kula). Kluczowe kompetencje na poziomie liceum obejmują: rozumienie pojęcia przekroju, obliczanie pola powierzchni całkowitej i bocznej, objętości, zależności skali (podobieństwo w 3D), a także proste zagadnienia metryczne w prostopadłościanie (przekątna przestrzenna). Centralna idea: objętość mierzy ilość przestrzeni zajmowanej przez bryłę, a pole powierzchni - ilość materiału potrzebnego na jej pokrycie. W bryłach o podstawie wielokąta istotne są wielkości: pole podstawy Pp, obwód podstawy op, wysokość H (odległość między płaszczyznami podstaw), wysokości ścian bocznych i apotemy (w ostrosłupach i stożkach oznaczane zwykle l). Graniastosłup prosty ma ściany boczne prostopadłe do podstawy; jego objętość to V=Pp·H, a pole boczne Sbok=op·H (suma pól prostokątów), zaś pole całkowite S=2Pp+Sbok. Dla prostopadłościanu o krawędziach a,b,c przekątna przestrzenna wynosi d=√(a²+b²+c²); w sześcianie d=a√3. Ostrosłup (o podstawie dowolnego wielokąta) ma V=(1/3)Pp·H. Pole boczne ostrosłupa prawidłowego (podstawa foremna, wierzchołek nad środkiem) można ująć jako Sbok=(1/2)·op·l, gdzie l to wysokość ściany bocznej (apotema). Bryły obrotowe powstają przez obrót figury płaskiej wokół prostej: walec - obrót prostokąta wokół boku, stożek - obrót trójkąta prostokątnego, kula - obrót półokręgu. Dla walca o promieniu r i wysokości H mamy: objętość V=πr²H, pole boczne Sbok=2πrH, pole całkowite S=2πr²+2πrH. Stożek o promieniu podstawy r, wysokości H i tworzącej l=√(r²+H²) ma V=(1/3)πr²H, Sbok=πrl, S=πr²+πrl. Ścięty stożek o promieniach R (większym) i r (mniejszym) oraz wysokości H: V=(1/3)πH(R²+Rr+r²), Sbok=π(R+r)l (z l - tworzącą ściętego stożka). Kula: V=(4/3)πr³ i S=4πr². Przekroje brył (cięcia płaszczyzną) pozwalają ujawnić zależności metryczne i często upraszczają obliczenia: przekrój osiowy walca lub stożka to prostokąt lub trójkąt, w których można zastosować Pitagorasa; przekroje w prostopadłościanie prowadzą do trójkątów prostokątnych ujawniających przekątne i odległości. Podobieństwo w przestrzeni: jeśli dwie bryły są podobne ze skalą k (np. dwa podobne ostrosłupy/walce), to odpowiednie długości skalują się jak k, pola powierzchni jak k², a objętości jak k³. Ta reguła jest kluczowa w zadaniach o skalowaniu modeli, optymalizacji materiałowej i szacowaniu kosztów (np. farba vs. objętość betonu). W praktyce egzaminacyjnej typowe zadania obejmują: (1) czyste obliczenia V i S przy podanych wymiarach; (2) wynajdywanie brakującego parametru z innego (np. z pola bocznego stożka oblicz l, a potem H); (3) rozwiązywanie zadań złożonych (bryły złożone, odejmowanie brył, wypełnienia), (4) przekroje i zastosowanie Pitagorasa w 3D, (5) podobieństwo i skalowanie. Zawsze sprawdzaj jednostki (cm² vs cm³) i sens liczbowy (pole/objętość dodatnia). Częste pułapki to mylenie promienia z średnicą, mieszanie pola bocznego i całkowitego, zapominanie o czynniku 1/3 w ostrosłupach i stożkach oraz podstawianie tworzącej l w miejsce wysokości H. Strategia rozwiązywania: (1) Zidentyfikuj bryłę i wypisz znane parametry. (2) Wybierz odpowiedni wzór (V, Sbok, S) i sprawdź, czy potrzebujesz H czy l - jeśli brakuje, użyj przekroju i Pitagorasa. (3) Dla brył złożonych rozbij problem na składniki i sumuj/odejmuj pola lub objętości. (4) Przy skalowaniu zidentyfikuj k i zastosuj prawa k²/k³. (5) Kontroluj jednostki i wykonaj test przybliżeniowy, by uniknąć błędów rzędu wielkości. Dodatkowo, dla wielościanów wypukłych obowiązuje wzór Eulera V−E+F=2 (V - liczba wierzchołków, E - krawędzi, F - ścian). Pozwala on sprawdzać spójność danych w zadaniach konstrukcyjnych i teoretycznych. W zastosowaniach technicznych umiejętność liczenia objętości i pól przekłada się na koszty materiałów (beton, blacha, farba), czasu napełniania zbiorników (walce, ścięte stożki - silosy) oraz projektowania opakowań (minimalizacja materiału przy zadanej objętości).",
        keyConceptsLaTex: [
          "$V_{\\text{gr}}=P_p\\cdot H$",
          "$S_{\\text{bok gr}}=o_p\\cdot H$", 
          "$S_{\\text{cał gr}}=2P_p+o_pH$",
          "$d_{\\text{prostop}}=\\sqrt{a^2+b^2+c^2}$",
          "$V_{\\text{ost}}=\\tfrac{1}{3}P_pH$",
          "$S_{\\text{bok ost}}=\\tfrac{1}{2}o_p\\,l$",
          "$V_{\\text{wal}}=\\pi r^2H$",
          "$S_{\\text{bok wal}}=2\\pi rH$",
          "$V_{\\text{sto}}=\\tfrac{1}{3}\\pi r^2H$",
          "$S_{\\text{bok sto}}=\\pi rl$",
          "$l=\\sqrt{r^2+H^2}$",
          "$V_{\\text{kuli}}=\\tfrac{4}{3}\\pi r^3$",
          "$S_{\\text{kuli}}=4\\pi r^2$",
          "$V_{\\text{sto ścięty}}=\\tfrac{1}{3}\\pi H(R^2+Rr+r^2)$",
          "$S':S=k^2:1,\\ V':V=k^3:1$",
          "$V-E+F=2$"
        ],
        timeEstimate: 600
      },
      examples: [
        {
          title: "STEREO_001",
          problem: "Prostopadłościan ma krawędzie $a=3$, $b=4$, $c=12$. Oblicz przekątną przestrzenną i pole powierzchni całkowitej.",
          solution: {
            steps: [
              { step: "Przekątna przestrzenna", latex: "$d=\\sqrt{a^2+b^2+c^2}$", explanation: "Twierdzenie Pitagorasa w 3D." },
              { step: "Podstaw", latex: "$d=\\sqrt{3^2+4^2+12^2}=\\sqrt{9+16+144}$", explanation: "Sumujemy kwadraty krawędzi." },
              { step: "Wynik d", latex: "$d=\\sqrt{169}=13$", explanation: "Pierwiastek z 169." },
              { step: "Pole całkowite", latex: "$S=2(ab+bc+ac)$", explanation: "Suma pól par przeciwległych ścian." },
              { step: "Podstaw i policz", latex: "$S=2(12+48+36)=2\\cdot96=192$", explanation: "Pola w jednostkach kwadratowych." }
            ],
            final_answer: "$d=13$, $S=192$"
          },
          expectedAnswer: "$d=13$, $S=192$",
          maturaConnection: "Zastosowano wzory na przekątną prostopadłościanu i pole całkowite.",
          timeEstimate: 300
        },
        {
          title: "STEREO_002", 
          problem: "Walec ma promień $r=5$ i wysokość $H=10$. Oblicz pole boczne i objętość.",
          solution: {
            steps: [
              { step: "Pole boczne", latex: "$S_{bok}=2\\pi rH$", explanation: "Prostokąt o bokach $2\\pi r$ i $H$ po rozwinięciu." },
              { step: "Objętość", latex: "$V=\\pi r^2H$", explanation: "Pole podstawy razy wysokość." },
              { step: "Podstawienia", latex: "$S_{bok}=2\\pi\\cdot5\\cdot10=100\\pi$", explanation: "Łatwe mnożenie." },
              { step: "Policz V", latex: "$V=\\pi\\cdot25\\cdot10=250\\pi$", explanation: "Kwadrat promienia razy wysokość." }
            ],
            final_answer: "$S_{bok}=100\\pi$, $V=250\\pi$"
          },
          expectedAnswer: "$S_{bok}=100\\pi$, $V=250\\pi$",
          maturaConnection: "Standardowe wzory walca.",
          timeEstimate: 280
        }
      ],
      practiceExercises: [
        {
          exerciseId: "EX_STEREO_001",
          difficulty: 3,
          problem: "Graniastosłup prawidłowy sześciokątny ma $P_p=54\\sqrt{3}$ i $H=7$. Oblicz objętość.",
          expectedAnswer: "$V=378\\sqrt{3}$",
          hints: [],
          timeEstimate: 320
        },
        {
          exerciseId: "EX_STEREO_002", 
          difficulty: 3,
          problem: "Sześcian ma objętość $V=343$. Oblicz pole powierzchni całkowitej.",
          expectedAnswer: "$S=294$",
          hints: [],
          timeEstimate: 330
        }
      ]
    },
    pedagogicalNotes: {
      commonMistakes: [
        "Mylone wzory na pola boczne i całkowite.",
        "Zamiana promienia ze średnicą w obliczeniach.",
        "Brak czynnika 1/3 przy stożku i ostrosłupie.",
        "Podstawianie l zamiast H w stożku.",
        "Błędne skalowanie pól i objętości przy podobieństwie."
      ],
      teachingTips: [
        "Zawsze wykonuj przekrój pomocniczy i podpisz wszystkie wielkości (r,H,l).",
        "Twórz tabelę wzorów (V, S_bok, S) dla każdej bryły z jednostkami.",
        "Dawaj zadania porównawcze: dwie bryły podobne – jak zmienia się S i V.",
        "Stosuj zadania złożone (sumy/różnice brył), by utrwalać rozbijanie problemu.",
        "Weryfikuj wyniki przez oszacowanie: czy rząd wielkości ma sens?"
      ],
      prerequisites: ["Planimetria: pola wielokątów i koła", "Twierdzenie Pitagorasa, trygonometria w trójkącie", "Operacje na potęgach i pierwiastkach"],
      estimatedTime: 5100,
      difficultyProgression: "Start: podstawowe wzory V i S dla walca/graniastosłupa (poziom 3). Dalej: stożek, ostrosłup, przekroje i zależności l,H,r (poziom 4). Finał: bryły złożone, ścięte, podobieństwo z k²/k³ (poziom 5)."
    },
    misconceptionPatterns: [
      {
        pattern: "STEREO_SIDE_TOTAL_MIX",
        description: "Mylenie pola bocznego z całkowitym (dodawanie/odejmowanie pól podstaw).",
        feedback: "Zapisz osobno S_bok i S_cał; podkreśl kiedy dodajemy 2P_p (graniastosłup/walec).",
        remediation: "Zadania porównawcze z i bez podstaw.",
        prerequisiteGap: "Rozróżnianie powierzchni bocznej i całkowitej"
      }
    ],
    realWorldApplications: [
      {
        context: "Inżynieria lądowa",
        example: "Obliczanie ilości betonu potrzebnego do słupa (walec) i fundamentu (prostopadłościan).",
        practicalUse: "Objętości brył bezpośrednio przekładają się na zapotrzebowanie materiału.",
        careerConnection: "Budownictwo, architektura"
      }
    ],
    assessmentRubric: {
      scope: "Ocena biegłości w stereometrii: pola, objętości, przekroje i podobieństwo w 3D.",
      criteria: [
        {
          skill: "Obliczanie pól i objętości",
          podstawowy: "Stosuje podstawowe wzory dla graniastosłupa i walca przy kompletnych danych.",
          rozszerzony: "Wyznacza brakujące parametry (np. l) i liczy pola/objętości stożka, kuli, ostrosłupa.",
          uniwersytecki: "Rozwiązuje zadania z bryłami złożonymi i ściętymi, łączy kilka wzorów."
        }
      ]
    }
  };

  try {
    console.log('Starting import for Stereometria – bryły...');
    return await importSingleSkillFromJSON(skillData);
  } catch (error) {
    console.error('Error importing Stereometria – bryły:', error);
    throw error;
  }
};

// Import function for Kombinatoryka i prawdopodobieństwo
export const importCombinatoricsProbabilitySkill = async (): Promise<SkillImportResult> => {
  const skillData = {
    skillName: "Kombinatoryka i prawdopodobieństwo",
    class_level: 3,
    department: "statystyka_prawdopodobienstwo",
    generatorParams: {
      microSkill: "combinatorics_probability_basics",
      difficultyRange: [2, 5],
      fallbackTrigger: "use_basic_probability_patterns"
    },
    teachingFlow: {
      phase1: { name: "Wprowadzenie", duration: 1500, activities: ["theory", "guided_examples"] },
      phase2: { name: "Ćwiczenia", duration: 2400, activities: ["practice", "feedback"] },
      phase3: { name: "Utrwalanie", duration: 1200, activities: ["mastery_tasks", "assessment"] }
    },
    content: {
      theory: {
        introduction: "Kombinatoryka dostarcza narzędzi do liczenia liczby możliwości w zadaniach dyskretnych, a rachunek prawdopodobieństwa przypisuje tym możliwościom miary szansy zajścia zdarzenia. Kluczowe idee to zasady sumy i mnożenia, rozróżnienie permutacji, wariacji i kombinacji (z i bez powtórzeń), a także prawdopodobieństwo klasyczne, warunkowe, niezależność, twierdzenie o prawdopodobieństwie całkowitym, wzór Bayesa oraz rozkład dwumianowy (schemat Bernoulliego). Model zliczania: jeśli doświadczenie przebiega w kolejnych niezależnych etapach o odpowiednio m i n możliwościach, to łączna liczba wyników to m*n (zasada mnożenia). Jeśli rozważamy rozłączne przypadki (nie zachodzą jednocześnie), to liczba wszystkich wyników to suma liczności (zasada sumy). Bardzo często wybór strategii sprowadza się do decyzji: czy kolejność ma znaczenie? czy elementy mogą się powtarzać? Gdy kolejność ma znaczenie i brak powtórzeń, używamy wariacji bez powtórzeń; gdy kolejność ma znaczenie i powtórzenia są dozwolone - wariacji z powtórzeniami. Gdy kolejność nie ma znaczenia i brak powtórzeń, stosujemy kombinacje; jeżeli dopuszczamy powtórzenia - kombinacje z powtórzeniami (na poziomie liceum zwykle pomijane lub wprowadzane jako rozszerzenie). Permutacje opisują przestawienia wszystkich n elementów (z lub bez powtórzeń).",
        keyConceptsLaTex: [
          "$n(A\\cup B)=n(A)+n(B)-n(A\\cap B)$",
          "$P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$",
          "$P(A)=\\frac{|A|}{|\\Omega|}$",
          "$P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}$",
          "$P(A\\cap B)=P(A)P(B)$",
          "$n!=1\\cdot2\\cdots n$",
          "$P_n=n!$",
          "$P_{n}^{(n_1,\\dots,n_k)}=\\frac{n!}{n_1!\\cdots n_k!}$",
          "$V(n,k)=\\frac{n!}{(n-k)!}$",
          "$V'(n,k)=n^k$",
          "$C(n,k)=\\frac{n!}{k!(n-k)!}$",
          "$\\binom{n}{k}=\\binom{n}{n-k}$",
          "$(a+b)^n=\\sum_{k=0}^n \\binom{n}{k}a^{n-k}b^k$",
          "$P(A)=\\sum_i P(A\\mid B_i)P(B_i)$",
          "$P(B_i\\mid A)=\\frac{P(A\\mid B_i)P(B_i)}{\\sum_j P(A\\mid B_j)P(B_j)}$",
          "$P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}$",
          "$E[X]=np,\\ Var(X)=np(1-p)$"
        ],
        timeEstimate: 600
      },
      examples: [
        {
          title: "COMBPROB_001",
          problem: "Ile jest możliwych kodów PIN czterocyfrowych, jeśli cyfry mogą się powtarzać?",
          solution: {
            steps: [
              { step: "Model etapowy", latex: "$4$ miejsca, cyfry $0$-$9$", explanation: "Każde miejsce wybieramy niezależnie spośród 10 cyfr." },
              { step: "Zasada mnożenia", latex: "$10\\cdot10\\cdot10\\cdot10$", explanation: "Powtórzenia dozwolone, kolejność ma znaczenie." },
              { step: "Wynik", latex: "$10^4=10000$", explanation: "Łączna liczba PIN-ów." }
            ],
            final_answer: "$10000$"
          },
          expectedAnswer: "$10000$",
          maturaConnection: "Wariacje z powtórzeniami: $V'(10,4)=10^4$.",
          timeEstimate: 280
        },
        {
          title: "COMBPROB_002",
          problem: "Na ile sposobów można ustawić litery wyrazu $ANANAS$?",
          solution: {
            steps: [
              { step: "Policz grupy", latex: "$A\\times3,\\ N\\times2,\\ S\\times1$", explanation: "Są powtórzenia liter." },
              { step: "Permutacje z powtórzeniami", latex: "$\\dfrac{6!}{3!\\,2!\\,1!}$", explanation: "Dzielimy przez permutacje w obrębie identycznych liter." },
              { step: "Oblicz", latex: "$\\dfrac{720}{6\\cdot2}=60$", explanation: "Upraszczamy ułamki." }
            ],
            final_answer: "$60$"
          },
          expectedAnswer: "$60$",
          maturaConnection: "Permutacje z powtórzeniami dla multizbioru liter.",
          timeEstimate: 300
        }
      ],
      practiceExercises: [
        {
          exerciseId: "EX_CP_001",
          difficulty: 3,
          problem: "Ile jest 5-literowych haseł z liter $A$-$Z$, jeśli litery mogą się powtarzać?",
          expectedAnswer: "$26^5$",
          hints: [],
          timeEstimate: 300
        },
        {
          exerciseId: "EX_CP_002",
          difficulty: 3,
          problem: "Na ile sposobów można wybrać 4-osobową drużynę z 10 kandydatów?",
          expectedAnswer: "$\\binom{10}{4}=210$",
          hints: [],
          timeEstimate: 310
        }
      ]
    },
    pedagogicalNotes: {
      commonMistakes: [
        "Użycie kombinacji, gdy kolejność ma znaczenie (lub odwrotnie).",
        "Pominięcie części wspólnej przy sumowaniu przypadków.",
        "Nieuprawnione założenie niezależności zdarzeń.",
        "Odwracanie warunku bez zastosowania wzoru Bayesa.",
        "Błędny dobór parametrów w rozkładzie dwumianowym lub brak dopełnienia."
      ],
      teachingTips: [
        "Zaczynaj od pytań kontrolnych: kolejność? powtórzenia? rozłączność?",
        "Rysuj drzewa prawdopodobieństw i diagramy Venna, aby wizualizować strukturę zdarzeń.",
        "Ćwicz pary zadań: (kombinacje vs wariacje) na tym samym zbiorze danych.",
        "Stosuj dopełnienie w zadaniach co najmniej raz, by oszczędzić rachunki.",
        "Łącz zadania liczności z prawdopodobieństwem - ten sam model służy obu obszarom."
      ],
      prerequisites: [
        "Algebra elementarna: potęgi, silnia, ułamki.",
        "Podstawy teorii zbiorów i logiki zdarzeń.",
        "Umiejętność czytania i tworzenia drzew decyzyjnych."
      ],
      estimatedTime: 5100
    }
  };

  try {
    console.log('Starting import for Kombinatoryka i prawdopodobieństwo...');
    return await importSingleSkillFromJSON(skillData);
  } catch (error) {
    console.error('Error importing Kombinatoryka i prawdopodobieństwo:', error);
    throw error;
  }
};

// Batch import function for ChatGPT generated content
export async function batchImportSkillContent(chatGPTData: { contentDatabase: ChatGPTSkillContent[] }): Promise<BatchImportResult> {
  console.log('Starting batch import from ChatGPT data...');
  
  const results: SkillImportResult[] = [];
  let successful = 0;
  let failed = 0;

  // Validate input structure
  if (!chatGPTData?.contentDatabase || !Array.isArray(chatGPTData.contentDatabase)) {
    throw new Error('Invalid data structure: expected { contentDatabase: [...] }');
  }

  // Process each skill from ChatGPT
  for (const skill of chatGPTData.contentDatabase) {
    try {
      // Map skillId to existing skill in database
      let targetSkillId = skill.skillId;
      
      // If skillId is a custom identifier, try to find by name
      if (!targetSkillId || typeof targetSkillId !== 'string' || targetSkillId.startsWith('skill_')) {
        const { data: existingSkill } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skill.skillName)
          .single();
        
        if (existingSkill) {
          targetSkillId = existingSkill.id;
        } else {
          results.push({
            skillName: skill.skillName,
            result: {
              success: false,
              error: `Skill not found in database: ${skill.skillName}`
            }
          });
          failed++;
          continue;
        }
      }

      // Import unified skill content
      const unifiedContentData = {
        theory: skill.content?.theory ? {
          theory_text: skill.content.theory.introduction || '',
          key_formulas: skill.content.theory.keyConceptsLaTex || [],
          time_estimate: skill.content.theory.timeEstimate || 300,
          difficulty_level: skill.generatorParams?.difficultyRange?.[0] || 1,
          created_at: new Date().toISOString()
        } : null,
        examples: skill.content?.examples?.map((example: any, index: number) => ({
          example_code: `${skill.skillName.toLowerCase().replace(/\s+/g, '_')}_ex_${index + 1}`,
          problem_statement: example.problem || '',
          solution_steps: example.solution?.steps?.map((step: any) => step.step) || [],
          final_answer: example.solution?.final_answer || '',
          explanation: example.explanation || example.maturaConnection || '',
          difficulty_level: example.difficulty || skill.generatorParams?.difficultyRange?.[0] || 1,
          time_estimate: example.timeEstimate || 120
        })) || [],
        exercises: skill.content?.practiceExercises?.map((exercise: any) => ({
          exercise_code: exercise.exerciseId || `${skill.skillName.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 6)}`,
          problem_statement: exercise.problem || '',
          expected_answer: exercise.expectedAnswer || '',
          difficulty_level: exercise.difficulty || 1,
          time_estimate: exercise.timeEstimate || 180,
          misconception_map: exercise.misconceptionTriggers || {},
          hints: exercise.hints?.map((hint: any) => hint.hint) || []
        })) || [],
        pedagogical_notes: skill.pedagogicalNotes ? {
          scaffolding_questions: skill.pedagogicalNotes.teachingTips || [],
          teaching_flow: ["theory", "examples", "practice", "assessment"],
          estimated_total_time: skill.pedagogicalNotes.estimatedTime || 3600,
          prerequisite_description: skill.pedagogicalNotes.prerequisites?.join(', ') || '',
          next_topic_description: skill.pedagogicalNotes.universityConnection || ''
        } : null,
        assessment_rubric: skill.assessmentRubric || {
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
        department: skill.department || 'mathematics',
        level: 'primary',
        class_level: skill.class_level || 1,
        men_code: skill.skillId || '',
        difficulty_rating: skill.generatorParams?.difficultyRange?.[0] || 1,
        estimated_time_minutes: Math.round((skill.pedagogicalNotes?.estimatedTime || 3600) / 60),
        prerequisites: skill.pedagogicalNotes?.prerequisites || [],
        learning_objectives: [],
        chapter_tag: skill.department || ''
      };

      // Check if content is complete
      const isComplete = !!(
        unifiedContentData.theory?.theory_text && 
        unifiedContentData.examples?.length > 0 &&
        unifiedContentData.exercises?.length > 0
      );

      const { error: unifiedError } = await supabase
        .from('unified_skill_content')
        .upsert([{
          skill_id: targetSkillId,
          content_data: unifiedContentData,
          metadata: metadata,
          is_complete: isComplete,
          version: 1
        }]);

      if (unifiedError) {
        console.error(`Error inserting unified content for ${skill.skillName}:`, unifiedError);
        results.push({
          skillName: skill.skillName,
          result: {
            success: false,
            error: `Failed to import: ${unifiedError.message}`
          }
        });
        failed++;
        continue;
      }

      console.log(`Successfully imported skill: ${skill.skillName}`);
      results.push({
        skillName: skill.skillName,
        result: {
          success: true,
          skillId: targetSkillId
        }
      });
      successful++;

    } catch (error) {
      console.error(`Failed to import skill ${skill.skillName}:`, error);
      results.push({
        skillName: skill.skillName,
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      failed++;
    }
  }

  const batchResult: BatchImportResult = {
    totalProcessed: chatGPTData.contentDatabase.length,
    successful,
    failed,
    details: results
  };

  console.log('Batch import completed:', batchResult);
  return batchResult;
}

// Generate ChatGPT prompts for missing skills
export async function generateChatGPTPrompts(): Promise<{ prompts: string[], skillCounts: Record<string, number> }> {
  // Get missing skills grouped by class level
  const { data: missingSkills } = await supabase
    .from('skills')
    .select('id, name, class_level, department')
    .not('id', 'in', `(SELECT skill_id FROM unified_skill_content WHERE is_complete = true)`)
    .order('class_level, department, name');

  if (!missingSkills) return { prompts: [], skillCounts: {} };

  // Group skills by class level for batch processing
  const skillsByLevel: Record<number, typeof missingSkills> = {};
  const skillCounts: Record<string, number> = {};

  missingSkills.forEach(skill => {
    if (!skillsByLevel[skill.class_level]) {
      skillsByLevel[skill.class_level] = [];
    }
    skillsByLevel[skill.class_level].push(skill);
    
    const key = `Class ${skill.class_level}`;
    skillCounts[key] = (skillCounts[key] || 0) + 1;
  });

  const prompts: string[] = [];
  
  // Generate prompts for each class level batch (max 20 skills per prompt)
  Object.entries(skillsByLevel).forEach(([level, skills]) => {
    const classLevel = parseInt(level);
    const chunks = [];
    
    // Split into chunks of 20 skills
    for (let i = 0; i < skills.length; i += 20) {
      chunks.push(skills.slice(i, i + 20));
    }

    chunks.forEach((chunk, chunkIndex) => {
      const prompt = `# Generowanie Treści dla Klasy ${classLevel} - Batch ${chunkIndex + 1}

Wygeneruj pełną treść edukacyjną dla poniższych ${chunk.length} umiejętności z klasy ${classLevel} polskiej szkoły podstawowej/średniej.

## Umiejętności do wygenerowania:

${chunk.map((skill, index) => `${index + 1}. **${skill.name}** (ID: ${skill.id}, Dział: ${skill.department})`).join('\n')}

## Wymagania:

1. **Format**: Zwróć TYLKO prawidłowy JSON w formacie:
\`\`\`json
{
  "contentDatabase": [
    // ... ${chunk.length} umiejętności z pełną strukturą
  ]
}
\`\`\`

2. **Struktura każdej umiejętności**:
   - skillId: użyj dokładnie podanego ID z listy powyżej
   - skillName: użyj dokładnie podanej nazwy z listy powyżej  
   - class_level: ${classLevel}
   - department: użyj podanego działu
   - generatorParams: { microSkill: "default", difficultyRange: [1, ${Math.min(classLevel + 2, 10)}], fallbackTrigger: "standard_approach" }

3. **Zawartość (content)**:
   - theory: wprowadzenie (maks 100 słów), keyConceptsLaTex (wzory inline $...$)
   - examples: 2-3 przykłady z rozwiązaniem krok po kroku
   - practiceExercises: 3-5 ćwiczeń o rosnącej trudności

4. **Polskie nazewnictwo**: Wszystko w języku polskim, dostosowane do poziomu klasy ${classLevel}

5. **LaTeX**: TYLKO inline $wzory$ (maks 50 znaków), NO display math $$...$$

6. **Czas**: Wszystkie timeEstimate w sekundach (60-300 dla teorii, 120-600 dla ćwiczeń)

**UWAGA**: Odpowiedz TYLKO prawidłowym JSON bez dodatkowych komentarzy!`;

      prompts.push(prompt);
    });
  });

  return { prompts, skillCounts };
}