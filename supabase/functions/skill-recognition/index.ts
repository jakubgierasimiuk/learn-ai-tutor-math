import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

// Inline fuzzy matching utilities (simplified for edge function)
function extractMathConcepts(message: string): string[] {
  const normalizedMessage = message.toLowerCase().trim();
  const concepts: string[] = [];
  
  const synonymMap = {
    "pochodne": ["pochodna", "różniczkowanie", "derivative", "tangent"],
    "całki": ["całka", "całkowanie", "integration", "pole pod krzywą"],
    "równania": ["równanie", "rozwiązywanie", "equation", "x ="],
    "funkcje": ["funkcja", "function", "wykres", "f(x)"],
    "geometria": ["trójkąt", "okrąg", "pole", "objętość", "kąt"],
    "algebra": ["wielomian", "ułamek", "potęga", "logarytm"]
  };
  
  Object.entries(synonymMap).forEach(([concept, synonyms]) => {
    if (synonyms.some(synonym => normalizedMessage.includes(synonym))) {
      concepts.push(concept);
    }
  });
  
  return concepts;
}

function calculateSkillRelevance(skill: any, message: string, concepts: string[]): number {
  const normalizedMessage = message.toLowerCase();
  const skillName = skill.name.toLowerCase();
  let score = 0;
  
  // Exact name match
  if (normalizedMessage.includes(skillName) || skillName.includes(normalizedMessage.slice(0, 10))) {
    score += 50;
  }
  
  // Concept matching
  concepts.forEach(concept => {
    if (skillName.includes(concept) || (skill.description || '').toLowerCase().includes(concept)) {
      score += 20;
    }
  });
  
  // Department relevance
  if (concepts.includes('geometria') && skill.department === 'geometry') score += 15;
  if (concepts.includes('algebra') && skill.department === 'algebra') score += 15;
  if (concepts.includes('pochodne') && skill.department === 'calculus') score += 15;
  
  return score;
}

function filterSkillsByDepartment(skills: any[], concepts: string[]): any[] {
  if (concepts.length === 0) return skills.slice(0, 50);
  
  const relevantSkills = skills.filter(skill => {
    const relevance = calculateSkillRelevance(skill, '', concepts);
    return relevance > 0;
  });
  
  return relevantSkills.length > 0 ? relevantSkills : skills.slice(0, 50);
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

    // FUZZY MATCHING AND INTELLIGENT FILTERING
    const extractedConcepts = extractMathConcepts(message);
    console.log('Extracted concepts from message:', extractedConcepts);
    
    // Filter skills to most relevant ones (max 50)
    const filteredSkills = filterSkillsByDepartment(skills, extractedConcepts);
    const skillMatches = filteredSkills
      .map(skill => calculateSkillRelevance(skill, message, extractedConcepts))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Top 50 most relevant
      
    console.log('Top skill matches:', skillMatches.slice(0, 5));
    
    // Create skills map for quick lookups
    const skillsMap = new Map(skills.map(skill => [skill.name, skill]));
    
    // Prepare optimized skills list for AI prompt
    const topSkills = skillMatches.slice(0, 30); // Even more focused for prompt
    const skillsForPrompt = topSkills.map(match => 
      `${match.skill.name} (${match.skill.department})`
    ).join(', ');

    // Enhanced AI prompt with better structure and empathetic questioning
    const systemPrompt = `Jesteś empatycznym systemem rozpoznawania umiejętności matematycznych dla polskiej aplikacji edukacyjnej.

KONTEKST: Wykryte koncepty z wiadomości ucznia: ${extractedConcepts.join(', ') || 'ogólne'}

NAJLEPSZE DOPASOWANIA (${topSkills.length} umiejętności): ${skillsForPrompt}

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

      // Enhanced candidate matching with fuzzy search
      if (recognitionResult.stage === 'clarification' && recognitionResult.candidates) {
        const candidatesWithIds = recognitionResult.candidates.map((candidateName: string) => {
          // First try exact match
          let skill = skillsMap.get(candidateName);
          
          // If no exact match, try fuzzy matching within top skills
          if (!skill) {
            const fuzzyMatch = topSkills.find(match => 
              match.skill.name.toLowerCase().includes(candidateName.toLowerCase()) ||
              candidateName.toLowerCase().includes(match.skill.name.toLowerCase())
            );
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
        if (!recognitionResult.candidates) {
          recognitionResult.candidates = topSkills.slice(0, 5).map(m => m.skill.name);
          recognitionResult.clarificationQuestion = `Widzę, że potrzebujesz pomocy z matematyką! 📚 Oto obszary, z którymi mogę pomóc: ${recognitionResult.candidates.slice(0, 3).join(', ')}. Co Cię najbardziej interesuje? 🤔`;
        }
      }

      // Validate skill_id exists in database
      if (recognitionResult.skill_id && recognitionResult.stage === 'direct') {
        const skillExists = skills.some(s => s.id === recognitionResult.skill_id);
        if (!skillExists) {
          console.log('Skill ID not found in database, switching to clarification.');
          recognitionResult.stage = 'clarification';
          recognitionResult.skill_id = null;
          recognitionResult.candidates = topSkills.slice(0, 5).map(m => m.skill.name);
        }
      }

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response was:', aiResponse.choices[0].message.content);
      return new Response(JSON.stringify({ 
        stage: 'direct',
        skillId: null, 
        skillName: null, 
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