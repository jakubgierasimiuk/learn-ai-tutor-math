import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export const ContentImportPage = () => {
  const criticalSkills = [
    // Klasa 1
    { name: 'Funkcje — definicja i własności', class: 1, department: 'mathematics' },
    { name: 'Równania i nierówności kwadratowe', class: 1, department: 'mathematics' },
    { name: 'Trygonometria — funkcje i wzory', class: 1, department: 'mathematics' },
    { name: 'Ciągi arytmetyczne i geometryczne', class: 1, department: 'mathematics' },
    { name: 'Prawdopodobieństwo warunkowe', class: 1, department: 'mathematics' },
    { name: 'Liczby rzeczywiste', class: 1, department: 'real_numbers' },
    { name: 'Twierdzenie Pitagorasa', class: 1, department: 'geometry' },
    
    // Klasa 2
    { name: 'Funkcja wykładnicza i logarytmiczna', class: 2, department: 'mathematics' },
    { name: 'Geometria analityczna – okrąg i parabola', class: 2, department: 'mathematics' },
    { name: 'Równania kwadratowe', class: 2, department: 'algebra' },
    { name: 'Wyrażenia algebraiczne', class: 2, department: 'algebraic_expressions' },
    { name: 'Ciągi arytmetyczne', class: 2, department: 'sequences' },
    
    // Klasa 3 
    { name: 'Pochodna funkcji — definicja, obliczanie, interpretacje', class: 3, department: 'calculus' },
    { name: 'Całka nieoznaczona — podstawowe techniki', class: 3, department: 'calculus' },
    { name: 'Stereometria — objętości i pola powierzchni', class: 3, department: 'geometry' },
    { name: 'Prawdopodobieństwo klasyczne', class: 3, department: 'statistics' },
  ];

  const highPrioritySkills = [
    // Klasa 4 - podstawy arytmetyki
    { name: 'Wartość miejsca w systemie dziesiętnym (do milionów)', class: 4, department: 'arithmetic' },
    { name: 'Liczby dziesiętne – zapis, porównywanie i oś liczbowa', class: 4, department: 'arithmetic' },
    { name: 'Tabliczka mnożenia do 100', class: 4, department: 'arithmetic' },
    { name: 'Ułamki zwykłe – pojęcie i reprezentacje', class: 4, department: 'arithmetic' },
    { name: 'Dodawanie pisemne liczb naturalnych (z przeniesieniem)', class: 4, department: 'arithmetic' },
    { name: 'Odejmowanie pisemne liczb naturalnych (z pożyczką)', class: 4, department: 'arithmetic' },
    { name: 'Mnożenie pisemne przez liczbę jednocyfrową', class: 4, department: 'arithmetic' },
    { name: 'Dzielenie pisemne przez liczbę jednocyfrową (z resztą)', class: 4, department: 'arithmetic' },
    { name: 'Kolejność wykonywania działań z nawiasami', class: 4, department: 'arithmetic' },
    { name: 'Dodawanie i odejmowanie liczb dziesiętnych', class: 4, department: 'arithmetic' },
    
    // Pozostałe klasy 4-6
    { name: 'Porównywanie i porządkowanie liczb naturalnych', class: 4, department: 'arithmetic' },
    { name: 'Oś liczbowa – podstawy', class: 4, department: 'arithmetic' },
    { name: 'Ułamki niewłaściwe i liczby mieszane', class: 4, department: 'arithmetic' },
    { name: 'Czynniki i wielokrotności, parzystość i nieparzystość', class: 4, department: 'arithmetic' },
  ];

  const remainingSkills = [
    // Wszystkie pozostałe umiejętności z klasy 4-6 oraz inne
    'Własności działań: przemienność i łączność',
    'Figury płaskie – podstawowe pojęcia',
    'Pomiary długości i obwodu',
    'Pole prostokąta i kwadratu',
    'Jednostki długości i ich zamiany',
    'Liczby ujemne – wprowadzenie',
    'Procenty podstawowe',
    'Proporcjonalność prosta',
    'Skala i mapy',
    'Wykresy słupkowe i kołowe',
    'Średnia arytmetyczna',
    'Układy równań liniowych',
    'Funkcje liniowe',
    'Geometria przestrzenna podstawy',
    'Trójkąty – rodzaje i własności',
    'Wielokąty foremne',
    'Okrąg i koło',
    'Prawdopodobieństwo i statystyka podstawy',
    // ... i wiele innych
  ];

  const totalMissing = criticalSkills.length + highPrioritySkills.length + remainingSkills.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Analiza brakujących umiejętności
        </h1>
        <div className="text-xl text-muted-foreground">
          <strong className="text-red-600">204 umiejętności</strong> wymaga uzupełnienia treści
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Stan bazy: 26/230 umiejętności ma pełną zawartość (11.3% pokrycia)
        </div>
      </div>

      {/* CRITICAL PRIORITY */}
      <Card className="border-red-500 border-2">
        <CardHeader className="bg-red-50 dark:bg-red-950/30">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-6 w-6" />
            PRIORYTET KRYTYCZNY
            <span className="ml-auto text-sm font-normal">
              {criticalSkills.length} umiejętności
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-sm text-red-600 dark:text-red-400 mb-4 font-medium">
            Fundamentalne umiejętności wymagane do dalszej nauki. Brak tych treści blokuje rozwój ucznia.
          </div>
          <div className="grid gap-3">
            {criticalSkills.map((skill, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex-1">
                  <div className="font-medium text-red-900 dark:text-red-100">
                    {skill.name}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Klasa {skill.class} • {skill.department}
                  </div>
                </div>
                <div className="ml-4 text-xs text-red-500 dark:text-red-500 font-medium">
                  BRAK TREŚCI
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* HIGH PRIORITY */}
      <Card className="border-orange-500 border-2">
        <CardHeader className="bg-orange-50 dark:bg-orange-950/30">
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <Clock className="h-6 w-6" />
            PRIORYTET WYSOKI
            <span className="ml-auto text-sm font-normal">
              {highPrioritySkills.length} umiejętności
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-sm text-orange-600 dark:text-orange-400 mb-4 font-medium">
            Ważne umiejętności podstawowe, szczególnie z klas 4-6. Konieczne do solidnego fundamentu matematycznego.
          </div>
          <div className="grid gap-2">
            {highPrioritySkills.map((skill, index) => (
              <div key={index} className="flex items-start justify-between p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                <div className="flex-1">
                  <div className="font-medium text-orange-900 dark:text-orange-100 text-sm">
                    {skill.name}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    Klasa {skill.class} • {skill.department}
                  </div>
                </div>
                <div className="ml-4 text-xs text-orange-500 dark:text-orange-500">
                  BRAK TREŚCI
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* REMAINING SKILLS */}
      <Card className="border-yellow-500">
        <CardHeader className="bg-yellow-50 dark:bg-yellow-950/30">
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <CheckCircle2 className="h-6 w-6" />
            POZOSTAŁE UMIEJĘTNOŚCI
            <span className="ml-auto text-sm font-normal">
              ~{remainingSkills.length}+ umiejętności
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-4 font-medium">
            Dodatkowe umiejętności uzupełniające program. Mogą być implementowane po uzupełnieniu priorytetów.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {remainingSkills.slice(0, 20).map((skill, index) => (
              <div key={index} className="p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-sm text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                {skill}
              </div>
            ))}
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-sm text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700 italic">
              ... i {remainingSkills.length - 20} dodatkowych umiejętności
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SUMMARY STATS */}
      <Card className="border-slate-300">
        <CardHeader>
          <CardTitle className="text-slate-700 dark:text-slate-300">
            Podsumowanie stanu bazy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {criticalSkills.length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Krytyczne braki
              </div>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {highPrioritySkills.length}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">
                Wysokie braki
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                204
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Łączne braki
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <strong>Pokrycie treści:</strong> 26/230 umiejętności (11.3%) • 
            <strong className="text-red-600"> Wymagany masowy import treści</strong>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentImportPage;