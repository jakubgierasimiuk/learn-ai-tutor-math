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
    
    // Insert into skills table (let database generate UUID)
    const { data: skillData, error: skillError } = await supabase
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

    // Import pedagogical notes to separate table
    if (skill.pedagogicalNotes) {
      const { error: pedagogicalError } = await supabase
        .from('skill_pedagogical_notes')
        .upsert([{
          skill_id: skillId,
          scaffolding_questions: skill.pedagogicalNotes.teachingTips || [],
          estimated_total_time: skill.pedagogicalNotes.estimatedTime || 3600,
          teaching_flow: ["theory", "examples", "practice", "assessment"],
          prerequisite_description: skill.pedagogicalNotes.prerequisites?.join(', ') || '',
          next_topic_description: skill.pedagogicalNotes.universityConnection || ''
        }]);

      if (pedagogicalError) {
        console.error(`Error inserting pedagogical notes for ${skill.skillName}:`, pedagogicalError);
      }
    }

    // Import theory content
    if (skill.content?.theory) {
      const { error: theoryError } = await supabase
        .from('skill_theory_content')
        .upsert([{
          skill_id: skillId,
          theory_text: skill.content.theory.introduction || '',
          key_formulas: skill.content.theory.keyConceptsLaTex || [],
          time_estimate: skill.content.theory.timeEstimate || 0
        }]);

      if (theoryError) {
        console.error(`Error inserting theory for ${skill.skillName}:`, theoryError);
      }
    }

    // Import examples
    if (skill.content?.examples) {
      for (const example of skill.content.examples) {
        const { error: exampleError } = await supabase
          .from('skill_examples')
          .upsert([{
            skill_id: skillId,
            problem_statement: example.problem || '',
            solution_steps: example.solution?.steps || [],
            example_code: example.title || '',
            explanation: example.maturaConnection || '',
            final_answer: example.solution?.final_answer || example.expectedAnswer || '',
            time_estimate: example.timeEstimate || 0
          }]);

        if (exampleError) {
          console.error(`Error inserting example for ${skill.skillName}:`, exampleError);
        }
      }
    }

    // Import exercises to practice exercises table  
    if (skill.content?.practiceExercises) {
      for (const exercise of skill.content.practiceExercises) {
        const { error: exerciseError } = await supabase
          .from('skill_practice_exercises')
          .upsert([{
            skill_id: skillId,
            exercise_code: exercise.exerciseId || '',
            difficulty_level: exercise.difficulty || 1,
            problem_statement: exercise.problem || '',
            expected_answer: exercise.expectedAnswer || '',
            hints: exercise.hints || [],
            misconception_map: {},
            time_estimate: exercise.timeEstimate || 0
          }]);

        if (exerciseError) {
          console.error(`Error inserting exercise for ${skill.skillName}:`, exerciseError);
        }
      }
    }

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