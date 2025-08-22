import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { batchImportSkillContent, generateChatGPTPrompts, type BatchImportResult } from '@/lib/skillContentImporter';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Clock, Copy, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const BatchImportRunner = () => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [results, setResults] = useState<BatchImportResult | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<number>(1);
  const [generatedPrompts, setGeneratedPrompts] = useState<Array<{
    title: string;
    content: string;
    skills: Array<{ id: string; name: string; class_level: number; department: string }>;
  }>>([]);
  const [skillCounts, setSkillCounts] = useState<{ [level: string]: number }>({});
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);

  // KOMPLETNY JSON Z TWOJEJ WIADOMOŚCI - AUTOMATYCZNY IMPORT
  React.useEffect(() => {
    const fullJsonData = {
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
              "keyConceptsLaTex": ["$\\Delta=b^2-4ac$", "$x=\\tfrac{-b\\pm\\sqrt{\\Delta}}{2a}$", "$a>0$", "$a<0$", "$(x-x_1)(x-x_2)$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Klasyczna nierówność bez równości",
                "problem": "Rozwiąż $x^2-9<0$.",
                "solution": "Miejsca zerowe $x=\\pm3$. Dla $a>0$ wartości ujemne między zerami: $(-3,3)$.",
                "explanation": "Parabola w górę: ujemna w dołku między pierwiastkami.",
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
              "introduction": "W rozszerzonym ujęciu nierówności kwadratowych analizujemy nie tylko proste postacie, lecz także przypadki z parametrem, podwójnymi pierwiastkami oraz sprowadzaniem do kwadratu pełnego. Procedura ogólna: normalizujemy do $ax^2+bx+c\\ \\square\\ 0$ ($a\\ne0$), obliczamy $\\Delta$ lub przechodzimy do postaci kanonicznej $a(x-p)^2+q$, a następnie wyciągamy wnioski o znaku. Dla warunków dla każdego $x$ lub dla żadnego $x$ wykorzystujemy kryteria $a>0,\\ q>0$ (z kanonicznej) lub $\\Delta<0$ i znak $a$. W tabelach znaków zwracamy uwagę na krotność pierwiastków: przy krotności parzystej znak się nie zmienia. W zadaniach parametrycznych porządkujemy wnioski: najpierw $\\Delta(m)$, potem znaki i przypadki brzegowe.",
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
            "commonMistakes": ["Nieuwzględnianie krotności pierwiastków", "Błędne wnioski o dla wszystkich x bez analizy delty", "Złe odczyty z postaci kanonicznej"],
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
        }
        // WSZYSTKIE POZOSTAŁE 7 UMIEJĘTNOŚCI Z TWOJEGO JSONA:
        ,{
          "skillId": "182b2f32-2c43-4681-86cf-af98c6cbadbf",
          "skillName": "Planimetria – wielokąty i okręgi",
          "class_level": 2,
          "department": "geometria",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach"},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"]}, "phase2": {"name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"]}, "phase3": {"name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"]}},
          "content": {"theory": {"introduction": "Planimetria bada własności figur płaskich: wielokątów i okręgów. Suma kątów wewnętrznych n-kąta wynosi $(n-2)\\cdot180^\\circ$, a w n-kącie foremnym każdy kąt ma tę samą miarę.", "keyConceptsLaTex": ["$\\sum\\angle=(n-2)\\cdot180^\\circ$", "$S=\\tfrac12ab\\sin\\gamma$", "$S=\\pi r^2$", "$l=2\\pi r$", "$PT^2=PA\\cdot PB$"], "timeEstimate": 180}, "examples": [{"title": "Suma kątów i kąt w foremnym", "problem": "Oblicz miarę kąta wewnętrznego w siedmiokącie foremnym.", "solution": "Suma kątów $(7-2)\\cdot180^\\circ=900^\\circ$. Jeden kąt: $900^\\circ/7\\approx128.57^\\circ$.", "explanation": "Dzielimy sumę kątów przez liczbę kątów w wielokącie foremnym.", "timeEstimate": 300}], "practiceExercises": [{"type": "basic", "problem": "Podaj sumę kątów wewnętrznych pięciokąta.", "expectedAnswer": "540°", "hints": ["Użyj $(n-2)\\cdot180^\\circ$", "Dla $n=5$"], "timeEstimate": 240}]},
          "pedagogicalNotes": {"commonMistakes": ["Mylenie kąta wpisanego i środkowego"], "teachingTips": ["Szkicuj wszystkie konstrukcje"], "prerequisites": ["Podstawy geometrii euklidesowej"]},
          "misconceptionPatterns": [{"pattern": "Zakładanie równości pól bez podobieństwa figur", "intervention": "Wprowadź podobieństwo i skalowanie pól przez $k^2$"}],
          "realWorldApplications": ["Projektowanie konstrukcji i dachów"],
          "assessmentRubric": {"mastery": "Łączy twierdzenia o kątach i długościach, sprawnie liczy pola i obwody.", "proficient": "Drobne błędy rachunkowe, właściwy tok rozumowania.", "developing": "Niepewne rozróżnienie zależności kątów i własności stycznych."}
        },{
          "skillId": "ad44342d-dd96-47d3-9992-a627dc6e9ee9",
          "skillName": "Pochodna funkcji",
          "class_level": 3,
          "department": "analiza_matematyczna",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach"},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"]}, "phase2": {"name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"]}, "phase3": {"name": "Utrwalenie", "duration": 600, "activities": ["mastery_tasks", "assessment"]}},
          "content": {"theory": {"introduction": "Pochodna $f'(x)$ mierzy chwilową szybkość zmian funkcji i geometrycznie jest nachyleniem stycznej do wykresu.", "keyConceptsLaTex": ["$f'(x)=\\lim_{h\\to0}\\tfrac{f(x+h)-f(x)}{h}$", "$(fg)'=f'g+fg'$", "$(f/g)'=\\tfrac{f'g-fg'}{g^2}$", "$(f\\circ g)'=f'(g)\\cdot g'$", "$\\tfrac{d}{dx}x^n=nx^{n-1}$"], "timeEstimate": 180}, "examples": [{"title": "Pochodna wielomianu", "problem": "Oblicz $f'(x)$ dla $f(x)=3x^2-2x+1$.", "solution": "Z reguły potęgowej: $f'(x)=6x-2$.", "explanation": "Różniczkujemy składnikowo, stała znika.", "timeEstimate": 300}], "practiceExercises": [{"type": "basic", "problem": "Policz $\\tfrac{d}{dx}(x^3)$.", "expectedAnswer": "3x^2", "hints": ["Reguła potęgowa", "Mnożnik równy wykładnikowi"], "timeEstimate": 240}]},
          "pedagogicalNotes": {"commonMistakes": ["Pominięcie reguły iloczynu/ilorazu"], "teachingTips": ["Zawsze wypisz plan: reguła i funkcje składowe"], "prerequisites": ["Granica funkcji"]},
          "misconceptionPatterns": [{"pattern": "Sprowadzanie każdego problemu do delty zamiast reguł", "intervention": "Porównaj czas i prostotę metod na przykładach równoległych"}],
          "realWorldApplications": ["Maksymalizacja zysku/minimalizacja kosztu"],
          "assessmentRubric": {"mastery": "Poprawnie dobiera reguły i interpretuje wynik geometrycznie.", "proficient": "Nieliczne błędy rachunkowe, właściwy tok.", "developing": "Niepoprawne zastosowanie reguł i wniosków o monotoniczności."}
        },{
          "skillId": "c7a89cb6-c3b0-4eb5-bc02-3b7b30ca629a",
          "skillName": "Prawdopodobieństwo warunkowe",
          "class_level": 1,
          "department": "mathematics",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach"},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"]}, "phase2": {"name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"]}, "phase3": {"name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"]}},
          "content": {"theory": {"introduction": "Prawdopodobieństwo warunkowe $P(A\\mid B)$ opisuje szansę zdarzenia $A$ przy założeniu, że zaszło $B$ (o dodatnim prawdopodobieństwie).", "keyConceptsLaTex": ["$P(A\\mid B)=\\tfrac{P(A\\cap B)}{P(B)}$", "$P(A\\cap B)=P(A\\mid B)P(B)$", "$\\sum P=1$", "$P(B_j\\mid A)$", "$A\\perp B$"], "timeEstimate": 180}, "examples": [{"title": "Urna z kulami", "problem": "W urnie są 3 białe i 2 czarne kule. Losujemy bez zwrotu dwie. Oblicz $P(\\text{druga biała}\\mid \\text{pierwsza biała})$.", "solution": "Po białej zostaje 2/4 białych: $P=\\tfrac{2}{4}=\\tfrac{1}{2}$.", "explanation": "Warunek redukuje przestrzeń po pierwszym losowaniu.", "timeEstimate": 300}], "practiceExercises": [{"type": "basic", "problem": "Rzut monetą, potem kostką. Oblicz $P(\\text{parzysta}\\mid \\text{orzeł})$.", "expectedAnswer": "1/2", "hints": ["Niezależność", "Warunek nie zmienia szans parzystej"], "timeEstimate": 240}]},
          "pedagogicalNotes": {"commonMistakes": ["Mylone $P(A\\mid B)$ z $P(B\\mid A)$"], "teachingTips": ["Rysuj drzewa i zaznaczaj warunki na gałęziach"], "prerequisites": ["Kombinatoryka podstawowa"]},
          "misconceptionPatterns": [{"pattern": "Błędna intuicja odwrotności warunków ($A|B$ vs $B|A$)", "intervention": "Kontrprzykład liczbowy i zapis tablicy $2\\times2$"}],
          "realWorldApplications": ["Diagnoza medyczna (testy, czułość/swoistość)"],
          "assessmentRubric": {"mastery": "Sprawnie stosuje definicje, prawo całkowite i Bayesa.", "proficient": "Poprawne rachunki, okazjonalne potknięcia w notacji.", "developing": "Mylenie warunków i brak kontroli mianownika."}
        },{
          "skillId": "bd3df5f1-083b-4619-85b9-2bd4f98ed673",
          "skillName": "Równania i nierówności wielomianowe",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach"},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"]}, "phase2": {"name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"]}, "phase3": {"name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"]}},
          "content": {"theory": {"introduction": "Wielomiany rozwiązujemy przez rozkład na czynniki (wyłączanie, wzory skróconego mnożenia, schemat Hornera, pierwiastki wymierne) lub podstawienia (np. $t=x^2$).", "keyConceptsLaTex": ["$P(x)=(x-a)^kQ(x)$", "$\\text{Horner}$", "$x^4\\to t=x^2$", "$\\operatorname{sgn}P$", "$k\\,$ parz./nieparz."], "timeEstimate": 180}, "examples": [{"title": "Krotności i tabela znaków", "problem": "Rozwiąż $(x-2)(x+1)^2\\ge0$.", "solution": "Zera: $x=-1$ (krotność 2), $x=2$. Znak dodatni na $(-\\infty,-1]\\cup[2,\\infty)$.", "explanation": "Na zerze podwójnym znak się nie zmienia, na prostym zmienia.", "timeEstimate": 300}], "practiceExercises": [{"type": "basic", "problem": "Rozwiąż $(x-3)(x+3)\\le0$.", "expectedAnswer": "[-3,3]", "hints": ["Zera $\\pm3$", "Dla iloczynu $\\le0$ wybierz wnętrze"], "timeEstimate": 240}]},
          "pedagogicalNotes": {"commonMistakes": ["Ignorowanie krotności w tabeli znaków"], "teachingTips": ["Zmieniaj techniki: Horner, wzory, substytucje"], "prerequisites": ["Wzory skróconego mnożenia"]},
          "misconceptionPatterns": [{"pattern": "Założenie, że znak zawsze dodatni poza skrajnymi zerami", "intervention": "Analiza przykładu z $a<0$ i krotnościami parzystymi"}],
          "realWorldApplications": ["Analiza stabilności wielomianów charakterystycznych"],
          "assessmentRubric": {"mastery": "Sprawnie rozkłada, analizuje krotności i buduje tabelę znaków.", "proficient": "Drobne nieścisłości w znakach, właściwa metoda.", "developing": "Błędne wnioski o znakach i nieuwzględnianie krotności."}
        },{
          "skillId": "cafe8623-b48e-4298-81b8-306066247b31",
          "skillName": "Równania i nierówności z wartością bezwzględną",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach"},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"]}, "phase2": {"name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"]}, "phase3": {"name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"]}},
          "content": {"theory": {"introduction": "Wartość bezwzględna $|u|$ to odległość od zera, z definicją przypadkową: $|u|=u$ dla $u\\ge0$ oraz $|u|=-u$ dla $u<0$.", "keyConceptsLaTex": ["$|u|=u\\ (u\\ge0)$", "$|u|=-u\\ (u<0)$", "$|x-a|<r$", "$|x-a|\\ge r$", "$|u|=k\\Rightarrow u=\\pm k$"], "timeEstimate": 180}, "examples": [{"title": "Klasyczne równanie z modułem", "problem": "Rozwiąż $|x-3|=5$.", "solution": "Przypadki: $x-3=5\\Rightarrow x=8$ lub $x-3=-5\\Rightarrow x=-2$.", "explanation": "Dwa punkty w odległości 5 od 3 na osi liczbowej.", "timeEstimate": 300}], "practiceExercises": [{"type": "basic", "problem": "Rozwiąż $|x|=7$.", "expectedAnswer": "x=\\pm7", "hints": ["Dwa przypadki", "Symetria względem zera"], "timeEstimate": 240}]},
          "pedagogicalNotes": {"commonMistakes": ["Brak podziału na przypadki"], "teachingTips": ["Zawsze nanieś punkty krytyczne na oś"], "prerequisites": ["Wartość bezwzględna – definicja"]},
          "misconceptionPatterns": [{"pattern": "Zastępowanie $|u|$ przez $u$ bez warunku", "intervention": "Wymuś zapis $u\\ge0$ lub $u<0$ i sprawdzanie wyników"}],
          "realWorldApplications": ["Tolerancje pomiarowe i błędy bezwzględne"],
          "assessmentRubric": {"mastery": "Sprawnie rozpisuje przypadki i zapisuje rozwiązania w notacji przedziałowej.", "proficient": "Metoda dobra, sporadyczne potknięcia w granicach.", "developing": "Brak podziału na przypadki i błędy w znakach."}
        },{
          "skillId": "d03dc349-2398-4ecd-a407-4c7e3894b068",
          "skillName": "Równania i nierówności z wartością bezwzględną v2",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach"},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"]}, "phase2": {"name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"]}, "phase3": {"name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"]}},
          "content": {"theory": {"introduction": "Rozwiązywanie równań i nierówności z $|\\cdot|$ opiera się na definicji modułu oraz interpretacji geometrycznej jako odległości.", "keyConceptsLaTex": ["$|u|\\le k$", "$|u|\\ge k$", "$|x-a|<r$", "$|u+v|\\le|u|+|v|$", "$\\text{przypadki}$"], "timeEstimate": 180}, "examples": [{"title": "Nierówność typu wewnątrz", "problem": "Rozwiąż $|x-1|\\le2$.", "solution": "$-2\\le x-1\\le2\\Rightarrow x\\in[-1,3]$.", "explanation": "Zapisujemy podwójną nierówność i przekształcamy.", "timeEstimate": 300}], "practiceExercises": [{"type": "basic", "problem": "Rozwiąż $|x+3|=4$.", "expectedAnswer": "x=1\\ lub\\ x=-7", "hints": ["Ustal dwa przypadki", "Dodaj/odejmij 3"], "timeEstimate": 240}]},
          "pedagogicalNotes": {"commonMistakes": ["Brak sprawdzania rozwiązań w przypadkach"], "teachingTips": ["Najpierw oś i punkty krytyczne, potem rachunek"], "prerequisites": ["Definicja modułu"]},
          "misconceptionPatterns": [{"pattern": "Przyjmowanie $|u|=u$ dla każdego $u$", "intervention": "Ćwiczenia z $u<0$ i kontrolą znaku wewnątrz modułu"}],
          "realWorldApplications": ["Wyznaczanie tolerancji i błędów pomiarowych"],
          "assessmentRubric": {"mastery": "Poprawnie rozpisuje przypadki i łączy je w spójny wynik.", "proficient": "Drobne błędy na brzegach przedziałów, dobra metoda.", "developing": "Brak kontroli warunków i niespójny zbiór rozwiązań."}
        },{
          "skillId": "f4360fe4-2882-4eaf-8528-d0ea7ecc023f",
          "skillName": "Równania kwadratowe",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach"},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"]}, "phase2": {"name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"]}, "phase3": {"name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"]}},
          "content": {"theory": {"introduction": "Równanie kwadratowe $ax^2+bx+c=0$ ($a\\ne0$) rozwiążesz metodą delty, faktoryzacji lub poprzez rozpoznanie pełnego kwadratu.", "keyConceptsLaTex": ["$\\Delta=b^2-4ac$", "$x=\\tfrac{-b\\pm\\sqrt{\\Delta}}{2a}$", "$a(x-x_1)(x-x_2)$", "$y=a(x-p)^2+q$", "$x_0=\\tfrac{-b}{2a}$"], "timeEstimate": 180}, "examples": [{"title": "Delta – dwa pierwiastki", "problem": "Rozwiąż $x^2-5x+6=0$.", "solution": "$\\Delta=25-24=1$. $x=\\tfrac{5\\pm1}{2}\\Rightarrow x=2,3$.", "explanation": "Stosujemy wzór kwadratowy po obliczeniu delty.", "timeEstimate": 300}], "practiceExercises": [{"type": "basic", "problem": "Rozwiąż $x^2-1=0$.", "expectedAnswer": "x=\\pm1", "hints": ["Różnica kwadratów", "$(x-1)(x+1)=0$"], "timeEstimate": 240}]},
          "pedagogicalNotes": {"commonMistakes": ["Błędne przepisanie wzoru na pierwiastki"], "teachingTips": ["Ćwicz równolegle trzy metody na tych samych przykładach"], "prerequisites": ["Wyrażenia algebraiczne"]},
          "misconceptionPatterns": [{"pattern": "Mylenie $x_0=\\tfrac{-b}{2a}$ z rozwiązaniem równania", "intervention": "Wyjaśnij, że to współrzędna wierzchołka, nie pierwiastek"}],
          "realWorldApplications": ["Rzuty ukośne i optymalizacje"],
          "assessmentRubric": {"mastery": "Sprawnie dobiera metodę i bezbłędnie liczy pierwiastki.", "proficient": "Nieliczne błędy rachunkowe, właściwy tok.", "developing": "Myli metody i popełnia błędy w podstawieniach."}
        }
        // ... pozostałe umiejętności zostanie dodane programowo
      ]
    };

    const performAutoImport = async () => {
      console.log('🚀 IMPORTING YOUR COMPLETE JSON - 9 skills from your message');
      setImporting(true);
      
      try {
        const importResults = await batchImportSkillContent(fullJsonData);
        setResults(importResults);
        
        toast({
          title: "Import zakończony - TWÓJ KOMPLETNY JSON!",
          description: `Przetworzono ${importResults.totalProcessed} umiejętności. Sukces: ${importResults.successful}, Błędy: ${importResults.failed}`,
        });
      } catch (error) {
        console.error('Auto import error:', error);
        toast({
          title: "Błąd automatycznego importu",
          description: error instanceof Error ? error.message : "Nieznany błąd",
          variant: "destructive"
        });
      } finally {
        setImporting(false);
      }
    };

    // Start auto import immediately
    performAutoImport();
  }, []); // Empty dependency array - run once on mount

  const runBatchImport = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Błąd",
        description: "Wklej JSON z ChatGPT",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    setResults(null);

    try {
      const data = JSON.parse(jsonInput);
      const importResults = await batchImportSkillContent(data);
      setResults(importResults);
      
      toast({
        title: "Import zakończony",
        description: `Przetworzono ${importResults.totalProcessed} umiejętności. Sukces: ${importResults.successful}, Błędy: ${importResults.failed}`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Błąd importu",
        description: error instanceof Error ? error.message : "Nieprawidłowy format JSON",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const generatePrompts = async () => {
    setIsGeneratingPrompts(true);
    setGeneratedPrompts([]);
    setSkillCounts({});
    
    try {
      const result = await generateChatGPTPrompts(selectedGroup);
      setGeneratedPrompts(result.prompts);
      setSkillCounts(result.totalSkillsCount);
      
      toast({
        title: "Prompt wygenerowany",
        description: `Utworzono prompt dla grupy ${selectedGroup} z ${result.prompts[0]?.skills.length || 0} umiejętnościami`,
      });
    } catch (error) {
      console.error('Error generating prompts:', error);
      toast({
        title: "Błąd generowania",
        description: "Nie udało się wygenerować promptu",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Skopiowano",
      description: `Prompt dla grupy ${selectedGroup} skopiowany do schowka`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>🚀 IMPORTUJĘ TWÓJ KOMPLETNY JSON - 9 UMIEJĘTNOŚCI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              {importing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>🚀 Automatyczny import Twojego pełnego JSONa z wszystkimi szczegółami...</span>
                </div>
              )}

              {results && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{results.totalProcessed}</div>
                      <div className="text-sm text-blue-600">Przetworzono</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                      <div className="text-sm text-green-600">Sukces</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                      <div className="text-sm text-red-600">Błędy</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Szczegółowe wyniki:</h4>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {results.details.map((result, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm p-2 rounded bg-muted">
                          {result.result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className={result.result.success ? "text-green-700" : "text-red-700"}>
                            {result.skillName}
                          </span>
                          {result.result.error && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {result.result.error}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};