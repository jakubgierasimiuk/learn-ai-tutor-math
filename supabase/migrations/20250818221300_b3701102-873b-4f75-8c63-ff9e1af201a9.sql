-- Check if skills already exist and update/insert
-- Add content_data and generator_params columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'skills' AND column_name = 'content_data'
    ) THEN
        ALTER TABLE skills ADD COLUMN content_data jsonb DEFAULT '{}';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'skills' AND column_name = 'generator_params'
    ) THEN
        ALTER TABLE skills ADD COLUMN generator_params jsonb DEFAULT '{}';
    END IF;
END $$;

-- Import all content packages using existing schema

-- Skill 008: Granica funkcji
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  'skill_008',
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
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  content_data = EXCLUDED.content_data,
  generator_params = EXCLUDED.generator_params,
  updated_at = NOW();

-- Skill 009: Kombinatoryka zaawansowana
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  'skill_009',
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
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  content_data = EXCLUDED.content_data,
  generator_params = EXCLUDED.generator_params,
  updated_at = NOW();

-- Continue with remaining skills...
-- Skill 010: Liczby zespolone
INSERT INTO skills (
  id, name, description, class_level, department, level, 
  content_data, generator_params, created_at, updated_at
) VALUES (
  'skill_010',
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
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  content_data = EXCLUDED.content_data,
  generator_params = EXCLUDED.generator_params,
  updated_at = NOW();