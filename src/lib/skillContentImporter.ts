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
    
    // Insert into skills table (corrected column mapping)
    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .upsert([{
        id: skill.skillId,
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