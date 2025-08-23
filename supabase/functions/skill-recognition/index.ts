import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

// Enhanced skill matching utilities integrated from skillMatcher.ts
interface SkillMatch {
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
  "pochodne": ["pochodna", "różniczkowanie", "derivative", "pochodna funkcji", "różniczka", "tangent", "definicja pochodnej"],
  "całki": ["całka", "całkowanie", "integration", "pole pod krzywą", "antiderivative", "całka oznaczona", "całka nieoznaczona"],
  "granice": ["granica", "granicy", "limit", "zbieganie", "divergence", "granica funkcji"],
  "ciągłość": ["ciągłość funkcji", "funkcje ciągłe", "continuity", "nieciągłość"],
  
  // Algebra
  "równania": ["równanie", "rozwiązywanie równań", "equation", "solutions", "równanie liniowe", "równanie kwadratowe"],
  "nierówności": ["nierówność", "inequality", "układ nierówności", "nierówność kwadratowa"],
  "funkcje": ["funkcja", "function", "wykres funkcji", "dziedzina", "przeciwdziedzina", "f(x)", "funkcja liniowa"],
  "wielomiany": ["wielomian", "polynomial", "rozkład na czynniki", "factorization", "wielomian stopnia"],
  
  // Geometria
  "trójkąty": ["trójkąt", "triangle", "trigonometry", "trygonometria", "trójkąt prostokątny"],
  "czworokąty": ["czworokąt", "quadrilateral", "prostokąt", "kwadrat", "romb", "równoległobok"],
  "okręgi": ["okrąg", "circle", "koło", "promień", "średnica", "obwód koła"],
  "bryły": ["bryła", "solid", "objętość", "pole powierzchni", "graniastosłupy", "ostrosłupy"],
  
  // Prawdopodobieństwo i statystyka  
  "prawdopodobieństwo": ["probability", "szansa", "zdarzenie", "event", "prawdopodobieństwo warunkowe"],
  "statystyka": ["statistics", "średnia", "mediana", "odchylenie standardowe", "statystyka opisowa"],
  
  // Liczby i działania
  "ułamki": ["ułamek", "fraction", "dzielenie", "procent", "percentage", "ułamki zwykłe"],
  "potęgi": ["potęga", "power", "exponent", "pierwiastki", "roots", "potęgowanie"],
  "logarytmy": ["logarytm", "logarithm", "log", "ln", "lg", "logarytm naturalny"],
  "wartość bezwzględna": ["wartość bezwzględna", "moduł", "absolute value", "|x|"]
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

function extractMathConcepts(message: string): string[] {
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

function calculateSkillRelevance(skill: any, message: string, extractedConcepts: string[]): SkillMatch {
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

function filterSkillsByDepartment(skills: any[], concepts: string[]): any[] {
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active skills from the database
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('id, name, department, description')
      .eq('is_active', true);

    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch skills' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!skills || skills.length === 0) {
      console.error('No active skills found in database');
      return new Response(JSON.stringify({ 
        stage: 'direct',
        skill_id: null,
        skill_name: null,
        confidence: 0,
        reasoning: 'No active skills available in database'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ENHANCED FUZZY MATCHING AND INTELLIGENT FILTERING
    const extractedConcepts = extractMathConcepts(message);
    console.log('Extracted concepts from message:', extractedConcepts);
    
    // Filter skills to most relevant ones first
    const filteredSkills = filterSkillsByDepartment(skills || [], extractedConcepts);
    console.log(`Filtered skills from ${skills?.length || 0} to ${filteredSkills.length}`);
    
    // Calculate skill relevance using enhanced matching
    const skillMatches: SkillMatch[] = filteredSkills
      .map(skill => calculateSkillRelevance(skill, message, extractedConcepts))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30); // Top 30 most relevant for prompt optimization
      
    console.log('Top 5 skill matches with scores:', skillMatches.slice(0, 5).map(m => ({
      name: m.skill.name,
      score: m.score,
      reason: m.matchReason
    })));
    
    // Create skills map for quick lookups (use all skills, not just filtered)
    const skillsMap = new Map(skills.map(skill => [skill.name, skill]));
    
    // Prepare optimized skills list for AI prompt
    const skillsForPrompt = skillMatches.map(match => 
      `${match.skill.name} (${match.skill.department}, score: ${Math.round(match.score)})`
    ).join(', ');

    // Enhanced AI prompt with better structure and empathetic questioning
    const systemPrompt = `Jesteś empatycznym systemem rozpoznawania umiejętności matematycznych dla polskiej aplikacji edukacyjnej.

KONTEKST: Wykryte koncepty z wiadomości ucznia: ${extractedConcepts.join(', ') || 'ogólne'}

NAJLEPSZE DOPASOWANIA (${skillMatches.length} umiejętności): ${skillsForPrompt}

ZADANIE: Przeanalizuj wiadomość ucznia i określ umiejętność lub zadaj pytanie doprecyzujące.

ODPOWIEDŹ JSON:
{
  "stage": "direct" | "clarification",
  "skill_id": "exact-skill-id" | null,
  "skill_name": "skill-name" | null,
  "confidence": 0.0-1.0,
  "candidates": ["skill-name-1", "skill-name-2", ...] | null,
  "clarificationQuestion": "empathetic question" | null,
  "reasoning": "brief explanation"
}

ZASADY ROZPOZNAWANIA:
- Jeśli pewność ≥ 0.75: stage="direct", podaj skill_id i skill_name
- Jeśli pewność < 0.75: stage="clarification", podaj candidates (3-8 najlepszych) 
- Dla "clarification" generuj empatyczne pytanie z opcjami poziomów trudności

ZASADY EMPATYCZNEGO PYTANIA:
- Używaj ciepłego, wspierającego tonu: "Widzę, że...", "Pomogę Ci z..."
- Podaj 2-3 konkretne opcje z różnymi poziomami: podstawy → średni → zaawansowany
- Zakończ: "Co Cię najbardziej interesuje? 🤔"
- Przykład: "Widzę, że chcesz się nauczyć o funkcjach! 📈 Mogę pomóc Ci z: (1) Podstawami - co to jest funkcja, (2) Wykresami funkcji, (3) Zaawansowanymi właściwościami. Co Cię najbardziej interesuje? 🤔"

FALLBACK: Jeśli brak dopasowania: stage="direct", skill_id=null, confidence=0`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    
    let recognitionResult;
    try {
      recognitionResult = JSON.parse(aiResponse.choices[0].message.content);
      console.log('Raw AI response:', aiResponse.choices[0].message.content);
      console.log('Parsed recognition result:', recognitionResult);

      // Enhanced candidate matching with advanced fuzzy search
      if (recognitionResult.stage === 'clarification' && recognitionResult.candidates) {
        const candidatesWithIds = recognitionResult.candidates.map((candidateName: string) => {
          // First try exact match
          let skill = skillsMap.get(candidateName);
          
          // If no exact match, try advanced fuzzy matching
          if (!skill) {
            const fuzzyMatch = skillMatches.find(match => {
              const skillName = match.skill.name.toLowerCase();
              const candidateNameLower = candidateName.toLowerCase();
              
              // Try various matching strategies
              return skillName.includes(candidateNameLower) ||
                     candidateNameLower.includes(skillName) ||
                     calculateStringSimilarity(skillName, candidateNameLower) > 0.6;
            });
            skill = fuzzyMatch?.skill;
          }
          
          return skill ? { 
            id: skill.id, 
            name: skill.name, 
            department: skill.department 
          } : null;
        }).filter(Boolean);

        recognitionResult.candidatesWithIds = candidatesWithIds;
        console.log('Enhanced candidates with IDs:', candidatesWithIds);
      }

      // Standardize field names to snake_case and validate logic
      if (recognitionResult.skillId) {
        recognitionResult.skill_id = recognitionResult.skillId;
        delete recognitionResult.skillId;
      }
      if (recognitionResult.skillName) {
        recognitionResult.skill_name = recognitionResult.skillName;
        delete recognitionResult.skillName;
      }

      // Enhanced confidence validation
      if (recognitionResult.confidence < 0.75 && recognitionResult.stage === 'direct') {
        console.log('Confidence below threshold, switching to clarification mode.');
        recognitionResult.stage = 'clarification';
        recognitionResult.skill_id = null;
        recognitionResult.skill_name = null;
        
        // Generate fallback candidates from top matches if not provided
        if (!recognitionResult.candidates && skillMatches.length > 0) {
          recognitionResult.candidates = skillMatches.slice(0, 5).map(m => m.skill.name);
          recognitionResult.clarificationQuestion = `Widzę, że potrzebujesz pomocy z matematyką! 📚 Oto obszary, z którymi mogę pomóc: ${recognitionResult.candidates.slice(0, 3).join(', ')}. Co Cię najbardziej interesuje? 🤔`;
          
          // Also set candidatesWithIds for frontend use
          recognitionResult.candidatesWithIds = skillMatches.slice(0, 5).map(m => ({
            id: m.skill.id,
            name: m.skill.name,
            department: m.skill.department
          }));
        }
      }

      // Validate skill_id exists in database
      if (recognitionResult.skill_id && recognitionResult.stage === 'direct') {
        const skillExists = skills.some(s => s.id === recognitionResult.skill_id);
        if (!skillExists) {
          console.log('Skill ID not found in database, switching to clarification.');
          recognitionResult.stage = 'clarification';
          recognitionResult.skill_id = null;
          recognitionResult.skill_name = null;
          
          if (skillMatches.length > 0) {
            recognitionResult.candidates = skillMatches.slice(0, 5).map(m => m.skill.name);
            recognitionResult.candidatesWithIds = skillMatches.slice(0, 5).map(m => ({
              id: m.skill.id,
              name: m.skill.name,
              department: m.skill.department
            }));
            recognitionResult.clarificationQuestion = `Nie mogłem znaleźć dokładnej umiejętności. Oto podobne opcje: ${recognitionResult.candidates.slice(0, 3).join(', ')}. Którą wybierasz? 🤔`;
          }
        }
      }

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response was:', aiResponse.choices[0].message.content);
      return new Response(JSON.stringify({ 
        stage: 'direct',
        skill_id: null, 
        skill_name: null, 
        confidence: 0,
        reasoning: 'Failed to parse skill recognition - AI response was malformed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(recognitionResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in skill recognition:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});