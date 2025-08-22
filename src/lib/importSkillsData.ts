import { batchImportSkillContent } from './skillContentImporter';

// Import the provided skills data
export const importNewSkillsData = async () => {
  const skillsData = {
    "contentDatabase": [
      {
        "skillId": "383a996f-6f04-406f-9b86-e9fe2fc93879",
        "skillName": "Nierówności kwadratowe",
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
            "introduction": "Nierówność kwadratowa dotyczy wyrażenia $ax^2+bx+c$ i polega na wyznaczeniu zbioru $x$, dla których wartości wielomianu są $<,\\le,>,\\ge$ od zera. Kluczowy jest znak współczynnika $a$ (kierunek ramion paraboli) oraz miejsca zerowe funkcji kwadratowej. Standardowa procedura: (1) oblicz deltę lub rozłóż na czynniki, (2) wyznacz miejsca zerowe (jeśli istnieją), (3) narysuj szkic paraboli lub użyj tabeli znaków, (4) odczytaj przedziały, na których wyrażenie ma żądany znak, (5) uwzględnij równość dla symboli $\\le,\\ge$. Dla $a>0$ wartości między pierwiastkami są ujemne, a poza nimi dodatnie; dla $a<0$ odwrotnie. Jeśli $\\Delta<0$, znak wielomianu jest stały (zależny od $a$). Zapis rozwiązania podajemy w notacji przedziałowej i weryfikujemy punktami testowymi.",
            "keyConceptsLaTex": ["$\\\\Delta=b^2-4ac$", "$x=\\\\tfrac{-b\\\\pm\\\\sqrt{\\\\Delta}}{2a}$", "$a>0$", "$a<0$", "$(x-x_1)(x-x_2)$"],
            "timeEstimate": 180
          },
          "examples": [
            {
              "title": "Klasyczna nierówność bez równości",
              "problem": "Rozwiąż $x^2-9<0$.",
              "solution": "Miejsca zerowe $x=\\pm3$. Dla $a>0$ wartości ujemne między zerami: $(-3,3)$.",
              "explanation": "Parabola w górę: ujemna „w dołku" między pierwiastkami.",
              "timeEstimate": 300
            },
            {
              "title": "Nierówność z ramionami w dół",
              "problem": "Rozwiąż $-x^2+4\\ge0$.",
              "solution": "Równoważnie $x^2\\le4$. Zera: $\\pm2$. Ramiona w dół $\\Rightarrow$ $[-2,2]$.",
              "explanation": "Dla $a<0$ wartości dodatnie/zerowe wewnątrz przedziału między zerami.",
              "timeEstimate": 300
            },
            {
              "title": "Iloczyn czynników",
              "problem": "Rozwiąż $(x-1)(x+2)>0$.",
              "solution": "Zera: $-2,1$. Iloczyn dodatni poza przedziałem: $(-\\infty,-2)\\cup(1,\\infty)$.",
              "explanation": "Tabela znaków dla dwóch czynników: zgodne znaki poza zerami.",
              "timeEstimate": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Rozwiąż $x^2-1\\le0$.",
              "expectedAnswer": "[-1,1]",
              "hints": ["Różnica kwadratów", "Parabola $a>0$ – wartości $\\le0$ między zerami"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $x^2+x-6\\ge0$.",
              "expectedAnswer": "(-\\infty,-3] \\cup [2,\\infty)",
              "hints": ["Rozłóż na czynniki", "Zewnętrzne przedziały dla $a>0$"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $-(x-3)^2<0$.",
              "expectedAnswer": "x\\ne3",
              "hints": ["$(x-3)^2\\ge0$", "Iloczyn z minusem $\\le0$; brak $<$ w wierzchołku"],
              "timeEstimate": 240
            },
            {
              "type": "advanced",
              "problem": "Dla $ax^2+1>0$ ($a>0$) podaj zbiór rozwiązań.",
              "expectedAnswer": "R",
              "hints": ["$ax^2\\ge0$", "Suma $\\ge1$ dla każdego $x$"],
              "timeEstimate": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Mylenie kierunku znaków dla $a<0$", "Brak włączenia pierwiastków przy $\\le,\\ge$", "Błędne odczyty z tabeli znaków"],
          "teachingTips": ["Zawsze szkicuj parabolę i zaznacz pierwiastki", "Sprawdzaj po jednym punkcie z każdego przedziału"],
          "prerequisites": ["Równania kwadratowe", "Wyrażenia algebraiczne i czynniki"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Założenie, że wynik zawsze jest przedziałem między zerami",
            "intervention": "Konfrontacja przypadków $a<0$ i $\\Delta<0$ na wykresach"
          }
        ],
        "realWorldApplications": ["Zakresy dopuszczalne parametrów modeli", "Warunki stabilności w fizyce i ekonomii"],
        "assessmentRubric": {
          "mastery": "Sprawnie buduje tabelę znaków i poprawnie zapisuje przedziały.",
          "proficient": "Drobne błędy w włączaniu końców, poprawna metoda.",
          "developing": "Myli kierunki i źle odczytuje znaki wielomianu."
        }
      },
      {
        "skillId": "6719fb54-526e-47de-90bf-3d14958a0347",
        "skillName": "Nierówności kwadratowe",
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
            "introduction": "W rozszerzonym ujęciu nierówności kwadratowych analizujemy nie tylko proste postacie, lecz także przypadki z parametrem, podwójnymi pierwiastkami oraz sprowadzaniem do kwadratu pełnego. Procedura ogólna: normalizujemy do $ax^2+bx+c\\ \\square\\ 0$ ($a\\ne0$), obliczamy $\\Delta$ lub przechodzimy do postaci kanonicznej $a(x-p)^2+q$, a następnie wyciągamy wnioski o znaku. Dla warunków „dla każdego $x$" lub „dla żadnego $x$" wykorzystujemy kryteria $a>0,\\ q>0$ (z kanonicznej) lub $\\Delta<0$ i znak $a$. W tabelach znaków zwracamy uwagę na krotność pierwiastków: przy krotności parzystej znak się nie zmienia. W zadaniach parametrycznych porządkujemy wnioski: najpierw $\\Delta(m)$, potem znaki i przypadki brzegowe.",
            "keyConceptsLaTex": ["$\\Delta=b^2-4ac$", "$x=\\tfrac{-b\\pm\\sqrt{\\Delta}}{2a}$", "$a(x-p)^2+q$", "$\\Delta<0$", "$krotność$"],
            "timeEstimate": 180
          },
          "examples": [
            {
              "title": "Nierówność z rozkładem",
              "problem": "Rozwiąż $2x^2-5x-3>0$.",
              "solution": "Pierwiastki $x=-\\tfrac{1}{2},\\ 3$. Dla $a>0$: rozwiązanie $(-\\infty,-\\tfrac{1}{2})\\cup(3,\\infty)$.",
              "explanation": "Po rozkładzie lub delcie odczytujemy znaki poza/między pierwiastkami.",
              "timeEstimate": 300
            },
            {
              "title": "Postać kanoniczna",
              "problem": "Rozwiąż $(x+1)^2\\le4$.",
              "solution": "$-2\\le x+1\\le2\\Rightarrow x\\in[-3,1]$.",
              "explanation": "Używamy definicji kwadratu i przekształcamy podwójną nierówność.",
              "timeEstimate": 300
            },
            {
              "title": "Warunki na parametr (dla wszystkich $x$)",
              "problem": "Dla jakich $m$ $x^2+(m-2)x+m>0$ dla wszystkich $x$?",
              "solution": "Warunek $a>0$ i $\\Delta<0$. $\\Delta=m^2-8m+4<0\\Rightarrow m\\in(4-2\\sqrt{3},\\ 4+2\\sqrt{3})$.",
              "explanation": "Brak pierwiastków i ramiona w górę gwarantują $>0$ zawsze.",
              "timeEstimate": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Rozwiąż $(x-4)^2\\ge0$.",
              "expectedAnswer": "R",
              "hints": ["Kwadrat $\\ge0$", "Równość dla $x=4$"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $-x^2+2x+3<0$.",
              "expectedAnswer": "(-\\infty,-1)\\cup(3,\\infty)",
              "hints": ["Przenieś na lewo", "Ramiona w dół: ujemne poza przedziałem między zerami"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Wyznacz $m$, aby $x^2+mx+4\\le0$ miało rozwiązania.",
              "expectedAnswer": "m\\in[-4,4]",
              "hints": ["Warunek $\\Delta\\ge0$ i $a>0$", "Zbadaj $m^2-16\\ge0$ — uwaga na $\\le0$"],
              "timeEstimate": 240
            },
            {
              "type": "advanced",
              "problem": "Rozwiąż $(x+2)^2(x-1)\\ge0$.",
              "expectedAnswer": "(-\\infty,-2]\\cup[1,\\infty)",
              "hints": ["Zera: $-2$ (krotność 2), $1$", "Znak nie zmienia się przy krotności parzystej"],
              "timeEstimate": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Nieuwzględnianie krotności pierwiastków", "Błędne wnioski o „dla wszystkich x" bez analizy delty", "Złe odczyty z postaci kanonicznej"],
          "teachingTips": ["Zmieniaj metody: delta/kanoniczna/tabela znaków", "W parametrycznych rysuj wykres $\\Delta(m)$"],
          "prerequisites": ["Równania kwadratowe i postacie", "Tablice znaków, analiza przedziałowa"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Zakładanie zmiany znaku na każdym pierwiastku",
            "intervention": "Ćwiczenia z krotnością parzystą i punkt testowy na przedziale"
          }
        ],
        "realWorldApplications": ["Kryteria dodatniości/ujemności energii potencjalnej", "Ograniczenia parametrów w modelach danych"],
        "assessmentRubric": {
          "mastery": "Sprawnie dobiera metodę, poprawnie wnioskuje o znakach i parametrach.",
          "proficient": "Metoda poprawna, drobne luki w ujęciu brzegów i krotności.",
          "developing": "Niespójne wnioski i błędy w analizie parametrów."
        }
      },
      {
        "skillId": "182b2f32-2c43-4681-86cf-af98c6cbadbf",
        "skillName": "Planimetria – wielokąty i okręgi",
        "class_level": 2,
        "department": "geometria",
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
            "introduction": "Planimetria bada własności figur płaskich: wielokątów i okręgów. Suma kątów wewnętrznych n-kąta wynosi $(n-2)\\cdot180^\\circ$, a w n-kącie foremnym każdy kąt ma tę samą miarę. Dla okręgu kluczowe są zależności między kątem środkowym i wpisanym (kąt wpisany oparty na tym samym łuku ma połowę miary), styczna jest prostopadła do promienia w punkcie styczności, a twierdzenie o potędze punktu łączy długości cięciw i stycznych. Obszary: pole trójkąta $S=\\tfrac12ab\\sin\\gamma$, koła $S=\\pi r^2$, długość okręgu $2\\pi r$. W zadaniach łączymy te fakty z podobieństwem trójkątów i własnościami kątów przyległych oraz naprzemianległych, budując krótkie łańcuchy wnioskowań geometrycznych.",
            "keyConceptsLaTex": ["$\\sum\\angle=(n-2)\\cdot180^\\circ$", "$S=\\tfrac12ab\\sin\\gamma$", "$S=\\pi r^2$", "$l=2\\pi r$", "$PT^2=PA\\cdot PB$"],
            "timeEstimate": 180
          },
          "examples": [
            {
              "title": "Suma kątów i kąt w foremnym",
              "problem": "Oblicz miarę kąta wewnętrznego w siedmiokącie foremnym.",
              "solution": "Suma kątów $(7-2)\\cdot180^\\circ=900^\\circ$. Jeden kąt: $900^\\circ/7\\approx128.57^\\circ$.",
              "explanation": "Dzielimy sumę kątów przez liczbę kątów w wielokącie foremnym.",
              "timeEstimate": 300
            },
            {
              "title": "Kąt wpisany a środkowy",
              "problem": "Kąt środkowy ma $80^\\circ$. Ile ma kąt wpisany oparty na tym łuku?",
              "solution": "$40^\\circ$.",
              "explanation": "Kąt wpisany oparty na tym samym łuku ma połowę miary kąta środkowego.",
              "timeEstimate": 240
            },
            {
              "title": "Potęga punktu – styczna i sieczna",
              "problem": "Niech $PT$ to styczna, a $PA,PB$ – punkty przecięcia siecznej z okręgiem. Jeśli $PA=4$, $PB=9$, oblicz $PT$.",
              "solution": "Z twierdzenia: $PT^2=PA\\cdot PB=36\\Rightarrow PT=6$.",
              "explanation": "Potęga punktu wiąże długość stycznej z iloczynem odcinków siecznej.",
              "timeEstimate": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Podaj sumę kątów wewnętrznych pięciokąta.",
              "expectedAnswer": "540°",
              "hints": ["Użyj $(n-2)\\cdot180^\\circ$", "Dla $n=5$"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Dla trójkąta z bokami $a,b$ i kątem $\\gamma$ oblicz pole.",
              "expectedAnswer": "$\\tfrac12ab\\sin\\gamma$",
              "hints": ["Wzór Herona niepotrzebny", "Użyj wzoru z sinusem"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Łuk odpowiada kątowi środkowemu $120^\\circ$. Ile ma kąt wpisany?",
              "expectedAnswer": "60°",
              "hints": ["Połowa kąta środkowego", "Sprawdź definicję"],
              "timeEstimate": 240
            },
            {
              "type": "advanced",
              "problem": "W okręgu $PA\\cdot PB=20$. Oblicz długość stycznej $PT$.",
              "expectedAnswer": "$\\sqrt{20}$",
              "hints": ["$PT^2=PA\\cdot PB$", "Weź dodatni pierwiastek"],
              "timeEstimate": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Mylenie kąta wpisanego i środkowego", "Błędne zastosowanie potęgi punktu", "Pomijanie jednostek i stopni/radianów"],
          "teachingTips": ["Szkicuj wszystkie konstrukcje", "Używaj kolorów dla łuków i kątów opartych na tym samym łuku"],
          "prerequisites": ["Podstawy geometrii euklidesowej", "Trygonometria w trójkącie"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Zakładanie równości pól bez podobieństwa figur",
            "intervention": "Wprowadź podobieństwo i skalowanie pól przez $k^2$"
          }
        ],
        "realWorldApplications": ["Projektowanie konstrukcji i dachów", "Nawigacja i triangulacja"],
        "assessmentRubric": {
          "mastery": "Łączy twierdzenia o kątach i długościach, sprawnie liczy pola i obwody.",
          "proficient": "Drobne błędy rachunkowe, właściwy tok rozumowania.",
          "developing": "Niepewne rozróżnienie zależności kątów i własności stycznych."
        }
      },
      {
        "skillId": "ad44342d-dd96-47d3-9992-a627dc6e9ee9",
        "skillName": "Pochodna funkcji",
        "class_level": 3,
        "department": "analiza_matematyczna",
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
            "introduction": "Pochodna $f'(x)$ mierzy chwilową szybkość zmian funkcji i geometrycznie jest nachyleniem stycznej do wykresu. Definicja graniczna wykorzystuje iloraz różnicowy. Reguły rachunkowe: liniowość, iloczyn i iloraz, łańcuchowa, a także pochodne funkcji elementarnych (potęgowych, wykładniczych, trygonometrycznych i logarytmów). Związek z monotonicznością: $f'>0$ na przedziale oznacza, że funkcja rośnie; miejsca zerowe pochodnej to kandydaci na ekstrema, które klasyfikujemy testem znaku $f'$ lub drugiej pochodnej. W zastosowaniach wyznaczamy styczne, szybkości, przyspieszenia, optymalizujemy wartości (minimum kosztu, maksimum zysku) i analizujemy kształt wykresu: przedziały wzrostu/spadku oraz punkty przegięcia.",
            "keyConceptsLaTex": ["$f'(x)=\\lim_{h\\to0}\\tfrac{f(x+h)-f(x)}{h}$", "$(fg)'=f'g+fg'$", "$(f/g)'=\\tfrac{f'g-fg'}{g^2}$", "$(f\\circ g)'=f'(g)\\cdot g'$", "$\\tfrac{d}{dx}x^n=nx^{n-1}$"],
            "timeEstimate": 180
          },
          "examples": [
            {
              "title": "Pochodna wielomianu",
              "problem": "Oblicz $f'(x)$ dla $f(x)=3x^2-2x+1$.",
              "solution": "Z reguły potęgowej: $f'(x)=6x-2$.",
              "explanation": "Różniczkujemy składnikowo, stała znika.",
              "timeEstimate": 300
            },
            {
              "title": "Równanie stycznej",
              "problem": "Wyznacz styczną do $y=x^2$ w punkcie $x_0=1$.",
              "solution": "$f'(x)=2x\\Rightarrow f'(1)=2$. Równanie: $y=f(1)+2(x-1)=1+2(x-1)=2x-1$.",
              "explanation": "Styczna: $y=f(x_0)+f'(x_0)(x-x_0)$.",
              "timeEstimate": 300
            },
            {
              "title": "Ekstremum lokalne",
              "problem": "Dla $f(x)=-x^2+4x+1$ wyznacz maksimum.",
              "solution": "$f'(x)=-2x+4=0\\Rightarrow x=2$. $f(2)=5$ – maksimum lokalne.",
              "explanation": "Wklęsła parabola ($f''<0$) ma maksimum w wierzchołku.",
              "timeEstimate": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Policz $\\tfrac{d}{dx}(x^3)$.",
              "expectedAnswer": "3x^2",
              "hints": ["Reguła potęgowa", "Mnożnik równy wykładnikowi"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Policz $\\tfrac{d}{dx}(e^x\\cdot x)$.",
              "expectedAnswer": "e^x(x+1)",
              "hints": ["Reguła iloczynu", "Pochodna $e^x=e^x$"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Określ monotoniczność $f(x)=x^3-3x$.",
              "expectedAnswer": "Rośnie dla $x<-1$ i $x>1$, maleje dla $(-1,1)$",
              "hints": ["$f'(x)=3x^2-3$", "Zbadaj znak pochodnej"],
              "timeEstimate": 240
            },
            {
              "type": "advanced",
              "problem": "Zastosuj regułę łańcuchową do $\\sin(2x)$.",
              "expectedAnswer": "2\\cos(2x)",
              "hints": ["Zewnętrzna: $\\sin u\\to\\cos u$", "Wewnętrzna: $(2x)'=2$"],
              "timeEstimate": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Pominięcie reguły iloczynu/ilorazu", "Błędy znaków w łańcuchowej", "Mylenie kryteriów ekstremów"],
          "teachingTips": ["Zawsze wypisz plan: reguła i funkcje składowe", "Sprawdzaj wynik na wykresie/intuicji"],
          "prerequisites": ["Granica funkcji", "Algebra funkcji elementarnych"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Sprowadzanie każdego problemu do delty zamiast reguł",
            "intervention": "Porównaj czas i prostotę metod na przykładach równoległych"
          }
        ],
        "realWorldApplications": ["Maksymalizacja zysku/minimalizacja kosztu", "Prędkość i przyspieszenie w ruchu"],
        "assessmentRubric": {
          "mastery": "Poprawnie dobiera reguły i interpretuje wynik geometrycznie.",
          "proficient": "Nieliczne błędy rachunkowe, właściwy tok.",
          "developing": "Niepoprawne zastosowanie reguł i wniosków o monotoniczności."
        }
      },
      {
        "skillId": "c7a89cb6-c3b0-4eb5-bc02-3b7b30ca629a",
        "skillName": "Prawdopodobieństwo warunkowe",
        "class_level": 1,
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
            "introduction": "Prawdopodobieństwo warunkowe $P(A\\mid B)$ opisuje szansę zdarzenia $A$ przy założeniu, że zaszło $B$ (o dodatnim prawdopodobieństwie). Definiujemy je jako iloraz $P(A\\cap B)$ do $P(B)$. Z niego wynika wzór na iloczyn: $P(A\\cap B)=P(A\\mid B)P(B)$ oraz prawo całkowitego prawdopodobieństwa, gdy $B_i$ tworzą rozbicie przestrzeni zdarzeń. Twierdzenie Bayesa pozwala odwracać warunek i aktualizować przekonania na podstawie danych: $P(B_j\\mid A)=\\tfrac{P(A\\mid B_j)P(B_j)}{\\sum_i P(A\\mid B_i)P(B_i)}$. Niezależność zdarzeń oznacza, że $P(A\\mid B)=P(A)$ i $P(A\\cap B)=P(A)P(B)$. W praktyce korzystamy z drzew prawdopodobieństw, tabel kontyngencji i schematów losowań bez zwracania/zwracaniem.",
            "keyConceptsLaTex": ["$P(A\\mid B)=\\tfrac{P(A\\cap B)}{P(B)}$", "$P(A\\cap B)=P(A\\mid B)P(B)$", "$\\sum P=1$", "$P(B_j\\mid A)$", "$A\\perp B$"],
            "timeEstimate": 180
          },
          "examples": [
            {
              "title": "Urna z kulami",
              "problem": "W urnie są 3 białe i 2 czarne kule. Losujemy bez zwrotu dwie. Oblicz $P(\\text{druga biała}\\mid \\text{pierwsza biała})$.",
              "solution": "Po białej zostaje 2/4 białych: $P=\\tfrac{2}{4}=\\tfrac{1}{2}$.",
              "explanation": "Warunek redukuje przestrzeń po pierwszym losowaniu.",
              "timeEstimate": 300
            },
            {
              "title": "Prawo całkowitego prawdopodobieństwa",
              "problem": "Masz dwie skrzynki: A (60% prób) i B (40%). Trafność w A to 90%, w B 70%. Jakie jest $P(\\text{trafienie})$?",
              "solution": "$0.6\\cdot0.9+0.4\\cdot0.7=0.82$.",
              "explanation": "Sumujemy po rozbiciu na skrzynki z wagami częstości.",
              "timeEstimate": 300
            },
            {
              "title": "Bayes – odwracanie warunku",
              "problem": "Zadanie jak wyżej. Jakie $P(\\text{A}\\mid \\text{trafienie})$?",
              "solution": "$\\tfrac{0.9\\cdot0.6}{0.82}\\approx0.6585$.",
              "explanation": "Zastosowano wzór Bayesa z mianownikiem z poprzedniego przykładu.",
              "timeEstimate": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Rzut monetą, potem kostką. Oblicz $P(\\text{parzysta}\\mid \\text{orzeł})$.",
              "expectedAnswer": "1/2",
              "hints": ["Niezależność", "Warunek nie zmienia szans parzystej"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "W urnie 4W,1C. Bez zwrotu. $P(\\text{druga C}\\mid \\text{pierwsza C})$?",
              "expectedAnswer": "0",
              "hints": ["Po czarnej brak czarnych", "Dzielenie przez liczbę pozostałych kul"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Dwie maszyny: M1 (0.7 produkcji, 2% wad), M2 (0.3, 5%). $P(\\text{M2}\\mid \\text{wada})$?",
              "expectedAnswer": "0.3\\cdot0.05/(0.7\\cdot0.02+0.3\\cdot0.05)",
              "hints": ["Zastosuj Bayesa", "Najpierw $P(\\text{wada})$"],
              "timeEstimate": 240
            },
            {
              "type": "advanced",
              "problem": "Zdarzenia $A,B$ niezależne. Pokaż, że $P(A\\mid B)=P(A)$.",
              "expectedAnswer": "Z definicji niezależności: $P(A\\cap B)=P(A)P(B)$",
              "hints": ["Wstaw do definicji $P(A\\mid B)$", "Skróć przez $P(B)$"],
              "timeEstimate": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Mylone $P(A\\mid B)$ z $P(B\\mid A)$", "Niedomknięta suma do 1 w prawie całkowitym", "Pominięcie warunku dodatniego $P(B)$"],
          "teachingTips": ["Rysuj drzewa i zaznaczaj warunki na gałęziach", "Ćwicz Bayesa na prostych, liczbowych przykładach"],
          "prerequisites": ["Kombinatoryka podstawowa", "Definicja prawdopodobieństwa klasycznego"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Błędna intuicja odwrotności warunków ($A|B$ vs $B|A$)",
            "intervention": "Kontrprzykład liczbowy i zapis tablicy $2\\times2$"
          }
        ],
        "realWorldApplications": ["Diagnoza medyczna (testy, czułość/swoistość)", "Filtrowanie sygnałów i klasyfikacja"],
        "assessmentRubric": {
          "mastery": "Sprawnie stosuje definicje, prawo całkowite i Bayesa.",
          "proficient": "Poprawne rachunki, okazjonalne potknięcia w notacji.",
          "developing": "Mylenie warunków i brak kontroli mianownika."
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
            "introduction": "Wielomiany rozwiązujemy przez rozkład na czynniki (wyłączanie, wzory skróconego mnożenia, schemat Hornera, pierwiastki wymierne) lub podstawienia (np. $t=x^2$). Nierówności wielomianowe badamy metodą tabeli znaków: zaznaczamy miejsca zerowe wraz z krotnościami i ustalamy znak na przedziałach. Krotność parzysta nie zmienia znaku, nieparzysta zmienia. Przy równaniach warto sprawdzać „trywialne" czynniki, np. wspólny $x$. W zadaniach parametrycznych opisujemy warunki na pierwiastki (liczba, krotność, położenie) poprzez deltę i znaki. Zawsze kontrolujemy dziedzinę (np. gdy równanie pochodzi z przekształcenia wyrażenia wymiernego) i weryfikujemy rozwiązania podstawieniem.",
            "keyConceptsLaTex": ["$P(x)=(x-a)^kQ(x)$", "$\\text{Horner}$", "$x^4\\to t=x^2$", "$\\operatorname{sgn}P$", "$k\\,$ parz./nieparz."],
            "timeEstimate": 180
          },
          "examples": [
            {
              "title": "Krotności i tabela znaków",
              "problem": "Rozwiąż $(x-2)(x+1)^2\\ge0$.",
              "solution": "Zera: $x=-1$ (krotność 2), $x=2$. Znak dodatni na $(-\\infty,-1]\\cup[2,\\infty)$.",
              "explanation": "Na zerze podwójnym znak się nie zmienia, na prostym zmienia.",
              "timeEstimate": 300
            },
            {
              "title": "Równanie sześcienne przez rozkład",
              "problem": "Rozwiąż $x^3-4x=0$.",
              "solution": "Wyłącz $x$: $x(x-2)(x+2)=0$. Rozwiązania: $x\\in\\{-2,0,2\\}$.",
              "explanation": "Wyłączenie czynnika upraszcza stopień wielomianu.",
              "timeEstimate": 300
            },
            {
              "title": "Substytucja $t=x^2$",
              "problem": "Rozwiąż $x^4-5x^2+4>0$.",
              "solution": "Weź $t=x^2$: $(t-1)(t-4)>0\\Rightarrow t\\in(-\\infty,1)\\cup(4,\\infty)$. Zatem $x\\in(-\\infty,-1)\\cup(1,2)\\cup(-2,-1)\\cup(2,\\infty)$.",
              "explanation": "Po podstawieniu badamy znak iloczynu liniowych czynników w $t\\ge0$.",
              "timeEstimate": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Rozwiąż $(x-3)(x+3)\\le0$.",
              "expectedAnswer": "[-3,3]",
              "hints": ["Zera $\\pm3$", "Dla iloczynu $\\le0$ wybierz wnętrze"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $x^3-1=0$ w $\\mathbb{R}$.",
              "expectedAnswer": "x=1",
              "hints": ["Różnica sześcianów", "Pozostałe pierwiastki zespolone"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $x^4-6x^2+9=0$.",
              "expectedAnswer": "x=\\pm3",
              "hints": ["$t=x^2$", "Równanie kwadratowe w $t$"],
              "timeEstimate": 240
            },
            {
              "type": "advanced",
              "problem": "Rozwiąż $x(x-1)^2(x+2)<0$.",
              "expectedAnswer": "(-\\infty,-2)\\cup(0,1)",
              "hints": ["Krotności: 1,2,1", "Znak zmienia się na nieparzystych krotnościach"],
              "timeEstimate": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Ignorowanie krotności w tabeli znaków", "Nieuzasadnione skracanie przez $x$ bez warunku", "Brak kontroli dziedziny po przekształceniach"],
          "teachingTips": ["Zmieniaj techniki: Horner, wzory, substytucje", "Sprawdzaj punkty testowe na przedziałach"],
          "prerequisites": ["Wzory skróconego mnożenia", "Równania kwadratowe i tabela znaków"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Założenie, że znak zawsze dodatni poza skrajnymi zerami",
            "intervention": "Analiza przykładu z $a<0$ i krotnościami parzystymi"
          }
        ],
        "realWorldApplications": ["Analiza stabilności wielomianów charakterystycznych", "Zakresy działania modeli nieliniowych"],
        "assessmentRubric": {
          "mastery": "Sprawnie rozkłada, analizuje krotności i buduje tabelę znaków.",
          "proficient": "Drobne nieścisłości w znakach, właściwa metoda.",
          "developing": "Błędne wnioski o znakach i nieuwzględnianie krotności."
        }
      },
      {
        "skillId": "cafe8623-b48e-4298-81b8-306066247b31",
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
            "introduction": "Wartość bezwzględna $|u|$ to odległość od zera, z definicją przypadkową: $|u|=u$ dla $u\\ge0$ oraz $|u|=-u$ dla $u<0$. Równania i nierówności z modułami rozbijamy na przypadki wyznaczane przez znaki wyrażeń pod kreskami. Alternatywnie interpretujemy $|x-a|$ jako odległość od punktu $a$ na osi: $|x-a|<r$ to przedział $(a-r,a+r)$, a $|x-a|\\ge r$ to dopełnienie $(-\\infty,a-r]\\cup[a+r,\\infty)$. Dla sum modułów analizujemy odcinki wyznaczone przez punkty krytyczne i stosujemy definiowanie kawałkami. Równania $|u|=k$ ($k\\ge0$) dają dwa symetryczne rozwiązania $u=\\pm k$. Pamiętaj o dziedzinie przy przekształceniach (np. gdy moduł stoi w mianowniku) i o konieczności sprawdzania rozwiązań w założonych przypadkach.",
            "keyConceptsLaTex": ["$|u|=u\\ (u\\ge0)$", "$|u|=-u\\ (u<0)$", "$|x-a|<r$", "$|x-a|\\ge r$", "$|u|=k\\Rightarrow u=\\pm k$"],
            "timeEstimate": 180
          },
          "examples": [
            {
              "title": "Klasyczne równanie z modułem",
              "problem": "Rozwiąż $|x-3|=5$.",
              "solution": "Przypadki: $x-3=5\\Rightarrow x=8$ lub $x-3=-5\\Rightarrow x=-2$.",
              "explanation": "Dwa punkty w odległości 5 od 3 na osi liczbowej.",
              "timeEstimate": 300
            },
            {
              "title": "Nierówność „poza przedziałem"",
              "problem": "Rozwiąż $|x+1|\\ge2$.",
              "solution": "$x\\le-3$ lub $x\\ge1$.",
              "explanation": "Odległość od $-1$ co najmniej 2: dopełnienie przedziału otwartego.",
              "timeEstimate": 300
            },
            {
              "title": "Suma modułów kawałkami",
              "problem": "Rozwiąż $|x-2|+|x+1|\\le4$.",
              "solution": "Krytyczne $-1,2$. Na odcinkach: $(-\\infty,-1],[-1,2],[2,\\infty)$. Po przekształceniach: rozwiązanie $[-2,3]$.",
              "explanation": "Definiujemy moduły w częściach i łączymy rozwiązania.",
              "timeEstimate": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Rozwiąż $|x|=7$.",
              "expectedAnswer": "x=\\pm7",
              "hints": ["Dwa przypadki", "Symetria względem zera"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $|x-4|<3$.",
              "expectedAnswer": "(1,7)",
              "hints": ["Odległość od 4 mniejsza niż 3", "Przedział otwarty"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $|2x+1|\\le5$.",
              "expectedAnswer": "[-3,2]",
              "hints": ["$-5\\le2x+1\\le5$", "Podziel przez 2 i przesuń"],
              "timeEstimate": 240
            },
            {
              "type": "advanced",
              "problem": "Rozwiąż $|x-2|+|x|\\ge4$.",
              "expectedAnswer": "(-\\infty,-2]\\cup[2,\\infty)",
              "hints": ["Punkty 0 i 2", "Suma odległości minimalna między punktami"],
              "timeEstimate": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Brak podziału na przypadki", "Zgubienie nierówności przy przekształceniach", "Pominięcie dopełnienia przy $\\ge$"],
          "teachingTips": ["Zawsze nanieś punkty krytyczne na oś", "Ucz interpretacji jako odległości"],
          "prerequisites": ["Wartość bezwzględna – definicja", "Nierówności liniowe"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Zastępowanie $|u|$ przez $u$ bez warunku",
            "intervention": "Wymuś zapis $u\\ge0$ lub $u<0$ i sprawdzanie wyników"
          }
        ],
        "realWorldApplications": ["Tolerancje pomiarowe i błędy bezwzględne", "Strefy bezpieczeństwa wokół punktów odniesienia"],
        "assessmentRubric": {
          "mastery": "Sprawnie rozpisuje przypadki i zapisuje rozwiązania w notacji przedziałowej.",
          "proficient": "Metoda dobra, sporadyczne potknięcia w granicach.",
          "developing": "Brak podziału na przypadki i błędy w znakach."
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
            "introduction": "Rozwiązywanie równań i nierówności z $|\\cdot|$ opiera się na definicji modułu oraz interpretacji geometrycznej jako odległości. Kluczowe strategie: (1) rozpisywanie przypadków według znaków wyrażeń wewnątrz $|\\cdot|$, (2) zamiana $|x-a|<r$ na zapis przedziałowy, (3) dla sum/dif. modułów – podział osi na odcinki wyznaczone przez punkty krytyczne i definiowanie funkcji kawałkami, (4) kontrola dziedziny i sprawdzanie rozwiązań w przyjętych przypadkach. Warto znać standardowe przekształcenia: $|u|\\le k\\Rightarrow -k\\le u\\le k$ oraz $|u|\\ge k\\Rightarrow u\\le -k$ lub $u\\ge k$ dla $k\\ge0$. Użyteczne jest też nierówność trójkąta $|u+v|\\le|u|+|v|$ przy oszacowaniach.",
            "keyConceptsLaTex": ["$|u|\\le k$", "$|u|\\ge k$", "$|x-a|<r$", "$|u+v|\\le|u|+|v|$", "$\\text{przypadki}$"],
            "timeEstimate": 180
          },
          "examples": [
            {
              "title": "Nierówność typu „wewnątrz"",
              "problem": "Rozwiąż $|x-1|\\le2$.",
              "solution": "$-2\\le x-1\\le2\\Rightarrow x\\in[-1,3]$.",
              "explanation": "Zapisujemy podwójną nierówność i przekształcamy.",
              "timeEstimate": 300
            },
            {
              "title": "Równanie z dwoma modułami",
              "problem": "Rozwiąż $|x-2|=|x+1|$.",
              "solution": "Symetria względem środka odcinka $[-1,2]$: $x=\\tfrac{1}{2}$.",
              "explanation": "Punkty o równej odległości od $-1$ i $2$ leżą w połowie drogi.",
              "timeEstimate": 300
            },
            {
              "title": "Suma modułów – oszacowanie",
              "problem": "Wykaż $|x-1|+|x+1|\\ge2$.",
              "solution": "Z nierówności trójkąta: $|x-1|+|x+1|\\ge|(x-1)-(x+1)|=2$.",
              "explanation": "Użyto $|u|+|v|\\ge|u-v|$ z wyborem $u=x-1$, $v=-(x+1)$.",
              "timeEstimate": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Rozwiąż $|x+3|=4$.",
              "expectedAnswer": "x=1\\ lub\\ x=-7",
              "hints": ["Ustal dwa przypadki", "Dodaj/odejmij 3"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $|2x-3|<5$.",
              "expectedAnswer": "(-1,4)",
              "hints": ["$-5<2x-3<5$", "Dodaj 3 i podziel przez 2"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $|x|\\ge|x-4|$.",
              "expectedAnswer": "[2,\\infty)",
              "hints": ["Kwadratuj obie strony (obie $\\ge0$)", "Uprość do $0\\ge -4x+16$"],
              "timeEstimate": 240
            },
            {
              "type": "advanced",
              "problem": "Rozwiąż $|x-2|+|x+2|\\le6$.",
              "expectedAnswer": "[-4,4]",
              "hints": ["Punkty krytyczne $-2,2$", "Rozpisz kawałkami i połącz wyniki"],
              "timeEstimate": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Brak sprawdzania rozwiązań w przypadkach", "Błędne łączenie przedziałów", "Nieuprawnione usuwanie modułu bez warunków"],
          "teachingTips": ["Najpierw oś i punkty krytyczne, potem rachunek", "W zadaniach z dwiema kreskami użyj symetrii"],
          "prerequisites": ["Definicja modułu", "Nierówności liniowe i operacje na przedziałach"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Przyjmowanie $|u|=u$ dla każdego $u$",
            "intervention": "Ćwiczenia z $u<0$ i kontrolą znaku wewnątrz modułu"
          }
        ],
        "realWorldApplications": ["Wyznaczanie tolerancji i błędów pomiarowych", "Optymalizacja z ograniczeniami odległościowymi"],
        "assessmentRubric": {
          "mastery": "Poprawnie rozpisuje przypadki i łączy je w spójny wynik.",
          "proficient": "Drobne błędy na brzegach przedziałów, dobra metoda.",
          "developing": "Brak kontroli warunków i niespójny zbiór rozwiązań."
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
            "introduction": "Równanie kwadratowe $ax^2+bx+c=0$ ($a\\ne0$) rozwiążesz metodą delty, faktoryzacji lub poprzez rozpoznanie pełnego kwadratu. Liczba i rodzaj rozwiązań zależą od $\\Delta=b^2-4ac$: dla $\\Delta>0$ są dwa pierwiastki rzeczywiste, dla $\\Delta=0$ jeden podwójny, dla $\\Delta<0$ brak rzeczywistych. Przy faktoryzacji szukamy par liczb o odpowiednim iloczynie i sumie. Postać kanoniczna $y=a(x-p)^2+q$ pozwala łatwo odczytać wierzchołek i zrozumieć geometrię. W praktyce zawsze sprawdzaj rozwiązania i dbaj o poprawne dzielenie przez $2a$. W zadaniach tekstowych tłumacz opis na równanie i interpretuj pierwiastki w kontekście (np. czas, długość, liczba sztuk).",
            "keyConceptsLaTex": ["$\\Delta=b^2-4ac$", "$x=\\tfrac{-b\\pm\\sqrt{\\Delta}}{2a}$", "$a(x-x_1)(x-x_2)$", "$y=a(x-p)^2+q$", "$x_0=\\tfrac{-b}{2a}$"],
            "timeEstimate": 180
          },
          "examples": [
            {
              "title": "Delta – dwa pierwiastki",
              "problem": "Rozwiąż $x^2-5x+6=0$.",
              "solution": "$\\Delta=25-24=1$. $x=\\tfrac{5\\pm1}{2}\\Rightarrow x=2,3$.",
              "explanation": "Stosujemy wzór kwadratowy po obliczeniu delty.",
              "timeEstimate": 300
            },
            {
              "title": "Wyłączanie czynnika",
              "problem": "Rozwiąż $2x^2-8x=0$.",
              "solution": "Wyłącz $2x$: $2x(x-4)=0\\Rightarrow x=0\\ lub\\ x=4$.",
              "explanation": "Faktoryzacja upraszcza obliczenia bez liczenia delty.",
              "timeEstimate": 300
            },
            {
              "title": "Kwadrat pełny",
              "problem": "Rozwiąż $x^2+2x+1=0$.",
              "solution": "$(x+1)^2=0\\Rightarrow x=-1$ (pierwiastek podwójny).",
              "explanation": "Rozpoznajemy wzór $(a+b)^2$ i natychmiast odczytujemy rozwiązanie.",
              "timeEstimate": 300
            }
          ],
          "practiceExercises": [
            {
              "type": "basic",
              "problem": "Rozwiąż $x^2-1=0$.",
              "expectedAnswer": "x=\\pm1",
              "hints": ["Różnica kwadratów", "$(x-1)(x+1)=0$"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Rozwiąż $x^2+x-6=0$.",
              "expectedAnswer": "x=-3\\ lub\\ x=2",
              "hints": ["Iloczyn $-6$, suma $1$", "Rozłóż na czynniki"],
              "timeEstimate": 240
            },
            {
              "type": "intermediate",
              "problem": "Dla $x^2+4x+5=0$ określ liczbę rozwiązań w $\\mathbb{R}$.",
              "expectedAnswer": "Brak (\\Delta<0)",
              "hints": ["Policz deltę", "Znak pod pierwiastkiem"],
              "timeEstimate": 240
            },
            {
              "type": "advanced",
              "problem": "Dla $y=x^2-6x+8$ podaj wierzchołek.",
              "expectedAnswer": "(3,-1)",
              "hints": ["$x_0=\\tfrac{-b}{2a}$", "Podstaw do $y$"],
              "timeEstimate": 240
            }
          ]
        },
        "pedagogicalNotes": {
          "commonMistakes": ["Błędne przepisanie wzoru na pierwiastki", "Zgubienie jednego rozwiązania przy $\\pm$", "Niedokładne liczenie delty"],
          "teachingTips": ["Ćwicz równolegle trzy metody na tych samych przykładach", "Weryfikuj przez podstawienie do równania"],
          "prerequisites": ["Wyrażenia algebraiczne", "Potęgowanie i pierwiastki"]
        },
        "misconceptionPatterns": [
          {
            "pattern": "Mylenie $x_0=\\tfrac{-b}{2a}$ z rozwiązaniem równania",
            "intervention": "Wyjaśnij, że to współrzędna wierzchołka, nie pierwiastek"
          }
        ],
        "realWorldApplications": ["Rzuty ukośne i optymalizacje", "Geometria analityczna – przecięcia i odległości"],
        "assessmentRubric": {
          "mastery": "Sprawnie dobiera metodę i bezbłędnie liczy pierwiastki.",
          "proficient": "Nieliczne błędy rachunkowe, właściwy tok.",
          "developing": "Myli metody i popełnia błędy w podstawieniach."
        }
      }
    ]
  };

  console.log('Starting import of 10 new skills...');
  
  try {
    const result = await batchImportSkillContent(skillsData);
    console.log('Import completed:', result);
    return result;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};

// Run the import immediately
importNewSkillsData().then(result => {
  console.log('Final import result:', result);
}).catch(error => {
  console.error('Final import error:', error);
});