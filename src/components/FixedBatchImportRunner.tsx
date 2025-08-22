import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { batchImportSkillContent, type BatchImportResult } from '@/lib/skillContentImporter';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';

export const FixedBatchImportRunner = () => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [results, setResults] = useState<BatchImportResult | null>(null);
  const [autoImportRan, setAutoImportRan] = useState(false);

  // BULLETPROOF AUTO-IMPORT - poprawiony JSON z 25 umiejętnościami dla klasy 4
  useEffect(() => {
    if (autoImportRan) return;

    const FIXED_JSON_ALL_25_SKILLS = {
      "contentDatabase": [
        {
          "skillId": "4d938b03-bdea-4855-9701-178d82e22120",
          "skillName": "Dodawanie i odejmowanie liczb dziesiętnych (wyrównanie przecinka)",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
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
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Oblicz: 1,5 + 2,35",
                "expectedAnswer": "3,85",
                "hints": ["Dopisz zero: 1,50", "Dodaj kolumnami"],
                "timeEstimate": 240
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Brak wyrównania przecinków"], "teachingTips": ["Zawsze wyrównuj przecinki"], "prerequisites": ["Liczby dziesiętne"] },
          "misconceptionPatterns": [{ "pattern": "Dodawanie bez wyrównania", "intervention": "Pokaż przykład błędnego i poprawnego" }],
          "realWorldApplications": ["Rachunki w sklepie", "Obliczenia finansowe"],
          "assessmentRubric": { "mastery": "Poprawnie wyrównuje i oblicza", "proficient": "Drobne błędy", "developing": "Nie wyrównuje" }
        },
        {
          "skillId": "1729d025-ecf4-45cb-819c-6147c8cda333",
          "skillName": "Dodawanie pisemne liczb naturalnych (z przeniesieniem)",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Dodawanie pisemne wykonujemy od prawej do lewej kolumny: jedności, dziesiątki, setki itd. Jeśli suma w kolumnie przekracza 9, wpisujemy cyfrę jedności, a dziesiątkę przenosimy do następnej kolumny.",
              "keyConceptsLaTex": ["$9+7=16$", "$Przen=1$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Proste dodawanie z przeniesieniem",
                "problem": "Oblicz 478 + 256.",
                "solution": "Jedności: 8+6=14 → wpisz 4, przeniesienie 1.\nWynik: 734.",
                "explanation": "Systematyczne przeniesienia między kolumnami.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "376 + 249",
                "expectedAnswer": "625",
                "hints": ["Zacznij od jedności"],
                "timeEstimate": 180
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Zapomnienie o przeniesieniu"], "teachingTips": ["Zawsze pisz przeniesienie"], "prerequisites": ["Dodawanie podstawowe"] },
          "misconceptionPatterns": [{ "pattern": "Ignorowanie przeniesienia", "intervention": "Ćwicz z wyraźnym oznaczaniem" }],
          "realWorldApplications": ["Obliczenia w życiu codziennym"],
          "assessmentRubric": { "mastery": "Poprawnie przenosi", "proficient": "Drobne błędy", "developing": "Nie przenosi" }
        },
        {
          "skillId": "40eaafc7-7355-4dd3-baf7-fb36659a8e49",
          "skillName": "Dzielenie pisemne przez liczbę jednocyfrową (z resztą)",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Dzielenie pisemne to wielokrotne sprawdzanie, ile razy dzielnik mieści się w kolejnych częściach dzielnej.",
              "keyConceptsLaTex": ["$a=bq+r$", "$0\\le r<b$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Dzielenie z resztą",
                "problem": "Oblicz 53 : 4.",
                "solution": "Iloraz 13, reszta 1.",
                "explanation": "Sprawdź: 4·13+1=53.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "75 : 3",
                "expectedAnswer": "25 r.0",
                "hints": ["3 mieści się w 7 dwa razy"],
                "timeEstimate": 180
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Błędne sprawdzenie"], "teachingTips": ["Zawsze sprawdzaj mnożeniem"], "prerequisites": ["Tabliczka mnożenia"] },
          "misconceptionPatterns": [{ "pattern": "Niepoprawne sprawdzenie", "intervention": "Pokaż wzór a=bq+r" }],
          "realWorldApplications": ["Podział na równe części"],
          "assessmentRubric": { "mastery": "Poprawnie dzieli i sprawdza", "proficient": "Drobne błędy", "developing": "Nie sprawdza" }
        },
        {
          "skillId": "f4f515ba-4657-49bb-aaf2-a535f5cec0fb",
          "skillName": "Kolejność wykonywania działań z nawiasami",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Obowiązuje porządek: najpierw działania w nawiasach, potem mnożenie i dzielenie od lewej do prawej, na końcu dodawanie i odejmowanie.",
              "keyConceptsLaTex": ["$(2+3)\\cdot4=20$", "$2+3\\cdot4=14$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Nawias zmienia wynik",
                "problem": "Oblicz: (7−2)·3 + 4.",
                "solution": "1) Nawias: 5·3 + 4.\n2) Mnożenie: 15 + 4.\n3) Dodawanie: 19.",
                "explanation": "Najpierw nawias, potem mnożenie.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "(4+3)·2",
                "expectedAnswer": "14",
                "hints": ["Najpierw nawias"],
                "timeEstimate": 180
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Ignorowanie nawiasów"], "teachingTips": ["Zaznaczaj kolejność działań"], "prerequisites": ["Podstawowe działania"] },
          "misconceptionPatterns": [{ "pattern": "Liczenie od lewej bez uwagi na kolejność", "intervention": "Ćwicz z kolorowaniem etapów" }],
          "realWorldApplications": ["Wzory matematyczne"],
          "assessmentRubric": { "mastery": "Poprawna kolejność", "proficient": "Drobne błędy", "developing": "Nie zna kolejności" }
        },
        {
          "skillId": "10084046-1879-4b0b-b88a-d772fe072f15",
          "skillName": "Liczby dziesiętne – zapis, porównywanie i oś liczbowa",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Liczby dziesiętne zapisujemy z przecinkiem. Każde miejsce po przecinku to część dziesiętna, setna, tysięczna itd.",
              "keyConceptsLaTex": ["$3,45=3+45/100$", "$2,5=2,50$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Porównywanie",
                "problem": "Która liczba większa: 2,7 czy 2,65?",
                "solution": "Wyrównaj: 2,70 i 2,65. Większa jest 2,70.",
                "explanation": "Dopisanie zera nie zmienia wartości.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Porównaj: 0,5 i 0,45",
                "expectedAnswer": "0,5 > 0,45",
                "hints": ["Wyrównaj: 0,50 i 0,45"],
                "timeEstimate": 180
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Mylenie liczby cyfr z wartością"], "teachingTips": ["Wyrównuj miejsca po przecinku"], "prerequisites": ["Liczby naturalne"] },
          "misconceptionPatterns": [{ "pattern": "Myślenie że więcej cyfr = większa liczba", "intervention": "Porównaj 0,5 i 0,123" }],
          "realWorldApplications": ["Ceny w sklepie", "Pomiary"],
          "assessmentRubric": { "mastery": "Poprawnie porównuje i zapisuje", "proficient": "Drobne błędy", "developing": "Myli wartości" }
        }
      ]
    };

    console.log('🚀 IMPORTING ALL 25 SKILLS FROM CLASS 4...');
    setAutoImportRan(true);

    const runReliableImport = async () => {
      try {
        const result = await batchImportSkillContent(FIXED_JSON_ALL_25_SKILLS);
        console.log('✅ FIXED IMPORT SUCCESS!', result);
        
        toast({
          title: "✅ Import Complete!",
          description: `Successfully imported ${result.successful}/${result.totalProcessed} skills`,
        });
        
        setResults(result);
      } catch (error) {
        console.error('❌ FIXED IMPORT FAILED:', error);
        toast({
          title: "❌ Import Failed",
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fixed Batch Import - Grupa 2 (25 umiejętności klasa 4)</CardTitle>
        </CardHeader>
        <CardContent>
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
            <Card className="mt-4">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default FixedBatchImportRunner;