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

  // WSZYSTKIE 25 UMIEJĘTNOŚCI Z POPRAWNYM JSON
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
        },
        {
          "skillId": "67890123-4567-8901-2345-678901234567",
          "skillName": "Mnożenie pisemne liczb naturalnych",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Mnożenie pisemne polega na rozkładzie jednego z czynników na dziesiątki, setki itp. i mnożeniu każdej części przez drugi czynnik. Wyniki częściowe zapisujemy jeden pod drugim, odpowiednio przesunięte, a następnie dodajemy. Każda linia odpowiada mnożeniu przez jedną cyfrę mnożnika, uwzględniając jej wartość miejscową.",
              "keyConceptsLaTex": ["$23×45=23×40+23×5$", "$23×5=115$", "$23×40=920$", "$115+920=1035$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Mnożenie dwucyfrowe",
                "problem": "Oblicz 23 × 45.",
                "solution": "1) 23 × 5 = 115\n2) 23 × 40 = 920 (przesunięcie o 1 miejsce)\n3) 115 + 920 = 1035",
                "explanation": "Rozkładamy 45 = 40 + 5 i mnożymy oddzielnie.",
                "timeEstimate": 300
              },
              {
                "title": "Mnożenie z zerami",
                "problem": "Oblicz 206 × 34.",
                "solution": "1) 206 × 4 = 824\n2) 206 × 30 = 6180\n3) 824 + 6180 = 7004",
                "explanation": "Zero w środku nie wpływa na algorytm.",
                "timeEstimate": 360
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "34 × 12",
                "expectedAnswer": "408",
                "hints": ["34 × 2 = 68", "34 × 10 = 340", "68 + 340"],
                "timeEstimate": 240
              },
              {
                "type": "intermediate",
                "problem": "156 × 23",
                "expectedAnswer": "3588",
                "hints": ["156 × 3 = 468", "156 × 20 = 3120"],
                "timeEstimate": 300
              },
              {
                "type": "advanced",
                "problem": "304 × 207",
                "expectedAnswer": "62928",
                "hints": ["Uważaj na zera", "Dokładnie przesuń linie"],
                "timeEstimate": 360
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Błędne przesunięcia"], "teachingTips": ["Uważaj na miejsca zerowe"], "prerequisites": ["Tabliczka mnożenia"] },
          "misconceptionPatterns": [{ "pattern": "Brak przesunięcia", "intervention": "Pokazuj wartości miejscowe" }],
          "realWorldApplications": ["Obliczenia powierzchni"],
          "assessmentRubric": { "mastery": "Poprawne przesunięcia", "proficient": "Drobne błędy", "developing": "Błędny algorytm" }
        },
        {
          "skillId": "78901234-5678-9012-3456-789012345678",
          "skillName": "Odejmowanie pisemne liczb naturalnych (z pożyczką)",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Odejmowanie pisemne wykonujemy kolumna po kolumnie od prawej. Gdy cyfra odjemnej jest większa od cyfry odjemnika, pożyczamy 10 z sąsiedniej kolumny. Pożyczona 10 dodaje się do bieżącej cyfry, a z kolumny, z której pożyczyliśmy, odejmujemy 1. Proces kontynuujemy aż do zakończenia wszystkich kolumn.",
              "keyConceptsLaTex": ["$12-8=4$", "$Pożyczka: 10+2-8$", "$524-167=357$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Odejmowanie z jedną pożyczką",
                "problem": "Oblicz 524 - 167.",
                "solution": "1) Jedności: 4-7 nie można, pożycz: 14-7=7\n2) Dziesiątki: (2-1)-6=1-6, pożycz: 11-6=5\n3) Setki: (5-1)-1=4-1=3\nWynik: 357",
                "explanation": "Pożyczka przechodzi między kolumnami.",
                "timeEstimate": 300
              },
              {
                "title": "Odejmowanie z zerami",
                "problem": "Oblicz 500 - 234.",
                "solution": "1) 0-4: pożycz z dziesiątek (ale są 0)\n2) Pożycz z setek: 5→4, 0→10\n3) 10-3=7 (dziesiątki), pożycz dla jedności: 9\n4) 10-4=6 (jedności)\nWynik: 266",
                "explanation": "Pożyczka może przechodzić przez kilka zer.",
                "timeEstimate": 360
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "83 - 47",
                "expectedAnswer": "36",
                "hints": ["3-7: pożycz", "13-7=6, 7-4=3"],
                "timeEstimate": 240
              },
              {
                "type": "intermediate",
                "problem": "603 - 247",
                "expectedAnswer": "356",
                "hints": ["Pożyczka przez zero", "600→599→593"],
                "timeEstimate": 300
              },
              {
                "type": "advanced",
                "problem": "1000 - 456",
                "expectedAnswer": "544",
                "hints": ["Seria pożyczek przez zera", "1000→999→994"],
                "timeEstimate": 360
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Zapominanie o pożyczce"], "teachingTips": ["Sprawdzaj dodawaniem"], "prerequisites": ["Dodawanie"] },
          "misconceptionPatterns": [{ "pattern": "Brak pożyczki", "intervention": "Wizualizuj regrupowanie" }],
          "realWorldApplications": ["Obliczenia reszty"],
          "assessmentRubric": { "mastery": "Poprawne pożyczki", "proficient": "Drobne błędy", "developing": "Błędny algorytm" }
        },
        {
          "skillId": "89012345-6789-0123-4567-890123456789",
          "skillName": "Mnożenie i dzielenie liczb dziesiętnych przez 10, 100, 1000",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Przy mnożeniu przez 10, 100, 1000 przesuwamy przecinek w prawo o tyle miejsc, ile zer ma mnożnik. Przy dzieleniu przesuwamy przecinek w lewo. Jeśli brakuje cyfr, dopisujemy zera. Ta reguła wynika z systemu dziesiętnego - każde przesunięcie o jedno miejsce oznacza mnożenie/dzielenie przez 10.",
              "keyConceptsLaTex": ["$3,45×10=34,5$", "$3,45×100=345$", "$34,5÷10=3,45$", "$34÷100=0,34$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Mnożenie przez potęgi 10",
                "problem": "Oblicz 2,37 × 100.",
                "solution": "Przesuń przecinek o 2 miejsca w prawo: 2,37 → 237",
                "explanation": "100 ma dwa zera, więc przesuwamy o 2 miejsca.",
                "timeEstimate": 240
              },
              {
                "title": "Dzielenie przez potęgi 10",
                "problem": "Oblicz 456 ÷ 1000.",
                "solution": "Przesuń przecinek o 3 miejsca w lewo: 456 → 0,456",
                "explanation": "1000 ma trzy zera, dopisujemy zero przed liczką.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "1,5 × 10",
                "expectedAnswer": "15",
                "hints": ["Przesuń przecinek w prawo", "Jeden zero = jedno miejsce"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "67 ÷ 100",
                "expectedAnswer": "0,67",
                "hints": ["Przesuń w lewo o 2 miejsca", "Dopisz zero przed liczbą"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "0,08 × 1000",
                "expectedAnswer": "80",
                "hints": ["Trzy miejsca w prawo", "0,08 → 0,080 → 80"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Błędny kierunek przesuwania"], "teachingTips": ["Mnożenie = w prawo, dzielenie = w lewo"], "prerequisites": ["Liczby dziesiętne"] },
          "misconceptionPatterns": [{ "pattern": "Mylenie kierunków", "intervention": "Ćwicz z konkretami" }],
          "realWorldApplications": ["Przeliczniki jednostek"],
          "assessmentRubric": { "mastery": "Poprawny kierunek", "proficient": "Drobne błędy", "developing": "Myli kierunki" }
        },
        {
          "skillId": "90123456-7890-1234-5678-901234567890",
          "skillName": "Ułamki zwykłe – pojęcie, skracanie i rozszerzanie",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Ułamek zwykły to zapis części całości. Licznik pokazuje ile części mamy, mianownik - na ile części podzielono całość. Skracamy przez dzielenie licznika i mianownika przez ich największy wspólny dzielnik. Rozszerzamy przez mnożenie obu przez tę samą liczbę (różną od zera). Ułamek nieskracalny ma NWD(licznik,mianownik) = 1.",
              "keyConceptsLaTex": ["$\\frac{a}{b}$", "$\\frac{6}{8}=\\frac{3}{4}$", "$\\frac{2}{3}=\\frac{4}{6}$", "$NWD(a,b)$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Skracanie ułamka",
                "problem": "Skróć ułamek 12/18.",
                "solution": "NWD(12,18) = 6\n12÷6 = 2, 18÷6 = 3\nWynik: 2/3",
                "explanation": "Dzielimy licznik i mianownik przez ich NWD.",
                "timeEstimate": 240
              },
              {
                "title": "Rozszerzanie ułamka",
                "problem": "Rozszerz 3/4 do mianownika 20.",
                "solution": "20 ÷ 4 = 5\n3 × 5 = 15, 4 × 5 = 20\nWynik: 15/20",
                "explanation": "Mnożymy licznik i mianownik przez 5.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Skróć: 6/9",
                "expectedAnswer": "2/3",
                "hints": ["NWD(6,9) = 3", "6÷3 = 2, 9÷3 = 3"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Rozszerz 2/5 do mianownika 15",
                "expectedAnswer": "6/15",
                "hints": ["15 ÷ 5 = 3", "Pomnóż licznik i mianownik przez 3"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Skróć do postaci nieskracalnej: 24/36",
                "expectedAnswer": "2/3",
                "hints": ["NWD(24,36) = 12", "24÷12 = 2, 36÷12 = 3"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Błędne znajdowanie NWD"], "teachingTips": ["Używaj algorytmu Euklidesa"], "prerequisites": ["Dzielniki i wielokrotności"] },
          "misconceptionPatterns": [{ "pattern": "Skracanie tylko licznika", "intervention": "Podkreśl: oba na raz" }],
          "realWorldApplications": ["Przepisy kulinarne"],
          "assessmentRubric": { "mastery": "Poprawnie skraca/rozszerza", "proficient": "Drobne błędy", "developing": "Błędne operacje" }
        },
        {
          "skillId": "01234567-8901-2345-6789-012345678901",
          "skillName": "Dodawanie i odejmowanie ułamków o różnych mianownikach",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Aby dodać lub odjąć ułamki o różnych mianownikach, najpierw sprowadzamy je do wspólnego mianownika. Znajdujemy najmniejszą wspólną wielokrotność mianowników (NWW), rozszerzamy oba ułamki do tego mianownika, a następnie dodajemy/odejmujemy liczniki. Wynik skracamy do postaci nieskracalnej.",
              "keyConceptsLaTex": ["$\\frac{a}{b}±\\frac{c}{d}=\\frac{ad±bc}{bd}$", "$NWW(b,d)$", "$\\frac{1}{3}+\\frac{1}{4}=\\frac{7}{12}$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Dodawanie ułamków",
                "problem": "Oblicz 1/3 + 1/4.",
                "solution": "NWW(3,4) = 12\n1/3 = 4/12, 1/4 = 3/12\n4/12 + 3/12 = 7/12",
                "explanation": "Wspólny mianownik pozwala dodać liczniki.",
                "timeEstimate": 300
              },
              {
                "title": "Odejmowanie ułamków",
                "problem": "Oblicz 5/6 - 1/4.",
                "solution": "NWW(6,4) = 12\n5/6 = 10/12, 1/4 = 3/12\n10/12 - 3/12 = 7/12",
                "explanation": "Rozszerzamy do wspólnego mianownika.",
                "timeEstimate": 300
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "1/2 + 1/3",
                "expectedAnswer": "5/6",
                "hints": ["NWW(2,3) = 6", "3/6 + 2/6 = 5/6"],
                "timeEstimate": 240
              },
              {
                "type": "intermediate",
                "problem": "3/4 - 1/6",
                "expectedAnswer": "7/12",
                "hints": ["NWW(4,6) = 12", "9/12 - 2/12"],
                "timeEstimate": 300
              },
              {
                "type": "advanced",
                "problem": "2/3 + 3/8 - 1/4",
                "expectedAnswer": "19/24",
                "hints": ["NWW(3,8,4) = 24", "16/24 + 9/24 - 6/24"],
                "timeEstimate": 360
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Dodawanie mianowników"], "teachingTips": ["Wspólny mianownik to klucz"], "prerequisites": ["NWW, rozszerzanie ułamków"] },
          "misconceptionPatterns": [{ "pattern": "Dodawanie poziomo", "intervention": "Pokazuj wizualnie części całości" }],
          "realWorldApplications": ["Dzielenie czasu"],
          "assessmentRubric": { "mastery": "Poprawny wspólny mianownik", "proficient": "Drobne błędy", "developing": "Nie znajduje NWW" }
        },
        {
          "skillId": "12345678-9012-3456-7890-123456789012",
          "skillName": "Mnożenie ułamków zwykłych",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Mnożenie ułamków to mnożenie liczników przez siebie i mianowników przez siebie. Przed mnożeniem warto skrócić na krzyż - dzielić licznik jednego ułamka z mianownikiem drugiego przez ich wspólny dzielnik. To upraszcza obliczenia i daje od razu wynik w postaci nieskracalnej.",
              "keyConceptsLaTex": ["$\\frac{a}{b}×\\frac{c}{d}=\\frac{a×c}{b×d}$", "$\\frac{2}{3}×\\frac{4}{5}=\\frac{8}{15}$", "Skracanie: $\\frac{2}{9}×\\frac{3}{4}=\\frac{1}{6}$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Proste mnożenie",
                "problem": "Oblicz 2/3 × 4/5.",
                "solution": "2×4 = 8, 3×5 = 15\nWynik: 8/15",
                "explanation": "Mnożymy liczniki i mianowniki osobno.",
                "timeEstimate": 240
              },
              {
                "title": "Mnożenie ze skracaniem",
                "problem": "Oblicz 2/9 × 3/4.",
                "solution": "Skróć na krzyż: 2 i 4 przez 2, 3 i 9 przez 3\n1/3 × 1/4 = 1/12",
                "explanation": "Skracanie przed mnożeniem upraszcza.",
                "timeEstimate": 300
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "1/4 × 2/3",
                "expectedAnswer": "2/12 = 1/6",
                "hints": ["1×2 = 2, 4×3 = 12", "Skróć wynik"],
                "timeEstimate": 240
              },
              {
                "type": "intermediate",
                "problem": "3/8 × 4/9",
                "expectedAnswer": "1/6",
                "hints": ["Skróć przed mnożeniem", "3 i 9, oraz 4 i 8"],
                "timeEstimate": 300
              },
              {
                "type": "advanced",
                "problem": "6/25 × 15/18 × 2/3",
                "expectedAnswer": "1/5",
                "hints": ["Skracaj stopniowo", "Znajdź wspólne dzielniki"],
                "timeEstimate": 360
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Mnożenie mianowników jak przy dodawaniu"], "teachingTips": ["Skracaj przed mnożeniem"], "prerequisites": ["Skracanie ułamków"] },
          "misconceptionPatterns": [{ "pattern": "Błędne mnożenie", "intervention": "Wizualizuj jako części części" }],
          "realWorldApplications": ["Obliczanie części kwoty"],
          "assessmentRubric": { "mastery": "Skraca przed mnożeniem", "proficient": "Poprawnie mnoży", "developing": "Błędy w algorytmie" }
        },
        {
          "skillId": "23456789-0123-4567-8901-234567890123",
          "skillName": "Dzielenie ułamków zwykłych",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Dzielenie przez ułamek to mnożenie przez ułamek odwrotny. Ułamek odwrotny do a/b to b/a (zamieniamy miejscami licznik z mianownikiem). Dzielenie a/b ÷ c/d = a/b × d/c. Po zamianie na mnożenie stosujemy zasady mnożenia ułamków, włącznie ze skracaniem na krzyż.",
              "keyConceptsLaTex": ["$\\frac{a}{b}÷\\frac{c}{d}=\\frac{a}{b}×\\frac{d}{c}$", "$\\frac{2}{3}÷\\frac{4}{5}=\\frac{2}{3}×\\frac{5}{4}=\\frac{10}{12}$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Dzielenie ułamków",
                "problem": "Oblicz 2/3 ÷ 4/5.",
                "solution": "2/3 ÷ 4/5 = 2/3 × 5/4\n2×5 = 10, 3×4 = 12\nWynik: 10/12 = 5/6",
                "explanation": "Dzielenie zamieniamy na mnożenie przez odwrotność.",
                "timeEstimate": 300
              },
              {
                "title": "Dzielenie ze skracaniem",
                "problem": "Oblicz 6/8 ÷ 9/4.",
                "solution": "6/8 × 4/9\nSkróć: 6 i 9 przez 3, 8 i 4 przez 4\n2/2 × 1/9 = 2/18 = 1/9",
                "explanation": "Skracanie ułatwia obliczenia.",
                "timeEstimate": 360
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "1/2 ÷ 3/4",
                "expectedAnswer": "2/3",
                "hints": ["1/2 × 4/3", "1×4 = 4, 2×3 = 6"],
                "timeEstimate": 240
              },
              {
                "type": "intermediate",
                "problem": "3/5 ÷ 2/7",
                "expectedAnswer": "21/10",
                "hints": ["3/5 × 7/2", "Odwrotność 2/7 to 7/2"],
                "timeEstimate": 300
              },
              {
                "type": "advanced",
                "problem": "8/15 ÷ 4/9",
                "expectedAnswer": "6/5",
                "hints": ["8/15 × 9/4", "Skróć 8 i 4, oraz 15 i 9"],
                "timeEstimate": 360
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Zapomnienie o odwracaniu"], "teachingTips": ["Pamiętaj: dzielenie = mnożenie przez odwrotność"], "prerequisites": ["Mnożenie ułamków"] },
          "misconceptionPatterns": [{ "pattern": "Dzielenie liczników i mianowników", "intervention": "Ćwicz znajdowanie odwrotności" }],
          "realWorldApplications": ["Dzielenie na równe części"],
          "assessmentRubric": { "mastery": "Poprawnie odwraca", "proficient": "Drobne błędy", "developing": "Nie odwraca" }
        },
        {
          "skillId": "34567890-1234-5678-9012-345678901234",
          "skillName": "Zamiana ułamków zwykłych na dziesiętne i odwrotnie",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Ułamek zwykły zamieniamy na dziesiętny przez dzielenie licznika przez mianownik. Ułamek dziesiętny na zwykły: zapisujemy bez przecinka w liczniku, w mianowniku 10, 100, 1000... (tyle zer ile miejsc po przecinku), następnie skracamy. Niektóre ułamki dają rozwinięcia skończone, inne - nieskończone okresowe.",
              "keyConceptsLaTex": ["$\\frac{3}{4}=0,75$", "$0,6=\\frac{6}{10}=\\frac{3}{5}$", "$\\frac{1}{3}=0,333...$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Ułamek zwykły na dziesiętny",
                "problem": "Zamień 3/4 na ułamek dziesiętny.",
                "solution": "3 ÷ 4 = 0,75",
                "explanation": "Dzielenie licznika przez mianownik.",
                "timeEstimate": 240
              },
              {
                "title": "Ułamek dziesiętny na zwykły",
                "problem": "Zamień 0,25 na ułamek zwykły.",
                "solution": "0,25 = 25/100 = 1/4",
                "explanation": "Dwa miejsca po przecinku = mianownik 100.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Zamień 1/2 na dziesiętny",
                "expectedAnswer": "0,5",
                "hints": ["1 ÷ 2", "Dzielenie pisemne"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Zamień 0,8 na ułamek zwykły",
                "expectedAnswer": "4/5",
                "hints": ["8/10", "Skróć przez 2"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Zamień 0,125 na ułamek zwykły",
                "expectedAnswer": "1/8",
                "hints": ["125/1000", "Skróć przez 125"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Błędne miejsce przecinka"], "teachingTips": ["Licz miejsca po przecinku"], "prerequisites": ["Dzielenie, skracanie"] },
          "misconceptionPatterns": [{ "pattern": "Błędny mianownik", "intervention": "Ćwicz liczenie miejsc" }],
          "realWorldApplications": ["Kalkulatory, pomiary"],
          "assessmentRubric": { "mastery": "Poprawne zamiany", "proficient": "Drobne błędy", "developing": "Błędne algorytmy" }
        },
        {
          "skillId": "45678901-2345-6789-0123-456789012345",
          "skillName": "Porównywanie ułamków zwykłych",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Ułamki porównujemy sprowadzając do wspólnego mianownika lub zamieniając na dziesiętne. Przy wspólnym mianowniku większy jest ten z większym licznikiem. Można też mnożyć na krzyż: a/b < c/d gdy a×d < b×c. Ułamki właściwe (<1) są mniejsze od ułamków niewłaściwych (≥1).",
              "keyConceptsLaTex": ["$\\frac{a}{b}<\\frac{c}{d} ⟺ a×d < b×c$", "$\\frac{2}{3}<\\frac{3}{4}$ bo $2×4<3×3$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Porównywanie przez wspólny mianownik",
                "problem": "Porównaj 2/3 i 3/4.",
                "solution": "NWW(3,4) = 12\n2/3 = 8/12, 3/4 = 9/12\n8 < 9, więc 2/3 < 3/4",
                "explanation": "Wspólny mianownik pozwala porównać liczniki.",
                "timeEstimate": 300
              },
              {
                "title": "Porównywanie przez mnożenie na krzyż",
                "problem": "Porównaj 5/7 i 3/4.",
                "solution": "5×4 = 20, 7×3 = 21\n20 < 21, więc 5/7 < 3/4",
                "explanation": "Mnożenie na krzyż to szybka metoda.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Porównaj: 1/3 i 1/4",
                "expectedAnswer": "1/3 > 1/4",
                "hints": ["Przy tym samym liczniku", "Większy mianownik = mniejszy ułamek"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Porównaj: 3/5 i 4/7",
                "expectedAnswer": "3/5 > 4/7",
                "hints": ["3×7 = 21, 5×4 = 20", "21 > 20"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Uporządkuj: 2/3, 5/8, 3/4",
                "expectedAnswer": "5/8 < 2/3 < 3/4",
                "hints": ["Wspólny mianownik 24", "16/24, 20/24, 18/24"],
                "timeEstimate": 360
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Porównywanie liczników bez wspólnego mianownika"], "teachingTips": ["Używaj metody na krzyż"], "prerequisites": ["NWW, rozszerzanie"] },
          "misconceptionPatterns": [{ "pattern": "Większy mianownik = większy ułamek", "intervention": "Wizualizuj części pizzy" }],
          "realWorldApplications": ["Porównywanie wyników"],
          "assessmentRubric": { "mastery": "Różne metody porównywania", "proficient": "Jedna metoda", "developing": "Błędne porównania" }
        },
        {
          "skillId": "56789012-3456-7890-1234-567890123456",
          "skillName": "Procenty – pojęcie, obliczanie procentu z liczby",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Procent to setna część liczby (1% = 1/100 = 0,01). Aby obliczyć a% z liczby b, mnożymy b przez a/100 lub b×0,01×a. Procenty używamy do wyrażania części całości, porównań i zmian. 100% to cała wielkość, 50% to połowa, 25% to ćwierć, 10% to jedna dziesiąta.",
              "keyConceptsLaTex": ["$a\\% = \\frac{a}{100}$", "$20\\% \\text{ z } 150 = 150 × 0,2 = 30$", "$100\\% = 1$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Obliczanie procentu z liczby",
                "problem": "Oblicz 25% z 80.",
                "solution": "25% = 25/100 = 0,25\n80 × 0,25 = 20",
                "explanation": "Zamiana procenta na ułamek lub liczbę dziesiętną.",
                "timeEstimate": 240
              },
              {
                "title": "Procenty w praktyce",
                "problem": "Koszula kosztuje 120 zł. Ile zapłacimy po 15% rabacie?",
                "solution": "15% z 120 = 120 × 0,15 = 18 zł\n120 - 18 = 102 zł",
                "explanation": "Obliczamy rabat, potem odejmujemy od ceny.",
                "timeEstimate": 300
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "10% z 60",
                "expectedAnswer": "6",
                "hints": ["10% = 0,1", "60 × 0,1"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "30% z 250",
                "expectedAnswer": "75",
                "hints": ["30% = 30/100 = 0,3", "250 × 0,3"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Cena 200 zł wzrosła o 15%. Jaka jest nowa cena?",
                "expectedAnswer": "230 zł",
                "hints": ["15% z 200 = 30", "200 + 30 = 230"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Mylenie % z liczbą"], "teachingTips": ["% = /100"], "prerequisites": ["Ułamki dziesiętne"] },
          "misconceptionPatterns": [{ "pattern": "5% z 100 = 5", "intervention": "Zawsze przez 100" }],
          "realWorldApplications": ["Rabaty, podatki, odsetki"],
          "assessmentRubric": { "mastery": "Procenty w zadaniach słownych", "proficient": "Proste obliczenia", "developing": "Podstawowe pojęcie" }
        },
        {
          "skillId": "67890123-4567-8901-2345-678901234567",
          "skillName": "Znajdowanie liczby, gdy dany jest jej procent",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Gdy znamy wartość pewnego procentu liczby, możemy znaleźć całą liczbę. Jeśli a% z liczby x równa się b, to x = b ÷ (a/100) = b × (100/a). Można też ułożyć proporcję: a% → b, więc 100% → x, skąd x = (b × 100)/a. Ta umiejętność jest kluczowa w zadaniach z życia.",
              "keyConceptsLaTex": ["$a\\% \\text{ z } x = b ⟹ x = \\frac{b × 100}{a}$", "$25\\% \\text{ z } x = 15 ⟹ x = 60$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Znajdowanie całości",
                "problem": "25% pewnej liczby to 15. Znajdź tę liczbę.",
                "solution": "x = 15 ÷ 0,25 = 15 × 4 = 60\nLub: 25% → 15, więc 100% → 15×4 = 60",
                "explanation": "Dzielimy przez wartość procentową lub używamy proporcji.",
                "timeEstimate": 300
              },
              {
                "title": "Zadanie praktyczne",
                "problem": "W klasie 30% uczniów to 9 osób. Ile uczniów jest w klasie?",
                "solution": "x = 9 ÷ 0,3 = 30 uczniów",
                "explanation": "30% uczniów to 9, więc całość to 9÷0,3.",
                "timeEstimate": 300
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "50% liczby to 20. Znajdź liczbę.",
                "expectedAnswer": "40",
                "hints": ["50% = 0,5", "20 ÷ 0,5 = 40"],
                "timeEstimate": 240
              },
              {
                "type": "intermediate",
                "problem": "15% liczby to 12. Znajdź liczbę.",
                "expectedAnswer": "80",
                "hints": ["12 ÷ 0,15", "Lub: 15% → 12, więc 100% → ?"],
                "timeEstimate": 300
              },
              {
                "type": "advanced",
                "problem": "Na wyprzedaży koszula za 45 zł ma 25% rabatu. Jaka była pierwotna cena?",
                "expectedAnswer": "60 zł",
                "hints": ["45 zł to 75% pierwotnej ceny", "45 ÷ 0,75 = 60"],
                "timeEstimate": 360
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Mnożenie zamiast dzielenia"], "teachingTips": ["Używaj proporcji"], "prerequisites": ["Procenty podstawowe"] },
          "misconceptionPatterns": [{ "pattern": "x × a% = b", "intervention": "Ćwicz odwrotne działania" }],
          "realWorldApplications": ["Obliczanie cen przed rabatem"],
          "assessmentRubric": { "mastery": "Zadania złożone", "proficient": "Proste przypadki", "developing": "Z pomocą" }
        },
        {
          "skillId": "78901234-5678-9012-3456-789012345678",
          "skillName": "Jednostki miary – długość, masa, objętość, czas",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Jednostki miary pozwalają wyrażać wielkości fizyczne. System metryczny oparty na potęgach 10: 1 km = 1000 m, 1 m = 100 cm, 1 cm = 10 mm. Masa: 1 kg = 1000 g, 1 t = 1000 kg. Objętość: 1 l = 1000 ml, 1 m³ = 1000 l. Czas: 1 h = 60 min, 1 min = 60 s, 1 doba = 24 h. Zamiany przez mnożenie/dzielenie przez 10, 100, 1000.",
              "keyConceptsLaTex": ["$1\\text{ km} = 1000\\text{ m}$", "$1\\text{ l} = 1000\\text{ ml}$", "$1\\text{ h} = 60\\text{ min}$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Zamiana jednostek długości",
                "problem": "Zamień 2,5 km na metry.",
                "solution": "2,5 km = 2,5 × 1000 m = 2500 m",
                "explanation": "Większa jednostka na mniejszą - mnożymy.",
                "timeEstimate": 240
              },
              {
                "title": "Zamiana jednostek czasu",
                "problem": "Zamień 150 minut na godziny i minuty.",
                "solution": "150 ÷ 60 = 2 r. 30\n150 min = 2 h 30 min",
                "explanation": "Dzielenie z resztą dla jednostek czasu.",
                "timeEstimate": 300
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "3 m = ? cm",
                "expectedAnswer": "300 cm",
                "hints": ["1 m = 100 cm", "3 × 100"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "2500 g = ? kg",
                "expectedAnswer": "2,5 kg",
                "hints": ["1000 g = 1 kg", "2500 ÷ 1000"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Ile minut to 2,25 godziny?",
                "expectedAnswer": "135 minut",
                "hints": ["2,25 × 60", "2 h 15 min"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Błędny kierunek zamiany"], "teachingTips": ["Większa→mniejsza: ×, mniejsza→większa: ÷"], "prerequisites": ["Mnożenie/dzielenie przez potęgi 10"] },
          "misconceptionPatterns": [{ "pattern": "Mylenie kierunku", "intervention": "Ćwicz z konkretnymi przedmiotami" }],
          "realWorldApplications": ["Przepisy, pomiary, sport"],
          "assessmentRubric": { "mastery": "Złożone zamiany", "proficient": "Podstawowe zamiany", "developing": "Z tabelą przeliczników" }
        },
        {
          "skillId": "89012345-6789-0123-4567-890123456789",
          "skillName": "Pole prostokąta i kwadratu",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Pole figury to liczba jednostkowych kwadratów, które można w niej umieścić. Pole prostokąta = długość × szerokość. Pole kwadratu = bok × bok = bok². Jednostki pola: cm², m², km². Przy obliczeniach wszystkie długości muszą być w tych samych jednostkach. Pole używamy do obliczania powierzchni w praktyce.",
              "keyConceptsLaTex": ["$P_{prostokąt} = a × b$", "$P_{kwadrat} = a²$", "$\\text{jednostki: }cm², m²$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Pole prostokąta",
                "problem": "Prostokąt ma długość 8 cm i szerokość 5 cm. Oblicz pole.",
                "solution": "P = a × b = 8 × 5 = 40 cm²",
                "explanation": "Mnożymy długość przez szerokość.",
                "timeEstimate": 240
              },
              {
                "title": "Pole kwadratu",
                "problem": "Kwadrat ma bok 6 m. Oblicz pole.",
                "solution": "P = a² = 6² = 36 m²",
                "explanation": "Bok do kwadratu.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Prostokąt 4 cm × 7 cm",
                "expectedAnswer": "28 cm²",
                "hints": ["P = 4 × 7", "Pamiętaj o jednostce"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Kwadrat o boku 9 dm",
                "expectedAnswer": "81 dm²",
                "hints": ["P = 9²", "9 × 9 = 81"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Prostokąt ma pole 24 m² i szerokość 3 m. Jaka jest długość?",
                "expectedAnswer": "8 m",
                "hints": ["24 = a × 3", "a = 24 ÷ 3"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Mylenie pola z obwodem"], "teachingTips": ["Pole = powierzchnia wewnątrz"], "prerequisites": ["Mnożenie, potęgowanie"] },
          "misconceptionPatterns": [{ "pattern": "Dodawanie boków", "intervention": "Wizualizuj kafelki" }],
          "realWorldApplications": ["Powierzchnia mieszkania, farba"],
          "assessmentRubric": { "mastery": "Zadania odwrotne", "proficient": "Proste obliczenia", "developing": "Ze wzorem" }
        },
        {
          "skillId": "90123456-7890-1234-5678-901234567890",
          "skillName": "Obwód prostokąta i kwadratu",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Obwód to długość wszystkich boków figury. Obwód prostokąta = 2 × (długość + szerokość) = 2a + 2b. Obwód kwadratu = 4 × bok = 4a. Jednostki obwodu to jednostki długości: cm, m, km. Obwód to długość ogrodzenia wokół działki, długość ramy obrazu itp.",
              "keyConceptsLaTex": ["$Ob_{prostokąt} = 2(a + b)$", "$Ob_{kwadrat} = 4a$", "$\\text{jednostki: cm, m}$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Obwód prostokąta",
                "problem": "Prostokąt ma boki 6 cm i 4 cm. Oblicz obwód.",
                "solution": "Ob = 2 × (6 + 4) = 2 × 10 = 20 cm",
                "explanation": "Suma wszystkich boków lub wzór 2(a+b).",
                "timeEstimate": 240
              },
              {
                "title": "Obwód kwadratu",
                "problem": "Kwadrat ma bok 5 m. Oblicz obwód.",
                "solution": "Ob = 4 × 5 = 20 m",
                "explanation": "Cztery równe boki.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Prostokąt 3 cm × 8 cm",
                "expectedAnswer": "22 cm",
                "hints": ["Ob = 2 × (3 + 8)", "2 × 11 = 22"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Kwadrat o boku 7 dm",
                "expectedAnswer": "28 dm",
                "hints": ["Ob = 4 × 7", "4 × 7 = 28"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Prostokąt ma obwód 20 m i długość 6 m. Jaka jest szerokość?",
                "expectedAnswer": "4 m",
                "hints": ["20 = 2 × (6 + b)", "10 = 6 + b"],
                "timeEstimate": 300
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Mylenie obwodu z polem"], "teachingTips": ["Obwód = ogrodzenie wokół"], "prerequisites": ["Dodawanie, mnożenie"] },
          "misconceptionPatterns": [{ "pattern": "Mnożenie wymiarów", "intervention": "Chodź wokół figury" }],
          "realWorldApplications": ["Ogrodzenie, rama"],
          "assessmentRubric": { "mastery": "Zadania odwrotne", "proficient": "Proste obliczenia", "developing": "Ze wzorem" }
        },
        {
          "skillId": "01234567-8901-2345-6789-012345678901",
          "skillName": "Figury na płaszczyźnie – rozpoznawanie i właściwości",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "teachingFlow": { "phase1": { "name": "Wprowadzenie", "duration": 900, "activities": ["theory", "guided_examples"] }, "phase2": { "name": "Ćwiczenia", "duration": 1200, "activities": ["practice", "feedback"] }, "phase3": { "name": "Utrwalanie", "duration": 600, "activities": ["mastery_tasks", "assessment"] } },
          "content": {
            "theory": {
              "introduction": "Figury płaskie to kształty na płaszczyźnie. Wielokąty: trójkąt (3 boki), czworokąt (4 boki), pięciokąt (5 boków) itd. Czworokąty: kwadrat (4 równe boki, 4 kąty proste), prostokąt (przeciwległe boki równe, 4 kąty proste), romb (4 równe boki), równoległobok (przeciwległe boki równe i równoległe). Koło to zbiór punktów w stałej odległości od środka.",
              "keyConceptsLaTex": ["$\\text{kwadrat: } a = b = c = d$", "$\\text{prostokąt: } a = c, b = d$", "$\\text{koło: } r = const$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Rozpoznawanie czworokątów",
                "problem": "Jakie właściwości ma prostokąt?",
                "solution": "- Przeciwległe boki równe i równoległe\n- Wszystkie kąty proste (90°)\n- Przekątne równe i dzielą się na pół",
                "explanation": "Prostokąt to szczególny przypadek równoległoboku.",
                "timeEstimate": 300
              },
              {
                "title": "Właściwości koła",
                "problem": "Co to jest promień i średnica koła?",
                "solution": "Promień (r) to odległość od środka do brzegu.\nŚrednica (d) to najdłuższa cięciwa, d = 2r.",
                "explanation": "Wszystkie promienie są równe.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Ile boków ma sześciokąt?",
                "expectedAnswer": "6",
                "hints": ["Nazwa mówi sama za siebie", "Sześć = 6"],
                "timeEstimate": 120
              },
              {
                "type": "intermediate",
                "problem": "Jakie kąty ma kwadrat?",
                "expectedAnswer": "Wszystkie po 90°",
                "hints": ["Kąty proste", "Równe boki i kąty"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Czym różni się romb od kwadratu?",
                "expectedAnswer": "Romb ma równe boki, ale niekoniecznie kąty proste",
                "hints": ["Kwadrat to szczególny romb", "Kąty w rombie mogą być różne od 90°"],
                "timeEstimate": 240
              }
            ]
          },
          "pedagogicalNotes": { "commonMistakes": ["Mylenie nazw figur"], "teachingTips": ["Używaj modeli i rysunków"], "prerequisites": ["Podstawowe pojęcia geometryczne"] },
          "misconceptionPatterns": [{ "pattern": "Kwadrat to nie prostokąt", "intervention": "Pokazuj hierarchię figur" }],
          "realWorldApplications": ["Architektura, sztuka, wzornictwo"],
          "assessmentRubric": { "mastery": "Klasyfikuje i uzasadnia", "proficient": "Rozpoznaje podstawowe", "developing": "Z pomocą wizualną" }
        }
      ]
    };

    console.log('🚀 IMPORTING 25 UMIEJĘTNOŚCI...');
    setAutoImportRan(true);

    const runCompleteImport = async () => {
      try {
        console.log('🔥 STARTUJEMY IMPORT!', COMPLETE_25_SKILLS_JSON);
        console.log('🔥 Calling batchImportSkillContent...');
        const result = await batchImportSkillContent(COMPLETE_25_SKILLS_JSON);
        console.log('✅ COMPLETE IMPORT SUCCESS!', result);
        
        toast({
          title: "✅ Import Complete!",
          description: `Successfully imported ${result.successful}/${result.totalProcessed} skills`,
        });
        
        setResults(result);
      } catch (error) {
        console.error('❌ COMPLETE IMPORT FAILED:', error);
        console.error('❌ Error details:', error);
        toast({
          title: "❌ Import Failed",
          description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
          <CardTitle>Fixed Batch Import - Wszystkie 25 umiejętności klasa 4</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">JSON z ChatGPT (wszystkie 25 umiejętności):</label>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Wklej pełny JSON z wszystkimi 25 umiejętnościami...'
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
                  Importuj Wszystkie 25 Umiejętności
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
