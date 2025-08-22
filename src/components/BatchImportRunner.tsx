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
          "skillId": "4d938b03-bdea-4855-9701-178d82e22120",
          "skillName": "Dodawanie i odejmowanie liczb dziesiętnych (wyrównanie przecinka)",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Przy dodawaniu i odejmowaniu liczb dziesiętnych zawsze wyrównujemy przecinki w jednej kolumnie. Dopisujemy zera, aby liczby miały tyle samo miejsc po przecinku. Liczymy kolumna po kolumnie, pamiętając o przeniesieniu przy dodawaniu oraz o pożyczce przy odejmowaniu. Przecinek w wyniku stawiamy dokładnie pod przecinkami składników. Ta metoda działa dla małych i dużych liczb oraz ułatwia sprawdzenie poprawności wyniku.",
              "keyConceptsLaTex": ["$3,40+1,25=4,65$", "$5,0-0,75=4,25$", "$0,5=0,50$", "$Przen:9+7=16$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Dodawanie z dopisaniem zera",
                "problem": "Oblicz 2,7 + 0,35.",
                "solution": "1) Wyrównaj: 2,70 + 0,35.\n2) Dodaj setne: 0+5=5.\n3) Dodaj dziesiąte: 7+3=10 → wpisz 0, przeniesienie 1.\n4) Dodaj jedności: 2+0+1=3.\nWynik: 3,05.",
                "explanation": "Równa liczba miejsc po przecinku i przeniesienie zapewniają poprawny zapis.",
                "timeEstimate": 300
              },
              {
                "title": "Odejmowanie z pożyczką",
                "problem": "Oblicz 5,2 − 0,86.",
                "solution": "1) Wyrównaj: 5,20 − 0,86.\n2) Setne: 0−6 nie można, pożycz z dziesiątych: 10−6=4.\n3) Dziesiąte: (1 po pożyczce) 1−8 nie można, pożycz z jedności: 11−8=3.\n4) Jedności: 4−0=4.\nWynik: 4,34.",
                "explanation": "Pożyczka przechodzi między kolumnami dziesiętnych i jedności.",
                "timeEstimate": 300
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Oblicz: 1,5 + 2,35",
                "expectedAnswer": "3,85",
                "hints": ["Dopisz zero: 1,50", "Dodaj kolumnami"],
                "timeEstimate": 240
              },
              {
                "type": "intermediate",
                "problem": "Oblicz: 7,03 − 3,8",
                "expectedAnswer": "3,23",
                "hints": ["Wyrównaj: 7,03 − 3,80", "Pożyczka w dziesiątych"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Oblicz: 12,456 + 0,7 − 3,08",
                "expectedAnswer": "10,076",
                "hints": ["Ujednolic miejsca: 12,456 + 0,700 − 3,080", "Wykonaj po kolei"],
                "timeEstimate": 300
              }
            ]
          }
        },
        {
          "skillId": "1729d025-ecf4-45cb-819c-6147c8cda333",
          "skillName": "Dodawanie pisemne liczb naturalnych (z przeniesieniem)",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Dodawanie pisemne wykonujemy od prawej do lewej kolumny: jedności, dziesiątki, setki itd. Jeśli suma w kolumnie przekracza 9, wpisujemy cyfrę jedności, a dziesiątkę przenosimy do następnej kolumny. Przeniesienie dodajemy do sumy kolejnej kolumny. Ustaw liczby równo pod sobą, cyfry w tych samych rzędach wartości miejsc. Po skończeniu sprawdź wynik szacowaniem lub odejmowaniem odwrotnym.",
              "keyConceptsLaTex": ["$9+7=16$", "$Przen=1$", "$Suma=cyfra+przen$", "$0$ dodajemy gdy brak"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Proste dodawanie z jednym przeniesieniem",
                "problem": "Oblicz 478 + 256.",
                "solution": "Jedności: 8+6=14 → wpisz 4, przeniesienie 1.\nDziesiątki: 7+5+1=13 → wpisz 3, przeniesienie 1.\nSetki: 4+2+1=7.\nWynik: 734.",
                "explanation": "Systematyczne przeniesienia między kolumnami.",
                "timeEstimate": 240
              },
              {
                "title": "Różne długości liczb",
                "problem": "Oblicz 905 + 87.",
                "solution": "Ustaw 087 pod 905.\nJedności: 5+7=12 → 2, przeniesienie 1.\nDziesiątki: 0+8+1=9.\nSetki: 9+0=9.\nWynik: 992.",
                "explanation": "Dopisujemy zero na brakujące miejsca, aby wyrównać kolumny.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "376 + 249",
                "expectedAnswer": "625",
                "hints": ["Zacznij od jedności", "Pamiętaj o przeniesieniu"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "1205 + 798",
                "expectedAnswer": "2003",
                "hints": ["Wyrównaj do 4 cyfr", "Kolejne przeniesienia"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "4999 + 2756",
                "expectedAnswer": "7755",
                "hints": ["Seria przeniesień przez kolejne kolumny", "Sprawdź odejmowaniem"],
                "timeEstimate": 300
              }
            ]
          }
        }
      ]
    };

    console.log('🚀 BULLETPROOF AUTO-IMPORT: Starting...');
    setAutoImportRan(true);

    const runReliableImport = async () => {
      try {
        console.log('Old component disabled - using FixedBatchImportRunner instead');
        return;
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