-- Dodanie pozostałych części z Paczki #3

-- Część 1A: Algebra podstawowa (klasy 7-8)
INSERT INTO skills (
  name, department, level, class_level, men_code, description, chapter_tag,
  estimated_time_minutes, difficulty_rating, learning_objectives
) VALUES
('Redukcja wyrazów podobnych', 'algebra', 'basic', 7, 'III.2.1', 'Uczeń potrafi łączyć wyrazy podobne w prostych wyrażeniach algebraicznych.', 'Wyrażenia algebraiczne - redukcja', 15, 2, '["Uczeń rozpoznaje wyrazy podobne.", "Uczeń redukuje wyrazy podobne poprawnie.", "Uczeń upraszcza proste wyrażenia algebraiczne."]'),

('Dodawanie i odejmowanie wyrażeń algebraicznych', 'algebra', 'basic', 7, 'III.2.2', 'Uczeń dodaje i odejmuje wyrażenia algebraiczne o 1–2 zmiennych.', 'Wyrażenia algebraiczne - działania podstawowe', 20, 2, '["Uczeń potrafi wykonywać działania na prostych wyrażeniach algebraicznych.", "Uczeń rozpoznaje sytuacje wymagające redukcji wyrazów podobnych.", "Uczeń stosuje dodawanie i odejmowanie w zadaniach tekstowych."]'),

('Mnożenie jednomianu przez jednomian', 'algebra', 'basic', 7, 'III.2.3', 'Uczeń mnoży jednomiany, stosując prawa działań na potęgach.', 'Wyrażenia algebraiczne - mnożenie jednomianów', 20, 2, '["Uczeń stosuje prawo mnożenia potęg o tej samej podstawie.", "Uczeń poprawnie mnoży jednomiany.", "Uczeń upraszcza wynik działania."]'),

('Mnożenie jednomianu przez wielomian', 'algebra', 'basic', 7, 'III.2.4', 'Uczeń mnoży jednomian przez wielomian, stosując rozdzielność mnożenia względem dodawania.', 'Wyrażenia algebraiczne - mnożenie jednomianu przez wielomian', 20, 2, '["Uczeń stosuje rozdzielność mnożenia względem dodawania.", "Uczeń wykonuje krok po kroku mnożenie jednomianu przez wielomian.", "Uczeń upraszcza otrzymany wynik."]'),

('Mnożenie wielomianu przez wielomian', 'algebra', 'intermediate', 7, 'III.2.5', 'Uczeń mnoży dwa wielomiany metodą podwójnego nawiasu lub tabliczki.', 'Wyrażenia algebraiczne - mnożenie wielomianów', 25, 3, '["Uczeń stosuje metodę podwójnego nawiasu.", "Uczeń wykonuje systematyczne mnożenie składników.", "Uczeń redukuje otrzymane wyrazy podobne."]'),

('Kwadrat sumy', 'algebra', 'intermediate', 7, 'III.2.6', 'Uczeń rozwija i stosuje wzór (a+b)² = a² + 2ab + b².', 'Wzory skróconego mnożenia', 20, 3, '["Uczeń zna wzór na kwadrat sumy.", "Uczeń rozwija wyrażenia postaci (a+b)².", "Uczeń stosuje wzór do obliczeń praktycznych."]'),

('Kwadrat różnicy', 'algebra', 'intermediate', 7, 'III.2.7', 'Uczeń rozwija i stosuje wzór (a-b)² = a² - 2ab + b².', 'Wzory skróconego mnożenia', 20, 3, '["Uczeń zna wzór na kwadrat różnicy.", "Uczeń rozwija wyrażenia postaci (a-b)².", "Uczeń stosuje wzór do obliczeń praktycznych."]'),

('Różnica kwadratów', 'algebra', 'intermediate', 7, 'III.2.8', 'Uczeń stosuje wzór a² - b² = (a-b)(a+b).', 'Wzory skróconego mnożenia', 20, 3, '["Uczeń zna wzór na różnicę kwadratów.", "Uczeń rozkłada wyrażenia na czynniki.", "Uczeń stosuje wzór w zadaniach rachunkowych."]'),

('Wyłączanie wspólnego czynnika przed nawias', 'algebra', 'basic', 7, 'III.2.9', 'Uczeń wyłącza wspólny czynnik przed nawias w prostych wyrażeniach.', 'Rozkład na czynniki', 20, 2, '["Uczeń rozpoznaje wspólny czynnik.", "Uczeń zapisuje wyrażenie w postaci iloczynu.", "Uczeń stosuje tę metodę do upraszczania wyrażeń."]'),

('Rozkład trójmianu kwadratowego na czynniki', 'algebra', 'intermediate', 8, 'III.2.10', 'Uczeń rozkłada trójmian kwadratowy na czynniki, stosując wzory skróconego mnożenia.', 'Rozkład na czynniki', 25, 4, '["Uczeń stosuje wzory skróconego mnożenia do rozkładu trójmianów.", "Uczeń rozpoznaje postacie trójmianów nadających się do rozkładu.", "Uczeń stosuje rozkład do rozwiązywania równań kwadratowych."]'),

('Upraszczanie ułamków algebraicznych', 'algebra', 'intermediate', 8, 'III.2.11', 'Uczeń skraca ułamki algebraiczne, stosując rozkład na czynniki.', 'Ułamki algebraiczne', 20, 3, '["Uczeń rozpoznaje wspólne czynniki w liczniku i mianowniku.", "Uczeń skraca ułamki algebraiczne poprawnie.", "Uczeń podaje warunki istnienia ułamka."]'),

('Dodawanie i odejmowanie ułamków algebraicznych', 'algebra', 'intermediate', 8, 'III.2.12', 'Uczeń dodaje i odejmuje ułamki algebraiczne o różnych mianownikach.', 'Ułamki algebraiczne', 25, 4, '["Uczeń sprowadza ułamki do wspólnego mianownika.", "Uczeń dodaje i odejmuje ułamki algebraiczne.", "Uczeń upraszcza wynik działania."]'),

('Mnożenie i dzielenie ułamków algebraicznych', 'algebra', 'intermediate', 8, 'III.2.13', 'Uczeń mnoży i dzieli ułamki algebraiczne, stosując skracanie czynników.', 'Ułamki algebraiczne', 25, 4, '["Uczeń mnoży i dzieli ułamki algebraiczne.", "Uczeń stosuje skracanie czynników podczas działań.", "Uczeń podaje warunki istnienia ułamka po działaniu."]'),

-- Część 1B: Równania liniowe (klasy 7-8)
('Równania liniowe z jedną niewiadomą - proste przypadki', 'algebra', 'basic', 7, 'III.2.14', 'Uczeń rozwiązuje równania postaci ax = b, gdzie a ≠ 0.', 'Równania liniowe', 20, 2, '["Uczeń rozpoznaje równanie liniowe prostej postaci.", "Uczeń stosuje dzielenie obu stron równania.", "Uczeń sprawdza poprawność rozwiązania."]'),

('Równania liniowe z jedną niewiadomą - pełna postać', 'algebra', 'basic', 7, 'III.2.15', 'Uczeń rozwiązuje równania postaci ax + b = c.', 'Równania liniowe', 20, 2, '["Uczeń przenosi składniki na drugą stronę równania.", "Uczeń wykonuje działania odwrotne.", "Uczeń sprawdza wynik podstawieniem."]'),

('Równania liniowe z nawiasami', 'algebra', 'intermediate', 7, 'III.2.16', 'Uczeń rozwiązuje równania liniowe zawierające nawiasy i redukcję wyrazów podobnych.', 'Równania liniowe', 25, 3, '["Uczeń usuwa nawiasy stosując rozdzielność mnożenia.", "Uczeń redukuje wyrazy podobne.", "Uczeń rozwiązuje równanie krok po kroku."]'),

('Równania liniowe z ułamkami zwykłymi', 'algebra', 'intermediate', 7, 'III.2.17', 'Uczeń rozwiązuje równania liniowe zawierające ułamki zwykłe.', 'Równania liniowe z ułamkami', 25, 3, '["Uczeń sprowadza równanie do wspólnego mianownika.", "Uczeń usuwa mianowniki mnożąc obie strony równania.", "Uczeń rozwiązuje równanie liniowe otrzymane po przekształceniach."]'),

('Równania liniowe z ułamkami algebraicznymi', 'algebra', 'intermediate', 8, 'III.2.18', 'Uczeń rozwiązuje równania liniowe zawierające ułamki algebraiczne.', 'Równania z ułamkami algebraicznymi', 30, 4, '["Uczeń podaje warunki istnienia równania.", "Uczeń eliminuje mianowniki poprzez mnożenie obu stron przez wspólny mianownik.", "Uczeń rozwiązuje równanie liniowe po uproszczeniach."]'),

('Równania liniowe z pierwiastkami kwadratowymi', 'algebra', 'intermediate', 8, 'III.2.19', 'Uczeń rozwiązuje równania liniowe zawierające pierwiastki kwadratowe.', 'Równania z pierwiastkami', 25, 4, '["Uczeń izoluje pierwiastek na jednej stronie równania.", "Uczeń podnosi obie strony równania do kwadratu.", "Uczeń sprawdza otrzymane rozwiązania pod kątem pierwiastków urojonych."]'),

('Równania z niewiadomą pod pierwiastkiem', 'algebra', 'advanced', 8, 'III.2.20', 'Uczeń rozwiązuje równania, w których niewiadoma występuje pod pierwiastkiem.', 'Równania z pierwiastkami', 30, 5, '["Uczeń izoluje wyrażenie pod pierwiastkiem.", "Uczeń podnosi obie strony równania do odpowiedniej potęgi.", "Uczeń eliminuje rozwiązania sprzeczne (tzw. rozwiązania pozorne)."]'),

('Równania tekstowe prowadzące do równań liniowych', 'algebra', 'intermediate', 7, 'III.2.21', 'Uczeń rozwiązuje zadania tekstowe, które sprowadzają się do równań liniowych.', 'Równania tekstowe', 30, 4, '["Uczeń tłumaczy treść zadania na równanie liniowe.", "Uczeń rozwiązuje równanie krok po kroku.", "Uczeń interpretuje wynik w kontekście zadania."]'),

('Równania równoważne i sprzeczne', 'algebra', 'intermediate', 8, 'III.2.22', 'Uczeń rozpoznaje równania równoważne i równania sprzeczne.', 'Równania liniowe - typy rozwiązań', 20, 3, '["Uczeń rozpoznaje równania tożsamościowe.", "Uczeń wskazuje przykłady równań sprzecznych.", "Uczeń wyjaśnia różnice między rodzajami równań."]'),

('Układy równań liniowych - wprowadzenie', 'algebra', 'intermediate', 8, 'III.2.23', 'Uczeń rozwiązuje proste układy dwóch równań liniowych metodą podstawiania.', 'Układy równań liniowych', 30, 4, '["Uczeń rozwiązuje jedno równanie względem jednej niewiadomej.", "Uczeń podstawia wynik do drugiego równania.", "Uczeń oblicza obie niewiadome."]'),

-- Część 1C: Równania kwadratowe (klasa 8)
('Rozpoznawanie równań kwadratowych', 'algebra', 'basic', 8, 'III.2.24', 'Uczeń rozpoznaje równanie kwadratowe w postaci ogólnej ax² + bx + c = 0.', 'Równania kwadratowe - wprowadzenie', 15, 2, '["Uczeń odróżnia równania kwadratowe od innych równań.", "Uczeń zna definicję równania kwadratowego.", "Uczeń wskazuje współczynniki a, b, c w równaniu kwadratowym."]'),

('Równania kwadratowe rozkładem na czynniki', 'algebra', 'intermediate', 8, 'III.2.25', 'Uczeń rozwiązuje równania kwadratowe poprzez rozkład na czynniki.', 'Równania kwadratowe - metody rozwiązywania', 25, 3, '["Uczeń stosuje rozkład trójmianu na czynniki.", "Uczeń rozwiązuje równanie poprzez sprowadzenie do iloczynu.", "Uczeń sprawdza poprawność rozwiązania podstawieniem."]'),

('Równania kwadratowe metodą wyciągania wspólnego czynnika', 'algebra', 'intermediate', 8, 'III.2.26', 'Uczeń rozwiązuje równania kwadratowe przez wyłączenie wspólnego czynnika.', 'Równania kwadratowe - metody rozwiązywania', 20, 3, '["Uczeń wyłącza wspólny czynnik przed nawias.", "Uczeń sprowadza równanie kwadratowe do prostszej postaci.", "Uczeń oblicza rozwiązania dla każdej części równania."]'),

('Równania kwadratowe z deltą dodatnią', 'algebra', 'intermediate', 8, 'III.2.27', 'Uczeń rozwiązuje równania kwadratowe, gdy Δ > 0.', 'Równania kwadratowe - wyróżnik Δ', 25, 4, '["Uczeń oblicza wyróżnik Δ.", "Uczeń stosuje wzory kwadratowe do obliczenia pierwiastków.", "Uczeń interpretuje liczbę rozwiązań."]'),

('Równania kwadratowe z deltą równą zero', 'algebra', 'intermediate', 8, 'III.2.28', 'Uczeń rozwiązuje równania kwadratowe, gdy Δ = 0.', 'Równania kwadratowe - wyróżnik Δ', 20, 3, '["Uczeń oblicza wyróżnik Δ.", "Uczeń stosuje wzór na pierwiastek podwójny.", "Uczeń sprawdza rozwiązanie podstawieniem."]'),

('Równania kwadratowe z deltą ujemną', 'algebra', 'advanced', 8, 'III.2.29', 'Uczeń rozwiązuje równania kwadratowe, gdy Δ < 0, i rozumie brak pierwiastków rzeczywistych.', 'Równania kwadratowe - wyróżnik Δ', 20, 4, '["Uczeń oblicza wyróżnik Δ.", "Uczeń stwierdza brak rozwiązań rzeczywistych.", "Uczeń wskazuje możliwość rozwiązań zespolonych (w rozszerzeniu)."]'),

('Równania kwadratowe - zadania tekstowe', 'algebra', 'advanced', 8, 'III.2.30', 'Uczeń rozwiązuje zadania tekstowe, które prowadzą do równań kwadratowych.', 'Równania kwadratowe - zastosowania', 30, 5, '["Uczeń tłumaczy treść zadania na równanie kwadratowe.", "Uczeń rozwiązuje równanie krok po kroku.", "Uczeń interpretuje wynik w kontekście treści zadania."]'),

('Zadania mieszane - równania liniowe i kwadratowe', 'algebra', 'advanced', 8, 'III.2.31', 'Uczeń rozwiązuje zestawy zadań mieszanych z równań liniowych i kwadratowych.', 'Równania mieszane', 30, 5, '["Uczeń rozpoznaje typ równania.", "Uczeń stosuje właściwą metodę rozwiązywania.", "Uczeń sprawdza poprawność rozwiązania dla różnych typów równań."]'),

-- Część 2: Funkcje liniowe i układy równań (klasa 8)
('Pojęcie funkcji liniowej', 'functions', 'basic', 8, 'III.3.1', 'Uczeń rozpoznaje funkcję liniową w postaci f(x) = ax + b.', 'Funkcja liniowa - definicja', 20, 2, '["Uczeń zna definicję funkcji liniowej.", "Uczeń wskazuje współczynnik kierunkowy i wyraz wolny.", "Uczeń zapisuje funkcję liniową w postaci f(x) = ax + b."]'),

('Wartości funkcji liniowej dla danych argumentów', 'functions', 'basic', 8, 'III.3.2', 'Uczeń oblicza wartości funkcji liniowej dla podanych argumentów.', 'Funkcja liniowa - wartości', 20, 2, '["Uczeń podstawia wartości do wzoru funkcji liniowej.", "Uczeń oblicza wartości liczbowe funkcji.", "Uczeń interpretuje wynik w kontekście zadania."]'),

('Wykres funkcji liniowej - wyznaczanie punktów', 'functions', 'basic', 8, 'III.3.3', 'Uczeń rysuje wykres funkcji liniowej, wyznaczając co najmniej dwa punkty.', 'Funkcja liniowa - wykres', 25, 3, '["Uczeń oblicza wartości funkcji dla dwóch argumentów.", "Uczeń zaznacza punkty w układzie współrzędnych.", "Uczeń rysuje prostą przechodzącą przez te punkty."]'),

('Współczynnik kierunkowy i wyraz wolny', 'functions', 'intermediate', 8, 'III.3.4', 'Uczeń interpretuje współczynnik kierunkowy jako nachylenie prostej, a wyraz wolny jako punkt przecięcia z osią OY.', 'Funkcja liniowa - współczynniki', 25, 3, '["Uczeń zna znaczenie współczynnika kierunkowego a i wyrazu wolnego b.", "Uczeń rozpoznaje rosnący i malejący przebieg funkcji.", "Uczeń określa punkt przecięcia z osią OY."]'),

('Miejsce zerowe funkcji liniowej', 'functions', 'intermediate', 8, 'III.3.5', 'Uczeń oblicza miejsce zerowe funkcji liniowej.', 'Funkcja liniowa - miejsca zerowe', 20, 3, '["Uczeń rozwiązuje równanie f(x) = 0.", "Uczeń interpretuje miejsce zerowe na wykresie.", "Uczeń stosuje miejsce zerowe w zadaniach praktycznych."]'),

('Równanie prostej przechodzącej przez dwa punkty', 'functions', 'intermediate', 8, 'III.3.6', 'Uczeń wyznacza równanie prostej przechodzącej przez dwa dane punkty.', 'Funkcja liniowa - równanie prostej', 30, 4, '["Uczeń oblicza współczynnik kierunkowy a = (y2 - y1) / (x2 - x1).", "Uczeń oblicza wyraz wolny b podstawiając punkt do równania y = ax + b.", "Uczeń zapisuje równanie prostej w postaci kierunkowej."]'),

('Wpływ współczynników a i b na wykres funkcji liniowej', 'functions', 'intermediate', 8, 'III.3.7', 'Uczeń analizuje, jak zmiana a i b wpływa na nachylenie i przesunięcie wykresu funkcji.', 'Funkcja liniowa - własności wykresu', 25, 3, '["Uczeń opisuje efekt zmiany a na nachylenie prostej.", "Uczeń opisuje efekt zmiany b na przesunięcie wykresu względem osi OY.", "Uczeń porównuje wykresy kilku funkcji liniowych."]'),

('Proporcjonalność prosta jako szczególny przypadek funkcji liniowej (b = 0)', 'functions', 'basic', 8, 'III.3.8', 'Uczeń rozpoznaje funkcję y = ax jako model proporcjonalności prostej i interpretuje współczynnik a.', 'Funkcja liniowa - proporcjonalność', 20, 2, '["Uczeń rozpoznaje proporcjonalność prostą w danych tabelarycznych i opisowych.", "Uczeń oblicza współczynnik proporcjonalności.", "Uczeń interpretuje a jako tempo zmiany wielkości."]'),

('Zastosowania funkcji liniowej w zadaniach tekstowych', 'functions', 'intermediate', 8, 'III.3.9', 'Uczeń modeluje sytuacje praktyczne przy pomocy funkcji liniowej.', 'Funkcja liniowa - zastosowania', 30, 4, '["Uczeń zapisuje zależności liniowe między wielkościami.", "Uczeń interpretuje współczynniki w kontekście zadania.", "Uczeń rozwiązuje zadania tekstowe z zastosowaniem funkcji liniowej."]'),

('Układy równań liniowych metodą podstawiania', 'algebra', 'intermediate', 8, 'III.3.10', 'Uczeń rozwiązuje układy dwóch równań liniowych z dwiema niewiadomymi metodą podstawiania.', 'Układy równań liniowych', 30, 4, '["Uczeń przekształca jedno równanie do postaci wyznaczającej jedną niewiadomą.", "Uczeń podstawia wyrażenie do drugiego równania.", "Uczeń rozwiązuje układ i interpretuje rozwiązanie."]'),

('Układy równań liniowych metodą przeciwnych współczynników', 'algebra', 'intermediate', 8, 'III.3.11', 'Uczeń rozwiązuje układy równań liniowych metodą przeciwnych współczynników.', 'Układy równań liniowych', 30, 4, '["Uczeń mnoży równania w układzie, aby uzyskać przeciwne współczynniki.", "Uczeń dodaje równania stronami eliminując jedną niewiadomą.", "Uczeń oblicza drugą niewiadomą i interpretuje rozwiązanie układu."]'),

('Graficzna interpretacja układu równań liniowych', 'algebra', 'intermediate', 8, 'III.3.12', 'Uczeń interpretuje rozwiązania układu równań jako punkt przecięcia prostych oraz rozpoznaje przypadki: jedno rozwiązanie, brak, nieskończenie wiele.', 'Układy równań liniowych - geometria', 25, 3, '["Uczeń rysuje wykresy dwóch funkcji liniowych na jednym układzie współrzędnych.", "Uczeń identyfikuje rodzaj układu na podstawie położenia prostych.", "Uczeń odczytuje rozwiązanie układu z wykresu."]'),

-- Część 3: Geometria płaska (klasy 7-8)
('Rodzaje kątów i ich klasyfikacja', 'geometry', 'basic', 7, 'III.3.1', 'Uczeń rozpoznaje i nazywa rodzaje kątów: ostry, prosty, rozwarty, półpełny, pełny.', 'Kąty', 15, 1, '["Uczeń rozróżnia kąty ostre, proste, rozwarte, półpełne i pełne.", "Uczeń potrafi je narysować i zmierzyć kątomierzem.", "Uczeń stosuje klasyfikację kątów w zadaniach."]'),

('Sumy kątów w trójkącie', 'geometry', 'basic', 7, 'III.3.2', 'Uczeń wie, że suma kątów wewnętrznych trójkąta wynosi 180° i stosuje to w zadaniach.', 'Trójkąty', 20, 2, '["Uczeń zna własność sumy kątów trójkąta.", "Uczeń potrafi obliczyć brakujący kąt.", "Uczeń stosuje własność w zadaniach praktycznych."]'),

('Rodzaje trójkątów', 'geometry', 'basic', 7, 'III.3.3', 'Uczeń klasyfikuje trójkąty ze względu na boki (równoboczny, równoramienny, różnoboczny) i kąty (ostrokątny, prostokątny, rozwartokątny).', 'Trójkąty', 20, 2, '["Uczeń rozpoznaje typy trójkątów.", "Uczeń rysuje trójkąty danego rodzaju.", "Uczeń stosuje klasyfikację w zadaniach."]'),

('Twierdzenie Pitagorasa - wprowadzenie', 'geometry', 'intermediate', 8, 'III.3.4', 'Uczeń rozumie i stosuje twierdzenie Pitagorasa do obliczeń długości boków w trójkątach prostokątnych.', 'Twierdzenie Pitagorasa', 25, 3, '["Uczeń zna wzór a² + b² = c².", "Uczeń oblicza brakujący bok w trójkącie prostokątnym.", "Uczeń stosuje twierdzenie w zadaniach praktycznych."]'),

('Zastosowania twierdzenia Pitagorasa', 'geometry', 'intermediate', 8, 'III.3.5', 'Uczeń stosuje twierdzenie Pitagorasa w zadaniach tekstowych i problemowych.', 'Twierdzenie Pitagorasa', 30, 4, '["Uczeń tłumaczy sytuację praktyczną na trójkąt prostokątny.", "Uczeń stosuje twierdzenie do obliczeń długości.", "Uczeń interpretuje wynik w kontekście zadania."]'),

('Czworokąty - klasyfikacja i własności', 'geometry', 'basic', 7, 'III.3.6', 'Uczeń klasyfikuje czworokąty: kwadrat, prostokąt, romb, równoległobok, trapez i zna ich własności.', 'Czworokąty', 25, 2, '["Uczeń rozpoznaje typy czworokątów.", "Uczeń zna ich własności dotyczące boków i kątów.", "Uczeń stosuje klasyfikację w zadaniach."]'),

('Obwody wielokątów', 'geometry', 'basic', 7, 'III.3.7', 'Uczeń oblicza obwody trójkątów, czworokątów i wielokątów foremnych.', 'Obwody i pola', 20, 2, '["Uczeń zna wzory na obwody podstawowych figur.", "Uczeń wykonuje obliczenia krok po kroku.", "Uczeń stosuje wzory w zadaniach praktycznych."]'),

('Pole prostokąta i kwadratu', 'geometry', 'basic', 7, 'III.3.8', 'Uczeń oblicza pola prostokąta i kwadratu.', 'Obwody i pola', 20, 2, '["Uczeń zna wzory na pole prostokąta i kwadratu.", "Uczeń wykonuje obliczenia praktyczne.", "Uczeń stosuje wzory w zadaniach z życia codziennego."]'),

('Pole równoległoboku i rombu', 'geometry', 'intermediate', 7, 'III.3.9', 'Uczeń oblicza pola równoległoboku i rombu stosując wzory.', 'Obwody i pola', 25, 3, '["Uczeń zna wzory na pole równoległoboku i rombu.", "Uczeń stosuje wysokość w obliczeniach pola.", "Uczeń interpretuje wynik w zadaniach praktycznych."]'),

('Pole trapezu', 'geometry', 'intermediate', 7, 'III.3.10', 'Uczeń oblicza pole trapezu.', 'Obwody i pola', 20, 3, '["Uczeń zna wzór na pole trapezu.", "Uczeń stosuje wzór do obliczeń krok po kroku.", "Uczeń wykorzystuje wynik w zadaniach praktycznych."]'),

('Pole trójkąta - różne wzory', 'geometry', 'intermediate', 7, 'III.3.11', 'Uczeń oblicza pole trójkąta różnymi metodami (wzór ½ah, wzór Herona).', 'Obwody i pola', 30, 3, '["Uczeń zna wzór na pole trójkąta ½ah.", "Uczeń stosuje wzór Herona.", "Uczeń interpretuje wynik w zadaniach praktycznych."]'),

('Koła i okręgi - wprowadzenie', 'geometry', 'basic', 7, 'III.3.12', 'Uczeń zna pojęcia koła, okręgu, promienia, średnicy i obwodu.', 'Koło i okrąg', 20, 2, '["Uczeń rozpoznaje elementy koła i okręgu.", "Uczeń zna wzór na obwód okręgu.", "Uczeń stosuje pojęcia w zadaniach praktycznych."]'),

('Pole koła', 'geometry', 'intermediate', 7, 'III.3.13', 'Uczeń oblicza pole koła i wycinków kołowych.', 'Koło i okrąg', 25, 3, '["Uczeń zna wzór na pole koła.", "Uczeń stosuje wzór w praktycznych obliczeniach.", "Uczeń oblicza pole wycinka kołowego."]'),

('Zadania problemowe z geometrii płaskiej', 'geometry', 'advanced', 8, 'III.3.14', 'Uczeń rozwiązuje zadania złożone wymagające łączenia kilku wzorów geometrycznych.', 'Geometria płaska - zadania problemowe', 35, 5, '["Uczeń łączy różne własności figur w jednym zadaniu.", "Uczeń wybiera właściwą strategię rozwiązania.", "Uczeń interpretuje wyniki w kontekście zadania praktycznego."]');