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
        },
        {
          "skillId": "707f7c2d-b79e-4f95-8da1-35b293719d7a",
          "skillName": "Oś liczbowa – podstawy",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Oś liczbowa to prosta z punktem 0 i zaznaczonym kierunkiem wzrostu w prawo. Każdemu punktowi odpowiada liczba, a odległość między liczbami to różnica ich wartości bezwzględnych. Liczby mniejsze leżą po lewej, większe po prawej. Możemy dzielić odcinki na równe części, by zaznaczać ułamki i liczby dziesiętne.",
              "keyConceptsLaTex": ["$0$ punkt odniesienia", "$a\\<b$", "$|b-a|$", "$\\to$ w prawo rośnie"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Zaznaczanie liczby całkowitej",
                "problem": "Zaznacz 3 na osi.",
                "solution": "Od 0 idź trzy jednostki w prawo i zaznacz punkt.",
                "explanation": "Dodatnie liczby są po prawej stronie zera.",
                "timeEstimate": 180
              },
              {
                "title": "Odległość między punktami",
                "problem": "Jaka jest odległość między 2 a 5?",
                "solution": "Oblicz |5−2|=3 jednostki.",
                "explanation": "Odległość na osi to wartość bezwzględna różnicy.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Która liczba leży dalej w prawo: 4 czy 6?",
                "expectedAnswer": "6",
                "hints": ["Większa liczba dalej w prawo", "Porównaj 4 i 6"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Zaznacz punkt w połowie między 1 a 5.",
                "expectedAnswer": "3",
                "hints": ["Średnia: (1+5)/2", "Położenie środka"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Podaj liczbę leżącą 2 jednostki na lewo od 0,5.",
                "expectedAnswer": "-1,5",
                "hints": ["0,5 − 2", "Idź w lewo"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "de6ec739-6742-4f25-9ad7-45fa309548a2",
          "skillName": "Porównywanie i porządkowanie liczb naturalnych",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Liczby naturalne porównujemy, patrząc najpierw na liczbę cyfr: więcej cyfr oznacza większą liczbę. Gdy jest tyle samo cyfr, porównujemy od lewej kolejne cyfry. Do porządkowania rosnąco ustawiamy od najmniejszej do największej. Do sprawdzania używamy osi liczbowej i szacowania.",
              "keyConceptsLaTex": ["$a\\<b$", "$a>b$", "$\\le,\\ge$", "$0,1,2,\\dots$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Porządkowanie rosnąco",
                "problem": "Ułóż rosnąco: 507, 75, 1050.",
                "solution": "75 ma 2 cyfry, 507 ma 3, 1050 ma 4.\nKolejność: 75, 507, 1050.",
                "explanation": "Najpierw długość, potem wartości szczegółowe.",
                "timeEstimate": 240
              },
              {
                "title": "Porównanie liczb o tej samej długości",
                "problem": "Która większa: 638 czy 683?",
                "solution": "Porównaj setki: równe 6. Dziesiątki: 3<8, więc 638<683.",
                "explanation": "Porównujemy od najwyższej pozycji cyfry.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Wstaw znak: 402 __ 240",
                "expectedAnswer": ">",
                "hints": ["Porównaj setki", "4>2"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Ułóż malejąco: 9, 123, 87",
                "expectedAnswer": "123, 87, 9",
                "hints": ["Najpierw liczba cyfr", "Potem wartości"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Znajdź największą z: 701, 710, 709",
                "expectedAnswer": "710",
                "hints": ["Porównaj setki, dziesiątki", "Równe setki, decydują dziesiątki"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "c570a271-70ac-48a5-883d-00f0a6955c7d",
          "skillName": "Tabliczka mnożenia do 100",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Tabliczka mnożenia do 100 obejmuje iloczyny liczb 1–10. Korzystamy z własności przemienności i łączności mnożenia, aby szybciej liczyć i zapamiętywać wzorce. Przydatne są kwadraty liczb 1–10 i dzielenie jako działanie odwrotne do mnożenia. Trenuj regularnie krótkimi seriami.",
              "keyConceptsLaTex": ["$ab=ba$", "$(ab)c=a(bc)$", "$a\\cdot1=a$", "$a\\cdot0=0$"],
              "timeEstimate": 120
            },
            "examples": [
              {
                "title": "Wykorzystanie przemienności",
                "problem": "Oblicz 7·8.",
                "solution": "Znam 8·7=56, więc 7·8=56.",
                "explanation": "Kolejność czynników nie zmienia iloczynu.",
                "timeEstimate": 180
              },
              {
                "title": "Dzielenie jako sprawdzenie",
                "problem": "Sprawdź 6·9 dzieleniem.",
                "solution": "6·9=54. 54:9=6 i 54:6=9 – poprawnie.",
                "explanation": "Dzielenie odwraca mnożenie i pozwala zweryfikować wynik.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "4·7",
                "expectedAnswer": "28",
                "hints": ["4·5=20, dodaj 4·2", "Pamiętaj wzorzec 7"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "8·8",
                "expectedAnswer": "64",
                "hints": ["Kwadrat 8", "Powtórne dodawanie ósemek"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "6·12 (użyj do 100)",
                "expectedAnswer": "72",
                "hints": ["6·10 + 6·2", "Rozbij na znane"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "bdf94ae8-8de0-49ee-97a4-73dc8ce1c02f",
          "skillName": "Ułamki niewłaściwe i liczby mieszane – obustronne zamiany",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Ułamek niewłaściwy ma licznik większy lub równy mianownikowi. Liczbę mieszaną zapisujemy jako część całkowitą i ułamek właściwy. Zamiana: dzielimy licznik przez mianownik, część całkowita to iloraz, reszta tworzy licznik ułamka. W drugą stronę: całość mnożymy przez mianownik i dodajemy licznik.",
              "keyConceptsLaTex": ["$\\tfrac{7}{3}=2\\tfrac{1}{3}$", "$2\\tfrac{1}{3}=\\tfrac{7}{3}$", "$n=qm+r$", "$0\\le r\\<m$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Ułamek → liczba mieszana",
                "problem": "Zamień 11/4 na liczbę mieszaną.",
                "solution": "11:4=2 r.3 → 2 i 3/4. Wynik: 2 3/4.",
                "explanation": "Iloraz to całe części, reszta to licznik nad tym samym mianownikiem.",
                "timeEstimate": 240
              },
              {
                "title": "Liczba mieszana → ułamek",
                "problem": "Zamień 3 2/5 na ułamek niewłaściwy.",
                "solution": "3·5=15; 15+2=17. Wynik: 17/5.",
                "explanation": "Część całkowita to pięć piątych razy 3, dodajemy dwie piąte.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Zamień 9/2 na liczbę mieszaną",
                "expectedAnswer": "4 1/2",
                "hints": ["9:2=4 r.1", "Reszta nad 2"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Zamień 5 3/8 na ułamek",
                "expectedAnswer": "43/8",
                "hints": ["5·8=40", "Dodaj licznik 3"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Zamień 29/6 na liczbę mieszaną",
                "expectedAnswer": "4 5/6",
                "hints": ["29:6=4 r.5", "Reszta nad 6"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "e2c31949-8777-4edc-88a7-193b560f6bd8",
          "skillName": "Ułamki zwykłe – pojęcie i reprezentacje (część całości, odcinek, diagram)",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Ułamek zwykły $\\tfrac{a}{b}$ oznacza $a$ części z $b$ równych części całości (b≠0). Reprezentujemy go na obrazkach (figury dzielone), na odcinku (podziały), oraz na osi liczbowej. Porównujemy ułamki o tym samym mianowniku przez licznik, a o różnych – przez sprowadzenie do wspólnego mianownika lub porównanie do 1/2 i 1.",
              "keyConceptsLaTex": ["$\\tfrac{a}{b}$", "$b\\ne0$", "$\\tfrac{a}{b}=\\tfrac{ka}{kb}$", "$\\tfrac{1}{2}$ połowa"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Część całości",
                "problem": "Na cieście 8 równych kawałków. Zjedzono 3. Jaki ułamek?",
                "solution": "Zjedzono 3 z 8, więc 3/8.",
                "explanation": "Licznik to zjedzone części, mianownik to wszystkie równe części.",
                "timeEstimate": 180
              },
              {
                "title": "Odcinek podzielony",
                "problem": "Odcinek podzielono na 5 części. Zaznacz 2/5.",
                "solution": "Od początku odcinka zaznacz dwie z pięciu równych części.",
                "explanation": "Długość 2/5 to dwie części z pięciu równych.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Który większy: 3/7 czy 4/7?",
                "expectedAnswer": "4/7",
                "hints": ["Ten sam mianownik", "Porównaj liczniki"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Zaznacz 3/4 na osi 0–1",
                "expectedAnswer": "Punkt na 0,75",
                "hints": ["Podziel na 4 równe części", "Zaznacz 3 części"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Uprość 6/9",
                "expectedAnswer": "2/3",
                "hints": ["Podziel licznik i mianownik przez 3", "Równoważne ułamki"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "45124ed0-8dd3-44f0-819c-fe71d0fbd1ff",
          "skillName": "Wartość miejsca w systemie dziesiętnym (do milionów)",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Każda cyfra w liczbie ma wartość zależną od miejsca: jedności, dziesiątki, setki, tysiące, dziesiątki tysięcy, setki tysięcy, miliony. Rozkładamy liczbę na sumę iloczynów cyfry i wartości miejsca. Zera w środku oznaczają brak danych jednostek miejsca.",
              "keyConceptsLaTex": ["$345=3\\cdot100+4\\cdot10+5$", "$1000=10^3$", "$1\\ 000\\ 000$", "$0$ jako brak miejsca"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Rozkład na sumę",
                "problem": "Rozłóż 407 120.",
                "solution": "4·100000 + 0·10000 + 7·1000 + 1·100 + 2·10 + 0.",
                "explanation": "Każde miejsce opisane wartością potęgi dziesięciu.",
                "timeEstimate": 240
              },
              {
                "title": "Wartość cyfry",
                "problem": "Jaka jest wartość cyfry 6 w 6 054 000?",
                "solution": "To 6·1 000 000 = 6 000 000.",
                "explanation": "Cyfra 6 stoi na miejscu milionów.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Podaj wartość cyfry 3 w 53 210",
                "expectedAnswer": "3 000",
                "hints": ["Setki czy tysiące?", "Sprawdź pozycję od końca"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Rozłóż 120 305",
                "expectedAnswer": "1·100000+2·10000+3·100+5",
                "hints": ["Zera pomijają miejsce", "Zapisz każde miejsce"],
                "timeEstimate": 240
              },
              {
                "type": "advanced",
                "problem": "Zamień 8·1000 + 5·10 + 9 na liczbę",
                "expectedAnswer": "8 059",
                "hints": ["Dodaj składowe", "Uważaj na brak setek"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "12952b4c-2ca8-4925-bb12-c1ccbd8c0ee5",
          "skillName": "Własności działań: przemienność i łączność (dodawanie, mnożenie)",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Dodawanie i mnożenie są przemienne i łączne: możemy zmieniać kolejność składników i sposób grupowania bez zmiany wyniku. Wykorzystujemy te własności do szybszych obliczeń i sprytnego łączenia liczb. Uwaga: odejmowanie i dzielenie nie są przemienne ani łączne.",
              "keyConceptsLaTex": ["$a+b=b+a$", "$(a+b)+c=a+(b+c)$", "$ab=ba$", "$(ab)c=a(bc)$"],
              "timeEstimate": 120
            },
            "examples": [
              {
                "title": "Szybsze dodawanie",
                "problem": "Oblicz 25+17+75+83.",
                "solution": "Połącz: (25+75)+(17+83)=100+100=200.",
                "explanation": "Łączność i przemienność pozwalają zgrupować do setek.",
                "timeEstimate": 180
              },
              {
                "title": "Mnożenie przez grupowanie",
                "problem": "Oblicz 5·2·50.",
                "solution": "Połącz: (5·2)·50=10·50=500.",
                "explanation": "Łączność pozwala najpierw policzyć łatwe pary.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Zastosuj przemienność: 7+9=",
                "expectedAnswer": "9+7=16",
                "hints": ["Zamień kolejność", "Suma bez zmian"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Oblicz: 4+16+6+14",
                "expectedAnswer": "40",
                "hints": ["Połącz do 20: (4+16)+(6+14)", "Dodaj"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Oblicz: 3·25·4",
                "expectedAnswer": "300",
                "hints": ["(3·4)·25", "12·25=300"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "baab9223-b4c7-4a56-a5a5-50de0e7ed4cf",
          "skillName": "Zaokrąglanie liczb naturalnych do dziesiątek, setek, tysięcy",
          "class_level": 4,
          "department": "arithmetic",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Zaokrąglamy, patrząc na następną cyfrę w prawo. Jeśli jest 0–4, zostawiamy, jeśli 5–9, podnosimy zaokrąglaną cyfrę o 1. Wszystkie cyfry na prawo zamieniamy na zera. Stosujemy do dziesiątek, setek, tysięcy, by szacować wyniki i ułatwiać obliczenia.",
              "keyConceptsLaTex": ["$47\\to50$", "$463\\to500$", "$1499\\to1500$", "$Reguła\\ 5\\uparrow$"],
              "timeEstimate": 120
            },
            "examples": [
              {
                "title": "Do dziesiątek",
                "problem": "Zaokrąglij 68 do dziesiątek.",
                "solution": "Cyfra jedności 8 ≥5, więc 68→70.",
                "explanation": "Reguła 5–9: zwiększ zaokrąglaną cyfrę.",
                "timeEstimate": 180
              },
              {
                "title": "Do setek",
                "problem": "Zaokrąglij 432 do setek.",
                "solution": "Cyfra dziesiątek 3 <5, więc 432→400.",
                "explanation": "0–4: zostawiamy setki, reszta na zera.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Zaokrąglij 25 do dziesiątek",
                "expectedAnswer": "30",
                "hints": ["5 → w górę", "Zamień jedności na 0"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Zaokrąglij 149 do setek",
                "expectedAnswer": "100",
                "hints": ["4 <5", "Setki bez zmian"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Zaokrąglij 2649 do tysięcy",
                "expectedAnswer": "3000",
                "hints": ["Setki 6 ≥5", "Podnieś tysiące"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "9f686b42-7f73-49c8-99a1-44fdcad9e17c",
          "skillName": "Całka nieoznaczona",
          "class_level": 4,
          "department": "calculus",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Całka nieoznaczona to działanie odwrotne do pochodnej: szukamy funkcji, której pochodna daje wyrażenie pod całką. Nazywamy ją funkcją pierwotną i dodajemy stałą całkowania. Dla prostych potęg stosujemy prosty wzór. W tym wprowadzeniu skupiamy się na rozpoznawaniu prostych schematów i sprawdzaniu wyniku przez zróżniczkowanie.",
              "keyConceptsLaTex": ["$\\int f=F+C$", "$F'=f$", "$\\int x^n dx=\\tfrac{x^{n+1}}{n+1}$", "$\\int 1 dx=x$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Prosta potęga",
                "problem": "Oblicz ∫ x dx.",
                "solution": "Z wzoru: ∫ x dx = x^2/2 + C. Sprawdź: (x^2/2)'=x.",
                "explanation": "Całkowanie odwraca różniczkowanie potęgi.",
                "timeEstimate": 240
              },
              {
                "title": "Stała pod całką",
                "problem": "Oblicz ∫ 3 dx.",
                "solution": "∫ 3 dx = 3x + C. Sprawdź: (3x)'=3.",
                "explanation": "Stałą wyciągamy przed znak całki i całkujemy 1.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Oblicz ∫ 1 dx",
                "expectedAnswer": "x + C",
                "hints": ["Stała całkowania", "Sprawdź pochodną"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Oblicz ∫ 2x dx",
                "expectedAnswer": "x^2 + C",
                "hints": ["Wyciągnij 2", "Zastosuj wzór potęgowy"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Oblicz ∫ x^2 dx",
                "expectedAnswer": "x^3/3 + C",
                "hints": ["n=2", "Zwiększ wykładnik o 1 i podziel"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "4a15485f-ff7e-414b-89a5-002540ab72dd",
          "skillName": "Elementy figury – punkt, prosta, odcinek, półprosta",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Punkt to miejsce bez wymiaru. Prosta jest nieskończona w obu kierunkach. Odcinek to część prostej między punktami A i B. Półprosta zaczyna się w punkcie i biegnie w jednym kierunku. Zapisujemy odległość jako długość odcinka |AB|, równoległość i prostopadłość oznaczamy symbolami.",
              "keyConceptsLaTex": ["$|AB|$", "$AB\\parallel CD$", "$AB\\perp CD$", "$A\\in p$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Długość odcinka na osi",
                "problem": "Na osi liczbowej A=2, B=7. Oblicz |AB|.",
                "solution": "|AB|=|7−2|=5.",
                "explanation": "Długość to wartość bezwzględna różnicy współrzędnych.",
                "timeEstimate": 180
              },
              {
                "title": "Półprosta",
                "problem": "Narysuj półprostą o początku w P przechodzącą przez Q.",
                "solution": "Połącz P i Q, przedłuż w kierunku Q bez końca, zaznacz początek P.",
                "explanation": "Półprosta ma początek, ale nie ma końca.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Zaznacz punkt A na prostej p",
                "expectedAnswer": "A∈p",
                "hints": ["Wybierz dowolne miejsce", "Oznacz literą"],
                "timeEstimate": 120
              },
              {
                "type": "intermediate",
                "problem": "Porównaj: odcinek a półprosta",
                "expectedAnswer": "Odcinek ma dwa końce, półprosta jeden",
                "hints": ["Początek i koniec", "Kierunek"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Wskaż prostą prostopadłą do danej prostej",
                "expectedAnswer": "Prosta pod kątem 90°",
                "hints": ["Użyj ekierki", "Znak ⟂"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "f16dd5a6-ccd1-409a-9507-29745d716583",
          "skillName": "Figury geometryczne",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Podstawowe figury to trójkąty, czworokąty (kwadrat, prostokąt, równoległobok), wielokąty oraz koło/okrąg. Rozpoznajemy je po liczbie boków, kątach i własnościach (równoległe boki, równe kąty). W praktyce mierzymy boki i kąty, opisujemy cechy i klasyfikujemy figurę.",
              "keyConceptsLaTex": ["$\\triangle ABC$", "$O=2\\pi r$", "$S=\\pi r^2$", "$O_{prost}=2(a+b)$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Rozpoznawanie figury",
                "problem": "Figura ma cztery boki, kąty proste, przeciwległe boki równe. Co to jest?",
                "solution": "Prostokąt.",
                "explanation": "Cztery kąty proste definiują prostokąt.",
                "timeEstimate": 180
              },
              {
                "title": "Cecha kwadratu",
                "problem": "Czym kwadrat różni się od prostokąta?",
                "solution": "Ma wszystkie boki równe i kąty proste.",
                "explanation": "Kwadrat to szczególny prostokąt o równych bokach.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Podaj nazwę figury: 3 boki",
                "expectedAnswer": "Trójkąt",
                "hints": ["Licz boki", "Nazwy od liczby boków"],
                "timeEstimate": 120
              },
              {
                "type": "intermediate",
                "problem": "Ile boków ma ośmiokąt?",
                "expectedAnswer": "8",
                "hints": ["Octo = 8", "Wielokąt = wiele boków"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Wskaż figury o kątach prostych",
                "expectedAnswer": "Kwadrat, prostokąt",
                "hints": ["90° w każdym wierzchołku", "Sprawdź definicje"],
                "timeEstimate": 180
              }
            ]
          }
        },
        {
          "skillId": "5588578f-d374-4d1a-80e2-1e92fad7425e",
          "skillName": "Obwody wielokątów – zastosowania praktyczne",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Obwód to suma długości wszystkich boków figury. Dla prostokąta stosujemy $O=2(a+b)$, dla kwadratu $O=4a$. W praktyce obwód używamy do planowania ogrodzeń, listew, taśm czy ram. Pamiętaj o jednostkach i ich zamianie.",
              "keyConceptsLaTex": ["$O=\\sum b_i$", "$O_{prost}=2(a+b)$", "$O_{kw}=4a$", "$1\\ m=100\\ cm$"],
              "timeEstimate": 120
            },
            "examples": [
              {
                "title": "Prostokąt w ogrodzie",
                "problem": "Działka ma wymiary 12 m i 8 m. Jaki obwód ogrodzenia?",
                "solution": "O=2(12+8)=2·20=40 m.",
                "explanation": "Suma dwóch par równych boków.",
                "timeEstimate": 180
              },
              {
                "title": "Wielokąt nieregularny",
                "problem": "Boki: 3 m, 2 m, 4 m, 5 m. Obwód?",
                "solution": "O=3+2+4+5=14 m.",
                "explanation": "Dodajemy wszystkie długości boków.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Kwadrat o boku 7 cm: obwód",
                "expectedAnswer": "28 cm",
                "hints": ["O=4a", "4·7"],
                "timeEstimate": 120
              },
              {
                "type": "intermediate",
                "problem": "Prostokąt 5 cm i 12 cm: obwód",
                "expectedAnswer": "34 cm",
                "hints": ["O=2(a+b)", "2·(5+12)"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Trójkąt 6 cm, 8 cm, 10 cm: obwód",
                "expectedAnswer": "24 cm",
                "hints": ["Suma boków", "Jednostki cm"],
                "timeEstimate": 180
              }
            ]
          }
        },
        {
          "skillId": "17f05c0a-7ea4-416d-851c-8998ffdd6f9f",
          "skillName": "Pole prostokąta i kwadratu – siatki i kafelkowanie",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Pole to liczba jednostek kwadratowych, które pokrywają figurę bez nakładania. Prostokąt: $S=a\\cdot b$, kwadrat: $S=a^2$. Na siatkach liczymy kafelki, w praktyce planujemy kafelkowanie podłogi czy malowanie. Pamiętaj o jednostkach: cm², m².",
              "keyConceptsLaTex": ["$S_{prost}=a\\cdot b$", "$S_{kw}=a^2$", "$1\\ m^2=10\\ 000\\ cm^2$", "$S=\\#\\ kafelków$"],
              "timeEstimate": 120
            },
            "examples": [
              {
                "title": "Siatka kwadratowa",
                "problem": "Prostokąt ma 3 kratki na 5 kratek. Pole?",
                "solution": "S=3·5=15 jednostek².",
                "explanation": "Kafelki liczą pole bezpośrednio.",
                "timeEstimate": 180
              },
              {
                "title": "Jednostki",
                "problem": "Kwadrat o boku 20 cm. Pole w m²?",
                "solution": "S=20·20=400 cm² = 0,04 m².",
                "explanation": "1 m² = 10 000 cm², przeliczamy jednostki.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Prostokąt 7 cm i 4 cm: pole",
                "expectedAnswer": "28 cm²",
                "hints": ["S=a·b", "Jednostki kwadratowe"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Kwadrat 9 m: pole",
                "expectedAnswer": "81 m²",
                "hints": ["S=a^2", "9·9"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Podłoga 3 m × 2,5 m: ile płytek 0,5 m × 0,5 m?",
                "expectedAnswer": "30",
                "hints": ["Pole podłogi / pole płytki", "7,5 / 0,25"],
                "timeEstimate": 300
              }
            ]
          }
        },
        {
          "skillId": "b3fe8aca-d74e-4fcc-b5b2-4d583c4f8d23",
          "skillName": "Pomiary długości",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Podstawowe jednostki: mm, cm, m, km. Zamiana: 10 mm=1 cm, 100 cm=1 m, 1000 m=1 km. Mierzymy linijką, taśmą, kołem mierniczym. Odczytujemy z dokładnością do najmniejszej podziałki. Zawsze zapisujemy jednostki.",
              "keyConceptsLaTex": ["$10\\ mm=1\\ cm$", "$100\\ cm=1\\ m$", "$1000\\ m=1\\ km$", "$1\\ m=100\\ cm$"],
              "timeEstimate": 120
            },
            "examples": [
              {
                "title": "Zamiana jednostek",
                "problem": "Zamień 3,5 m na cm.",
                "solution": "1 m=100 cm. 3,5 m=350 cm.",
                "explanation": "Mnożymy przez 100, bo w 1 m jest 100 cm.",
                "timeEstimate": 180
              },
              {
                "title": "Odczyt z linijki",
                "problem": "Długość odcinka to 7,4 cm. Ile to mm?",
                "solution": "1 cm=10 mm. 7,4 cm=74 mm.",
                "explanation": "Przelicz na milimetry mnożąc przez 10.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Zamień 250 cm na m",
                "expectedAnswer": "2,5 m",
                "hints": ["Dziel przez 100", "Przypomnij 100 cm=1 m"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Zamień 3,2 km na m",
                "expectedAnswer": "3200 m",
                "hints": ["Mnoż przez 1000", "1 km=1000 m"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Ile cm to 1,25 m?",
                "expectedAnswer": "125 cm",
                "hints": ["1 m=100 cm", "Mnoż przez 100"],
                "timeEstimate": 180
              }
            ]
          }
        },
        {
          "skillId": "938ed309-ef2f-43a7-a45e-3672f97fd3a1",
          "skillName": "Rodzaje kątów i pomiar kątomierzem",
          "class_level": 4,
          "department": "geometry",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Kąty dzielimy na ostre (0–90°), prosty (90°), rozwarty (90–180°), półpełny (180°) i pełny (360°). Kątomierz przykładamy środkiem do wierzchołka, jedno ramię do zera skali, drugie odczytujemy na właściwej skali (wewnętrznej lub zewnętrznej).",
              "keyConceptsLaTex": ["$90^\\circ$", "$180^\\circ$", "$360^\\circ$", "$0^\\circ<\\alpha<90^\\circ$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Odczyt kąta",
                "problem": "Zmierz kąt między ramionami: wskazówka na 0° i 60°.",
                "solution": "Odczyt to 60°.",
                "explanation": "Jedno ramię na zerze, odczyt z drugiego.",
                "timeEstimate": 180
              },
              {
                "title": "Klasyfikacja",
                "problem": "Kąt ma 130°. Jaki to rodzaj?",
                "solution": "Rozwarty.",
                "explanation": "130° mieści się między 90° a 180°.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Podaj rodzaj kąta 45°",
                "expectedAnswer": "Ostry",
                "hints": ["Między 0° a 90°", "Mniejszy od prostego"],
                "timeEstimate": 120
              },
              {
                "type": "intermediate",
                "problem": "Zaznacz kąt 90°",
                "expectedAnswer": "Prosty",
                "hints": ["Użyj ekierki", "Ramię na 0°, drugie na 90°"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Jaki to kąt: 210°",
                "expectedAnswer": "Wypukły półpełny+ (większy niż 180°)",
                "hints": ["180° to półpełny", "210°>180°"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "64bcc8a3-5f82-4050-9dc8-412f9b55a31c",
          "skillName": "Działania na liczbach naturalnych",
          "class_level": 4,
          "department": "real_numbers",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Podstawowe działania to dodawanie, odejmowanie, mnożenie i dzielenie (z resztą). Stosujemy kolejność działań i własności: przemienność oraz łączność dla dodawania i mnożenia, rozdzielność mnożenia względem dodawania. Sprawdzamy wyniki szacowaniem lub działaniem odwrotnym.",
              "keyConceptsLaTex": ["$a+b=b+a$", "$(a+b)c=ac+bc$", "$a\\cdot1=a$", "$a:0$ niedozw."],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Łączność i rozdzielność",
                "problem": "Oblicz 25·(8+2).",
                "solution": "25·10=250. Albo 25·8+25·2=200+50=250.",
                "explanation": "Rozdzielność daje tę samą wartość co obliczenie w nawiasie.",
                "timeEstimate": 240
              },
              {
                "title": "Działanie odwrotne",
                "problem": "Sprawdź 732−259=473.",
                "solution": "Dodaj 473+259=732. Równe – poprawnie.",
                "explanation": "Odejmowanie weryfikujemy dodawaniem.",
                "timeEstimate": 180
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "36·5",
                "expectedAnswer": "180",
                "hints": ["30·5 + 6·5", "Rozdzielność"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "120 : 8",
                "expectedAnswer": "15",
                "hints": ["8·15=120", "Działanie odwrotne"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "(14+6)·25 − 200",
                "expectedAnswer": "300",
                "hints": ["(20)·25", "Sprawdź 500−200"],
                "timeEstimate": 240
              }
            ]
          }
        },
        {
          "skillId": "572e4033-f225-4821-a7c6-4048c6adadbf",
          "skillName": "Ułamki zwykłe",
          "class_level": 4,
          "department": "real_numbers",
          "generatorParams": { "microSkill": "default", "difficultyRange": [1, 8], "fallbackTrigger": "standard_approach" },
          "content": {
            "theory": {
              "introduction": "Ułamek zwykły $\\tfrac{a}{b}$ (b≠0) oznacza część całości. Ułamki równoważne powstają przez mnożenie/dzielenie licznika i mianownika przez tę samą liczbę. Ułamki skracamy przez dzielenie przez wspólny dzielnik. Porównujemy przez wspólny mianownik.",
              "keyConceptsLaTex": ["$\\tfrac{a}{b}$", "$b\\ne0$", "$\\tfrac{ka}{kb}$", "$\\tfrac{2}{4}=\\tfrac{1}{2}$"],
              "timeEstimate": 180
            },
            "examples": [
              {
                "title": "Skracanie",
                "problem": "Skróć 12/18.",
                "solution": "Podziel przez 6: 12/18=2/3.",
                "explanation": "Wspólny dzielnik 6 redukuje licznik i mianownik.",
                "timeEstimate": 180
              },
              {
                "title": "Wspólny mianownik",
                "problem": "Porównaj 3/5 i 2/3.",
                "solution": "Wspólny mianownik 15: 9/15 i 10/15 → 2/3 większy.",
                "explanation": "Przekształcenie do wspólnego mianownika ułatwia porównanie.",
                "timeEstimate": 240
              }
            ],
            "practiceExercises": [
              {
                "type": "basic",
                "problem": "Uprość 4/6",
                "expectedAnswer": "2/3",
                "hints": ["Podziel przez 2", "Sprawdź jeszcze przez 3"],
                "timeEstimate": 180
              },
              {
                "type": "intermediate",
                "problem": "Który większy: 5/8 czy 1/2?",
                "expectedAnswer": "5/8",
                "hints": ["1/2=4/8", "Porównaj liczniki"],
                "timeEstimate": 180
              },
              {
                "type": "advanced",
                "problem": "Sprowadź 2/9 i 1/6 do wspólnego mianownika",
                "expectedAnswer": "4/18 i 3/18",
                "hints": ["NWW(9,6)=18", "Pomnóż liczniki i mianowniki"],
                "timeEstimate": 240
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