import React, { useState, useEffect } from 'react';
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
  const [autoImportRan, setAutoImportRan] = useState(false);

  // BULLETPROOF AUTO-IMPORT - runs once reliably
  useEffect(() => {
    if (autoImportRan) return;

    const YOUR_COMPLETE_JSON = {
      "contentDatabase": [
        {
          "skillId": "383a996f-6f04-406f-9b86-e9fe2fc93879",
          "skillName": "Nierówności kwadratowe",
          "class_level": 1,
          "department": "algebra",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": { "theory": { "introduction": "Nierówność kwadratowa dotyczy wyrażenia $ax^2+bx+c$ i polega na wyznaczeniu zbioru $x$, dla których wartości wielomianu są $<,\\le,>,\\ge$ od zera. Kluczowy jest znak współczynnika $a$ (kierunek ramion paraboli) oraz miejsca zerowe funkcji kwadratowej. Standardowa procedura: (1) oblicz deltę lub rozłóż na czynniki, (2) wyznacz miejsca zerowe (jeśli istnieją), (3) narysuj szkic paraboli lub użyj tabeli znaków, (4) odczytaj przedziały, na których wyrażenie ma żądany znak, (5) uwzględnij równość dla symboli $\\le,\\ge$. Dla $a>0$ wartości między pierwiastkami są ujemne, a poza nimi dodatnie; dla $a<0$ odwrotnie. Jeśli $\\Delta<0$, znak wielomianu jest stały (zależny od $a$). Zapis rozwiązania podajemy w notacji przedziałowej i weryfikujemy punktami testowymi.", "keyConceptsLaTex": ["$\\Delta=b^2-4ac$", "$x=\\tfrac{-b\\pm\\sqrt{\\Delta}}{2a}$", "$a>0$", "$a<0$", "$(x-x_1)(x-x_2)$"], "timeEstimate": 180 }, "examples": [{ "title": "Klasyczna nierówność bez równości", "problem": "Rozwiąż $x^2-9<0$.", "solution": "Miejsca zerowe $x=\\pm3$. Dla $a>0$ wartości ujemne między zerami: $(-3,3)$.", "explanation": "Parabola w górę: ujemna w dołku między pierwiastkami.", "timeEstimate": 300 }], "practiceExercises": [{ "type": "basic", "problem": "Rozwiąż $x^2-1\\le0$.", "expectedAnswer": "[-1,1]", "hints": ["Różnica kwadratów", "Parabola $a>0$ – wartości $\\le0$ między zerami"], "timeEstimate": 240 }] },
          "pedagogicalNotes": { "commonMistakes": ["Mylenie kierunku znaków dla $a<0$"], "teachingTips": ["Zawsze szkicuj parabolę"], "prerequisites": ["Równania kwadratowe"] },
          "misconceptionPatterns": [{ "pattern": "Założenie, że wynik zawsze jest przedziałem między zerami", "intervention": "Konfrontacja przypadków $a<0$ i $\\Delta<0$" }],
          "realWorldApplications": ["Zakresy dopuszczalne parametrów modeli"],
          "assessmentRubric": { "mastery": "Sprawnie buduje tabelę znaków", "proficient": "Drobne błędy", "developing": "Myli kierunki" }
        },
        {
          "skillId": "6719fb54-526e-47de-90bf-3d14958a0347",
          "skillName": "Nierówności kwadratowe",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": { "theory": { "introduction": "W rozszerzonym ujęciu nierówności kwadratowych analizujemy przypadki z parametrem, podwójnymi pierwiastkami oraz sprowadzaniem do kwadratu pełnego.", "keyConceptsLaTex": ["$\\Delta=b^2-4ac$", "$a(x-p)^2+q$"], "timeEstimate": 180 }, "examples": [{ "title": "Nierówność z rozkładem", "problem": "Rozwiąż $2x^2-5x-3>0$.", "solution": "Pierwiastki $x=-\\tfrac{1}{2},\\ 3$.", "explanation": "Po rozkładzie odczytujemy znaki.", "timeEstimate": 300 }], "practiceExercises": [{ "type": "basic", "problem": "Rozwiąż $(x-4)^2\\ge0$.", "expectedAnswer": "R", "hints": ["Kwadrat $\\ge0$"], "timeEstimate": 240 }] },
          "pedagogicalNotes": { "commonMistakes": ["Nieuwzględnianie krotności"], "teachingTips": ["Zmieniaj metody"], "prerequisites": ["Równania kwadratowe"] },
          "misconceptionPatterns": [{ "pattern": "Zakładanie zmiany znaku na każdym pierwiastku", "intervention": "Ćwiczenia z krotnością parzystą" }],
          "realWorldApplications": ["Kryteria dodatniości energii"],
          "assessmentRubric": { "mastery": "Sprawnie dobiera metodę", "proficient": "Metoda poprawna", "developing": "Niespójne wnioski" }
        },
        {
          "skillId": "182b2f32-2c43-4681-86cf-af98c6cbadbf",
          "skillName": "Planimetria – wielokąty i okręgi",
          "class_level": 2,
          "department": "geometria",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": { "theory": { "introduction": "Planimetria bada własności figur płaskich: wielokątów i okręgów.", "keyConceptsLaTex": ["$\\sum\\angle=(n-2)\\cdot180^\\circ$", "$S=\\pi r^2$"], "timeEstimate": 180 }, "examples": [{ "title": "Suma kątów", "problem": "Oblicz miarę kąta w siedmiokącie foremnym.", "solution": "Suma $(7-2)\\cdot180^\\circ=900^\\circ$.", "explanation": "Dzielimy przez liczbę kątów.", "timeEstimate": 300 }], "practiceExercises": [{ "type": "basic", "problem": "Podaj sumę kątów pięciokąta.", "expectedAnswer": "540°", "hints": ["Użyj $(n-2)\\cdot180^\\circ$"], "timeEstimate": 240 }] },
          "pedagogicalNotes": { "commonMistakes": ["Mylenie kąta wpisanego"], "teachingTips": ["Szkicuj konstrukcje"], "prerequisites": ["Geometria euklidesowa"] },
          "misconceptionPatterns": [{ "pattern": "Zakładanie równości pól", "intervention": "Wprowadź podobieństwo" }],
          "realWorldApplications": ["Projektowanie konstrukcji"],
          "assessmentRubric": { "mastery": "Łączy twierdzenia", "proficient": "Drobne błędy", "developing": "Niepewne rozróżnienie" }
        },
        {
          "skillId": "ad44342d-dd96-47d3-9992-a627dc6e9ee9",
          "skillName": "Pochodna funkcji",
          "class_level": 3,
          "department": "analiza_matematyczna",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": { "theory": { "introduction": "Pochodna $f'(x)$ mierzy chwilową szybkość zmian funkcji.", "keyConceptsLaTex": ["$f'(x)=\\lim_{h\\to0}\\tfrac{f(x+h)-f(x)}{h}$", "$(fg)'=f'g+fg'$"], "timeEstimate": 180 }, "examples": [{ "title": "Pochodna wielomianu", "problem": "Oblicz $f'(x)$ dla $f(x)=3x^2-2x+1$.", "solution": "$f'(x)=6x-2$.", "explanation": "Różniczkujemy składnikowo.", "timeEstimate": 300 }], "practiceExercises": [{ "type": "basic", "problem": "Policz $\\tfrac{d}{dx}(x^3)$.", "expectedAnswer": "3x^2", "hints": ["Reguła potęgowa"], "timeEstimate": 240 }] },
          "pedagogicalNotes": { "commonMistakes": ["Pominięcie reguły iloczynu"], "teachingTips": ["Wypisz plan"], "prerequisites": ["Granica funkcji"] },
          "misconceptionPatterns": [{ "pattern": "Sprowadzanie do delty", "intervention": "Porównaj metody" }],
          "realWorldApplications": ["Maksymalizacja zysku"],
          "assessmentRubric": { "mastery": "Poprawnie dobiera reguły", "proficient": "Nieliczne błędy", "developing": "Niepoprawne zastosowanie" }
        },
        {
          "skillId": "c7a89cb6-c3b0-4eb5-bc02-3b7b30ca629a",
          "skillName": "Prawdopodobieństwo warunkowe",
          "class_level": 1,
          "department": "mathematics",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": { "theory": { "introduction": "Prawdopodobieństwo warunkowe $P(A\\mid B)$ opisuje szansę zdarzenia $A$ przy założeniu, że zaszło $B$.", "keyConceptsLaTex": ["$P(A\\mid B)=\\tfrac{P(A\\cap B)}{P(B)}$"], "timeEstimate": 180 }, "examples": [{ "title": "Urna z kulami", "problem": "W urnie 3 białe i 2 czarne. Oblicz $P(\\text{druga biała}\\mid \\text{pierwsza biała})$.", "solution": "$P=\\tfrac{2}{4}=\\tfrac{1}{2}$.", "explanation": "Warunek redukuje przestrzeń.", "timeEstimate": 300 }], "practiceExercises": [{ "type": "basic", "problem": "Rzut monetą, potem kostką. Oblicz $P(\\text{parzysta}\\mid \\text{orzeł})$.", "expectedAnswer": "1/2", "hints": ["Niezależność"], "timeEstimate": 240 }] },
          "pedagogicalNotes": { "commonMistakes": ["Mylone $P(A\\mid B)$ z $P(B\\mid A)$"], "teachingTips": ["Rysuj drzewa"], "prerequisites": ["Kombinatoryka"] },
          "misconceptionPatterns": [{ "pattern": "Błędna intuicja odwrotności", "intervention": "Kontrprzykład liczbowy" }],
          "realWorldApplications": ["Diagnoza medyczna"],
          "assessmentRubric": { "mastery": "Sprawnie stosuje definicje", "proficient": "Poprawne rachunki", "developing": "Mylenie warunków" }
        },
        {
          "skillId": "bd3df5f1-083b-4619-85b9-2bd4f98ed673",
          "skillName": "Równania i nierówności wielomianowe",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": { "theory": { "introduction": "Wielomiany rozwiązujemy przez rozkład na czynniki lub podstawienia.", "keyConceptsLaTex": ["$P(x)=(x-a)^kQ(x)$", "$x^4\\to t=x^2$"], "timeEstimate": 180 }, "examples": [{ "title": "Krotności i tabela znaków", "problem": "Rozwiąż $(x-2)(x+1)^2\\ge0$.", "solution": "Znak dodatni na $(-\\infty,-1]\\cup[2,\\infty)$.", "explanation": "Na zerze podwójnym znak się nie zmienia.", "timeEstimate": 300 }], "practiceExercises": [{ "type": "basic", "problem": "Rozwiąż $(x-3)(x+3)\\le0$.", "expectedAnswer": "[-3,3]", "hints": ["Zera $\\pm3$"], "timeEstimate": 240 }] },
          "pedagogicalNotes": { "commonMistakes": ["Ignorowanie krotności"], "teachingTips": ["Zmieniaj techniki"], "prerequisites": ["Wzory skróconego mnożenia"] },
          "misconceptionPatterns": [{ "pattern": "Założenie, że znak zawsze dodatni poza zerami", "intervention": "Analiza przykładu z $a<0$" }],
          "realWorldApplications": ["Analiza stabilności"],
          "assessmentRubric": { "mastery": "Sprawnie rozkłada", "proficient": "Drobne nieścisłości", "developing": "Błędne wnioski" }
        },
        {
          "skillId": "cafe8623-b48e-4298-81b8-306066247b31",
          "skillName": "Równania i nierówności z wartością bezwzględną",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalenie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": { "theory": { "introduction": "Wartość bezwzględna $|u|$ to odległość od zera. Równania rozbijamy na przypadki.", "keyConceptsLaTex": ["$|u|=u\\ (u\\ge0)$", "$|x-a|<r$"], "timeEstimate": 180 }, "examples": [{ "title": "Klasyczne równanie", "problem": "Rozwiąż $|x-3|=5$.", "solution": "$x=8$ lub $x=-2$.", "explanation": "Dwa punkty w odległości 5 od 3.", "timeEstimate": 300 }], "practiceExercises": [{ "type": "basic", "problem": "Rozwiąż $|x|=7$.", "expectedAnswer": "x=\\pm7", "hints": ["Dwa przypadki"], "timeEstimate": 240 }] },
          "pedagogicalNotes": { "commonMistakes": ["Brak podziału na przypadki"], "teachingTips": ["Nanieś punkty krytyczne"], "prerequisites": ["Wartość bezwzględna"] },
          "misconceptionPatterns": [{ "pattern": "Zastępowanie $|u|$ przez $u$", "intervention": "Wymuś zapis warunków" }],
          "realWorldApplications": ["Tolerancje pomiarowe"],
          "assessmentRubric": { "mastery": "Sprawnie rozpisuje przypadki", "proficient": "Metoda dobra", "developing": "Brak podziału" }
        },
        {
          "skillId": "f4360fe4-2882-4eaf-8528-d0ea7ecc023f",
          "skillName": "Równania kwadratowe",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalenie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": { "theory": { "introduction": "Równanie kwadratowe $ax^2+bx+c=0$ rozwiążesz metodą delty lub faktoryzacji.", "keyConceptsLaTex": ["$\\Delta=b^2-4ac$", "$x=\\tfrac{-b\\pm\\sqrt{\\Delta}}{2a}$"], "timeEstimate": 180 }, "examples": [{ "title": "Delta – dwa pierwiastki", "problem": "Rozwiąż $x^2-5x+6=0$.", "solution": "$x=2,3$.", "explanation": "Stosujemy wzór kwadratowy.", "timeEstimate": 300 }], "practiceExercises": [{ "type": "basic", "problem": "Rozwiąż $x^2-1=0$.", "expectedAnswer": "x=\\pm1", "hints": ["Różnica kwadratów"], "timeEstimate": 240 }] },
          "pedagogicalNotes": { "commonMistakes": ["Błędne przepisanie wzoru"], "teachingTips": ["Ćwicz trzy metody"], "prerequisites": ["Wyrażenia algebraiczne"] },
          "misconceptionPatterns": [{ "pattern": "Mylenie $x_0$ z rozwiązaniem", "intervention": "Wyjaśnij, że to wierzchołek" }],
          "realWorldApplications": ["Rzuty ukośne"],
          "assessmentRubric": { "mastery": "Sprawnie dobiera metodę", "proficient": "Nieliczne błędy", "developing": "Myli metody" }
        }
      ]
    };

    console.log('🚀 BULLETPROOF AUTO-IMPORT: Starting...');
    setAutoImportRan(true);

    const runReliableImport = async () => {
      try {
        const result = await batchImportSkillContent(YOUR_COMPLETE_JSON);
        console.log('✅ BULLETPROOF AUTO-IMPORT: SUCCESS!', result);
        
        toast({
          title: "✅ Auto-Import Complete!",
          description: `Successfully imported ${result.successful}/${result.totalProcessed} skills`,
        });
        
        setResults(result);
      } catch (error) {
        console.error('❌ BULLETPROOF AUTO-IMPORT: FAILED:', error);
        toast({
          title: "❌ Auto-Import Failed",
          description: "Check console for details",
          variant: "destructive"
        });
      }
    };

    runReliableImport();
  }, [autoImportRan, toast]);

  const handleManualImport = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: "Brak danych",
        description: "Wklej JSON z ChatGPT",
        variant: "destructive"
      });
      return;
    }

    setImporting(true);
    try {
      const parsedData = JSON.parse(jsonInput);
      const result = await batchImportSkillContent(parsedData);
      setResults(result);
      
      toast({
        title: result.successful > 0 ? "Import zakończony" : "Import nieudany",
        description: `${result.successful}/${result.totalProcessed} umiejętności zaimportowane`,
        variant: result.successful > 0 ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Błąd importu",
        description: error instanceof Error ? error.message : "Nieznany błąd",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const generatePrompts = async () => {
    setIsGeneratingPrompts(true);
    try {
      const { prompts, totalSkillsCount } = await generateChatGPTPrompts(selectedGroup);
      setGeneratedPrompts(prompts);
      setSkillCounts(totalSkillsCount);
      
      toast({
        title: "Prompt wygenerowany",
        description: `Grupa ${selectedGroup} zawiera ${Object.values(totalSkillsCount).reduce((a, b) => a + b, 0)} umiejętności`
      });
    } catch (error) {
      toast({
        title: "Błąd generowania",
        description: "Nie udało się wygenerować promptu",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Importu Treści Edukacyjnych</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chatgpt" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chatgpt">Import z ChatGPT</TabsTrigger>
              <TabsTrigger value="prompts">Generator Promptów</TabsTrigger>
            </TabsList>

            <TabsContent value="chatgpt" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">JSON z ChatGPT:</label>
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='Wklej JSON w formacie: {"contentDatabase": [...]}'
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <Button 
                  onClick={handleManualImport}
                  disabled={importing || !jsonInput.trim()}
                  className="w-full"
                >
                  {importing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Importowanie...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Importuj Dane z ChatGPT
                    </>
                  )}
                </Button>
              </div>

              {results && (
                <Card>
                  <CardHeader>
                    <CardTitle>Wyniki Importu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>Przetworzono: <strong>{results.totalProcessed}</strong></p>
                      <p>Sukces: <strong className="text-green-600">{results.successful}</strong></p>
                      <p>Błędy: <strong className="text-red-600">{results.failed}</strong></p>
                      
                      {results.details.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="font-medium">Szczegóły:</h4>
                          {results.details.map((detail, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {detail.result.success ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                              <span>{detail.skillName}</span>
                              {detail.result.error && (
                                <span className="text-red-500 text-xs">({detail.result.error})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="prompts" className="space-y-4">
              <div className="flex gap-4 items-end">
                <div>
                  <label className="text-sm font-medium">Grupa do wygenerowania:</label>
                  <Select value={selectedGroup.toString()} onValueChange={(v) => setSelectedGroup(parseInt(v))}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          Grupa {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={generatePrompts} disabled={isGeneratingPrompts}>
                  {isGeneratingPrompts ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generowanie...
                    </>
                  ) : (
                    "Generuj Prompt"
                  )}
                </Button>
              </div>

              {generatedPrompts.map((prompt, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {prompt.title}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(prompt.content)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Kopiuj
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                      {prompt.content}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchImportRunner;