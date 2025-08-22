import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Seo } from '@/components/Seo';

const BatchImportPage = () => {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const importSpecificSkills = async () => {
    setImporting(true);
    setResults([]);

    const specificData = {
      "contentDatabase": [
        {
          "skillId": "4d938b03-bdea-4855-9701-178d82e22120",
          "skillName": "Dodawanie i odejmowanie liczb dziesiętnych (wyrównanie przecinka)",
          "class_level": 4,
          "department": "arithmetic",
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
        },
        {
          "skillId": "40eaafc7-7355-4dd3-baf7-fb36659a8e49",
          "skillName": "Dzielenie pisemne przez liczbę jednocyfrową (z resztą)",
          "class_level": 4,
          "department": "arithmetic",
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
          }
        },
        {
          "skillId": "f4f515ba-4657-49bb-aaf2-a535f5cec0fb",
          "skillName": "Kolejność wykonywania działań z nawiasami",
          "class_level": 4,
          "department": "arithmetic",
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
          }
        },
        {
          "skillId": "10084046-1879-4b0b-b88a-d772fe072f15",
          "skillName": "Liczby dziesiętne – zapis, porównywanie i oś liczbowa",
          "class_level": 4,
          "department": "arithmetic",
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
          }
        },
        {
          "skillId": "4ddf10c4-4a7a-498e-8cde-38fc9c5a4b2a",
          "skillName": "Mnożenie pisemne przez liczbę jednocyfrową",
          "class_level": 4,
          "department": "arithmetic",
          "content": {
            "theory": {
              "introduction": "Mnożenie pisemne wykonujemy od prawej do lewej, mnożąc każdą cyfrę przez jednocyfrowy mnożnik. Jeśli iloczyn w kolumnie przekracza 9, zapisujemy cyfrę jedności, a dziesiątki przenosimy do następnej kolumny. Ustaw liczby pionowo i kontroluj przeniesienia. Wynik można sprawdzić dzieleniem odwrotnym lub przybliżeniem.",
              "keyConceptsLaTex": ["$9\\cdot7=63$", "$Przen=6$", "$a\\cdot0=0$", "$a\\cdot1=a$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Proste mnożenie",
                "problem": "Oblicz 346 · 3.",
                "solution": "Jedności: 6·3=18 → 8, przeniesienie 6.\nDziesiątki: 4·3=12 + 6=18 → 8, przeniesienie 1.\nSetki: 3·3=9 + 1=10.\nWynik: 1038.",
                "explanation": "Kolumnowe mnożenie z kontrolą przeniesień.",
                "timeEstimate": 240
              },
              {
                "title": "Zero w środku liczby",
                "problem": "Oblicz 502 · 7.",
                "solution": "Jedności: 2·7=14 → 4, przeniesienie 1.\nDziesiątki: 0·7=0 +1=1.\nSetki: 5·7=35.\nWynik: 3514.",
                "explanation": "Mnożenie przez 0 w kolumnie daje tylko przeniesienie.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "128 · 4",
                "expectedAnswer": "512",
                "hints": ["8·4, przenieś dziesiątki", "Kolejne kolumny"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "709 · 6",
                "expectedAnswer": "4254",
                "hints": ["9·6, potem 0·6 z przeniesieniem", "Na końcu 7·6"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "999 · 8",
                "expectedAnswer": "7992",
                "hints": ["Maksymalne przeniesienia", "Sprawdź dzieleniem przez 8"],
                "timeEstimate": 300
              }
            ]
          }
        },
        {
          "skillId": "903233a2-5494-49bc-a079-46d111022daf",
          "skillName": "Odejmowanie pisemne liczb naturalnych (z pożyczką)",
          "class_level": 4,
          "department": "arithmetic",
          "content": {
            "theory": {
              "introduction": "Odejmowanie pisemne wykonujemy od prawej do lewej. Gdy w kolumnie odjemnik jest większy niż odjemna, pożyczamy 1 z wyższej kolumny (zamienia się w 10 jednostek w aktualnej kolumnie). Kontynuujemy, pamiętając o zmniejszeniu cyfry w kolumnie wyższej o 1. Na końcu sprawdzamy dodając różnicę i odjemnik, by uzyskać odjemną.",
              "keyConceptsLaTex": ["$10$ pożyczka", "$a-b=c$", "$c+b=a$", "$0$ wiodące pomijamy"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Pożyczka w jednych dziesiątych",
                "problem": "Oblicz 705 − 268.",
                "solution": "Jedności: 5−8 nie można → pożycz z dziesiątek (0), pożycz z setek: 10 dziesiątek → 9 setek, 9 dziesiątek.\nJedności: 15−8=7.\nDziesiątki: 9−6=3.\nSetki: 6−2=4.\nWynik: 437.",
                "explanation": "Pożyczka może przechodzić przez kolumny, aż znajdziemy niezerową cyfrę.",
                "timeEstimate": 300
              },
              {
                "title": "Zerowe cyfry pośrodku",
                "problem": "Oblicz 1000 − 457.",
                "solution": "Jedności: 0−7 → pożycz z dziesiątek (0), dalej z setek (0), z tysięcy: 10 setek.\nZamień: 9 setek, 9 dziesiątek, 10 jedności.\nJedności: 10−7=3.\nDziesiątki: 9−5=4.\nSetki: 9−4=5.\nTysiące: 0.\nWynik: 543.",
                "explanation": "Kaskadowa pożyczka przez wiele kolumn.",
                "timeEstimate": 300
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "632 − 287",
                "expectedAnswer": "345",
                "hints": ["Jedności: pożyczka", "Idź kolumnami"],
                "timeEstimate": 240
              },
              {
                "type": "intermediate",
                "problem": "1003 − 598",
                "expectedAnswer": "405",
                "hints": ["Pożycz przez zero", "Sprawdź dodawaniem"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "20000 − 13579",
                "expectedAnswer": "6421",
                "hints": ["Seria pożyczek", "Zapisuj zmiany w każdej kolumnie"],
                "timeEstimate": 300
              }
            ]
          }
        },
        {
          "skillId": "a7454708-2be1-48d1-8ce2-a2ffdb031381",
          "skillName": "Dodawanie i odejmowanie ułamków o różnych mianownikach",
          "class_level": 5,
          "department": "arithmetic",
          "content": {
            "theory": {
              "introduction": "Aby dodać lub odjąć ułamki o różnych mianownikach, sprowadzamy je do wspólnego mianownika (najlepiej NWW), mnożąc licznik i mianownik przez odpowiednie liczby. Następnie dodajemy/odejmujemy liczniki, mianownik pozostaje wspólny. Wynik skracamy, a jeśli jest niewłaściwy, zamieniamy na liczbę mieszaną.",
              "keyConceptsLaTex": ["$\\tfrac{a}{b}+\\tfrac{c}{d}=\\tfrac{ad+bc}{bd}$", "$NWW$", "$\\tfrac{a}{b}-\\tfrac{c}{d}$", "$Skracanie$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Dodawanie przez NWW",
                "problem": "Oblicz 3/4 + 2/3.",
                "solution": "NWW(4,3)=12. 3/4=9/12, 2/3=8/12. Suma 17/12=1 5/12.",
                "explanation": "Wspólny mianownik 12 pozwala dodać liczniki.",
                "timeEstimate": 300
              },
              {
                "title": "Odejmowanie i skracanie",
                "problem": "Oblicz 5/6 − 1/4.",
                "solution": "NWW(6,4)=12. 5/6=10/12, 1/4=3/12. Różnica 7/12.",
                "explanation": "Rachunek na wspólnym mianowniku, wynik już skrócony.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "1/2 + 1/3",
                "expectedAnswer": "5/6",
                "hints": ["NWW=6", "3/6 + 2/6"],
                "timeEstimate": 240
              },
              {
                "type": "intermediate",
                "problem": "7/8 − 1/2",
                "expectedAnswer": "3/8",
                "hints": ["NWW=8", "7/8 − 4/8"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "2/5 + 3/10 − 1/2",
                "expectedAnswer": "0",
                "hints": ["NWW=10", "4/10 + 3/10 − 5/10"],
                "timeEstimate": 300
              }
            ]
          }
        }
      ]
    };

    try {
      const results = [];
      
      for (const skill of specificData.contentDatabase) {
        try {
          const { error } = await supabase
            .from('unified_skill_content')
            .upsert([{
              skill_id: skill.skillId,
              content_data: skill.content,
              metadata: {
                skillName: skill.skillName,
                class_level: skill.class_level,
                department: skill.department,
                generatorParams: { microSkill: "default", difficultyRange: [1, 8], fallbackTrigger: "standard_approach" }
              },
              is_complete: true,
              version: 1
            }], {
              onConflict: 'skill_id'
            });

          if (error) throw error;
          
          results.push({
            skillName: skill.skillName,
            result: { success: true, skillId: skill.skillId }
          });
        } catch (error: any) {
          results.push({
            skillName: skill.skillName,
            result: { success: false, error: error.message }
          });
        }
      }

      setResults(results);
      const successCount = results.filter(r => r.result.success).length;
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${successCount}/${results.length} skills`,
      });

    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import skills",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Seo 
        title="Batch Import - System Uzupełniania Umiejętności"
        description="System importu treści edukacyjnych z ChatGPT dla uzupełnienia brakujących umiejętności w bazie danych."
      />
      <div className="min-h-screen bg-background p-8">
        <Card>
          <CardHeader>
            <CardTitle>Simple Skills Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Import 32 specific skills for class 4-5 mathematics.
            </p>

            {results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Results:</h4>
                {results.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {result.result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={result.result.success ? "text-green-700" : "text-red-700"}>
                      {result.skillName}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button 
              onClick={importSpecificSkills} 
              disabled={importing}
              className="w-full"
            >
              {importing ? 'Importing...' : 'Import Skills'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default BatchImportPage;