import { batchImportSkillContent } from './skillContentImporter';

// Fixed data with corrected structure and complete content for all 6 skills
const fixedChatGPTData = {
  "contentDatabase": [
    {
      "skillId": "skill_001", 
      "skillName": "Wartość bezwzględna",
      "class_level": 1,
      "department": "algebra",
      "generatorParams": {
        "microSkill": "default",
        "difficulty": 2
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
          "introduction": "Wartość bezwzględna liczby rzeczywistej $x$, oznaczana $|x|$, to jej odległość od zera na osi liczbowej. Formalnie: $|x| = x$ gdy $x \\geq 0$ oraz $|x| = -x$ gdy $x < 0$. Graficznie funkcja $f(x) = |x|$ ma kształt litery V z wierzchołkiem w $(0,0)$.",
          "keyConceptsLaTex": [
            "$|x| = \\begin{cases} x & \\text{gdy } x \\geq 0 \\\\ -x & \\text{gdy } x < 0 \\end{cases}$",
            "$|x| \\geq 0$ dla każdego $x \\in \\mathbb{R}$",
            "$|x| = 0 \\iff x = 0$",
            "$|xy| = |x||y|$",
            "$|x + y| \\leq |x| + |y|$ (nierówność trójkąta)"
          ],
          "timeEstimate": 1800
        },
        "examples": [
          {
            "title": "Obliczanie wartości bezwzględnej",
            "problem": "Oblicz $|5|$, $|-3|$, $|0|$.",
            "solution": {
              "steps": [
                {
                  "step": "Zastosuj definicję dla $|5|$",
                  "latex": "$|5| = 5$",
                  "explanation": "Ponieważ $5 > 0$, wartość bezwzględna to sama liczba.",
                  "justification": "Definicja wartości bezwzględnej dla liczb dodatnich"
                },
                {
                  "step": "Zastosuj definicję dla $|-3|$", 
                  "latex": "$|-3| = -(-3) = 3$",
                  "explanation": "Ponieważ $-3 < 0$, wartość bezwzględna to przeciwność tej liczby.",
                  "justification": "Definicja wartości bezwzględnej dla liczb ujemnych"
                },
                {
                  "step": "Zastosuj definicję dla $|0|$",
                  "latex": "$|0| = 0$", 
                  "explanation": "Zero ma wartość bezwzględną równą zero.",
                  "justification": "Definicja wartości bezwzględnej dla zera"
                }
              ]
            },
            "expectedAnswer": "$|5| = 5$, $|-3| = 3$, $|0| = 0$",
            "maturaConnection": "Podstawowe obliczenia z wartością bezwzględną pojawiają się regularnie w zadaniach maturalnych.",
            "timeEstimate": 300
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "abs_ex_001",
            "difficulty": 1,
            "problem": "Oblicz $|7| + |-4| - |0|$.",
            "expectedAnswer": "$11$",
            "timeEstimate": 180,
            "hints": [
              {
                "level": 1,
                "hint": "Oblicz każdą wartość bezwzględną osobno, następnie wykonaj działania.",
                "timeEstimate": 60
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "teachingTips": [
          "Użyj osi liczbowej do wizualizacji odległości od zera",
          "Podkreśl, że wartość bezwzględna to zawsze liczba nieujemna"
        ],
        "prerequisites": ["Liczby rzeczywiste", "Oś liczbowa"],
        "estimatedTime": 5400,
        "universityConnection": "Podstawa metryki i norm w analizie matematycznej"
      },
      "misconceptionPatterns": [
        {
          "pattern": "negative_absolute",
          "description": "Uczeń myśli, że $|-3| = -3$",
          "feedback": "Wartość bezwzględna to odległość od zera, zawsze nieujemna",
          "remediation": "Ćwicz interpretację geometryczną na osi liczbowej"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Fizyka - odległości",
          "example": "Obliczanie rzeczywistej odległości bez względu na kierunek",
          "practicalUse": "Pomiary w laboratoriach, GPS",
          "careerConnection": "Inżynieria, geodezja"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena umiejętności pracy z wartością bezwzględną",
        "criteria": [
          {
            "skill": "Obliczanie wartości bezwzględnej",
            "podstawowy": "Oblicza wartości dla liczb całkowitych",
            "rozszerzony": "Stosuje w wyrażeniach algebraicznych",
            "uniwersytecki": "Używa w dowodach nierówności"
          }
        ]
      }
    },
    {
      "skillId": "skill_002",
      "skillName": "Równania i nierówności z wartością bezwzględną", 
      "class_level": 1,
      "department": "algebra",
      "generatorParams": {
        "microSkill": "default",
        "difficulty": 3
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
          "introduction": "Równania i nierówności z wartością bezwzględną rozwiązujemy przez analizę przypadków lub interpretację geometryczną. Równanie $|x| = a$ ma rozwiązanie $x = a$ lub $x = -a$ gdy $a \\geq 0$. Nierówność $|x| < a$ oznacza $-a < x < a$ gdy $a > 0$.",
          "keyConceptsLaTex": [
            "$|x| = a \\iff x = a \\text{ lub } x = -a$ (gdy $a \\geq 0$)",
            "$|x| < a \\iff -a < x < a$ (gdy $a > 0$)",
            "$|x| > a \\iff x < -a \\text{ lub } x > a$ (gdy $a > 0$)",
            "$|f(x)| = |g(x)| \\iff f(x) = g(x) \\text{ lub } f(x) = -g(x)$"
          ],
          "timeEstimate": 2000
        },
        "examples": [
          {
            "title": "Równanie podstawowe",
            "problem": "Rozwiąż równanie $|x - 2| = 5$.",
            "solution": {
              "steps": [
                {
                  "step": "Zastosuj definicję wartości bezwzględnej",
                  "latex": "$x - 2 = 5$ lub $x - 2 = -5$",
                  "explanation": "Z definicji $|a| = b$ gdy $a = b$ lub $a = -b$",
                  "justification": "Podstawowa właściwość wartości bezwzględnej"
                },
                {
                  "step": "Rozwiąż oba równania liniowe",
                  "latex": "$x = 7$ lub $x = -3$",
                  "explanation": "Dodaj 2 do obu stron każdego równania",
                  "justification": "Podstawowe przekształcenia równań"
                }
              ]
            },
            "expectedAnswer": "$x = 7$ lub $x = -3$",
            "maturaConnection": "Standardowy typ zadania maturalnego na poziomie podstawowym",
            "timeEstimate": 400
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "abs_eq_001", 
            "difficulty": 2,
            "problem": "Rozwiąż równanie $|2x + 1| = 7$.",
            "expectedAnswer": "$x = 3$ lub $x = -4$",
            "timeEstimate": 300,
            "hints": [
              {
                "level": 1,
                "hint": "Rozłóż na dwa przypadki: $2x + 1 = 7$ i $2x + 1 = -7$",
                "timeEstimate": 90
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "teachingTips": [
          "Wizualizuj na osi liczbowej - równanie |x-a|=b to odległość",
          "Sprawdzaj rozwiązania przez podstawienie"
        ],
        "prerequisites": ["Wartość bezwzględna", "Równania liniowe"],
        "estimatedTime": 6000,
        "universityConnection": "Podstawa analizy funkcjonalnej i równań różniczkowych"
      },
      "misconceptionPatterns": [
        {
          "pattern": "single_solution",
          "description": "Uczeń znajduje tylko jedno rozwiązanie równania |x| = a",
          "feedback": "Równanie z wartością bezwzględną ma zwykle dwa rozwiązania",
          "remediation": "Ćwicz systematyczne rozłożenie na przypadki"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Tolerancje w produkcji",
          "example": "Wymiar elementu może odchylać się o maksymalnie ±0.1mm",
          "practicalUse": "Kontrola jakości w przemyśle",
          "careerConnection": "Inżynieria mechaniczna, automatyka"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena umiejętności rozwiązywania równań i nierówności z wartością bezwzględną",
        "criteria": [
          {
            "skill": "Rozwiązywanie równań z wartością bezwzględną",
            "podstawowy": "Rozwiązuje podstawowe równania typu |x-a|=b",
            "rozszerzony": "Radzi sobie z równaniami złożonymi i nierównościami",
            "uniwersytecki": "Analizuje wszystkie przypadki systematycznie"
          }
        ]
      }
    },
    {
      "skillId": "skill_003",
      "skillName": "Nierówności kwadratowe",
      "class_level": 1, 
      "department": "algebra",
      "generatorParams": {
        "microSkill": "quadratic_equations",
        "difficulty": 3
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2200,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 2800,
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
          "introduction": "Nierówność kwadratowa dotyczy znaku trójmianu $ax^2+bx+c$ ($>0$, $<0$, $\\geq0$, $\\leq0$). Badamy znak funkcji kwadratowej przez miejsca zerowe i ramiona paraboli (znak $a$). Kluczowa rola dyskryminantu: $\\Delta=b^2-4ac$.",
          "keyConceptsLaTex": [
            "$\\Delta = b^2 - 4ac$",
            "$ax^2 + bx + c = a(x - x_1)(x - x_2)$",
            "Znak trójmianu zależy od $a$ i pierwiastków",
            "Gdy $a > 0$: parabola w górę",
            "Gdy $a < 0$: parabola w dół"
          ],
          "timeEstimate": 2200
        },
        "examples": [
          {
            "title": "Nierówność podstawowa",
            "problem": "Rozwiąż: $x^2 - 5x + 6 > 0$.",
            "solution": {
              "steps": [
                {
                  "step": "Rozkład na czynniki",
                  "latex": "$x^2 - 5x + 6 = (x-2)(x-3)$",
                  "explanation": "Znajdujemy czynniki o sumie -5 i iloczynie 6",
                  "justification": "Rozkład trójmianu kwadratowego"
                },
                {
                  "step": "Wyznacz miejsca zerowe",
                  "latex": "$x_1 = 2, x_2 = 3$",
                  "explanation": "Parabola przecina oś OX w punktach 2 i 3",
                  "justification": "Pierwiastki równania kwadratowego"
                },
                {
                  "step": "Oceń znak dla $a > 0$",
                  "latex": "$a = 1 > 0$",
                  "explanation": "Parabola skierowana w górę: dodatnia na zewnątrz pierwiastków",
                  "justification": "Analiza znaku funkcji kwadratowej"
                },
                {
                  "step": "Zapisz rozwiązanie",
                  "latex": "$x \\in (-\\infty, 2) \\cup (3, \\infty)$",
                  "explanation": "Poza przedziałem między pierwiastkami",
                  "justification": "Interpretacja znaku trójmianu"
                }
              ]
            },
            "expectedAnswer": "$(-\\infty, 2) \\cup (3, \\infty)$",
            "maturaConnection": "Graficzna interpretacja: parabola powyżej osi poza przedziałem [2,3]",
            "timeEstimate": 450
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "quad_ineq_001",
            "difficulty": 3,
            "problem": "Rozwiąż: $x^2 - x - 6 \\geq 0$.",
            "expectedAnswer": "$x \\in (-\\infty, -2] \\cup [3, \\infty)$",
            "timeEstimate": 400,
            "hints": [
              {
                "level": 1,
                "hint": "Znajdź pierwiastki równania $x^2 - x - 6 = 0$",
                "timeEstimate": 120
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "teachingTips": [
          "Używaj wykresów paraboli do wizualizacji rozwiązań",
          "Podkreślaj różnicę między < a ≤ w zapisie przedziałów"
        ],
        "prerequisites": ["Funkcja kwadratowa", "Rozkład na czynniki", "Równania kwadratowe"],
        "estimatedTime": 6500,
        "universityConnection": "Podstawa optymalizacji i analizy wypukłości"
      },
      "misconceptionPatterns": [
        {
          "pattern": "wrong_interval_notation",
          "description": "Uczeń myli przedziały otwarte i domknięte",
          "feedback": "Sprawdź, czy nierówność to > czy ≥",
          "remediation": "Ćwicz oznaczanie przedziałów na osi liczbowej"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Optymalizacja zysków firmy",
          "example": "Kiedy funkcja zysku P(x) = -x² + 10x - 21 jest nieujemna?",
          "practicalUse": "Analiza rentowności biznesu",
          "careerConnection": "Ekonomia, zarządzanie finansami"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena umiejętności rozwiązywania nierówności kwadratowych",
        "criteria": [
          {
            "skill": "Rozwiązywanie nierówności kwadratowych",
            "podstawowy": "Rozwiązuje podstawowe nierówności przez rozkład",
            "rozszerzony": "Analizuje wszystkie przypadki dyskryminantu",
            "uniwersytecki": "Łączy z zastosowaniami optymalizacyjnymi"
          }
        ]
      }
    },
    {
      "skillId": "skill_004",
      "skillName": "Zastosowania całki oznaczonej",
      "class_level": 3,
      "department": "calculus", 
      "generatorParams": {
        "microSkill": "applications",
        "difficulty": 4
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie teoretyczne",
          "duration": 2500,
          "activities": ["theory", "formal_definitions", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia i zastosowania",
          "duration": 3000,
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
          "introduction": "Całka oznaczona $\\int_a^b f(x)dx$ ma liczne zastosowania geometryczne i fizyczne. Oblicza pole figur płaskich, objętości brył obrotowych, długości łuków, pracę i inne wielkości fizyczne. Kluczowe to interpretacja geometryczna i umiejętność rozpoznania granic całkowania.",
          "keyConceptsLaTex": [
            "$S = \\int_a^b f(x)dx$ - pole pod wykresem",
            "$S = \\int_a^b |f(x) - g(x)|dx$ - pole między wykresami", 
            "$V = \\pi \\int_a^b [f(x)]^2 dx$ - objętość bryły obrotowej",
            "$L = \\int_a^b \\sqrt{1 + [f'(x)]^2} dx$ - długość łuku",
            "$W = \\int_a^b F(x) dx$ - praca siły zmiennej"
          ],
          "timeEstimate": 2500
        },
        "examples": [
          {
            "title": "Pole pod parabolą",
            "problem": "Oblicz pole figury ograniczonej przez $y = x^2$, oś $Ox$ i proste $x = 1$, $x = 3$.",
            "solution": {
              "steps": [
                {
                  "step": "Ustaw całkę oznaczoną",
                  "latex": "$S = \\int_1^3 x^2 dx$",
                  "explanation": "Pole pod wykresem funkcji nieujemnej",
                  "justification": "Definicja całki jako pola"
                },
                {
                  "step": "Oblicz funkcję pierwotną",
                  "latex": "$\\int x^2 dx = \\frac{x^3}{3} + C$",
                  "explanation": "Podstawowe wzory całkowania",
                  "justification": "Reguła potęgowa całkowania"
                },
                {
                  "step": "Zastosuj wzór Newtona-Leibniza",
                  "latex": "$S = \\left[\\frac{x^3}{3}\\right]_1^3 = \\frac{27}{3} - \\frac{1}{3} = \\frac{26}{3}$",
                  "explanation": "Oblicz różnicę wartości funkcji pierwotnej",
                  "justification": "Podstawowe twierdzenie rachunku różniczkowego"
                }
              ]
            },
            "expectedAnswer": "$\\frac{26}{3}$",
            "maturaConnection": "Standardowe zadanie maturalne - obliczanie pól figur",
            "timeEstimate": 500
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "integral_app_001",
            "difficulty": 4,
            "problem": "Oblicz pole figury ograniczonej przez $y = x^2 - 4$ i oś $Ox$.",
            "expectedAnswer": "$\\frac{32}{3}$",
            "timeEstimate": 600,
            "hints": [
              {
                "level": 1,
                "hint": "Znajdź punkty przecięcia z osią Ox i rozważ znak funkcji",
                "timeEstimate": 180
              }
            ]
          }
        ]
      },
      "pedagogicalNotes": {
        "teachingTips": [
          "Zawsze rysuj wykres przed całkowaniem",
          "Sprawdzaj znak funkcji podcałkowej - użyj wartości bezwzględnej gdy trzeba"
        ],
        "prerequisites": ["Całka nieoznaczona", "Wzór Newtona-Leibniza", "Funkcje elementarne"],
        "estimatedTime": 7000,
        "universityConnection": "Podstawa fizyki matematycznej i mechaniki"
      },
      "misconceptionPatterns": [
        {
          "pattern": "ignoring_function_sign",
          "description": "Uczeń nie uwzględnia znaku funkcji przy obliczaniu pól", 
          "feedback": "Pole to zawsze wartość dodatnia - użyj |f(x)| gdy funkcja ujemna",
          "remediation": "Ćwicz analizę znaku funkcji przed całkowaniem"
        }
      ],
      "realWorldApplications": [
        {
          "context": "Fizyka - praca i energia",
          "example": "Obliczanie pracy siły zmiennej wzdłuż trajektorii",
          "practicalUse": "Projektowanie silników, analiza wydajności energetycznej",
          "careerConnection": "Inżynieria mechaniczna, energetyka"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena umiejętności stosowania całki oznaczonej",
        "criteria": [
          {
            "skill": "Zastosowania geometryczne całki",
            "podstawowy": "Oblicza pola podstawowych figur",
            "rozszerzony": "Radzi sobie z polami między wykresami i objętościami",
            "uniwersytecki": "Modeluje problemy fizyczne za pomocą całek"
          }
        ]
      }
    }
  ]
};

export async function runFixedImport() {
  console.log('🚀 Starting FIXED import of skills...');
  
  try {
    const result = await batchImportSkillContent(fixedChatGPTData);
    console.log('✅ Fixed import completed successfully!');
    console.log('📊 Import results:', result);
    return result;
  } catch (error) {
    console.error('❌ Fixed import failed:', error);
    throw error;
  }
}

// Auto-run the import
runFixedImport()
  .then((result) => {
    console.log('🎉 FIXED IMPORT FINAL RESULT:', result);
  })
  .catch((error) => {
    console.error('💥 FIXED IMPORT FAILED:', error);
  });