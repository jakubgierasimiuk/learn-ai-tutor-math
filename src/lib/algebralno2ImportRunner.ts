import { supabase } from '@/integrations/supabase/client';

const algebralno2Data = {
  "contentDatabase": [
    {
      "skillId": "ab7a796e-f284-4a68-85de-973f2efbd376",
      "skillName": "Liczby zespolone",
      "class_level": 2,
      "department": "algebra",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 8],
        "fallbackTrigger": "standard_approach"
      },
      "teachingFlow": {
        "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] },
        "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] },
        "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] }
      },
      "content": {
        "theory": {
          "introduction": "Liczby zespolone mają postać $z=a+bi$, gdzie $a,b\\in\\mathbb{R}$ oraz $i^2=-1$. Poznasz działania: dodawanie, odejmowanie, mnożenie, dzielenie (przez sprzężenie), a także pojęcia modułu i sprzężenia. Na płaszczyźnie Gaussa liczby reprezentujemy jako punkty $(a,b)$ lub wektory. Moduł $|z|$ to odległość od zera, a sprzężenie $\\bar z$ odbija punkt względem osi $OX$. Opanowanie rachunku i geometrii zespolonej ułatwia pracę z wielomianami i trygonometrią.",
          "keyConceptsLaTex": ["$z=a+bi$", "$i^2=-1$", "$\\bar z=a-bi$", "$|z|=\\sqrt{a^2+b^2}$", "$(a+bi)(c+di)=(ac-bd)+i(ad+bc)$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Mnożenie liczb zespolonych",
            "problem": "Oblicz $(1+2i)(3-i)$",
            "solution": "$(1\\cdot3-2\\cdot(-1))+i(1\\cdot(-1)+2\\cdot3)=5+5i$.",
            "explanation": "Stosujemy wzór na iloczyn i własność $i^2=-1$.",
            "timeEstimate": 300
          },
          {
            "title": "Dzielenie przez sprzężenie",
            "problem": "Oblicz $\\frac{1+i}{1-i}$",
            "solution": "Pomnóż licznik i mianownik przez $1+i$: $\\frac{(1+i)^2}{1-(-1)}=\\frac{1+2i+i^2}{2}=\\frac{2i}{2}=i$.",
            "explanation": "Użycie sprzężenia upraszcza mianownik do liczby rzeczywistej.",
            "timeEstimate": 300
          },
          {
            "title": "Moduł i sprzężenie",
            "problem": "Podaj $|3-4i|$ i $\\overline{(3-4i)}$",
            "solution": "$|3-4i|=5$, $\\overline{(3-4i)}=3+4i$.",
            "explanation": "Moduł to $\\sqrt{3^2+(-4)^2}$, sprzężenie zmienia znak części urojonej.",
            "timeEstimate": 240
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Wyznacz $\\overline{(2-3i)}$",
            "expectedAnswer": "2+3i",
            "hints": ["Zmień znak części urojonej", "Część rzeczywista bez zmian"],
            "timeEstimate": 240
          },
          {
            "type": "basic",
            "problem": "Oblicz $|3+4i|$",
            "expectedAnswer": "5",
            "hints": ["Zastosuj $|z|=\\sqrt{a^2+b^2}$", "Użyj 3-4-5"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Upraszczaj $(2+i)(2-i)$",
            "expectedAnswer": "5",
            "hints": ["To $a^2-b^2$ z $a=2$, $b=i$", "Użyj $i^2=-1$"],
            "timeEstimate": 300
          },
          {
            "type": "advanced",
            "problem": "Dla $z\\bar z=13$ podaj $|z|$",
            "expectedAnswer": "|z|=\\sqrt{13}",
            "hints": ["$z\\bar z=|z|^2$", "Pierwiastkuj obie strony"],
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Traktowanie $i$ jak niewiadomej", "Zapominanie o $i^2=-1$", "Błędne dzielenie bez sprzężenia"],
        "teachingTips": ["Rysuj punkty $z$ i $\\bar z$ na płaszczyźnie", "Ćwicz mnożenie na parach prostych liczb"],
        "prerequisites": ["Potęgowanie i pierwiastki", "Wyrażenia algebraiczne"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Uznanie $|a+bi|=a+b$",
          "intervention": "Przypomnij definicję $|z|=\\sqrt{a^2+b^2}$ na przykładach"
        }
      ],
      "realWorldApplications": ["Analiza sygnałów (faza i amplituda)", "Prądy zmienne w elektrotechnice"],
      "assessmentRubric": {
        "mastery": "Sprawnie wykonuje działania, interpretuje moduł i sprzężenie.",
        "proficient": "Popełnia drobne błędy rachunkowe, poprawna metoda.",
        "developing": "Myli własności $i$ i zapis algebraiczny."
      }
    },
    {
      "skillId": "6dce8c69-0f5b-43d6-a813-5e000552cfa2",
      "skillName": "Wyrażenia algebraiczne",
      "class_level": 2,
      "department": "algebraic_expressions",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 8],
        "fallbackTrigger": "standard_approach"
      },
      "teachingFlow": {
        "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] },
        "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] },
        "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] }
      },
      "content": {
        "theory": {
          "introduction": "Uproszczenia wyrażeń obejmują redukcję wyrazów podobnych, wyłączanie wspólnego czynnika, stosowanie wzorów skróconego mnożenia oraz rachunek na ułamkach algebraicznych. Zawsze zacznij od określenia dziedziny (zakazy mianownika), a następnie wykonuj przekształcenia krokami, dbając o poprawne znaki. Pamiętaj, że skraca się wyłącznie czynniki, nie składniki sumy.",
          "keyConceptsLaTex": ["$(a+b)^2=a^2+2ab+b^2$", "$(a-b)^2=a^2-2ab+b^2$", "$a^2-b^2=(a-b)(a+b)$", "$\\tfrac{a}{b}\\cdot\\tfrac{c}{d}=\\tfrac{ac}{bd}$", "$\\tfrac{a}{b}:\\tfrac{c}{d}=\\tfrac{ad}{bc}$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Redukcja i wyłączanie czynnika",
            "problem": "Upraszczaj $2x+3x-5$",
            "solution": "Po redukcji: $5x-5=5(x-1)$.",
            "explanation": "Najpierw łączymy wyrazy podobne, potem wyłączamy wspólny czynnik.",
            "timeEstimate": 300
          },
          {
            "title": "Wzory skróconego mnożenia",
            "problem": "Rozwiń $(x+1)^2$",
            "solution": "$(x+1)^2=x^2+2x+1$.",
            "explanation": "Używamy wzoru $(a+b)^2=a^2+2ab+b^2$.",
            "timeEstimate": 240
          },
          {
            "title": "Ułamki algebraiczne i dziedzina",
            "problem": "Upraszczaj $\\tfrac{2x}{x}$",
            "solution": "$\\tfrac{2x}{x}=2$ dla $x\\ne0$.",
            "explanation": "Skracamy przez $x$ i dopisujemy warunek $x\\ne0$.",
            "timeEstimate": 300
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Upraszczaj $6x+9$",
            "expectedAnswer": "3(2x+3)",
            "hints": ["Wspólny czynnik 3", "Sprawdź przez wymnożenie"],
            "timeEstimate": 240
          },
          {
            "type": "basic",
            "problem": "Rozwiń $(x-2)^2$",
            "expectedAnswer": "x^2-4x+4",
            "hints": ["Użyj $(a-b)^2$", "Zachowaj znak przy $-2$"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Upraszczaj $\\tfrac{x^2-1}{x-1}$",
            "expectedAnswer": "x+1\\ (x\\ne1)",
            "hints": ["Różnica kwadratów", "Skróć przez $(x-1)$"],
            "timeEstimate": 300
          },
          {
            "type": "advanced",
            "problem": "Upraszczaj $\\tfrac{3x^2-12x}{3x}$",
            "expectedAnswer": "x-4\\ (x\\ne0)",
            "hints": ["Wyłącz $3x$", "Skróć czynnik wspólny"],
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Skracanie sumy przez składnik", "Pomijanie dziedziny po skracaniu", "Złe znaki w rozwinięciu kwadratu"],
        "teachingTips": ["Zawsze wypisz dziedzinę przed uproszczeniem", "Sprawdzaj wynik przez odwrotne działanie"],
        "prerequisites": ["Kolejność działań", "Własności działań i potęgowanie"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Skracanie $\\tfrac{a+b}{a}$ do $1+\\tfrac{b}{a}$ przez skreślenie $a$",
          "intervention": "Podkreśl różnicę między czynnikiem a składnikiem sumy"
        }
      ],
      "realWorldApplications": ["Uproszczenia modeli fizycznych", "Algebra w rachunku prawdopodobieństwa"],
      "assessmentRubric": {
        "mastery": "Upraszcza poprawnie z pełną kontrolą dziedziny.",
        "proficient": "Poprawny tok, sporadyczne braki w warunkach.",
        "developing": "Skraca składniki lub gubi znaki."
      }
    },
    {
      "skillId": "f4360fe4-2882-4eaf-8528-d0ea7ecc023f",
      "skillName": "Równania kwadratowe",
      "class_level": 2,
      "department": "algebra",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 8],
        "fallbackTrigger": "standard_approach"
      },
      "teachingFlow": {
        "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] },
        "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] },
        "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] }
      },
      "content": {
        "theory": {
          "introduction": "Równanie kwadratowe $ax^2+bx+c=0$ ($a\\ne0$) rozwiązujemy metodą delty, faktoryzacją lub wzorami Viète'a. Liczba rozwiązań zależy od $\\Delta=b^2-4ac$. Wygodne są również postacie: kanoniczna $y=a(x-p)^2+q$ oraz iloczynowa $a(x-x_1)(x-x_2)$. Zawsze warto sprawdzić rozwiązania przez podstawienie.",
          "keyConceptsLaTex": ["$\\Delta=b^2-4ac$", "$x=\\tfrac{-b\\pm\\sqrt{\\Delta}}{2a}$", "$ax^2+bx+c=a(x-x_1)(x-x_2)$", "$y=a(x-p)^2+q$", "$a\\ne0$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Metoda delty",
            "problem": "Rozwiąż $x^2-5x+6=0$",
            "solution": "$\\Delta=25-24=1$. $x=\\tfrac{5\\pm1}{2}\\Rightarrow x=2,3$.",
            "explanation": "Klasyczne użycie wzoru kwadratowego po obliczeniu delty.",
            "timeEstimate": 300
          },
          {
            "title": "Faktoryzacja",
            "problem": "Rozwiąż $2x^2-8x=0$",
            "solution": "Wyłącz $2x$: $2x(x-4)=0\\Rightarrow x=0\\ lub\\ x=4$.",
            "explanation": "Wyłączenie wspólnego czynnika upraszcza równanie.",
            "timeEstimate": 240
          },
          {
            "title": "Pierwiastek podwójny",
            "problem": "Rozwiąż $x^2+2x+1=0$",
            "solution": "$(x+1)^2=0\\Rightarrow x=-1$ (podwójny).",
            "explanation": "Rozpoznanie pełnego kwadratu skraca obliczenia.",
            "timeEstimate": 240
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Rozwiąż $x^2-1=0$",
            "expectedAnswer": "x=\\pm1",
            "hints": ["Różnica kwadratów", "$(x-1)(x+1)=0$"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $x^2-4x+4=0$",
            "expectedAnswer": "x=2",
            "hints": ["$(x-2)^2=0$", "Jeden pierwiastek podwójny"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $x^2+x-6=0$",
            "expectedAnswer": "x=2\\ lub\\ x=-3",
            "hints": ["Szukaj iloczynu $-6$ i sumy $1$", "Rozkład na czynniki"],
            "timeEstimate": 300
          },
          {
            "type": "advanced",
            "problem": "Rozwiąż $x^2+4x+5=0$ w $\\mathbb{R}$",
            "expectedAnswer": "brak rozwiązań",
            "hints": ["$\\Delta=16-20<0$", "Brak pierwiastków rzeczywistych"],
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Zły znak pod pierwiastkiem", "Pominięcie jednego rozwiązania przy $\\pm$"],
        "teachingTips": ["Ćwicz identyfikację $a,b,c$ i szybkie liczenie $\\Delta$", "Stosuj sprawdzanie przez podstawienie"],
        "prerequisites": ["Równania liniowe", "Wyrażenia algebraiczne"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Traktowanie $\\pm$ jako jednego wyniku",
          "intervention": "Wylicz oba rozwiązania i zaznacz na osi"
        }
      ],
      "realWorldApplications": ["Ruch paraboliczny", "Zadania optymalizacyjne i geometrii analitycznej"],
      "assessmentRubric": {
        "mastery": "Dobiera właściwą metodę i poprawnie uzasadnia.",
        "proficient": "Poprawny wynik z drobnymi błędami notacji.",
        "developing": "Myli znaki lub pomija przypadki."
      }
    },
    {
      "skillId": "bd3df5f1-083b-4619-85b9-2bd4f98ed673",
      "skillName": "Równania i nierówności wielomianowe",
      "class_level": 2,
      "department": "algebra",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 8],
        "fallbackTrigger": "standard_approach"
      },
      "teachingFlow": {
        "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] },
        "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] },
        "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] }
      },
      "content": {
        "theory": {
          "introduction": "Równania wielomianowe rozwiązujemy przez rozkład na czynniki (wyłączanie, wzory, Horner), podstawienia lub korzystając z pierwiastków wymiernych. Nierówności analizujemy tabelą znaków: wyznaczamy miejsca zerowe czynników i określamy znaki iloczynu na przedziałach. Pamiętaj o wielokrotności pierwiastków – zmiana znaku następuje tylko przy nieparzystej krotności.",
          "keyConceptsLaTex": ["$P(x)=(x-a)Q(x)$", "$x\\in Z(P)\\Rightarrow P(x)=0$", "$(-)(-)=(+)$", "$\\text{Horner}$", "$\\mathbb{R}$-przedziały"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Tabela znaków dla iloczynu",
            "problem": "Rozwiąż $(x-1)(x+2)\\ge0$",
            "solution": "Zera: $x=-2,1$. Iloczyn $\\ge0$ poza przedziałem: $(-\\infty,-2]\\cup[1,\\infty)$.",
            "explanation": "Na zewnętrznych przedziałach znaki czynników są zgodne.",
            "timeEstimate": 300
          },
          {
            "title": "Równanie sześcienne z czynnikiem",
            "problem": "Rozwiąż $x^3-1=0$ w $\\mathbb{R}$",
            "solution": "Rozłóż: $(x-1)(x^2+x+1)=0\\Rightarrow x=1$ (pozostałe nierzeczywiste).",
            "explanation": "Wykorzystujemy wzór na różnicę sześcianów i analizę w $\\mathbb{R}$.",
            "timeEstimate": 300
          },
          {
            "title": "Nierówność z czynnikiem podwójnym",
            "problem": "Rozwiąż $x(x-3)<0$",
            "solution": "Zera: $0,3$. Iloczyn ujemny między zerami: $(0,3)$.",
            "explanation": "Dla $x$ między zerami znaki czynników są różne.",
            "timeEstimate": 240
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Rozwiąż $(x-5)(x+1)\\le0$",
            "expectedAnswer": "[-1,5]",
            "hints": ["Zera: $-1,5$", "Iloczyn $\\le0$ między zerami"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $(x+2)(x-1)(x-2)>0$",
            "expectedAnswer": "(-2,1)\\cup(2,\\infty)",
            "hints": ["Zera: $-2,1,2$", "Testuj punkty na przedziałach"],
            "timeEstimate": 300
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $x^2(x-4)\\ge0$",
            "expectedAnswer": "{0}\\cup[4,\\infty)",
            "hints": ["$x^2\\ge0$ dla każdego $x$", "Uwzględnij krotność zera w 0"],
            "timeEstimate": 300
          },
          {
            "type": "advanced",
            "problem": "Rozwiąż $x^4-5x^2+4\\ge0$",
            "expectedAnswer": "(-\\infty,-2]\\cup[-1,1]\\cup[2,\\infty)",
            "hints": ["Podstaw $t=x^2$", "Rozłóż $(t-1)(t-4)$"],
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Błędna tabela znaków", "Ignorowanie krotności pierwiastków", "Złe wnioski bez punktu testowego"],
        "teachingTips": ["Ucz kładzenia kropek pełnych/pustych i czytania znaków", "Zawsze sprawdzaj jeden punkt na przedziale"],
        "prerequisites": ["Wyrażenia algebraiczne", "Równania kwadratowe"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Założenie, że znak dodatni jest zawsze między zerami",
          "intervention": "Przeprowadź analizę z punktem testowym i krotnością"
        }
      ],
      "realWorldApplications": ["Wyznaczanie dopuszczalnych zakresów parametrów", "Analiza stabilności w modelach"],
      "assessmentRubric": {
        "mastery": "Poprawnie rozkłada, buduje tabelę znaków i wnioskuje.",
        "proficient": "Drobne pomyłki w znakach, poprawne rozwiązanie.",
        "developing": "Błędne przedziały lub nieuwzględniona krotność."
      }
    },
    {
      "skillId": "d03dc349-2398-4ecd-a407-4c7e3894b068",
      "skillName": "Równania i nierówności z wartością bezwzględną",
      "class_level": 2,
      "department": "algebra",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 8],
        "fallbackTrigger": "standard_approach"
      },
      "teachingFlow": {
        "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] },
        "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] },
        "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] }
      },
      "content": {
        "theory": {
          "introduction": "W równaniach i nierównościach z $|x|$ korzystamy z definicji przedziałowej i interpretacji odległości. Równania rozbijamy na przypadki zależne od znaku wyrażenia pod modułem. Nierówności tłumaczymy jako zbiory punktów w określonej odległości od $a$, np. $|x-a|<r\\Rightarrow (a-r,a+r)$. Koniecznie zapisuj warunki dla każdego przypadku.",
          "keyConceptsLaTex": ["$|x|=x$ dla $x\\ge0$", "$|x|=-x$ dla $x<0$", "$|x-a|<r\\Rightarrow(a-r,a+r)$", "$|x-a|\\le r\\Rightarrow[a-r,a+r]$", "$|u|>|v|\\Rightarrow u>v\\ lub\\ u<-v$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Równanie z modułem",
            "problem": "Rozwiąż $|x-2|=5$",
            "solution": "Przypadki: $x-2=5\\Rightarrow x=7$ lub $x-2=-5\\Rightarrow x=-3$.",
            "explanation": "Odległość od 2 równa 5 daje dwa punkty symetryczne.",
            "timeEstimate": 300
          },
          {
            "title": "Nierówność typu większe",
            "problem": "Rozwiąż $|2x-1|>3$",
            "solution": "$2x-1>3\\Rightarrow x>2$ lub $2x-1<-3\\Rightarrow x<-1$.",
            "explanation": "Rozpisujemy na dwa przypadki i dzielimy przez 2.",
            "timeEstimate": 300
          },
          {
            "title": "Suma modułów",
            "problem": "Rozwiąż $|x-2|+|x+2|\\ge6$",
            "solution": "Dla $x\\ge2$: $2x\\ge6\\Rightarrow x\\ge3$. Dla $-2\\le x\\le2$: suma $=4$ (nie spełnia). Dla $x\\le-2$: $-2x\\ge6\\Rightarrow x\\le-3$.",
            "explanation": "Analiza odcinkami względem punktów $-2$ i $2$.",
            "timeEstimate": 300
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Rozwiąż $|x|=4$",
            "expectedAnswer": "x=4\\ lub\\ x=-4",
            "hints": ["Dwa przypadki: $x=\\pm4$", "Interpretacja na osi"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $|x-3|\\le1$",
            "expectedAnswer": "[2,4]",
            "hints": ["$|x-a|\\le r\\Rightarrow[a-r,a+r]$", "Tu $a=3$, $r=1$"],
            "timeEstimate": 300
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $|2x+4|<2$",
            "expectedAnswer": "(-3,-1)",
            "hints": ["$-2<2x+4<2$", "Odejmij 4 i podziel przez 2"],
            "timeEstimate": 300
          },
          {
            "type": "advanced",
            "problem": "Rozwiąż $|x+1|\\ge2$",
            "expectedAnswer": "(-\\infty,-3]\\cup[1,\\infty)",
            "hints": ["Dwa przypadki $\\ge$", "Zapisz w notacji przedziałowej"],
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Brak rozbicia na przypadki", "Zły kierunek nierówności po dzieleniu", "Pominięcie dziedziny"],
        "teachingTips": ["Zawsze rysuj oś i punkty krytyczne", "Sprawdzaj po jednym punkcie w każdym przedziale"],
        "prerequisites": ["Wartość bezwzględna – własności", "Równania liniowe i nierówności"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Zastąpienie $|x|$ przez $x$ bez warunku",
          "intervention": "Wymuś zapis przypadków z $x\\ge0$ i $x<0$"
        }
      ],
      "realWorldApplications": ["Tolerancje pomiarowe", "Bezpieczne zakresy parametrów"],
      "assessmentRubric": {
        "mastery": "Poprawnie rozpisuje przypadki i zapisuje rozwiązania jako przedziały.",
        "proficient": "Drobne potknięcia w granicach, dobra metoda.",
        "developing": "Nie rozpoznaje przypadków i gubi znaki."
      }
    },
    {
      "skillId": "1a0e3370-65f9-4be3-85f9-5bd1b6bbff46",
      "skillName": "Geometria analityczna – okrąg i parabola",
      "class_level": 2,
      "department": "mathematics",
      "generatorParams": {
        "microSkill": "default",
        "difficultyRange": [1, 8],
        "fallbackTrigger": "standard_approach"
      },
      "teachingFlow": {
        "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] },
        "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] },
        "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] }
      },
      "content": {
        "theory": {
          "introduction": "Okrąg o środku $(x_0,y_0)$ i promieniu $r$ ma równanie $(x-x_0)^2+(y-y_0)^2=r^2$. Parabola z osią $OY$ ma postać $y=ax^2+bx+c$, a wierzchołek odczytamy z postaci $y=a(x-p)^2+q$. Położenie punktu względem krzywej badamy przez podstawienie współrzędnych do równania i sprawdzenie znaku. Znajomość tych form ułatwia szkicowanie i rozwiązywanie zadań z odległości.",
          "keyConceptsLaTex": ["$(x-x_0)^2+(y-y_0)^2=r^2$", "$y=ax^2+bx+c$", "$y=a(x-p)^2+q$", "$x_0,y_0,r$", "$\\Delta=b^2-4ac$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Położenie punktu na okręgu",
            "problem": "Czy $(3,4)$ leży na $x^2+y^2=25$?",
            "solution": "Podstaw: $3^2+4^2=9+16=25$ – punkt leży na okręgu.",
            "explanation": "Równość spełniona dokładnie, więc punkt należy do okręgu.",
            "timeEstimate": 300
          },
          {
            "title": "Wierzchołek paraboli",
            "problem": "Dla $y=x^2-4x+1$ podaj wierzchołek",
            "solution": "$p=\\tfrac{-b}{2a}=2$, $q=f(2)=-3$. Wierzchołek $(2,-3)$.",
            "explanation": "Z postaci ogólnej wyznaczamy $p$ i obliczamy $q$.",
            "timeEstimate": 300
          },
          {
            "title": "Parametry okręgu",
            "problem": "Podaj promień $(x-1)^2+(y+2)^2=9$",
            "solution": "Promień $r=3$ (bo $r^2=9$).",
            "explanation": "Porównujemy z postacią standardową i wyciągamy pierwiastek.",
            "timeEstimate": 240
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Podaj środek $(x-2)^2+(y+1)^2=16$",
            "expectedAnswer": "(2,-1)",
            "hints": ["Porównaj z $(x-x_0)^2+(y-y_0)^2=r^2$", "Uważaj na znak przy $y+1$"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Czy $(2,1)$ leży na $x^2+y^2=5$?",
            "expectedAnswer": "Tak",
            "hints": ["Podstaw współrzędne", "Sprawdź równość do 5"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Miejsca zerowe $y=x^2-1$",
            "expectedAnswer": "x=\\pm1",
            "hints": ["Rozwiąż $x^2-1=0$", "Użyj różnicy kwadratów"],
            "timeEstimate": 300
          },
          {
            "type": "advanced",
            "problem": "Oś symetrii $y=x^2+6x+5$",
            "expectedAnswer": "x=-3",
            "hints": ["$x=\\tfrac{-b}{2a}$", "Tu $a=1$, $b=6$"],
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Błędny znak przy $(y-y_0)^2$", "Mylenie $p,q$ w wierzchołku", "Złe podstawienie punktu"],
        "teachingTips": ["Rysuj szkice przed obliczeniami", "Ćwicz przejście między postaciami paraboli"],
        "prerequisites": ["Układ współrzędnych", "Równania kwadratowe"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Uznawanie, że każdy kwadrat sum to okrąg",
          "intervention": "Porównaj równania różnych krzywych na przykładach"
        }
      ],
      "realWorldApplications": ["Optyka (zwierciadła paraboliczne)", "Lokalizacja w geometrii (okręgi zasięgu)"],
      "assessmentRubric": {
        "mastery": "Poprawnie identyfikuje parametry i bada położenie punktu.",
        "proficient": "Drobne błędy rachunkowe, poprawny tok.",
        "developing": "Myli formuły i interpretacje wykresu."
      }
    }
  ]
};

async function importSingleSkill(skillData: any) {
  try {
    // Transform the skill data
    const transformedSkill = {
      skill_id: skillData.skillId, // Use existing UUID
      content_data: {
        skillName: skillData.skillName,
        theory: skillData.content.theory,
        examples: skillData.content.examples,
        practiceExercises: skillData.content.practiceExercises
      },
      metadata: {
        skill_name: skillData.skillName,
        class_level: skillData.class_level,
        department: skillData.department,
        generator_params: skillData.generatorParams,
        teaching_flow: skillData.teachingFlow,
        pedagogical_notes: skillData.pedagogicalNotes,
        misconception_patterns: skillData.misconceptionPatterns,
        real_world_applications: skillData.realWorldApplications,
        assessment_rubric: skillData.assessmentRubric
      },
      is_complete: true
    };

    console.log(`Importing skill: ${skillData.skillName}`);

    const { data, error } = await supabase
      .from('unified_skill_content')
      .insert([transformedSkill])
      .select();

    if (error) throw error;

    console.log(`✅ Successfully imported: ${skillData.skillName}`);
    return { success: true, skillId: skillData.skillId };
  } catch (error) {
    console.error(`❌ Failed to import ${skillData.skillName}:`, error);
    return { success: false, error: error.message };
  }
}

export async function runAlgebralno2Import() {
  try {
    console.log('🧹 Clearing incomplete records...');
    
    // Clear incomplete records
    const { error: clearError } = await supabase
      .from('unified_skill_content')
      .delete()
      .eq('is_complete', false);

    if (clearError) {
      console.error('Error clearing incomplete records:', clearError);
    }

    console.log('🚀 Starting Algebrano2 import...');
    
    const results = [];
    
    for (const skill of algebralno2Data.contentDatabase) {
      const result = await importSingleSkill(skill);
      results.push(result);
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`✅ Import complete: ${successful} successful, ${failed} failed`);
    
    return {
      total: results.length,
      successful,
      failed,
      results
    };
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Auto-execute the import
runAlgebralno2Import()
  .then(result => {
    console.log('🎉 Algebrano2 import finished:', result);
  })
  .catch(error => {
    console.error('💥 Algebrano2 import failed:', error);
  });