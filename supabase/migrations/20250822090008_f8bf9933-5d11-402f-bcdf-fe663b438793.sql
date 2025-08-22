-- Merge duplicate skills and clean up the database
-- Step 1: Merge "Pochodna funkcji — definicja, obliczanie, interpretacje" content into "Pochodna funkcji"
UPDATE skills 
SET content_structure = (
  SELECT content_structure 
  FROM skills 
  WHERE name = 'Pochodna funkcji — definicja, obliczanie, interpretacje' 
  AND department = 'calculus'
),
content_data = (
  SELECT content_data 
  FROM skills 
  WHERE name = 'Pochodna funkcji — definicja, obliczanie, interpretacje' 
  AND department = 'calculus'
),
updated_at = now()
WHERE name = 'Pochodna funkcji' AND department = 'analiza_matematyczna';

-- Step 2: Merge "Stereometria — objętości i pola powierzchni" content into "Stereometria – bryły"
UPDATE skills 
SET content_structure = (
  SELECT content_structure 
  FROM skills 
  WHERE name = 'Stereometria — objętości i pola powierzchni' 
  AND department = 'geometry'
),
content_data = (
  SELECT content_data 
  FROM skills 
  WHERE name = 'Stereometria — objętości i pola powierzchni' 
  AND department = 'geometry'
),
updated_at = now()
WHERE name = 'Stereometria – bryły' AND department = 'geometria';

-- Step 3: Remove duplicate entries after merging content
DELETE FROM skills 
WHERE name = 'Pochodna funkcji — definicja, obliczania, interpretacje' 
AND department = 'calculus';

DELETE FROM skills 
WHERE name = 'Stereometria — objętości i pola powierzchni' 
AND department = 'geometry';

DELETE FROM skills 
WHERE name = 'Stereometria' 
AND department = 'Geometria';

-- Step 4: Update skill names to be more consistent
UPDATE skills 
SET name = 'Pochodna funkcji — definicja, obliczanie, interpretacje',
    updated_at = now()
WHERE name = 'Pochodna funkcji' AND department = 'analiza_matematyczna';

UPDATE skills 
SET name = 'Stereometria — objętości i pola powierzchni',
    updated_at = now()
WHERE name = 'Stereometria – bryły' AND department = 'geometria';