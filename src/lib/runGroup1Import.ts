import { batchImportSkillContent } from './skillContentImporter';

const chatGPTData = {
  "contentDatabase": [
    {
      "skillId": "1f44da1e-abb1-4c9a-835b-b164d82fe206",
      "skillName": "Działania na liczbach rzeczywistych",
      "class_level": 1,
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
          "introduction": "Liczby rzeczywiste obejmują liczby całkowite, wymierne i niewymierne. W tym temacie ćwiczymy kolejność działań, pracę z liczbami ujemnymi oraz ułamkami zwykłymi i dziesiętnymi. Kluczowe są własności: łączność, przemienność i rozdzielność, które pozwalają przekształcać wyrażenia i szybciej liczyć. Rozszerzamy rachunek o potęgowanie i pierwiastkowanie z zachowaniem zasad znaków. Uczymy się też szacować wynik i wykrywać błędy, zanim je popełnimy. Dobre nawyki rachunkowe zwiększają pewność na sprawdzianach i maturze.",
          "keyConceptsLaTex": ["$a+b=b+a$", "$(a+b)+c=a+(b+c)$", "$a(b+c)=ab+ac$", "$a^{-1}=1/a$", "$\\sqrt{a^2}=|a|$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Kolejność działań z liczbami ujemnymi",
            "problem": "Oblicz $3-\\tfrac{5}{2}\\cdot(-4)$",
            "solution": "Najpierw mnożenie: $(5/2)\\cdot(-4)=-10$. Następnie: $3-(-10)=3+10=13$.",
            "explanation": "Mnożenie wykonujemy przed odejmowaniem; minus razy plus daje wynik ujemny.",
            "timeEstimate": 300
          },
          {
            "title": "Potęgi i pierwiastki",
            "problem": "Upraszczaj $\\sqrt{9\\cdot 16}$",
            "solution": "$\\sqrt{9\\cdot16}=\\sqrt{144}=12$.",
            "explanation": "Można najpierw wymnożyć pod pierwiastkiem lub użyć $\\sqrt{ab}=\\sqrt a\\sqrt b$.",
            "timeEstimate": 300
          },
          {
            "title": "Rozdzielność a szybkie liczenie",
            "problem": "Upraszczaj $25\\cdot 12-25\\cdot 2$",
            "solution": "Wyłącz $25$: $25(12-2)=25\\cdot 10=250$.",
            "explanation": "Własność rozdzielności upraszcza rachunek przez wyłączenie wspólnego czynnika.",
            "timeEstimate": 300
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Oblicz $-7+12$",
            "expectedAnswer": "5",
            "hints": ["Porównaj wartości bezwzględne", "Znak większej wartości bezwzględnej zostaje"],
            "timeEstimate": 240
          },
          {
            "type": "basic",
            "problem": "Upraszczaj $2(3-5)+4$",
            "expectedAnswer": "0",
            "hints": ["Najpierw nawias", "Potem mnożenie i dodawanie"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Oblicz $\\tfrac{3}{4}+\\tfrac{5}{8}$",
            "expectedAnswer": "1\\tfrac{1}{8}",
            "hints": ["Wspólny mianownik 8", "Dodaj liczniki"],
            "timeEstimate": 240
          },
          {
            "type": "advanced",
            "problem": "Upraszczaj $\\frac{2x}{x}-\\frac{x}{x}$",
            "expectedAnswer": "1\\ (x\\ne 0)",
            "hints": ["Skróć ułamki przez $x$", "Pamiętaj o dziedzinie $x\\ne0$"],
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Ignorowanie kolejności działań", "Błędy znaków przy mnożeniu ujemnych", "Niepoprawne skracanie ułamków"],
        "teachingTips": ["Wprowadzaj szacowanie przed rachunkiem", "Stosuj kolorowanie znaków przy liczbach ujemnych"],
        "prerequisites": ["Arytmetyka szkoły podstawowej", "Operacje na ułamkach"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Dodawanie przed mnożeniem w złożonych wyrażeniach",
          "intervention": "Przypomnij hierarchię działań i rozwiąż kontrprzykład krok po kroku"
        }
      ],
      "realWorldApplications": ["Przeliczanie cen i rabatów", "Szacowanie wyników pomiarów"],
      "assessmentRubric": {
        "mastery": "Bez błędów stosuje własności działań i szacuje wynik.",
        "proficient": "Popełnia drobne błędy rachunkowe, poprawna metoda.",
        "developing": "Często myli kolejność działań lub znaki."
      }
    },
    {
      "skillId": "bce53b28-de1d-4ec1-b08c-4139ef91b213",
      "skillName": "Nierówności liniowe z jedną niewiadomą",
      "class_level": 1,
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
          "introduction": "Nierówność liniowa ma postać $ax+b\\ \\square\\ c$ z symbolami $<,\\le,>,\\ge$. Rozwiązujemy ją analogicznie do równań: przenosimy wyrazy, dzielimy przez współczynnik przy $x$, pamiętając o kluczowej zasadzie: przy mnożeniu lub dzieleniu przez liczbę ujemną odwracamy znak nierówności. Odpowiedź zapisujemy w notacji przedziałowej i zaznaczamy na osi liczbowej. Warto sprawdzić wynik przez podstawienie punktu testowego.",
          "keyConceptsLaTex": ["$ax+b<c$", "$x<\\tfrac{c-b}{a}$", "$-1\\cdot x\\Rightarrow$ zmień znak", "$(a,b),[a,b]$", "$x\\in(-\\infty,k)$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Prosta nierówność bez zmiany znaku",
            "problem": "Rozwiąż $2x-5<9$",
            "solution": "Dodaj 5: $2x<14$. Podziel przez 2: $x<7$. Zapis: $(-\\infty,7)$.",
            "explanation": "Dzielenie przez liczbę dodatnią nie zmienia znaku nierówności.",
            "timeEstimate": 300
          },
          {
            "title": "Dzielenie przez liczbę ujemną",
            "problem": "Rozwiąż $-3x\\ge 6$",
            "solution": "Podziel przez $-3$: $x\\le -2$. Zapis: $(-\\infty,-2]$.",
            "explanation": "Dzielenie przez liczbę ujemną odwraca znak z $\\ge$ na $\\le$.",
            "timeEstimate": 300
          },
          {
            "title": "Nierówność z $x$ po obu stronach",
            "problem": "Rozwiąż $5-2x\\le 1$",
            "solution": "Odejmij 5: $-2x\\le -4$. Podziel przez $-2$: $x\\ge 2$.",
            "explanation": "Konsekwentnie przenosimy wyrazy i pilnujemy zmiany znaku przy dzieleniu.",
            "timeEstimate": 300
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Rozwiąż $x+4>1$",
            "expectedAnswer": "x>-3",
            "hints": ["Odejmij 4", "Zapisz w postaci przedziału"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $7-3x<1$",
            "expectedAnswer": "x>2",
            "hints": ["Przenieś 7 na prawą", "Podziel przez $-3$ i odwróć znak"],
            "timeEstimate": 300
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $2(x-1)\\ge x+3$",
            "expectedAnswer": "x\\ge 5",
            "hints": ["Rozmnoż nawias", "Przenieś $x$ na lewą stronę"],
            "timeEstimate": 300
          },
          {
            "type": "advanced",
            "problem": "Zapisz rozwiązanie $x\\le a$",
            "expectedAnswer": "(-\\infty,a]",
            "hints": ["Użyj przedziału domkniętego w $a$", "Nieskończoność zawsze otwarta"],
            "timeEstimate": 240
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Brak zmiany znaku przy dzieleniu przez liczbę ujemną", "Błędny zapis przedziału brzegowego"],
        "teachingTips": ["Ćwicz na osi z kółkami otwartymi i zamkniętymi", "Stosuj punkt testowy dla kontroli rozwiązania"],
        "prerequisites": ["Równania liniowe", "Notacja przedziałowa"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Dzielenie przez $-1$ bez odwrócenia znaku",
          "intervention": "Pokaż kontrprzykład liczbowy i zaznacz wynik na osi"
        }
      ],
      "realWorldApplications": ["Budżety z ograniczeniami", "Warunki progowe w fizyce"],
      "assessmentRubric": {
        "mastery": "Poprawnie wyznacza przedziały i przedstawia na osi.",
        "proficient": "Nieliczne potknięcia w zapisie przedziału lub oznaczeniach.",
        "developing": "Nieprawidłowa zmiana znaku i mylenie nawiasów."
      }
    },
    {
      "skillId": "ab3ff5a5-499b-4041-8037-9b76072dced1",
      "skillName": "Rozwiązywanie równań liniowych",
      "class_level": 1,
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
          "introduction": "Równanie liniowe w jednej niewiadomej ma postać $ax+b=c$ z $a\\ne0$. Celem jest izolacja $x$ za pomocą równoważnych przekształceń: dodawania, odejmowania, mnożenia i dzielenia obu stron przez tę samą liczbę (niezerową). W praktyce przenosimy wyrazy wolne na jedną stronę, a wyrazy z $x$ na drugą, następnie dzielimy przez współczynnik przy $x$. Zawsze warto sprawdzić rozwiązanie przez podstawienie, by uniknąć drobnych błędów znaków.",
          "keyConceptsLaTex": ["$ax+b=c$", "$x=\\tfrac{c-b}{a}$", "$a\\ne0$", "$0\\cdot x=b$", "$L= P$ po przekształceniu"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Równanie podstawowe",
            "problem": "Rozwiąż $3x+7=1$",
            "solution": "Odejmij 7: $3x=-6$. Podziel przez 3: $x=-2$. Sprawdzenie: $3(-2)+7=1$.",
            "explanation": "Sekwencja równoważnych przekształceń prowadzi do izolacji $x$.",
            "timeEstimate": 300
          },
          {
            "title": "Nawias i redukcja",
            "problem": "Rozwiąż $5(x-2)=3x+4$",
            "solution": "Rozmnoż: $5x-10=3x+4$. Przenieś: $2x=14$. Podziel: $x=7$.",
            "explanation": "Po rozwinięciu nawiasu grupujemy wyrazy i dzielimy przez współczynnik.",
            "timeEstimate": 300
          },
          {
            "title": "Szczególny przypadek",
            "problem": "Rozwiąż $0\\cdot x=5$",
            "solution": "Brak rozwiązań, równanie sprzeczne.",
            "explanation": "Lewą stronę stanowi 0, więc równość nie może dać liczby niezerowej.",
            "timeEstimate": 240
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Rozwiąż $2x-4=10$",
            "expectedAnswer": "x=7",
            "hints": ["Dodaj 4", "Podziel przez 2"],
            "timeEstimate": 240
          },
          {
            "type": "basic",
            "problem": "Rozwiąż $x+\\tfrac{3}{2}=4$",
            "expectedAnswer": "x=\\tfrac{5}{2}",
            "hints": ["Odejmij $\\tfrac{3}{2}$", "Sprowadź do ułamka"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $4x-3=2x+9$",
            "expectedAnswer": "x=6",
            "hints": ["Przenieś $2x$ na lewo", "Dodaj 3 do obu stron"],
            "timeEstimate": 300
          },
          {
            "type": "advanced",
            "problem": "Rozwiąż $\\tfrac{x-1}{3}=2$",
            "expectedAnswer": "x=7",
            "hints": ["Pomnóż obie strony przez 3", "Dodaj 1"],
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Dzielenie tylko jednej strony równania", "Błędy znaków przy przenoszeniu"],
        "teachingTips": ["Ucz sprawdzania przez podstawienie", "Oznaczaj kolorem wyrazy z $x$"],
        "prerequisites": ["Działania na liczbach", "Kolejność działań"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Traktowanie znaku po przeniesieniu jako niezmiennego",
          "intervention": "Ćwiczenia z komentarzem 'co robię po obu stronach?'"
        }
      ],
      "realWorldApplications": ["Modele kosztów stałych i zmiennych", "Skalowanie wielkości w fizyce"],
      "assessmentRubric": {
        "mastery": "Szybko i bezbłędnie izoluje $x$ i weryfikuje wynik.",
        "proficient": "Poprawny wynik, okazjonalne potknięcia w zapisie.",
        "developing": "Błędy w przekształceniach, brak sprawdzenia."
      }
    },
    {
      "skillId": "9bae92cf-4b76-4f05-80db-a9df027d3a2e",
      "skillName": "Wartość bezwzględna - definicja i własności",
      "class_level": 1,
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
          "introduction": "Wartość bezwzględna $|x|$ to odległość liczby $x$ od zera na osi liczbowej. Jest zawsze nieujemna i spełnia zasadę symetrii $|x|=|-x|$. Kluczowe są dwie definicje: przedziałowa oraz równoważna $|x|=\\sqrt{x^2}$. Znajomość tych własności ułatwia upraszczanie wyrażeń i rozwiązywanie równań oraz nierówności z $|x|$. W praktyce zapis $|x-a|<r$ opisuje punkty leżące w odległości mniejszej niż $r$ od $a$.",
          "keyConceptsLaTex": ["$|x|=x$ dla $x\\ge0$", "$|x|=-x$ dla $x<0$", "$|x|=\\sqrt{x^2}$", "$|x|=|-x|$", "$|a+b|\\le|a|+|b|$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Użycie definicji przedziałowej",
            "problem": "Oblicz $|{-3}|+|2|$",
            "solution": "$|-3|=3$, $|2|=2$, więc $3+2=5$.",
            "explanation": "Wartość bezwzględna zwraca odległość od zera, niezależnie od znaku.",
            "timeEstimate": 300
          },
          {
            "title": "Prosta nierówność z odległością",
            "problem": "Rozwiąż $|x-2|<3$",
            "solution": "Interpretacja: odległość od 2 mniejsza niż 3. Otrzymujemy $( -1,5 )$.",
            "explanation": "Zapis $|x-a|<r$ odpowiada przedziałowi $(a-r,a+r)$.",
            "timeEstimate": 300
          },
          {
            "title": "Nierówność trójkąta",
            "problem": "Oceń $|3+(-5)|$",
            "solution": "$| -2|=2 \\le |3|+| -5|=8$.",
            "explanation": "Pokazuje, że suma modułów ogranicza moduł sumy.",
            "timeEstimate": 240
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Upraszczaj $|x|+|{-x}|$",
            "expectedAnswer": "2|x|",
            "hints": ["Użyj $|x|=|-x|$", "Zastosuj liniowość dodawania"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $|x|\\le 4$",
            "expectedAnswer": "[-4,4]",
            "hints": ["Odległość od 0 nie większa niż 4", "Zapisz jako przedział"],
            "timeEstimate": 300
          },
          {
            "type": "intermediate",
            "problem": "Rozwiąż $|2x-1|>3$",
            "expectedAnswer": "x<-1 lub x>2",
            "hints": ["$2x-1>3$ lub $2x-1<-3$", "Podziel przez 2"],
            "timeEstimate": 300
          },
          {
            "type": "advanced",
            "problem": "Upraszczaj $\\sqrt{x^2}$",
            "expectedAnswer": "|x|",
            "hints": ["Definicja równoważna $|x|=\\sqrt{x^2}$", "Pamiętaj o nieujemności"],
            "timeEstimate": 240
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Traktowanie $|x|$ jak zwykłych nawiasów", "Pominięcie dwóch przypadków w definicji"],
        "teachingTips": ["Wizualizuj odległość na osi", "Ćwiczenia z szybkim rozpoznaniem przedziałów"],
        "prerequisites": ["Liczby rzeczywiste i oś liczbowa", "Nierówności proste"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Zakładanie $|x|=x$ dla wszystkich $x$",
          "intervention": "Ćwiczenia z $x<0$ i natychmiastowe podstawienie do definicji"
        }
      ],
      "realWorldApplications": ["Błędy bezwzględne w pomiarach", "Strefy tolerancji w jakości"],
      "assessmentRubric": {
        "mastery": "Sprawnie stosuje definicje i zapis przedziałowy.",
        "proficient": "Drobne potknięcia w przypadkach, poprawna idea.",
        "developing": "Myli definicję i kończy z błędnym znakiem."
      }
    },
    {
      "skillId": "1d4bcd6b-2306-412b-ac3e-600689d473d4",
      "skillName": "Funkcja liniowa",
      "class_level": 1,
      "department": "funkcje",
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
          "introduction": "Funkcja liniowa ma postać $f(x)=ax+b$. Współczynnik $a$ określa nachylenie prostej (zmianę wartości o $\\Delta y$ na jednostkę $\\Delta x$), a $b$ to punkt przecięcia z osią $OY$. Wykres jest prostą, którą narysujesz, znając dwa punkty. Miejsce zerowe obliczamy z równania $f(x)=0$. Znak $a$ decyduje o rosnącym lub malejącym charakterze funkcji.",
          "keyConceptsLaTex": ["$f(x)=ax+b$", "$x_0=-\\tfrac{b}{a}$", "$a=\\tfrac{\\Delta y}{\\Delta x}$", "$f(0)=b$", "$a>0$ rośnie"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Miejsce zerowe",
            "problem": "Dla $f(x)=2x+1$ wyznacz $x_0$",
            "solution": "Rozwiąż $2x+1=0$. Otrzymasz $x=-\\tfrac{1}{2}$.",
            "explanation": "Miejsce zerowe to punkt przecięcia wykresu z osią $OX$.",
            "timeEstimate": 300
          },
          {
            "title": "Odczyt $a$ i $b$",
            "problem": "Dla $f(x)=-3x+4$ podaj $a,b$",
            "solution": "$a=-3$, $b=4$.",
            "explanation": "Porównaj z postacią $f(x)=ax+b$ i odczytaj współczynniki.",
            "timeEstimate": 240
          },
          {
            "title": "Rysowanie z dwóch punktów",
            "problem": "Wyznacz $f(0)$ i $f(2)$ dla $f(x)=x-2$",
            "solution": "$f(0)=-2$, $f(2)=0$. Połącz punkty i narysuj prostą.",
            "explanation": "Dwa punkty wystarczą do narysowania wykresu funkcji liniowej.",
            "timeEstimate": 300
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Podaj $a$ w $f(x)=5x-3$",
            "expectedAnswer": "a=5",
            "hints": ["Porównaj z $ax+b$", "Współczynnik przy $x$ to $a$"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Wyznacz $x_0$ dla $f(x)=-2x+6$",
            "expectedAnswer": "x_0=3",
            "hints": ["Rozwiąż $-2x+6=0$", "Podziel przez $-2$"],
            "timeEstimate": 300
          },
          {
            "type": "intermediate",
            "problem": "Zdecyduj: $f(x)=1-4x$ rośnie?",
            "expectedAnswer": "Maleje",
            "hints": ["$a=-4<0$", "Ujemne $a$ ⇒ malejąca"],
            "timeEstimate": 240
          },
          {
            "type": "advanced",
            "problem": "Dla $a=1,b=-2$ podaj $f(5)$",
            "expectedAnswer": "3",
            "hints": ["$f(x)=x-2$", "Podstaw $x=5$"],
            "timeEstimate": 240
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Mylenie $a$ z $b$", "Błędny znak miejsca zerowego"],
        "teachingTips": ["Ćwicz odczyt z wykresu i z równania równolegle", "Wprowadzaj tabelę wartości do rysunku"],
        "prerequisites": ["Układ współrzędnych", "Równania liniowe"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Uznawanie $b$ za nachylenie prostej",
          "intervention": "Porównaj wykresy dla $a$ różnych i stałego $b$"
        }
      ],
      "realWorldApplications": ["Modele kosztów stałych i zmiennych", "Prędkość stała w fizyce"],
      "assessmentRubric": {
        "mastery": "Poprawnie interpretuje $a,b$, rysuje i odczytuje parametry.",
        "proficient": "Poprawny odczyt z drobnymi nieścisłościami.",
        "developing": "Myli role $a$ i $b$, niepewny wykres."
      }
    },
    {
      "skillId": "d8d22ed7-67a9-48a9-a0f9-a89aa8f9633f",
      "skillName": "Twierdzenie Pitagorasa",
      "class_level": 1,
      "department": "geometry",
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
          "introduction": "W trójkącie prostokątnym o przyprostokątnych $a,b$ i przeciwprostokątnej $c$ zachodzi $a^2+b^2=c^2$. Twierdzenie pozwala obliczać brakujący bok, sprawdzać prostokątność oraz wyznaczać odległości w układzie współrzędnych. Pamiętaj o właściwej identyfikacji boków: $c$ leży naprzeciw kąta prostego. Znajomość klasycznych trójek pitagorejskich przyspiesza rachunki.",
          "keyConceptsLaTex": ["$a^2+b^2=c^2$", "$c=\\sqrt{a^2+b^2}$", "$a=\\sqrt{c^2-b^2}$", "$3,4,5$", "$5,12,13$"],
          "timeEstimate": 180
        },
        "examples": [
          {
            "title": "Oblicz przeciwprostokątną",
            "problem": "Dane $a=6,\\ b=8$",
            "solution": "$c=\\sqrt{6^2+8^2}=\\sqrt{36+64}=10$.",
            "explanation": "Bezpośrednie użycie wzoru $a^2+b^2=c^2$.",
            "timeEstimate": 300
          },
          {
            "title": "Oblicz przyprostokątną",
            "problem": "Dane $c=10,\\ b=6$",
            "solution": "$a=\\sqrt{10^2-6^2}=\\sqrt{100-36}=8$.",
            "explanation": "Przekształcamy wzór do postaci na brakującą przyprostokątną.",
            "timeEstimate": 300
          },
          {
            "title": "Odległość w układzie współrzędnych",
            "problem": "Punkty $(0,0)$ i $(3,4)$",
            "solution": "Odległość $d=\\sqrt{3^2+4^2}=5$.",
            "explanation": "Różnice współrzędnych tworzą przyprostokątne trójkąta.",
            "timeEstimate": 240
          }
        ],
        "practiceExercises": [
          {
            "type": "basic",
            "problem": "Dane $a=5,\\ b=12$",
            "expectedAnswer": "c=13",
            "hints": ["Użyj $c=\\sqrt{a^2+b^2}$", "To znana trójka $5,12,13$"],
            "timeEstimate": 240
          },
          {
            "type": "intermediate",
            "problem": "Dane $c=25,\\ a=7$",
            "expectedAnswer": "b=24",
            "hints": ["$b=\\sqrt{c^2-a^2}$", "$625-49=576$"],
            "timeEstimate": 300
          },
          {
            "type": "intermediate",
            "problem": "Długość przekątnej kwadratu $a=\\sqrt{2}$",
            "expectedAnswer": "2",
            "hints": ["Przekątna $d=a\\sqrt{2}$", "Podstaw $a=\\sqrt{2}$"],
            "timeEstimate": 240
          },
          {
            "type": "advanced",
            "problem": "Trójkąt o bokach $c=\\sqrt{50}$, $a=5$",
            "expectedAnswer": "b=5",
            "hints": ["$c^2=50$", "Sprawdź $b^2=50-25$"],
            "timeEstimate": 300
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["Mylenie przeciwprostokątnej z przyprostokątną", "Zapominanie o pierwiastku na końcu"],
        "teachingTips": ["Zawsze szkicuj trójkąt i oznacz kąt prosty", "Ucz rozpoznawać trójki pitagorejskie"],
        "prerequisites": ["Potęgowanie i pierwiastkowanie", "Geometria płaska – podstawy"]
      },
      "misconceptionPatterns": [
        {
          "pattern": "Stosowanie $c^2=a\\cdot b$ zamiast $a^2+b^2=c^2$",
          "intervention": "Kontrprzykład liczbowy i identyfikacja boków na rysunku"
        }
      ],
      "realWorldApplications": ["Budownictwo i geodezja", "Nawigacja i odległość w terenie"],
      "assessmentRubric": {
        "mastery": "Sprawnie oblicza brakujące boki i uzasadnia wybór wzoru.",
        "proficient": "Poprawne obliczenia, sporadyczne braki w komentarzu.",
        "developing": "Myli boki lub pomija pierwiastkowanie."
      }
    }
  ]
};

export async function runGroup1Import() {
  try {
    console.log('Starting Group 1 import...');
    const result = await batchImportSkillContent(chatGPTData);
    console.log('Import completed successfully:', result);
    return result;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Auto run
runGroup1Import().then(result => {
  console.log('Final import result:', result);
}).catch(error => {
  console.error('Final import error:', error);
});