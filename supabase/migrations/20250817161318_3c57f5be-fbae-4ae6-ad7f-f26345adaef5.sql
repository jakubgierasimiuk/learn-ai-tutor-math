-- Add chapter_tag column to skills table if it doesn't exist
ALTER TABLE skills ADD COLUMN IF NOT EXISTS chapter_tag TEXT;

-- Insert skills without prerequisites initially (we'll handle prerequisites later)
INSERT INTO skills (
  name, department, level, class_level, men_code, description, chapter_tag, 
  estimated_time_minutes, difficulty_rating, learning_objectives
) VALUES 
-- Batch 1: Basic algebra skills (grades 9-10)
('Zastosowanie wzoru na kwadrat sumy i różnicy', 'algebra', 'basic', 9, 'III.2.1', 'Stosowanie wzoru skróconego mnożenia (a ± b)^2 do szybkiego rozwijania i upraszczania wyrażeń algebraicznych.', 'Wyrażenia algebraiczne', 20, 2, '["Uczeń stosuje wzór (a ± b)^2 = a^2 ± 2ab + b^2 do rozwijania sumy i różnicy do kwadratu.", "Uczeń upraszcza wyrażenia algebraiczne, korzystając z powyższego wzoru skróconego mnożenia."]'::jsonb),

('Różnica kwadratów - rozkład na czynniki', 'algebra', 'basic', 9, 'III.2.1', 'Rozpoznawanie i stosowanie tożsamości a^2 - b^2 = (a - b)(a + b) w celu faktoryzacji wyrażeń algebraicznych.', 'Wyrażenia algebraiczne', 20, 2, '["Uczeń rozkłada wyrażenia w postaci różnicy dwóch kwadratów na iloczyn dwóch czynników liniowych.", "Uczeń rozpoznaje strukturę a^2 - b^2 w wyrażeniu i zastępuje ją iloczynem (a - b)(a + b)."]'::jsonb),

('Mnożenie wielomianów (dwumian przez dwumian)', 'algebra', 'basic', 9, 'III.2.4', 'Umiejętność mnożenia dwóch dwumianów (lub ogólnie wielomianów) z wykorzystaniem rozdzielności mnożenia względem dodawania.', 'Wyrażenia algebraiczne', 20, 2, '["Uczeń mnoży dwa dwumiany, np. (ax + b)(cx + d), obliczając sumę iloczynów wszystkich par składników.", "Uczeń porządkuje i upraszcza otrzymany wielomian po wykonaniu mnożenia."]'::jsonb),

('Wyłączanie wspólnego czynnika przed nawias', 'algebra', 'basic', 9, 'III.2.3', 'Faktoryzacja wyrażenia algebraicznego poprzez wyciągnięcie największego wspólnego czynnika przed nawias w celu uproszczenia wyrażenia.', 'Wyrażenia algebraiczne', 20, 2, '["Uczeń identyfikuje największy wspólny dzielnik jednomianowy wyrazów wielomianu.", "Uczeń wyłącza wspólny czynnik przed nawias i zapisuje wyrażenie w postaci iloczynu tego czynnika oraz pozostałego wielomianu."]'::jsonb),

('Grupowanie wyrazów przy rozkładaniu wielomianu', 'algebra', 'advanced', 10, 'III.2.3', 'Zaawansowana technika faktoryzacji wielomianów polegająca na grupowaniu wyrazów w pary w celu znalezienia wspólnych czynników i rozłożenia wielomianu na iloczyny.', 'Wyrażenia algebraiczne', 25, 4, '["Uczeń rozkłada wielomian na grupy wyrazów w taki sposób, aby w każdej grupie można było wyłączyć wspólny czynnik.", "Uczeń stosuje dwukrotnie wyłączanie czynnika: najpierw w każdej z grup, a następnie na wyrażeniu powstałym po pogrupowaniu, uzyskując iloczyn dwóch wielomianów."]'::jsonb),

-- Quadratic equations
('Rozwiązywanie równań kwadratowych metodą faktoryzacji', 'algebra', 'basic', 9, 'III.2.5', 'Uczeń rozwiązuje równania kwadratowe poprzez rozkład trójmianu na czynniki i zastosowanie prawa iloczynu zerowego.', 'Równania kwadratowe', 25, 3, '["Uczeń rozpoznaje możliwość rozkładu trójmianu kwadratowego na iloczyn czynników liniowych.", "Uczeń stosuje prawo iloczynu zerowego do znajdowania rozwiązań równania."]'::jsonb),

('Rozwiązywanie równań kwadratowych za pomocą wzorów Vieta', 'algebra', 'intermediate', 9, 'III.2.6', 'Uczeń znajduje pierwiastki równania kwadratowego korzystając z zależności Vieta między współczynnikami a pierwiastkami.', 'Równania kwadratowe', 25, 3, '["Uczeń rozpoznaje równanie kwadratowe w postaci kanonicznej.", "Uczeń stosuje wzory Vieta do obliczania sumy i iloczynu pierwiastków.", "Uczeń potrafi wyznaczyć pierwiastki równania na podstawie zależności Vieta."]'::jsonb),

-- Quadratic functions
('Wyznaczanie miejsc zerowych funkcji kwadratowej metodą wyróżnika Delta', 'functions', 'basic', 9, 'III.3.2', 'Uczeń oblicza miejsca zerowe funkcji kwadratowej, korzystając z wyróżnika trójmianu kwadratowego.', 'Funkcje kwadratowe', 30, 3, '["Uczeń oblicza wartość wyróżnika Delta = b^2 - 4ac.", "Uczeń określa liczbę miejsc zerowych funkcji na podstawie wartości Delta.", "Uczeń wyznacza pierwiastki równania kwadratowego przy pomocy wzoru kwadratowego."]'::jsonb),

('Wyznaczanie wierzchołka paraboli', 'functions', 'intermediate', 10, 'III.3.3', 'Uczeń znajduje współrzędne wierzchołka paraboli funkcji kwadratowej w postaci ogólnej y = ax^2 + bx + c.', 'Funkcje kwadratowe', 25, 3, '["Uczeń korzysta ze wzoru na współrzędne wierzchołka: x0 = -b / 2a, y0 = -Delta / 4a.", "Uczeń oblicza i interpretuje położenie wierzchołka paraboli na płaszczyźnie."]'::jsonb),

('Szkicowanie wykresu funkcji kwadratowej', 'functions', 'intermediate', 10, 'III.3.3', 'Uczeń potrafi naszkicować wykres paraboli, korzystając z miejsc zerowych, wierzchołka oraz współczynnika kierunkowego a.', 'Funkcje kwadratowe', 30, 4, '["Uczeń rozpoznaje kształt paraboli w zależności od znaku współczynnika a.", "Uczeń wyznacza kluczowe punkty wykresu: miejsca zerowe, wierzchołek, punkt przecięcia z osią OY.", "Uczeń szkicuje wykres paraboli na układzie współrzędnych."]'::jsonb),

('Przekształcanie wzoru funkcji kwadratowej do postaci kanonicznej', 'functions', 'intermediate', 10, 'III.3.3', 'Uczeń przekształca wzór funkcji kwadratowej y = ax^2 + bx + c do postaci kanonicznej y = a(x - p)^2 + q poprzez dopełnianie kwadratu.', 'Funkcje kwadratowe', 30, 4, '["Uczeń stosuje metodę dopełniania kwadratu do przekształcania postaci ogólnej funkcji kwadratowej.", "Uczeń interpretuje parametry p i q jako współrzędne wierzchołka paraboli."]'::jsonb),

('Analiza znaku funkcji kwadratowej', 'functions', 'advanced', 10, 'III.3.3', 'Uczeń bada przedziały, w których funkcja kwadratowa przyjmuje wartości dodatnie i ujemne.', 'Funkcje kwadratowe', 25, 4, '["Uczeń zaznacza miejsca zerowe na osi liczbowej.", "Uczeń określa znak funkcji w poszczególnych przedziałach między miejscami zerowymi.", "Uczeń interpretuje znak funkcji kwadratowej w kontekście wykresu paraboli."]'::jsonb),

('Zadania tekstowe z funkcją kwadratową', 'functions', 'advanced', 10, 'III.3.4', 'Uczeń rozwiązuje zadania praktyczne, w których model matematyczny stanowi funkcja kwadratowa (np. optymalizacja pola, ceny, prędkości).', 'Funkcje kwadratowe - zastosowania', 35, 5, '["Uczeń buduje model funkcją kwadratową dla sytuacji opisanej w zadaniu.", "Uczeń znajduje wartości optymalne (maksimum/minimum) i interpretuje je kontekstowo.", "Uczeń rozwiązuje zadania problemowe z zastosowaniem funkcji kwadratowej."]'::jsonb),

-- Analytic geometry
('Równanie prostej w postaci kierunkowej', 'geometry', 'basic', 9, 'III.4.1', 'Uczeń zapisuje równanie prostej w układzie współrzędnych w postaci y = ax + b na podstawie współczynnika kierunkowego i punktu.', 'Geometria analityczna', 20, 2, '["Uczeń wyznacza współczynnik kierunkowy prostej przechodzącej przez dwa punkty.", "Uczeń zapisuje równanie prostej w postaci y = ax + b.", "Uczeń interpretuje współczynnik kierunkowy jako tangens kąta nachylenia prostej do osi OX."]'::jsonb),

('Równanie prostej w postaci ogólnej', 'geometry', 'intermediate', 9, 'III.4.1', 'Uczeń zapisuje równanie prostej w postaci Ax + By + C = 0 oraz przekształca je do postaci kierunkowej i odwrotnie.', 'Geometria analityczna', 20, 3, '["Uczeń zna i stosuje równanie prostej w postaci ogólnej Ax + By + C = 0.", "Uczeń przekształca równanie z postaci ogólnej do kierunkowej i odwrotnie.", "Uczeń rozpoznaje proste równoległe i prostopadłe na podstawie równań."]'::jsonb),

('Odległość punktu od prostej', 'geometry', 'intermediate', 10, 'III.4.2', 'Uczeń oblicza odległość punktu od prostej w układzie współrzędnych, korzystając ze wzoru analitycznego.', 'Geometria analityczna', 25, 3, '["Uczeń zna wzór na odległość punktu P(x0,y0) od prostej Ax+By+C=0: d = |Ax0+By0+C| / √(A^2+B^2).", "Uczeń stosuje wzór do obliczania odległości punktu od danej prostej.", "Uczeń interpretuje geometrycznie otrzymany wynik."]'::jsonb),

('Równanie okręgu w układzie współrzędnych', 'geometry', 'basic', 9, 'III.4.3', 'Uczeń zapisuje równanie okręgu o środku w punkcie (a, b) i promieniu r w postaci (x - a)^2 + (y - b)^2 = r^2.', 'Geometria analityczna', 20, 2, '["Uczeń zna wzór na równanie okręgu o danym środku i promieniu.", "Uczeń rozpoznaje równanie okręgu i potrafi wskazać jego środek i promień.", "Uczeń rysuje okrąg w układzie współrzędnych na podstawie równania."]'::jsonb),

('Wektory - dodawanie i odejmowanie', 'geometry', 'basic', 9, 'III.4.4', 'Uczeń wykonuje działania na wektorach w układzie współrzędnych: dodawanie, odejmowanie, mnożenie przez liczbę.', 'Geometria analityczna - wektory', 20, 2, '["Uczeń dodaje i odejmuje wektory, stosując regułę równoległoboku i/lub rachunek współrzędnych.", "Uczeń mnoży wektor przez liczbę i interpretuje wynik geometrycznie.", "Uczeń stosuje działania na wektorach w prostych zadaniach geometrycznych."]'::jsonb),

('Iloczyn skalarny wektorów', 'geometry', 'intermediate', 10, 'III.4.4', 'Uczeń oblicza iloczyn skalarny wektorów i interpretuje go geometrycznie jako miarę kąta między wektorami.', 'Geometria analityczna - wektory', 25, 3, '["Uczeń zna wzór na iloczyn skalarny: u·v = |u||v|cosα oraz u·v = x1x2 + y1y2.", "Uczeń oblicza iloczyn skalarny wektorów w zadaniach liczbowych.", "Uczeń wykorzystuje iloczyn skalarny do wyznaczania kąta między wektorami i sprawdzania prostopadłości."]'::jsonb),

('Zastosowanie wektorów do obliczania pól figur', 'geometry', 'advanced', 10, 'III.4.5', 'Uczeń oblicza pola trójkątów i równoległoboków korzystając z własności wektorów i iloczynu wektorowego w R².', 'Geometria analityczna - wektory', 30, 5, '["Uczeń stosuje wzór na pole trójkąta w oparciu o wektory.", "Uczeń oblicza pole równoległoboku jako wartość iloczynu wektorowego.", "Uczeń interpretuje rozwiązania geometrycznie na układzie współrzędnych."]'::jsonb),

-- Systems of equations
('Układy równań liniowych metodą podstawiania', 'algebra', 'basic', 9, 'III.2.7', 'Uczeń rozwiązuje układy dwóch równań liniowych z dwiema niewiadomymi metodą podstawiania.', 'Układy równań', 25, 3, '["Uczeń przekształca jedno z równań, aby wyrazić jedną niewiadomą przez drugą.", "Uczeń podstawia wyrażenie do drugiego równania i oblicza rozwiązanie.", "Uczeń sprawdza poprawność rozwiązania poprzez podstawienie do obu równań."]'::jsonb),

('Układy równań liniowych metodą przeciwnych współczynników', 'algebra', 'basic', 9, 'III.2.7', 'Uczeń rozwiązuje układy dwóch równań liniowych metodą przeciwnych współczynników (dodawania/odejmowania równań).', 'Układy równań', 25, 3, '["Uczeń mnoży równania układu przez odpowiednie liczby, aby uzyskać przeciwne współczynniki.", "Uczeń dodaje/odejmuje równania i oblicza niewiadome.", "Uczeń zapisuje rozwiązanie układu w postaci uporządkowanej pary liczb."]'::jsonb),

('Zastosowanie układów równań w zadaniach tekstowych', 'algebra', 'intermediate', 10, 'III.2.7', 'Uczeń modeluje sytuacje praktyczne za pomocą układów równań i rozwiązuje je.', 'Układy równań', 30, 4, '["Uczeń tłumaczy zadanie tekstowe na język równań liniowych.", "Uczeń rozwiązuje układ i interpretuje wynik w kontekście problemu.", "Uczeń analizuje poprawność modelu matematycznego."]'::jsonb),

('Rozwiązywanie układów równań kwadratowych i liniowych', 'algebra', 'advanced', 10, 'III.2.8', 'Uczeń rozwiązuje układy równań, w których jedno równanie jest kwadratowe, a drugie liniowe.', 'Układy równań nieliniowych', 35, 5, '["Uczeń podstawia wyrażenie liniowe do równania kwadratowego.", "Uczeń rozwiązuje otrzymane równanie kwadratowe i interpretuje rozwiązania.", "Uczeń analizuje liczbę i rodzaj rozwiązań geometrycznie (przecięcie paraboli i prostej)."]'::jsonb),

-- Linear functions
('Badanie monotoniczności funkcji liniowej', 'functions', 'basic', 9, 'III.3.1', 'Uczeń bada monotoniczność funkcji liniowej w zależności od współczynnika kierunkowego a.', 'Funkcja liniowa', 20, 2, '["Uczeń interpretuje współczynnik kierunkowy jako wskaźnik rosnącego lub malejącego charakteru funkcji.", "Uczeń rozpoznaje, że a > 0 oznacza funkcję rosnącą, a < 0 – malejącą."]'::jsonb),

('Obliczanie wartości funkcji liniowej', 'functions', 'basic', 9, 'III.3.1', 'Uczeń oblicza wartość funkcji liniowej dla danego argumentu.', 'Funkcja liniowa', 15, 1, '["Uczeń podstawia wartość x do wzoru funkcji y = ax + b i oblicza y.", "Uczeń interpretuje wynik w kontekście problemu tekstowego."]'::jsonb),

('Równoległość i prostopadłość prostych w układzie współrzędnych', 'geometry', 'intermediate', 10, 'III.4.1', 'Uczeń bada warunki równoległości i prostopadłości prostych na podstawie współczynników kierunkowych.', 'Geometria analityczna', 25, 3, '["Uczeń rozpoznaje równoległość prostych, gdy mają równe współczynniki kierunkowe.", "Uczeń rozpoznaje prostopadłość prostych, gdy iloczyn współczynników kierunkowych wynosi -1.", "Uczeń interpretuje geometrycznie zależności między prostymi."]'::jsonb);