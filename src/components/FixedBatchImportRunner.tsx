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

  // NAPRAWIONY JSON - wszystkie 25 umiejętności z poprawnym class_level (bez backslash)
  useEffect(() => {
    if (autoImportRan) return;

    const COMPLETE_25_SKILLS_JSON = {
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
              "introduction": "Dzielenie pisemne to wielokrotne sprawdzanie, ile razy dzielnik mieści się w kolejnych częściach dzielnej. Przepisujemy kolejne cyfry, wyznaczamy cyfrę ilorazu, mnożymy przez dzielnik i odejmujemy. Gdy nie da się dalej, cyfra ilorazu to 0. Reszta to liczba mniejsza od dzielnika, która pozostaje po odjęciach. Zawsze zachodzi $a=bq+r$ oraz $0\\le r<b$.",
              "keyConceptsLaTex": ["$a=bq+r$", "$0\\le r<b$", "$36:5=7$ r.1", "$48:6=8$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Dzielenie z resztą",
                "problem": "Oblicz 53 : 4.",
                "solution": "1) 5:4=1, reszta 1, przepisz 3 → 13.\n2) 13:4=3, reszta 1.\nIloraz 13, reszta 1.\nSprawdz.: 4·13+1=53.",
                "explanation": "Korzystamy z zapisu $a=bq+r$ do weryfikacji.",
                "timeEstimate": 240
              },
              {
                "title": "Cyfra 0 w ilorazie",
                "problem": "Oblicz 406 : 5.",
                "solution": "4:5=0 (zapisz 0), przepisz 40.\n40:5=8, reszta 0, przepisz 6.\n6:5=1, reszta 1.\nWynik: 81 r.1.",
                "explanation": "Gdy część jest mniejsza od dzielnika, wpisujemy 0 i bierzemy kolejną cyfrę.",
                "timeEstimate": 300
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "75 : 3",
                "expectedAnswer": "25 r.0",
                "hints": ["3 mieści się w 7 dwa razy", "Sprawdź mnożeniem"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "92 : 7",
                "expectedAnswer": "13 r.1",
                "hints": ["7·13=91", "Reszta to 92−91"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "608 : 9",
                "expectedAnswer": "67 r.5",
                "hints": ["9·67=603", "Reszta < 9"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Błędy w dzieleniu"], "teachingTips": ["Sprawdzaj mnożeniem"], "prerequisites": ["Mnożenie"] },
          "misconceptionPatterns": [{ "pattern": "Błędne dzielenie", "intervention": "Ćwicz krok po kroku" }],
          "realWorldApplications": ["Dzielenie przedmiotów"],
          "assessmentRubric": { "mastery": "Poprawnie dzieli", "proficient": "Drobne błędy", "developing": "Błędy w algorytmie" }
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
              "introduction": "Obowiązuje porządek: najpierw działania w nawiasach, potem mnożenie i dzielenie od lewej do prawej, na końcu dodawanie i odejmowanie także od lewej. Nawias może zmienić naturalny wynik, dlatego pilnujemy ich hierarchii. Gdy jest kilka poziomów nawiasów, zaczynamy od najgłębszych. Stosuj linię pomocniczą i zaznaczaj wykonane etapy.",
              "keyConceptsLaTex": ["$(2+3)\\cdot4=20$", "$2+3\\cdot4=14$", "$8:(2+2)=2$", "$(10-6)+1=5$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Nawias zmienia wynik",
                "problem": "Oblicz: (7−2)·3 + 4.",
                "solution": "1) Nawias: 5·3 + 4.\n2) Mnożenie: 15 + 4.\n3) Dodawanie: 19.",
                "explanation": "Najpierw nawias, potem mnożenie, na końcu dodawanie.",
                "timeEstimate": 240
              },
              {
                "title": "Mieszane działania",
                "problem": "Oblicz: 18 − 6 : 3 + 2·5.",
                "solution": "1) Dzielenie: 18 − 2 + 2·5.\n2) Mnożenie: 18 − 2 + 10.\n3) Od lewej: 16 + 10 = 26.",
                "explanation": "Brak nawiasów: dzielenie i mnożenie przed dodawaniem/odejmowaniem.",
                "timeEstimate": 300
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "(4+3)·2",
                "expectedAnswer": "14",
                "hints": ["Najpierw nawias", "Potem mnożenie"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "20 − 8 : 2 + 3",
                "expectedAnswer": "19",
                "hints": ["Policz 8:2", "Następnie od lewej"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "6 + (12 − 4·2) : 2",
                "expectedAnswer": "6",
                "hints": ["Najpierw 4·2", "Potem nawias, na końcu dzielenie i dodawanie"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Błędna kolejność"], "teachingTips": ["Pamiętaj o hierarchii"], "prerequisites": ["Działania podstawowe"] },
          "misconceptionPatterns": [{ "pattern": "Ignorowanie nawiasów", "intervention": "Ćwicz krok po kroku" }],
          "realWorldApplications": ["Obliczenia matematyczne"],
          "assessmentRubric": { "mastery": "Poprawna kolejność", "proficient": "Drobne błędy", "developing": "Błędna hierarchia" }
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
              "introduction": "Liczby dziesiętne zapisujemy z przecinkiem. Każde miejsce po przecinku to część dziesiętna, setna, tysięczna itd. Porównujemy liczby, wyrównując liczbę miejsc po przecinku przez dopisanie zer. Na osi liczbowej liczby rosną w prawo; zaznaczamy je w odpowiednich miejscach, dzieląc odcinki na równe części.",
              "keyConceptsLaTex": ["$3,45=3+45/100$", "$2,5=2,50$", "$3,4<3,5$", "$|b-a|$ odległość"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Porównywanie",
                "problem": "Która liczba większa: 2,7 czy 2,65?",
                "solution": "Wyrównaj: 2,70 i 2,65. Większa jest 2,70.",
                "explanation": "Dopisanie zera nie zmienia wartości, ułatwia porównanie.",
                "timeEstimate": 240
              },
              {
                "title": "Zaznaczanie na osi",
                "problem": "Zaznacz 1,25 na osi od 1 do 2.",
                "solution": "Podziel odcinek [1;2] na 100 części. 1,25 to 25 setnych za 1, czyli 1/4 odcinka.",
                "explanation": "Setne to sto równych części jedności.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Porównaj: 0,5 i 0,45",
                "expectedAnswer": "0,5 > 0,45",
                "hints": ["Wyrównaj: 0,50 i 0,45", "Porównaj cyfry"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Wstaw brakującą: 3,1 __ 3,09",
                "expectedAnswer": ">",
                "hints": ["3,10 i 3,09", "Porównaj dziesiąte i setne"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Ile wynosi odległość między 2,03 a 1,9?",
                "expectedAnswer": "0,13",
                "hints": ["2,03 − 1,90", "Wyrównaj miejsca po przecinku"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Błędne porównywanie"], "teachingTips": ["Wyrównuj miejsca"], "prerequisites": ["Liczby dziesiętne"] },
          "misconceptionPatterns": [{ "pattern": "Błędne porównywanie", "intervention": "Ćwicz wyrównywanie" }],
          "realWorldApplications": ["Pomiary precyzyjne"],
          "assessmentRubric": { "mastery": "Poprawnie porównuje", "proficient": "Drobne błędy", "developing": "Błędne porównywanie" }
        }
      ]
    };

    console.log('🚀 IMPORTING WSZYSTKICH 25 UMIEJĘTNOŚCI (NAPRAWIONY JSON)...');
    setAutoImportRan(true);

    const runCompleteImport = async () => {
      try {
        const result = await batchImportSkillContent(COMPLETE_25_SKILLS_JSON);
        console.log('✅ COMPLETE IMPORT SUCCESS!', result);
        
        toast({
          title: "✅ Import Complete!",
          description: `Successfully imported ${result.successful}/${result.totalProcessed} skills`,
        });
        
        setResults(result);
      } catch (error) {
        console.error('❌ COMPLETE IMPORT FAILED:', error);
        toast({
          title: "❌ Import Failed",
          description: "Check console for details",
          variant: "destructive"
        });
      }
    };

    runCompleteImport();
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