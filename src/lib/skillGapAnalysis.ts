// Plan uzupełnienia braków w systemie umiejętności
// Analiza przeprowadzona: 2025-01-21

export interface SkillGap {
  priority: 'critical' | 'high' | 'medium' | 'low';
  class_level: number;
  department: string;
  skillName: string;
  justification: string;
  prerequisites?: string[];
  leads_to?: string[];
}

export const skillGapAnalysis: SkillGap[] = [
  // ========== KLASA 1 - PODSTAWY ==========
  
  // CRITICAL - Nierówności (fundamentalne)
  {
    priority: 'critical',
    class_level: 1,
    department: 'algebra',
    skillName: 'Nierówności liniowe z jedną niewiadomą',
    justification: 'Podstawa do wszystkich dalszych nierówności, często na maturze',
    leads_to: ['Nierówności kwadratowe', 'Układy nierówności']
  },
  {
    priority: 'critical',
    class_level: 1,
    department: 'algebra',
    skillName: 'Wartość bezwzględna - definicja i własności',
    justification: 'Kluczowa dla geometrii, granic, nierówności',
    leads_to: ['Równania z wartością bezwzględną', 'Metryka']
  },
  
  // HIGH - Kombinatoryka podstawowa
  {
    priority: 'high',
    class_level: 1,
    department: 'mathematics',
    skillName: 'Permutacje i wariacje',
    justification: 'Podstawa kombinatoryki, często na maturze podstawowej',
    leads_to: ['Kombinacje', 'Prawdopodobieństwo klasyczne']
  },
  {
    priority: 'high',
    class_level: 1,
    department: 'mathematics',
    skillName: 'Kombinacje i wzór Newtona',
    justification: 'Kluczowe dla prawdopodobieństwa i algebry',
    prerequisites: ['Permutacje i wariacje'],
    leads_to: ['Rozkład dwumianowy']
  },

  // MEDIUM - Geometria podstawowa
  {
    priority: 'medium',
    class_level: 1,
    department: 'geometry',
    skillName: 'Pola figur płaskich',
    justification: 'Podstawa stereometrii i całek',
    leads_to: ['Objętości', 'Całka oznaczona']
  },

  // ========== KLASA 2 - ROZSZERZENIA ==========
  
  // CRITICAL - Nierówności zaawansowane  
  {
    priority: 'critical',
    class_level: 2,
    department: 'algebra',
    skillName: 'Nierówności kwadratowe',
    justification: 'Bardzo często na maturze rozszerzonej',
    prerequisites: ['Nierówności liniowe', 'Równania kwadratowe'],
    leads_to: ['Dziedziny funkcji', 'Monotoniczność']
  },
  {
    priority: 'critical',
    class_level: 2,
    department: 'algebra', 
    skillName: 'Równania i nierówności z wartością bezwzględną',
    justification: 'Standardowy temat maturalny, trudny dla uczniów',
    prerequisites: ['Wartość bezwzględna - definicja'],
    leads_to: ['Metryka w przestrzeni']
  },

  // HIGH - Funkcje zaawansowane
  {
    priority: 'high',
    class_level: 2,
    department: 'mathematics',
    skillName: 'Funkcje odwrotne',
    justification: 'Kluczowe dla logarytmów i funkcji cyklometrycznych',
    prerequisites: ['Funkcje — definicja i własności'],
    leads_to: ['Funkcje cyklometryczne']
  },
  {
    priority: 'high',
    class_level: 2,
    department: 'mathematics',
    skillName: 'Asymptoty funkcji (pionowe, poziome, ukośne)',
    justification: 'Ważne dla analizy funkcji, często na maturze',
    prerequisites: ['Granica funkcji'],
    leads_to: ['Badanie funkcji z pochodnymi']
  },

  // HIGH - Geometria analityczna
  {
    priority: 'high',
    class_level: 2,
    department: 'mathematics',
    skillName: 'Prosta w układzie współrzędnych - wszystkie postacie',
    justification: 'Rozszerza geometrię analityczną z klasy 2',
    prerequisites: ['Geometria analityczna – okrąg i parabola'],
    leads_to: ['Przekształcenia geometryczne']
  },

  // MEDIUM - Ciągi rozszerzone
  {
    priority: 'medium',
    class_level: 2,
    department: 'sequences',
    skillName: 'Ciągi geometryczne - suma nieskończona',
    justification: 'Rozszerza wiedzę o ciągach, przydatne w analizie',
    prerequisites: ['Ciągi arytmetyczne'],
    leads_to: ['Szeregi liczbowe']
  },

  // ========== KLASA 3 - ANALIZA I ZASTOSOWANIA ==========
  
  // CRITICAL - Całka oznaczona
  {
    priority: 'critical',
    class_level: 3,
    department: 'calculus',
    skillName: 'Całka oznaczona - definicja i obliczanie',
    justification: 'Kluczowa dla zastosowań, często na maturze rozszerzonej',
    prerequisites: ['Całka nieoznaczona'],
    leads_to: ['Pola figur', 'Objętości brył obrotowych']
  },
  {
    priority: 'critical',
    class_level: 3,
    department: 'calculus',
    skillName: 'Zastosowania całki oznaczonej (pola, objętości)',
    justification: 'Praktyczne zastosowania analizy matematycznej',
    prerequisites: ['Całka oznaczona - definicja'],
    leads_to: ['Fizyka matematyczna']
  },

  // HIGH - Ekstremum i monotoniczność
  {
    priority: 'high', 
    class_level: 3,
    department: 'calculus',
    skillName: 'Badanie funkcji z pochodnymi (ekstremum, monotoniczność)',
    justification: 'Kompleksowa analiza funkcji, częsty temat maturalny',
    prerequisites: ['Pochodna funkcji — definicja, obliczanie'],
    leads_to: ['Optymalizacja']
  },
  {
    priority: 'high',
    class_level: 3,
    department: 'calculus',
    skillName: 'Zadania optymalizacyjne',
    justification: 'Praktyczne zastosowania pochodnych',
    prerequisites: ['Badanie funkcji z pochodnymi'],
    leads_to: ['Modele matematyczne']
  },

  // HIGH - Trigonometria zaawansowana
  {
    priority: 'high',
    class_level: 3,
    department: 'trigonometry',
    skillName: 'Równania trygonometryczne podstawowe',
    justification: 'Rozszerza trigonometrię, często na maturze',
    prerequisites: ['Funkcje trygonometryczne'],
    leads_to: ['Równania trygonometryczne złożone']
  },
  {
    priority: 'high',
    class_level: 3,
    department: 'trigonometry', 
    skillName: 'Wzory trygonometryczne (sumy, różnicy, podwojenia)',
    justification: 'Narzędzia do rozwiązywania równań trygonometrycznych',
    prerequisites: ['Funkcje trygonometryczne'],
    leads_to: ['Funkcje okresowe w zastosowaniach']
  },

  // HIGH - Funkcje cyklometryczne
  {
    priority: 'high',
    class_level: 3,
    department: 'trigonometry',
    skillName: 'Funkcje cyklometryczne (arcsin, arccos, arctg)',
    justification: 'Uzupełnia wiedzę o funkcjach odwrotnych',
    prerequisites: ['Funkcje odwrotne', 'Funkcje trygonometryczne'],
    leads_to: ['Całkowanie funkcji trygonometrycznych']
  },

  // MEDIUM - Statystyka opisowa
  {
    priority: 'medium',
    class_level: 3,
    department: 'statistics',
    skillName: 'Statystyka opisowa (średnie, mediana, kwartyle)',
    justification: 'Podstawa statystyki, przydatne w życiu',
    leads_to: ['Testowanie hipotez', 'Regresja']
  },
  {
    priority: 'medium',
    class_level: 3,
    department: 'statistics',
    skillName: 'Estymacja i przedziały ufności',
    justification: 'Wnioskowanie statystyczne, uniwersyteckie przygotowanie',
    prerequisites: ['Rozkłady prawdopodobieństwa'],
    leads_to: ['Testowanie hipotez']
  },

  // MEDIUM - Planimetria zaawansowana
  {
    priority: 'medium',
    class_level: 3,
    department: 'geometry',
    skillName: 'Okrąg wpisany i opisany na trójkącie',
    justification: 'Klasyczna geometria, może pojawić się na maturze',
    prerequisites: ['Stereometria — objętości i pola powierzchni'],
    leads_to: ['Geometria analityczna zaawansowana']
  },

  // LOW - Zaawansowane
  {
    priority: 'low',
    class_level: 3,
    department: 'mathematics',
    skillName: 'Indukcja matematyczna',
    justification: 'Metoda dowodów, przygotowanie do studiów',
    leads_to: ['Dowody matematyczne']
  },
  {
    priority: 'low',
    class_level: 3,
    department: 'calculus',
    skillName: 'Szeregi liczbowe (zbieżność, suma)',
    justification: 'Zaawansowana analiza, przygotowanie uniwersyteckie',
    prerequisites: ['Ciągi geometryczne - suma nieskończona'],
    leads_to: ['Szeregi potęgowe']
  }
];

// Podsumowanie priorytetów
export const prioritySummary = {
  critical: skillGapAnalysis.filter(skill => skill.priority === 'critical').length, // 5
  high: skillGapAnalysis.filter(skill => skill.priority === 'high').length,         // 11  
  medium: skillGapAnalysis.filter(skill => skill.priority === 'medium').length,     // 6
  low: skillGapAnalysis.filter(skill => skill.priority === 'low').length           // 2
};

// Grupowanie po klasach
export const gapsByClass = {
  class1: skillGapAnalysis.filter(skill => skill.class_level === 1),  // 5 umiejętności
  class2: skillGapAnalysis.filter(skill => skill.class_level === 2),  // 7 umiejętności  
  class3: skillGapAnalysis.filter(skill => skill.class_level === 3)   // 12 umiejętności
};

// Funkcje pomocnicze
export const getCriticalGaps = () => skillGapAnalysis.filter(skill => skill.priority === 'critical');
export const getGapsByDepartment = (department: string) => 
  skillGapAnalysis.filter(skill => skill.department === department);
  
export const getImplementationOrder = () => 
  skillGapAnalysis
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || a.class_level - b.class_level;
    });