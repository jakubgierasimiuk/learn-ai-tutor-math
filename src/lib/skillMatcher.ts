// Fuzzy matching and synonym mapping for skill recognition
export interface SkillMatch {
  skill: {
    id: string;
    name: string;
    department: string;
    description?: string;
  };
  score: number;
  matchReason: string;
}

// Comprehensive synonym mapping for Polish math skills
const SKILL_SYNONYMS: Record<string, string[]> = {
  // Pochodne i analiza matematyczna
  "pochodne": ["pochodna", "różniczkowanie", "derivative", "pochodna funkcji", "różniczka", "tangent"],
  "całki": ["całka", "całkowanie", "integration", "pole pod krzywą", "antiderivative"],
  "granice": ["granica", "granicy", "limit", "zbieganie", "divergence"],
  "ciągłość": ["ciągłość funkcji", "funkcje ciągłe", "continuity", "nieciągłość"],
  
  // Algebra
  "równania": ["równanie", "rozwiązywanie równań", "equation", "solutions"],
  "nierówności": ["nierówność", "inequality", "układ nierówności"],
  "funkcje": ["funkcja", "function", "wykres funkcji", "dziedzina", "przeciwdziedzina"],
  "wielomiany": ["wielomian", "polynomial", "rozkład na czynniki", "factorization"],
  
  // Geometria
  "trójkąty": ["trójkąt", "triangle", "trigonometry", "trygonometria"],
  "czworokąty": ["czworokąt", "quadrilateral", "prostokąt", "kwadrat", "romb"],
  "okręgi": ["okrąg", "circle", "koło", "promień", "średnica"],
  "bryły": ["bryła", "solid", "objętość", "pole powierzchni", "graniastosłupy"],
  
  // Prawdopodobieństwo i statystyka  
  "prawdopodobieństwo": ["probability", "szansa", "zdarzenie", "event"],
  "statystyka": ["statistics", "średnia", "mediana", "odchylenie standardowe"],
  
  // Liczby i działania
  "ułamki": ["ułamek", "fraction", "dzielenie", "procent", "percentage"],
  "potęgi": ["potęga", "power", "exponent", "pierwiastki", "roots"],
  "logarytmy": ["logarytm", "logarithm", "log", "ln", "lg"]
};

// Keywords that indicate specific skill areas
const SKILL_KEYWORDS: Record<string, string[]> = {
  algebra: ["równanie", "x", "y", "zmienna", "rozwiąż", "solve", "funkcja", "wykres"],
  geometry: ["kąt", "długość", "pole", "objętość", "trójkąt", "okrąg", "bryła", "figura"],
  calculus: ["pochodna", "całka", "granica", "różniczka", "tangent", "pole pod krzywą"],
  probability: ["prawdopodobieństwo", "szansa", "zdarzenie", "losowy", "statystyka"]
};

// Common learning intent phrases
const LEARNING_INTENTS = [
  "chcę się nauczyć", "nie rozumiem", "pomóż mi z", "wytłumacz mi",
  "jak rozwiązać", "co to jest", "czym jest", "nie wiem jak"
];

export function extractMathConcepts(message: string): string[] {
  const normalizedMessage = message.toLowerCase().trim();
  const concepts: string[] = [];
  
  // Check for direct skill synonym matches
  Object.entries(SKILL_SYNONYMS).forEach(([skill, synonyms]) => {
    synonyms.forEach(synonym => {
      if (normalizedMessage.includes(synonym.toLowerCase())) {
        concepts.push(skill);
      }
    });
  });
  
  // Check for subject-specific keywords
  Object.entries(SKILL_KEYWORDS).forEach(([subject, keywords]) => {
    const matchCount = keywords.filter(keyword => 
      normalizedMessage.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount >= 2) { // Multiple keywords suggest this subject
      concepts.push(subject);
    }
  });
  
  return [...new Set(concepts)]; // Remove duplicates
}

export function calculateSkillRelevance(skill: any, message: string, extractedConcepts: string[]): SkillMatch {
  const normalizedMessage = message.toLowerCase();
  const skillName = skill.name.toLowerCase();
  const skillDesc = (skill.description || '').toLowerCase();
  
  let score = 0;
  let matchReasons: string[] = [];
  
  // 1. Direct name similarity (fuzzy matching)
  const nameWords = skillName.split(' ');
  const messageWords = normalizedMessage.split(' ');
  
  nameWords.forEach(nameWord => {
    messageWords.forEach(messageWord => {
      if (nameWord.length > 3 && messageWord.length > 3) {
        const similarity = calculateStringSimilarity(nameWord, messageWord);
        if (similarity > 0.7) {
          score += similarity * 30; // High weight for name matches
          matchReasons.push(`name similarity: ${nameWord} ≈ ${messageWord}`);
        }
      }
    });
  });
  
  // 2. Exact keyword matches in name
  if (normalizedMessage.includes(skillName)) {
    score += 50;
    matchReasons.push('exact name match');
  }
  
  // 3. Synonym matching
  Object.entries(SKILL_SYNONYMS).forEach(([concept, synonyms]) => {
    if (extractedConcepts.includes(concept)) {
      synonyms.forEach(synonym => {
        if (skillName.includes(synonym) || skillDesc.includes(synonym)) {
          score += 25;
          matchReasons.push(`synonym match: ${concept}`);
        }
      });
    }
  });
  
  // 4. Department-specific boost
  const department = skill.department.toLowerCase();
  if (department === 'algebra' && extractedConcepts.includes('algebra')) score += 15;
  if (department === 'geometry' && extractedConcepts.includes('geometry')) score += 15;
  if (department === 'calculus' && extractedConcepts.includes('calculus')) score += 15;
  
  // 5. Description content matching
  extractedConcepts.forEach(concept => {
    if (skillDesc.includes(concept)) {
      score += 10;
      matchReasons.push(`description contains: ${concept}`);
    }
  });
  
  // 6. Learning intent detection
  const hasLearningIntent = LEARNING_INTENTS.some(intent => 
    normalizedMessage.includes(intent)
  );
  
  if (hasLearningIntent) {
    score += 5; // Small boost for learning intent
  }
  
  return {
    skill,
    score: Math.min(score, 100), // Cap at 100
    matchReason: matchReasons.join(', ') || 'no specific match'
  };
}

function calculateStringSimilarity(str1: string, str2: string): number {
  // Simple Levenshtein distance based similarity
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export function filterSkillsByDepartment(skills: any[], concepts: string[]): any[] {
  // If specific department concepts are detected, filter to relevant departments
  const departmentMap = {
    algebra: ['algebra'],
    geometry: ['geometry'],  
    calculus: ['calculus'],
    probability: ['probability']
  };
  
  let relevantDepartments: string[] = [];
  
  Object.entries(departmentMap).forEach(([dept, deptConcepts]) => {
    if (deptConcepts.some(concept => concepts.includes(concept))) {
      relevantDepartments.push(dept);
    }
  });
  
  if (relevantDepartments.length === 0) {
    // No specific department detected, return top skills from each major department
    const majorDepts = ['algebra', 'geometry', 'calculus'];
    return skills.filter(skill => majorDepts.includes(skill.department));
  }
  
  return skills.filter(skill => 
    relevantDepartments.some(dept => skill.department.includes(dept))
  );
}