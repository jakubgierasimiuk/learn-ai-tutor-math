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

  // UŻYJ SPRAWDZONEGO JSONA Z GODZINY 20:00 - AUTOMATYCZNY IMPORT
  React.useEffect(() => {
    const autoImportData = {
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
              "introduction": "Nierówność kwadratowa dotyczy wyrażenia $ax^2+bx+c$ i polega na wyznaczeniu zbioru $x$, dla których wartości wielomianu są $<,\\le,>,\\ge$ od zera.",
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
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Rozwiąż $x^2-1\\le0$.",
                "expectedAnswer": "[-1,1]",
                "hints": ["Różnica kwadratów", "Parabola a>0 – wartości ≤0 między zerami"],
                "timeEstimate": 240
              }
            ]
          },
          "pedagogicalNotes": {
            "commonMistakes": ["Mylenie kierunku znaków dla a<0"],
            "teachingTips": ["Zawsze szkicuj parabolę i zaznacz pierwiastki"],
            "prerequisites": ["Równania kwadratowe"]
          },
          "misconceptionPatterns": [
            {
              "pattern": "Założenie, że wynik zawsze jest przedziałem między zerami",
              "intervention": "Konfrontacja przypadków a<0 na wykresach"
            }
          ],
          "realWorldApplications": ["Zakresy dopuszczalne parametrów modeli"],
          "assessmentRubric": {
            "mastery": "Sprawnie buduje tabelę znaków i poprawnie zapisuje przedziały.",
            "proficient": "Drobne błędy w włączaniu końców, poprawna metoda.",
            "developing": "Myli kierunki i źle odczytuje znaki wielomianu."
          }
        },
        {
          "skillId": "6719fb54-526e-47de-90bf-3d14958a0347",
          "skillName": "Nierówności kwadratowe poziom 2",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8]},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900}},
          "content": {
            "theory": {"introduction": "Rozszerzone nierówności kwadratowe z parametrem.", "keyConceptsLaTex": ["$\\Delta=b^2-4ac$"], "timeEstimate": 180},
            "examples": [{"title": "Przykład", "problem": "Rozwiąż", "solution": "Rozwiązanie", "timeEstimate": 300}],
            "practiceExercises": [{"type": "basic", "problem": "Zadanie", "expectedAnswer": "Odpowiedź", "hints": ["Wskazówka"], "timeEstimate": 240}]
          },
          "pedagogicalNotes": {"commonMistakes": [], "teachingTips": [], "prerequisites": []},
          "misconceptionPatterns": [],
          "realWorldApplications": [],
          "assessmentRubric": {"mastery": "Opis"}
        },
        {
          "skillId": "182b2f32-2c43-4681-86cf-af98c6cbadbf",
          "skillName": "Planimetria – wielokąty i okręgi",
          "class_level": 2,
          "department": "geometria",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8]},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900}},
          "content": {
            "theory": {"introduction": "Planimetria bada własności figur płaskich.", "keyConceptsLaTex": ["$S=\\pi r^2$"], "timeEstimate": 180},
            "examples": [{"title": "Przykład", "problem": "Oblicz", "solution": "Wynik", "timeEstimate": 300}],
            "practiceExercises": [{"type": "basic", "problem": "Zadanie", "expectedAnswer": "Odpowiedź", "hints": ["Wskazówka"], "timeEstimate": 240}]
          },
          "pedagogicalNotes": {"commonMistakes": [], "teachingTips": [], "prerequisites": []},
          "misconceptionPatterns": [],
          "realWorldApplications": [],
          "assessmentRubric": {"mastery": "Opis"}
        },
        {
          "skillId": "ad44342d-dd96-47d3-9992-a627dc6e9ee9",
          "skillName": "Pochodna funkcji",
          "class_level": 3,
          "department": "analiza_matematyczna",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8]},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900}},
          "content": {
            "theory": {"introduction": "Pochodna mierzy chwilową szybkość zmian funkcji.", "keyConceptsLaTex": ["$f'(x)$"], "timeEstimate": 180},
            "examples": [{"title": "Przykład", "problem": "Oblicz pochodną", "solution": "f'(x)", "timeEstimate": 300}],
            "practiceExercises": [{"type": "basic", "problem": "Zadanie", "expectedAnswer": "Odpowiedź", "hints": ["Wskazówka"], "timeEstimate": 240}]
          },
          "pedagogicalNotes": {"commonMistakes": [], "teachingTips": [], "prerequisites": []},
          "misconceptionPatterns": [],
          "realWorldApplications": [],
          "assessmentRubric": {"mastery": "Opis"}
        },
        {
          "skillId": "c7a89cb6-c3b0-4eb5-bc02-3b7b30ca629a",
          "skillName": "Prawdopodobieństwo warunkowe",
          "class_level": 1,
          "department": "mathematics",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8]},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900}},
          "content": {
            "theory": {"introduction": "Prawdopodobieństwo warunkowe opisuje szansę zdarzenia A przy założeniu B.", "keyConceptsLaTex": ["$P(A|B)$"], "timeEstimate": 180},
            "examples": [{"title": "Przykład", "problem": "Oblicz", "solution": "Wynik", "timeEstimate": 300}],
            "practiceExercises": [{"type": "basic", "problem": "Zadanie", "expectedAnswer": "Odpowiedź", "hints": ["Wskazówka"], "timeEstimate": 240}]
          },
          "pedagogicalNotes": {"commonMistakes": [], "teachingTips": [], "prerequisites": []},
          "misconceptionPatterns": [],
          "realWorldApplications": [],
          "assessmentRubric": {"mastery": "Opis"}
        },
        {
          "skillId": "bd3df5f1-083b-4619-85b9-2bd4f98ed673",
          "skillName": "Równania i nierówności wielomianowe",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8]},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900}},
          "content": {
            "theory": {"introduction": "Wielomiany rozwiązujemy przez rozkład na czynniki.", "keyConceptsLaTex": ["$P(x)$"], "timeEstimate": 180},
            "examples": [{"title": "Przykład", "problem": "Rozwiąż", "solution": "Wynik", "timeEstimate": 300}],
            "practiceExercises": [{"type": "basic", "problem": "Zadanie", "expectedAnswer": "Odpowiedź", "hints": ["Wskazówka"], "timeEstimate": 240}]
          },
          "pedagogicalNotes": {"commonMistakes": [], "teachingTips": [], "prerequisites": []},
          "misconceptionPatterns": [],
          "realWorldApplications": [],
          "assessmentRubric": {"mastery": "Opis"}
        },
        {
          "skillId": "cafe8623-b48e-4298-81b8-306066247b31",
          "skillName": "Równania i nierówności z wartością bezwzględną",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8]},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900}},
          "content": {
            "theory": {"introduction": "Wartość bezwzględna to odległość od zera.", "keyConceptsLaTex": ["$|u|$"], "timeEstimate": 180},
            "examples": [{"title": "Przykład", "problem": "Rozwiąż", "solution": "Wynik", "timeEstimate": 300}],
            "practiceExercises": [{"type": "basic", "problem": "Zadanie", "expectedAnswer": "Odpowiedź", "hints": ["Wskazówka"], "timeEstimate": 240}]
          },
          "pedagogicalNotes": {"commonMistakes": [], "teachingTips": [], "prerequisites": []},
          "misconceptionPatterns": [],
          "realWorldApplications": [],
          "assessmentRubric": {"mastery": "Opis"}
        },
        {
          "skillId": "d03dc349-2398-4ecd-a407-4c7e3894b068",
          "skillName": "Równania i nierówności z wartością bezwzględną v2",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8]},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900}},
          "content": {
            "theory": {"introduction": "Rozwiązywanie równań z modułem.", "keyConceptsLaTex": ["$|u|$"], "timeEstimate": 180},
            "examples": [{"title": "Przykład", "problem": "Rozwiąż", "solution": "Wynik", "timeEstimate": 300}],
            "practiceExercises": [{"type": "basic", "problem": "Zadanie", "expectedAnswer": "Odpowiedź", "hints": ["Wskazówka"], "timeEstimate": 240}]
          },
          "pedagogicalNotes": {"commonMistakes": [], "teachingTips": [], "prerequisites": []},
          "misconceptionPatterns": [],
          "realWorldApplications": [],
          "assessmentRubric": {"mastery": "Opis"}
        },
        {
          "skillId": "f4360fe4-2882-4eaf-8528-d0ea7ecc023f",
          "skillName": "Równania kwadratowe",
          "class_level": 2,
          "department": "algebra",
          "generatorParams": {"microSkill": "default", "difficultyRange": [1, 8]},
          "teachingFlow": {"phase1": {"name": "Wprowadzenie", "duration": 900}},
          "content": {
            "theory": {"introduction": "Równanie kwadratowe ax²+bx+c=0.", "keyConceptsLaTex": ["$\\Delta$"], "timeEstimate": 180},
            "examples": [{"title": "Przykład", "problem": "Rozwiąż", "solution": "Wynik", "timeEstimate": 300}],
            "practiceExercises": [{"type": "basic", "problem": "Zadanie", "expectedAnswer": "Odpowiedź", "hints": ["Wskazówka"], "timeEstimate": 240}]
          },
          "pedagogicalNotes": {"commonMistakes": [], "teachingTips": [], "prerequisites": []},
          "misconceptionPatterns": [],
          "realWorldApplications": [],
          "assessmentRubric": {"mastery": "Opis"}
        }
      ]
    };

    const performAutoImport = async () => {
      console.log('🚀 AUTOMATIC IMPORT STARTING - Using proven method from 20:00');
      setImporting(true);
      
      try {
        const importResults = await batchImportSkillContent(autoImportData);
        setResults(importResults);
        
        toast({
          title: "Import zakończony automatycznie",
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
          <CardTitle>System Importu Batch - AUTOMATYCZNY IMPORT W TOKU</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              {importing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>🚀 Automatyczny import używając sprawdzonej metody z godziny 20:00...</span>
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