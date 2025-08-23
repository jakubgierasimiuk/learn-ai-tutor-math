-- Dodanie kolumn do klasyfikacji szkół i ukrywania tematów podstawówki
ALTER TABLE skills 
ADD COLUMN school_type TEXT DEFAULT 'podstawowa',
ADD COLUMN is_hidden BOOLEAN DEFAULT false;

-- Ukrycie wszystkich tematów podstawówki (klasy 4-8)
UPDATE skills 
SET school_type = 'podstawowa', is_hidden = true 
WHERE department IN ('arithmetic', 'real_numbers') 
   AND class_level::text IN ('4', '5', '6', '7', '8');

-- Oznaczenie tematów licealnych jako widoczne
UPDATE skills 
SET school_type = 'liceum', is_hidden = false 
WHERE department IN ('algebra', 'functions', 'geometry', 'calculus', 'analiza_matematyczna', 'sequences')
   AND class_level::text IN ('1', '2', '3', '4');

-- Poprawne mapowanie klas licealnych zgodnie z polską podstawą programową
UPDATE skills SET class_level = '1 LO' WHERE class_level = '1' AND school_type = 'liceum';
UPDATE skills SET class_level = '2 LO' WHERE class_level = '2' AND school_type = 'liceum';
UPDATE skills SET class_level = '3 LO' WHERE class_level = '3' AND school_type = 'liceum';
UPDATE skills SET class_level = '4 LO' WHERE class_level = '4' AND school_type = 'liceum';

-- Specyficzne mapowanie tematów na klasy zgodnie z podstawą programową:

-- 1 LO: Liczby rzeczywiste, podstawy algebry, funkcje liniowe
UPDATE skills SET class_level = '1 LO' 
WHERE name ILIKE '%liczby rzeczywiste%' 
   OR name ILIKE '%działania na liczbach%'
   OR name ILIKE '%równania liniowe%'
   OR name ILIKE '%nierówności liniowe%'
   OR name ILIKE '%funkcje liniowe%';

-- 2 LO: Funkcje kwadratowe, równania kwadratowe, wartość bezwzględna, ciągi
UPDATE skills SET class_level = '2 LO' 
WHERE name ILIKE '%kwadratowe%'
   OR name ILIKE '%wartość bezwzględna%'
   OR name ILIKE '%ciągi%'
   OR name ILIKE '%parabola%'
   OR name ILIKE '%równania wielomianowe%';

-- 3 LO: Trygonometria, funkcje wykładnicze/logarytmiczne (poziom rozszerzony)
UPDATE skills SET class_level = '3 LO' 
WHERE name ILIKE '%trygonometr%'
   OR name ILIKE '%logarytm%'
   OR name ILIKE '%wykładnicze%'
   OR name ILIKE '%sinus%'
   OR name ILIKE '%cosinus%';

-- 4 LO: Rachunek różniczkowy i całkowy (tylko rozszerzony)
UPDATE skills SET class_level = '4 LO' 
WHERE name ILIKE '%pochodna%'
   OR name ILIKE '%różniczkow%'
   OR name ILIKE '%całka%'
   OR name ILIKE '%granica%'
   OR department IN ('calculus', 'analiza_matematyczna');

-- Dodanie indeksów dla wydajności
CREATE INDEX idx_skills_school_type_hidden ON skills(school_type, is_hidden);
CREATE INDEX idx_skills_class_level ON skills(class_level);