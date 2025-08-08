import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AnalyzeRequest = {
  imagesBase64?: string[]; // data URLs or raw base64 (will accept both)
};

type AnalyzeResponse = {
  detectedTopics: { topic: string; confidence: number }[];
  difficultySuggestion: 'easy' | 'medium' | 'hard';
  sampleTasks: string[];
  lessonPlan: {
    title: string;
    objectives: string[];
    outline: string[];
    recommendedPrerequisites: string[];
  };
  skillMatches: { id: string; name: string; confidence: number }[];
};

function normalizeDataUrl(b64: string) {
  if (b64.startsWith('data:image')) return b64;
  // Assume jpeg if not provided
  return `data:image/jpeg;base64,${b64}`;
}

function stringSimilarity(a: string, b: string) {
  // simple cosine-like similarity on word sets
  const setA = new Set(a.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean));
  if (!setA.size || !setB.size) return 0;
  let inter = 0;
  setA.forEach((w) => { if (setB.has(w)) inter++; });
  return inter / Math.sqrt(setA.size * setB.size);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openAIApiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not set' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const authHeader = req.headers.get('Authorization');
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader ?? '' } }
  });

  try {
    const body = (await req.json()) as AnalyzeRequest;
    const images = (body.imagesBase64 || []).slice(0, 5); // max 5 images

    if (!images.length) {
      return new Response(JSON.stringify({ error: 'No images provided' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch user (optional, for telemetry / personalization)
    const { data: authUser } = await supabase.auth.getUser();
    const userId = authUser?.user?.id;

    // Fetch skills list for fuzzy matching
    const { data: skills } = await supabase
      .from('skills')
      .select('id,name,department,level,is_active')
      .eq('is_active', true);

    // Build OpenAI messages with images
    const content: any[] = [
      { type: 'text', text: `You are an expert math tutor. Analyze the following student materials (photos of notes/tests/homework). Extract:
1) topics: list of math topics (e.g., quadratic equations, factoring polynomials, derivatives), with confidence 0-1
2) difficultySuggestion: one of easy, medium, hard suitable for a high-school student
3) sampleTasks: 3-5 concise, non-trivial tasks from the materials, normalized to clean text
4) lessonPlan: title, 3-5 objectives, 3-6 outline bullet points, and 2-4 recommendedPrerequisites

Rules:
- Focus on the core math concept(s); ignore personal data or unrelated doodles
- Prefer Polish topic names when obvious (e.g., "Równania kwadratowe")
- Avoid trivial tasks (like 2+2). Keep tasks at least basic high-school level
- Return ONLY valid JSON in the exact schema below.

Schema:
{
  "detectedTopics": [{ "topic": string, "confidence": number }],
  "difficultySuggestion": "easy" | "medium" | "hard",
  "sampleTasks": string[],
  "lessonPlan": {
    "title": string,
    "objectives": string[],
    "outline": string[],
    "recommendedPrerequisites": string[]
  }
}` }
    ];

    for (const img of images) {
      content.push({ type: 'image_url', image_url: { url: normalizeDataUrl(img) } });
    }

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a careful JSON-only producer.' },
          { role: 'user', content },
        ],
        temperature: 0.2,
      })
    });

    const aiJson = await aiRes.json();
    const text = aiJson?.choices?.[0]?.message?.content?.trim?.() || '';

    let parsed: Omit<AnalyzeResponse, 'skillMatches'> | null = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // Attempt to extract JSON block
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch (_) { /* ignore */ }
      }
    }

    if (!parsed) {
      console.error('Failed to parse model output', { text: text?.slice(0, 300) });
      return new Response(JSON.stringify({ error: 'Failed to parse AI output' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fuzzy match topics to skills
    const detected = parsed.detectedTopics || [];
    const skillMatches: AnalyzeResponse['skillMatches'] = [];
    if (skills && Array.isArray(skills)) {
      for (const t of detected) {
        const best = skills
          .map((s: any) => ({ s, sim: Math.max(
            stringSimilarity(t.topic, s.name || ''),
            stringSimilarity(t.topic, `${s.department} ${s.name}`)
          ) }))
          .sort((a: any, b: any) => b.sim - a.sim)[0];
        if (best && best.sim > 0.2) {
          skillMatches.push({ id: best.s.id, name: best.s.name, confidence: Number(best.sim.toFixed(2)) });
        }
      }
    }

    const response: AnalyzeResponse = {
      detectedTopics: detected,
      difficultySuggestion: parsed.difficultySuggestion || 'medium',
      sampleTasks: parsed.sampleTasks || [],
      lessonPlan: parsed.lessonPlan || { title: 'Lekcja', objectives: [], outline: [], recommendedPrerequisites: [] },
      skillMatches,
    };

    // basic telemetry log
    console.log('analyze-student-materials', {
      userId,
      imagesCount: images.length,
      topics: response.detectedTopics?.map((t) => t.topic).slice(0, 5),
      matchedSkills: response.skillMatches?.length,
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error in analyze-student-materials:', error?.message || error);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: error?.message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
