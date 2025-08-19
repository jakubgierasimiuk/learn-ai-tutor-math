-- Populate content_data for existing skills with proper educational content
UPDATE skills 
SET content_data = jsonb_build_object(
  'theory', ARRAY[
    'Działania na liczbach rzeczywistych obejmują dodawanie, odejmowanie, mnożenie i dzielenie.',
    'Liczby rzeczywiste składają się z liczb wymiernych i niewymiernych.',
    'Działania na liczbach rzeczywistych mają określony porządek wykonywania.',
    'Właściwości przemienności, łączności i rozdzielności ułatwiają obliczenia.',
    'Liczby przeciwne i odwrotne mają specjalne zastosowania.'
  ],
  'examples', ARRAY[
    'Przykład 1: $2 + 3 \cdot 4 = 2 + 12 = 14$ (najpierw mnożenie)',
    'Przykład 2: $(5 - 2) \cdot 3 = 3 \cdot 3 = 9$ (najpierw nawiasy)',
    'Przykład 3: $\frac{1}{2} + \frac{1}{3} = \frac{3}{6} + \frac{2}{6} = \frac{5}{6}$'
  ],
  'practiceExercises', ARRAY[
    jsonb_build_object('difficulty', 2, 'task', 'Oblicz: $7 + 3 \cdot 2$', 'answer', '13'),
    jsonb_build_object('difficulty', 3, 'task', 'Oblicz: $(8 - 3) \cdot 2 + 1$', 'answer', '11'), 
    jsonb_build_object('difficulty', 4, 'task', 'Oblicz: $\frac{2}{3} + \frac{1}{4}$', 'answer', '$\frac{11}{12}$'),
    jsonb_build_object('difficulty', 5, 'task', 'Oblicz: $2^3 - 3 \cdot 2 + 1$', 'answer', '3')
  ]
)
WHERE name = 'Działania na liczbach rzeczywistych';

UPDATE skills 
SET content_data = jsonb_build_object(
  'theory', ARRAY[
    'Równanie liniowe ma postać $ax + b = 0$, gdzie $a \neq 0$.',
    'Celem jest znalezienie wartości $x$, która spełnia równanie.',
    'Używamy przekształceń równoważnych: dodawanie, odejmowanie, mnożenie, dzielenie.',
    'Izolujemy niewiadomą przenosząc wszystkie składniki z $x$ na jedną stronę.',
    'Sprawdzenie: podstawiamy rozwiązanie do pierwotnego równania.'
  ],
  'examples', ARRAY[
    'Przykład 1: $2x + 3 = 11$ → $2x = 8$ → $x = 4$',
    'Przykład 2: $5x - 7 = 2x + 8$ → $3x = 15$ → $x = 5$',
    'Przykład 3: $\frac{x}{2} + 1 = 4$ → $\frac{x}{2} = 3$ → $x = 6$'
  ],
  'practiceExercises', ARRAY[
    jsonb_build_object('difficulty', 2, 'task', 'Rozwiąż: $x + 5 = 12$', 'answer', '$x = 7$'),
    jsonb_build_object('difficulty', 3, 'task', 'Rozwiąż: $3x - 4 = 8$', 'answer', '$x = 4$'),
    jsonb_build_object('difficulty', 4, 'task', 'Rozwiąż: $2x + 3 = x + 9$', 'answer', '$x = 6$'),
    jsonb_build_object('difficulty', 5, 'task', 'Rozwiąż: $\frac{2x-1}{3} = 5$', 'answer', '$x = 8$')
  ]
)
WHERE name = 'Rozwiązywanie równań liniowych';

UPDATE skills 
SET content_data = jsonb_build_object(
  'theory', ARRAY[
    'Funkcja liniowa ma postać $f(x) = ax + b$, gdzie $a \neq 0$.',
    'Współczynnik $a$ to współczynnik kierunkowy (nachylenie).',
    'Współczynnik $b$ to wyraz wolny (przecięcie z osią Y).',
    'Wykres funkcji liniowej to linia prosta.',
    'Funkcja rosnąca gdy $a > 0$, malejąca gdy $a < 0$.'
  ],
  'examples', ARRAY[
    'Przykład 1: $f(x) = 2x + 1$ - funkcja rosnąca, przecięcie z osią Y w punkcie $(0,1)$',
    'Przykład 2: $f(x) = -x + 3$ - funkcja malejąca, przecięcie z osią Y w punkcie $(0,3)$',
    'Przykład 3: $f(x) = \frac{1}{2}x - 2$ - funkcja rosnąca o małym nachyleniu'
  ],
  'practiceExercises', ARRAY[
    jsonb_build_object('difficulty', 2, 'task', 'Podaj współczynnik kierunkowy funkcji $f(x) = 3x - 1$', 'answer', '$a = 3$'),
    jsonb_build_object('difficulty', 3, 'task', 'Znajdź miejsce zerowe funkcji $f(x) = 2x - 6$', 'answer', '$x = 3$'),
    jsonb_build_object('difficulty', 4, 'task', 'Napisz wzór funkcji przechodzącej przez punkty $(0,2)$ i $(1,5)$', 'answer', '$f(x) = 3x + 2$'),
    jsonb_build_object('difficulty', 5, 'task', 'Znajdź punkt przecięcia funkcji $f(x) = x + 1$ i $g(x) = 2x - 1$', 'answer', '$(2,3)$')
  ]
)
WHERE name = 'Funkcja liniowa';