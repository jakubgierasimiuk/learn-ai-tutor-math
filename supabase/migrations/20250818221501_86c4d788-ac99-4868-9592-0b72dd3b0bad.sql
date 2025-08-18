-- Import all content packages with proper UUIDs

-- Skill 008: Granica funkcji
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Granica funkcji',
  'Granice funkcji jednej zmiennej - definicja, obliczanie, twierdzenia o granicach',
  2,
  'Rachunek różniczkowy i całkowy',
  'intermediate',
  '{
    "theory": {
      "introduction": "Granica funkcji to podstawowe pojęcie analizy matematycznej.",
      "keyFormulas": ["lim_{x→a} f(x) = L", "lim_{x→∞} f(x) = L", "lim_{x→a⁺} f(x)", "lim_{x→a⁻} f(x)"],
      "mainConcepts": ["Definicja granicy", "Granice jednostronne", "Granice w nieskończoności", "Twierdzenia o granicach"]
    },
    "examples": [
      {
        "title": "Granica funkcji liniowej",
        "problem": "Oblicz $\\\\lim_{x \\\\to 2} (3x + 1)$",
        "solution": "Podstawiając bezpośrednio: $\\\\lim_{x \\\\to 2} (3x + 1) = 3 \\\\cdot 2 + 1 = 7$"
      },
      {
        "title": "Granica z nieoznaczonością 0/0",
        "problem": "Oblicz $\\\\lim_{x \\\\to 1} \\\\frac{x^2-1}{x-1}$",
        "solution": "Faktoryzujemy licznik: $\\\\lim_{x \\\\to 1} \\\\frac{(x-1)(x+1)}{x-1} = \\\\lim_{x \\\\to 1} (x+1) = 2$"
      }
    ],
    "practiceExercises": [
      {"problem": "Oblicz $\\\\lim_{x \\\\to 3} (x^2 + 2x - 1)$", "answer": "14"},
      {"problem": "Oblicz $\\\\lim_{x \\\\to 0} \\\\frac{\\\\sin x}{x}$", "answer": "1"},
      {"problem": "Oblicz $\\\\lim_{x \\\\to \\\\infty} \\\\frac{2x+1}{x-3}$", "answer": "2"}
    ]
  }',
  '{
    "microSkill": "derivatives",
    "difficultyFactors": {
      "conceptualComplexity": 0.7,
      "calculationLength": 0.6,
      "abstractionLevel": 0.8
    }
  }',
  NOW(),
  NOW()
);

-- Skill 009: Kombinatoryka zaawansowana
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Kombinatoryka zaawansowana',
  'Zaawansowane zagadnienia kombinatoryki - permutacje z powtórzeniami, dwumian Newtona, zasada włączeń i wyłączeń',
  2,
  'Statystyka i probabilistyka',
  'advanced',
  '{
    "theory": {
      "introduction": "Zaawansowana kombinatoryka obejmuje złożone sposoby liczenia i organizowania obiektów.",
      "keyFormulas": ["${n \\\\choose k} = \\\\frac{n!}{k!(n-k)!}$", "$(a+b)^n = \\\\sum_{k=0}^n {n \\\\choose k} a^{n-k}b^k$", "$|A \\\\cup B| = |A| + |B| - |A \\\\cap B|$"],
      "mainConcepts": ["Dwumian Newtona", "Permutacje z powtórzeniami", "Zasada włączeń i wyłączeń", "Kombinacje z powtórzeniami"]
    },
    "examples": [
      {
        "title": "Dwumian Newtona",
        "problem": "Rozwiń $(x+2)^4$ używając dwumianu Newtona",
        "solution": "$(x+2)^4 = \\\\sum_{k=0}^4 {4 \\\\choose k} x^{4-k} \\\\cdot 2^k = x^4 + 8x^3 + 24x^2 + 32x + 16$"
      },
      {
        "title": "Permutacje z powtórzeniami",
        "problem": "Na ile sposobów można ułożyć litery słowa MATEMATYKA?",
        "solution": "Mamy 10 liter: M(2), A(3), T(2), E(1), Y(1), K(1). Odpowiedź: $\\\\frac{10!}{2! \\\\cdot 3! \\\\cdot 2!} = 151200$"
      }
    ],
    "practiceExercises": [
      {"problem": "Oblicz ${8 \\\\choose 3}$", "answer": "56"},
      {"problem": "Ile jest permutacji słowa ABABA?", "answer": "10"},
      {"problem": "Znajdź współczynnik przy $x^3$ w $(2x+1)^5$", "answer": "80"}
    ]
  }',
  '{
    "microSkill": "combinatorics",
    "difficultyFactors": {
      "conceptualComplexity": 0.8,
      "calculationLength": 0.7,
      "abstractionLevel": 0.7
    }
  }',
  NOW(),
  NOW()
);

-- Skill 010: Liczby zespolone
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Liczby zespolone',
  'Działania na liczbach zespolonych, postać algebraiczna i trygonometryczna, wzór de Moivre''a',
  2,
  'Algebra',
  'intermediate',
  '{
    "theory": {
      "introduction": "Liczby zespolone rozszerzają zbiór liczb rzeczywistych o jednostkę urojoną i.",
      "keyFormulas": ["$z = a + bi$", "$|z| = \\\\sqrt{a^2 + b^2}$", "$z^n = r^n(\\\\cos(n\\\\phi) + i\\\\sin(n\\\\phi))$", "$z \\\\cdot \\\\overline{z} = |z|^2$"],
      "mainConcepts": ["Postać algebraiczna", "Postać trygonometryczna", "Wzór de Moivre''a", "Sprzężenie zespolone"]
    },
    "examples": [
      {
        "title": "Dodawanie liczb zespolonych",
        "problem": "Oblicz $(3+2i) + (1-4i)$",
        "solution": "$(3+2i) + (1-4i) = (3+1) + (2-4)i = 4 - 2i$"
      },
      {
        "title": "Moduł liczby zespolonej",
        "problem": "Oblicz moduł liczby $z = 3-4i$",
        "solution": "$|z| = \\\\sqrt{3^2 + (-4)^2} = \\\\sqrt{9 + 16} = \\\\sqrt{25} = 5$"
      }
    ],
    "practiceExercises": [
      {"problem": "Oblicz $(2+i)(3-2i)$", "answer": "8-i"},
      {"problem": "Znajdź $|4+3i|$", "answer": "5"},
      {"problem": "Oblicz $(1+i)^4$ używając wzoru de Moivre''a", "answer": "-4"}
    ]
  }',
  '{
    "microSkill": "default",
    "difficultyFactors": {
      "conceptualComplexity": 0.7,
      "calculationLength": 0.6,
      "abstractionLevel": 0.8
    }
  }',
  NOW(),
  NOW()
);

-- Skill 011: Pochodna funkcji
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Pochodna funkcji',
  'Definicja pochodnej, wzory na pochodne funkcji elementarnych, reguła łańcuchowa, zastosowania pochodnych',
  3,
  'Rachunek różniczkowy i całkowy',
  'advanced',
  '{
    "theory": {
      "introduction": "Pochodna funkcji mierzy szybkość zmian funkcji w danym punkcie.",
      "keyFormulas": ["$f''(x) = \\\\lim_{h \\\\to 0} \\\\frac{f(x+h)-f(x)}{h}$", "$(x^n)'' = nx^{n-1}$", "$(\\\\sin x)'' = \\\\cos x$", "$(f \\\\circ g)'' = f''(g(x)) \\\\cdot g''(x)$"],
      "mainConcepts": ["Definicja pochodnej", "Wzory na pochodne", "Reguła łańcuchowa", "Zastosowania geometryczne"]
    },
    "examples": [
      {
        "title": "Pochodna funkcji wielomianowej",
        "problem": "Oblicz pochodną funkcji $f(x) = 3x^4 - 2x^2 + 5$",
        "solution": "$f''(x) = 12x^3 - 4x$"
      },
      {
        "title": "Reguła łańcuchowa",
        "problem": "Oblicz pochodną funkcji $f(x) = \\\\sin(2x^2)$",
        "solution": "$f''(x) = \\\\cos(2x^2) \\\\cdot 4x = 4x\\\\cos(2x^2)$"
      }
    ],
    "practiceExercises": [
      {"problem": "Oblicz pochodną $f(x) = x^3 - 2x + 1$", "answer": "$3x^2 - 2$"},
      {"problem": "Znajdź $f''(x)$ dla $f(x) = e^{3x}$", "answer": "$3e^{3x}$"},
      {"problem": "Oblicz pochodną $f(x) = \\\\ln(x^2+1)$", "answer": "$\\\\frac{2x}{x^2+1}$"}
    ]
  }',
  '{
    "microSkill": "derivatives",
    "difficultyFactors": {
      "conceptualComplexity": 0.8,
      "calculationLength": 0.7,
      "abstractionLevel": 0.8
    }
  }',
  NOW(),
  NOW()
);

-- Skill 012: Całka nieoznaczona
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Całka nieoznaczona',
  'Podstawowe wzory całkowania, metody całkowania przez części i przez podstawienie',
  3,
  'Rachunek różniczkowy i całkowy',
  'advanced',
  '{
    "theory": {
      "introduction": "Całka nieoznaczona to operacja odwrotna do różniczkowania.",
      "keyFormulas": ["$\\\\int x^n dx = \\\\frac{x^{n+1}}{n+1} + C$", "$\\\\int e^x dx = e^x + C$", "$\\\\int \\\\frac{1}{x} dx = \\\\ln|x| + C$", "$\\\\int u dv = uv - \\\\int v du$"],
      "mainConcepts": ["Funkcja pierwotna", "Podstawowe wzory całkowania", "Całkowanie przez części", "Całkowanie przez podstawienie"]
    },
    "examples": [
      {
        "title": "Podstawowe całkowanie",
        "problem": "Oblicz $\\\\int (3x^2 - 2x + 1) dx$",
        "solution": "$\\\\int (3x^2 - 2x + 1) dx = x^3 - x^2 + x + C$"
      },
      {
        "title": "Całkowanie przez podstawienie",
        "problem": "Oblicz $\\\\int 2x \\\\cos(x^2) dx$",
        "solution": "Podstawienie $u = x^2$, $du = 2x dx$: $\\\\int \\\\cos u du = \\\\sin u + C = \\\\sin(x^2) + C$"
      }
    ],
    "practiceExercises": [
      {"problem": "Oblicz $\\\\int x^4 dx$", "answer": "$\\\\frac{x^5}{5} + C$"},
      {"problem": "Znajdź $\\\\int e^{2x} dx$", "answer": "$\\\\frac{e^{2x}}{2} + C$"},
      {"problem": "Oblicz $\\\\int \\\\frac{3x^2}{x^3+1} dx$", "answer": "$\\\\ln|x^3+1| + C$"}
    ]
  }',
  '{
    "microSkill": "integrals",
    "difficultyFactors": {
      "conceptualComplexity": 0.8,
      "calculationLength": 0.8,
      "abstractionLevel": 0.8
    }
  }',
  NOW(),
  NOW()
);

-- Skill 013: Stereometria
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Stereometria',
  'Geometria przestrzenna - bryły, objętości, pola powierzchni, układy współrzędnych w przestrzeni',
  3,
  'Geometria',
  'advanced',
  '{
    "theory": {
      "introduction": "Stereometria zajmuje się badaniem figur w przestrzeni trójwymiarowej.",
      "keyFormulas": ["$V_{sześcian} = a^3$", "$V_{kula} = \\\\frac{4}{3}\\\\pi r^3$", "$V_{ostrosłup} = \\\\frac{1}{3}Sh$", "$S_{kula} = 4\\\\pi r^2$"],
      "mainConcepts": ["Bryły geometryczne", "Objętości i pola powierzchni", "Przekroje brył", "Współrzędne w przestrzeni"]
    },
    "examples": [
      {
        "title": "Objętość stożka",
        "problem": "Oblicz objętość stożka o promieniu podstawy $r = 3$ i wysokości $h = 4$",
        "solution": "$V = \\\\frac{1}{3}\\\\pi r^2 h = \\\\frac{1}{3}\\\\pi \\\\cdot 9 \\\\cdot 4 = 12\\\\pi$"
      },
      {
        "title": "Przekrój sześcianu",
        "problem": "Znajdź pole przekroju sześcianu o krawędzi $a = 6$ płaszczyzną przechodzącą przez środki trzech krawędzi",
        "solution": "Przekrój jest trójkątem równobocznym o boku $3\\\\sqrt{2}$. Pole: $\\\\frac{\\\\sqrt{3}}{4}(3\\\\sqrt{2})^2 = \\\\frac{9\\\\sqrt{3}}{2}$"
      }
    ],
    "practiceExercises": [
      {"problem": "Oblicz objętość kuli o promieniu $r = 2$", "answer": "$\\\\frac{32\\\\pi}{3}$"},
      {"problem": "Znajdź pole powierzchni sześcianu o objętości $64$", "answer": "96"},
      {"problem": "Oblicz przekątną prostopadłościanu o wymiarach $2 \\\\times 3 \\\\times 6$", "answer": "7"}
    ]
  }',
  '{
    "microSkill": "default",
    "difficultyFactors": {
      "conceptualComplexity": 0.8,
      "calculationLength": 0.7,
      "abstractionLevel": 0.7
    }
  }',
  NOW(),
  NOW()
);

-- Skill 014: Rozkłady prawdopodobieństwa
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Rozkłady prawdopodobieństwa',
  'Rozkłady dyskretne i ciągłe, rozkład dwumianowy, normalny, Poissona, wartość oczekiwana i wariancja',
  3,
  'Statystyka i probabilistyka',
  'advanced',
  '{
    "theory": {
      "introduction": "Rozkłady prawdopodobieństwa opisują sposób rozłożenia prawdopodobieństw dla różnych wartości zmiennej losowej.",
      "keyFormulas": ["$P(X = k) = {n \\\\choose k}p^k(1-p)^{n-k}$", "$f(x) = \\\\frac{1}{\\\\sqrt{2\\\\pi\\\\sigma^2}}e^{-\\\\frac{(x-\\\\mu)^2}{2\\\\sigma^2}}$", "$E(X) = \\\\sum x \\\\cdot P(X = x)$", "$Var(X) = E(X^2) - [E(X)]^2$"],
      "mainConcepts": ["Rozkład dwumianowy", "Rozkład normalny", "Rozkład Poissona", "Parametry rozkładów"]
    },
    "examples": [
      {
        "title": "Rozkład dwumianowy",
        "problem": "Rzucamy monetą 10 razy. Jakie jest prawdopodobieństwo uzyskania dokładnie 6 orłów?",
        "solution": "$P(X = 6) = {10 \\\\choose 6}(0.5)^6(0.5)^4 = 210 \\\\cdot \\\\frac{1}{1024} = \\\\frac{105}{512}$"
      },
      {
        "title": "Rozkład normalny",
        "problem": "Dla rozkładu $N(100, 15^2)$ znajdź $P(85 < X < 115)$",
        "solution": "Standaryzujemy: $P(-1 < Z < 1) \\\\approx 0.6827$ (68% obserwacji)"
      }
    ],
    "practiceExercises": [
      {"problem": "Dla rozkładu dwumianowego $B(8, 0.3)$ oblicz $E(X)$", "answer": "2.4"},
      {"problem": "Jaka jest wariancja rozkładu $N(50, 10^2)$?", "answer": "100"},
      {"problem": "Dla rozkładu Poissona z $\\\\lambda = 4$ znajdź $P(X = 2)$", "answer": "$\\\\frac{4e^{-4}}{3}$"}
    ]
  }',
  '{
    "microSkill": "probability",
    "difficultyFactors": {
      "conceptualComplexity": 0.9,
      "calculationLength": 0.7,
      "abstractionLevel": 0.8
    }
  }',
  NOW(),
  NOW()
);

-- Skill 015: Równania różniczkowe
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Równania różniczkowe',
  'Równania różniczkowe zwyczajne pierwszego rzędu, metody rozwiązywania, zastosowania praktyczne',
  3,
  'Rachunek różniczkowy i całkowy',
  'expert',
  '{
    "theory": {
      "introduction": "Równania różniczkowe opisują związki między funkcją a jej pochodnymi.",
      "keyFormulas": ["$\\\\frac{dy}{dx} = f(x, y)$", "$y'' + p(x)y'' + q(x)y = 0$", "$y = Ce^{\\\\int P(x)dx}$", "$y = e^{-\\\\int P(x)dx}(\\\\int Q(x)e^{\\\\int P(x)dx}dx + C)$"],
      "mainConcepts": ["Równania separowalne", "Równania liniowe", "Warunki początkowe", "Zastosowania fizyczne"]
    },
    "examples": [
      {
        "title": "Równanie separowalne",
        "problem": "Rozwiąż równanie $\\\\frac{dy}{dx} = xy$ z warunkiem $y(0) = 2$",
        "solution": "Separujemy zmienne: $\\\\frac{dy}{y} = x dx$. Całkujemy: $\\\\ln|y| = \\\\frac{x^2}{2} + C$. Z warunkiem początkowym: $y = 2e^{x^2/2}$"
      },
      {
        "title": "Równanie liniowe",
        "problem": "Rozwiąż $y'' + 2y = 6x$",
        "solution": "Czynnik całkujący: $\\\\mu = e^{2x}$. Rozwiązanie: $y = 3x - \\\\frac{3}{2} + Ce^{-2x}$"
      }
    ],
    "practiceExercises": [
      {"problem": "Rozwiąż $\\\\frac{dy}{dx} = 2x$ z $y(1) = 3$", "answer": "$y = x^2 + 2$"},
      {"problem": "Znajdź rozwiązanie $y'' - y = 0$", "answer": "$y = Ce^x$"},
      {"problem": "Rozwiąż $\\\\frac{dy}{dx} = \\\\frac{y}{x}$ z $y(1) = 4$", "answer": "$y = 4x$"}
    ]
  }',
  '{
    "microSkill": "derivatives",
    "difficultyFactors": {
      "conceptualComplexity": 1.0,
      "calculationLength": 0.9,
      "abstractionLevel": 0.9
    }
  }',
  NOW(),
  NOW()
);