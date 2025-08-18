import { supabase } from '@/integrations/supabase/client';

const allContentPackages = {
  "contentDatabase": [
    {
      "skillId": "skill_008",
      "skillName": "Granica funkcji",
      "class_level": 2,
      "department": "calculus",
      "generatorParams": {
        "microSkill": "default",
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
          ]
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
        "microSkill": "combinatorics",
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
          ]
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
        "microSkill": "default",
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
          ]
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
        "microSkill": "derivatives",
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
          "keyConceptsLaTex": ["$f'(x)$", "$\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}$"],
          "formalDefinitions": [
            "Pochodną $f$ w punkcie $x$ definiujemy jako $f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}{h}$, jeśli granica istnieje.",
            "Funkcja różniczkowalna w przedziale ma pochodną w każdym jego punkcie."
          ]
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
        "microSkill": "integrals",
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
          "keyConceptsLaTex": ["$\\int f'(x)dx=f(x)+C$", "$\\int x^n dx=\\frac{x^{n+1}}{n+1}+C$"],
          "formalDefinitions": [
            "Funkcję $F$ nazywamy pierwotną $f$, gdy $F'(x)=f(x)$ dla każdego $x$ z dziedziny.",
            "Całka nieoznaczona $\\int f(x)dx$ jest rodziną wszystkich pierwotnych funkcji $f$."
          ]
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
        "microSkill": "default",
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
          "keyConceptsLaTex": ["$V_{walca}=\\pi r^2h$", "$V_{sto\\dot{z}}=\\tfrac{1}{3}\\pi r^2h$"],
          "formalDefinitions": [
            "Objętość to miara zajmowanej przestrzeni przez bryłę w 3D.",
            "Pole powierzchni całkowitej to suma pól wszystkich ścian bryły."
          ]
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
    },
    {
      "skillId": "skill_014",
      "skillName": "Rozkłady prawdopodobieństwa — dyskretne i ciągłe",
      "class_level": 3,
      "department": "statistics",
      "generatorParams": {
        "microSkill": "probability",
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
          "keyConceptsLaTex": ["$X\\sim\\text{Bin}(n,p)$", "$P(X=k)=\\binom{n}{k}p^k(1-p)^{n-k}$"],
          "formalDefinitions": [
            "Zmienna losowa dyskretna ma rozkład określony przez funkcję $P(X=k)$, a zmienna ciągła — przez gęstość, której całka na dowolnym przedziale daje prawdopodobieństwo.",
            "Rozkład dwumianowy modeluje liczbę sukcesów w $n$ próbach Bernoulliego z prawdopodobieństwem sukcesu $p$."
          ]
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
          "keyConceptsLaTex": ["$y'=f(x)y$", "$y=Ce^{\\int f(x)dx}$"],
          "formalDefinitions": [
            "Równanie separowalne: $\\frac{dy}{dx}=f(x)g(y)$, które rozwiązuje się przez rozdzielenie zmiennych i całkowanie po stronach.",
            "Równanie liniowe I rzędu: $y'+p(x)y=q(x)$; rozwiązujemy przez mnożenie czynnikiem całkującym i całkowanie."
          ]
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

const validateContentStructure = (content: any): string[] => {
  const errors: string[] = [];
  
  if (!Array.isArray(content.contentDatabase)) {
    errors.push('contentDatabase must be an array');
    return errors;
  }

  content.contentDatabase.forEach((skill: any, index: number) => {
    const prefix = `Skill ${index + 1}`;
    
    // Required fields
    if (!skill.skillId) errors.push(`${prefix}: Missing skillId`);
    if (!skill.skillName) errors.push(`${prefix}: Missing skillName`);
    if (!skill.class_level || skill.class_level < 1 || skill.class_level > 3) {
      errors.push(`${prefix}: class_level must be 1-3`);
    }
    
    // Generator params validation
    if (skill.generatorParams?.microSkill) {
      const validMicroSkills = [
        'linear_equations', 'quadratic_equations', 'factoring', 'area_perimeter',
        'angles', 'transformations', 'basic_operations', 'fractions', 'decimals',
        'linear_functions', 'graphing', 'domain_range', 'arithmetic', 'geometric',
        'patterns', 'basic_ratios', 'unit_circle', 'identities', 'derivatives',
        'integrals', 'applications', 'probability', 'descriptive', 'combinatorics',
        'default'
      ];
      
      if (!validMicroSkills.includes(skill.generatorParams.microSkill)) {
        // Auto-correct invalid microSkill to 'default'
        skill.generatorParams.microSkill = 'default';
      }
    }
  });
  
  return errors;
};

export const importAllContentPackages = async () => {
  try {
    const errors = validateContentStructure(allContentPackages);
    
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      return { success: false, errors };
    }
    
    let importedCount = 0;
    const importErrors: string[] = [];
    
    // Import to database
    for (const skill of allContentPackages.contentDatabase) {
      try {
        const { error } = await supabase
          .from('lessons')
          .upsert({
            topic_id: parseInt(skill.skillId.replace('skill_', '')) || Math.floor(Math.random() * 1000000),
            title: skill.skillName,
            content_data: skill.content,
            generator_params: skill.generatorParams,
            teaching_flow: skill.teachingFlow,
            misconception_patterns: skill.misconceptionPatterns,
            real_world_applications: skill.realWorldApplications,
            assessment_rubric: skill.assessmentRubric,
            difficulty_level: skill.class_level,
            is_active: true,
            content_type: 'comprehensive',
            description: `${skill.department} skill for class level ${skill.class_level}`,
            lesson_order: parseInt(skill.skillId.replace('skill_', '')) || 1,
            estimated_time_minutes: skill.pedagogicalNotes?.estimatedTime 
              ? Math.floor(skill.pedagogicalNotes.estimatedTime / 60) 
              : 90
          }, {
            onConflict: 'topic_id'
          });
          
        if (error) {
          console.error(`Import error for ${skill.skillName}:`, error);
          importErrors.push(`Failed to import skill: ${skill.skillName} - ${error.message}`);
        } else {
          importedCount++;
        }
      } catch (err) {
        console.error(`Exception importing ${skill.skillName}:`, err);
        importErrors.push(`Exception importing skill: ${skill.skillName}`);
      }
    }
    
    return { 
      success: importErrors.length === 0, 
      importedCount, 
      errors: importErrors,
      totalSkills: allContentPackages.contentDatabase.length
    };
    
  } catch (error) {
    console.error('Import process error:', error);
    return { 
      success: false, 
      errors: ['Failed to import content packages'], 
      importedCount: 0 
    };
  }
};