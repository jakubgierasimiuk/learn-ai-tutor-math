import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Helpers
function objectiveBullets(topic: string) {
  return [
    `Rozumie podstawowe pojęcia tematu: ${topic}`,
    `Stosuje algorytmy rozwiązywania zadań z tematu: ${topic}`,
    `Analizuje błędy i uzasadnia rozwiązania w ${topic}`,
  ];
}

function lessonTitle(type: string, topic: string) {
  const map: Record<string, string> = {
    diagnostic: `Diagnoza wstępna – ${topic}`,
    theory: `Teoria i przykłady – ${topic}`,
    guided: `Ćwiczenia kierowane – ${topic}`,
    problem_set: `Zestaw zadań – ${topic}`,
    quiz: `Mini‑test – ${topic}`,
    matura: `Zadania maturalne – ${topic}`,
    review: `Powtórka SRS – ${topic}`,
  };
  return map[type] ?? `${type} – ${topic}`;
}

async function ensureTopicsAndLessons(supabase: any, topicsByCategory: Record<string, string[]>, phase: 1 | 2 | 3, isExtended = false) {
  const allTopics = Object.entries(topicsByCategory).flatMap(([category, names]) =>
    names.map((name) => ({ name, category }))
  );

  const names = allTopics.map((t) => t.name);
  let existingTopics: any[] = [];
  if (names.length) {
    const sel = await supabase.from('topics').select('id,name').in('name', names);
    if (sel.error) throw sel.error;
    existingTopics = sel.data ?? [];
  }

  const existingMap = new Map(existingTopics.map((t: any) => [t.name, t.id]));

  const toInsert = allTopics
    .filter((t) => !existingMap.has(t.name))
    .map((t) => ({
      name: t.name,
      category: t.category,
      difficulty_level: isExtended ? 4 : 2,
      estimated_time_minutes: 60,
      learning_objectives: objectiveBullets(t.name),
      is_active: true,
      description: `Temat: ${t.name}. Zestaw lekcji i zadań zgodnych z podstawą programową${isExtended ? ' (rozszerzenie)' : ''}.`,
    }));

  let insertedTopics: any[] = [];
  if (toInsert.length) {
    const ins = await supabase.from('topics').insert(toInsert).select('id,name');
    if (ins.error) throw ins.error;
    insertedTopics = ins.data ?? [];
  }

  const allWithIds = [
    ...insertedTopics,
    ...Array.from(existingMap, ([name, id]) => ({ id, name })),
  ];

  // Insert 1 skill per topic if not exists
  let existingSkills: any[] = [];
  if (allWithIds.length) {
    const selSkills = await supabase
      .from('skills')
      .select('id,name')
      .in('name', allWithIds.map((t) => `Opanowanie: ${t.name}`));
    if (selSkills.error) throw selSkills.error;
    existingSkills = selSkills.data ?? [];
  }
  const existingSkillNames = new Set(existingSkills.map((s: any) => s.name));

  const skillsToInsert = allWithIds
    .filter((t) => !existingSkillNames.has(`Opanowanie: ${t.name}`))
    .map((t) => ({
      name: `Opanowanie: ${t.name}`,
      description: `Kluczowe umiejętności dla tematu ${t.name}.`,
      department: 'mathematics',
      level: isExtended ? 'extended' : 'basic',
      class_level: isExtended ? 2 : 1,
      is_active: true,
    }));
  if (skillsToInsert.length) {
    const insSkills = await supabase.from('skills').insert(skillsToInsert);
    if (insSkills.error) throw insSkills.error;
  }

  const topicIds = allWithIds.map((t) => t.id);

  // Define lesson sets per phase
  const phaseLessons: Record<1 | 2 | 3, { type: string; order: number; time: number }[]> = {
    1: [
      { type: 'diagnostic', order: 0, time: 15 },
      { type: 'theory', order: 1, time: 20 },
      { type: 'guided', order: 2, time: 20 },
      { type: 'problem_set', order: 3, time: 25 },
    ],
    2: [
      { type: 'quiz', order: 4, time: 15 },
      { type: 'matura', order: 5, time: 30 },
      { type: 'review', order: 6, time: 10 },
    ],
    3: [
      // Phase 3 ensures SRS review exists (same as review)
      { type: 'review', order: 6, time: 10 },
    ],
  };

  if (!topicIds.length) {
    return { topics_created: insertedTopics.length, skills_created: skillsToInsert.length, lessons_created: 0 };
  }

  // Get existing lessons for topics and phase types
  const needTypes = phaseLessons[phase].map((l) => l.type);
  let existingLessons: any[] = [];
  if (needTypes.length) {
    const selLessons = await supabase
      .from('lessons')
      .select('id, topic_id, content_type')
      .in('topic_id', topicIds)
      .in('content_type', needTypes);
    if (selLessons.error) throw selLessons.error;
    existingLessons = selLessons.data ?? [];
  }

  const existingForTopicType = new Set(
    (existingLessons ?? []).map((l: any) => `${l.topic_id}:${l.content_type}`)
  );

  // We need topic names for titles
  const topicRows = await supabase.from('topics').select('id,name').in('id', topicIds);
  if (topicRows.error) throw topicRows.error;
  const nameById = new Map((topicRows.data ?? []).map((t: any) => [t.id, t.name]));

  const lessonInserts: any[] = [];
  for (const tid of topicIds) {
    for (const L of phaseLessons[phase]) {
      const key = `${tid}:${L.type}`;
      if (existingForTopicType.has(key)) continue;
      const tname = nameById.get(tid) as string;
      lessonInserts.push({
        topic_id: tid,
        title: lessonTitle(L.type, tname),
        description: `${L.type === 'matura' ? 'Zadania' : 'Lekcja'} dla tematu ${tname}.`,
        content_type: L.type,
        content_data: { sections: [], generated: true },
        lesson_order: L.order,
        estimated_time_minutes: L.time,
        difficulty_level: isExtended ? 4 : 2,
        is_active: true,
      });
    }
  }

  if (lessonInserts.length) {
    const insLessons = await supabase.from('lessons').insert(lessonInserts);
    if (insLessons.error) throw insLessons.error;
  }

  return {
    topics_created: insertedTopics.length,
    skills_created: skillsToInsert.length,
    lessons_created: lessonInserts.length,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  try {
    const { phase = 'all' } = await req.json().catch(() => ({ phase: 'all' }));

    // Phase 1: PP topics
    const pp: Record<string, string[]> = {
      'liczby': [
        'Potęgi i pierwiastki',
        'Procenty i proporcje',
        'Wyrażenia algebraiczne',
        'Notacja wykładnicza',
      ],
      'rownania': [
        'Równania liniowe i układy',
        'Równania kwadratowe',
        'Nierówności liniowe i kwadratowe',
        'Wartość bezwzględna w równaniach',
      ],
      'funkcje': [
        'Wprowadzenie do funkcji i wykresów',
        'Funkcja liniowa',
        'Funkcja kwadratowa',
        'Funkcja wymierna',
        'Funkcja potęgowa',
        'Funkcja wykładnicza',
        'Funkcja logarytmiczna',
      ],
      'ciagi': [
        'Ciąg arytmetyczny',
        'Ciąg geometryczny',
        'Sumy ciągów',
      ],
      'trygonometria': [
        'Definicje i wykresy funkcji trygonometrycznych',
        'Tożsamości trygonometryczne',
        'Równania trygonometryczne',
        'Zastosowania trygonometrii w geometrii',
      ],
      'geometria-plaska': [
        'Miary kątów i podstawy',
        'Trójkąty: cechy i okręgi',
        'Czworokąty i wielokąty',
        'Okrąg i koło: styczne i kąty',
        'Podobieństwo figur',
        'Twierdzenia Talesa i Pitagorasa',
        'Miejsca geometryczne',
      ],
      'geometria-analityczna': [
        'Układ współrzędnych i odległości',
        'Prosta: równania i nachylenie',
        'Okrąg w układzie współrzędnych',
        'Wektory w R²',
        'Kąty i odległości w R²',
      ],
      'geometria-przestrzenna': [
        'Graniastosłupy',
        'Ostrosłupy',
        'Bryły obrotowe',
        'Siatki i przekroje brył',
        'Pole i objętość brył',
      ],
      'kombinatoryka-i-statystyka': [
        'Permutacje, kombinacje, wariacje',
        'Prawdopodobieństwo proste i warunkowe',
        'Drzewa i rozkład dwumianowy',
        'Statystyka opisowa: średnia, mediana, kwartyle',
      ],
    };

    // Phase 2: PR topics and advanced layers
    const pr: Record<string, string[]> = {
      'granice-i-pochodne': [
        'Granice i ciągłość',
        'Pochodna: definicja i własności',
        'Zastosowania pochodnej: monotoniczność i ekstrema',
        'Asymptoty i szkic wykresu',
      ],
      'zespolone': [
        'Liczby zespolone: postać algebraiczna i trygonometryczna',
        'Działania na liczbach zespolonych',
        'Wzory de Moivre’a i równania zespolone',
      ],
      'geometria-przestrzenna': [
        'Wektory w R³',
      ],
      'trygonometria-pr': [
        'Radiany i miary łukowe',
      ],
      'kombinatoryka-i-statystyka-pr': [
        'Zmienna losowa i rozkłady',
        'Prosta estymacja',
      ],
      'teoria-liczb': [
        'Podzielność, NWD i NWW',
        'Kongruencje proste',
        'Liczby pierwsze i rozkłady',
      ],
    };

    const results: any = { phase_1: null, phase_2: null, phase_3: null };

    if (phase === '1' || phase === 'all') {
      results.phase_1 = await ensureTopicsAndLessons(supabase, pp, 1, false);
    }

    if (phase === '2' || phase === 'all') {
      // Add advanced lessons (L4–L6) to ALL existing topics
      const all = await supabase.from('topics').select('id,name');
      if (all.error) throw all.error;
      const allTopics = all.data ?? [];
      if (allTopics.length) {
        const ids = allTopics.map((t: any) => t.id);
        const phaseLessons = [
          { type: 'quiz', order: 4, time: 15 },
          { type: 'matura', order: 5, time: 30 },
          { type: 'review', order: 6, time: 10 },
        ];
        let existingLessons: any[] = [];
        if (ids.length) {
          const el = await supabase
            .from('lessons')
            .select('topic_id, content_type')
            .in('topic_id', ids)
            .in('content_type', phaseLessons.map((l) => l.type));
          if (el.error) throw el.error;
          existingLessons = el.data ?? [];
        }
        const existingSet = new Set(existingLessons.map((l: any) => `${l.topic_id}:${l.content_type}`));
        const nameById = new Map(allTopics.map((t: any) => [t.id, t.name]));
        const inserts: any[] = [];
        for (const tid of ids) {
          const tname = nameById.get(tid) as string;
          for (const L of phaseLessons) {
            const key = `${tid}:${L.type}`;
            if (existingSet.has(key)) continue;
            inserts.push({
              topic_id: tid,
              title: lessonTitle(L.type, tname),
              description: `${L.type === 'matura' ? 'Zadania' : 'Lekcja'} dla tematu ${tname}.`,
              content_type: L.type,
              content_data: { sections: [], generated: true },
              lesson_order: L.order,
              estimated_time_minutes: L.time,
              difficulty_level: 3,
              is_active: true,
            });
          }
        }
        if (inserts.length) {
          const ins = await supabase.from('lessons').insert(inserts);
          if (ins.error) throw ins.error;
        }
        results.phase_2 = { lessons_created: inserts.length };
      }

      // Insert PR topics themselves + lessons
      const prRes = await ensureTopicsAndLessons(supabase, pr, 1, true);
      const prAdv = await ensureTopicsAndLessons(supabase, pr, 2, true);
      results.phase_2_pr = { base: prRes, advanced: prAdv };
    }

    if (phase === '3' || phase === 'all') {
      // Ensure every topic has review lesson (L6)
      const all = await supabase.from('topics').select('id,name');
      if (all.error) throw all.error;
      const topics = all.data ?? [];
      const ids = topics.map((t: any) => t.id);
      let existing: any[] = [];
      if (ids.length) {
        const el = await supabase
          .from('lessons')
          .select('topic_id, content_type')
          .in('topic_id', ids)
          .eq('content_type', 'review');
        if (el.error) throw el.error;
        existing = el.data ?? [];
      }
      const haveReview = new Set(existing.map((l: any) => l.topic_id));
      const nameById = new Map(topics.map((t: any) => [t.id, t.name]));
      const inserts: any[] = [];
      for (const tid of ids) {
        if (haveReview.has(tid)) continue;
        const tname = nameById.get(tid) as string;
        inserts.push({
          topic_id: tid,
          title: lessonTitle('review', tname),
          description: `Powtórka SRS dla tematu ${tname}.`,
          content_type: 'review',
          content_data: { sections: [], generated: true },
          lesson_order: 6,
          estimated_time_minutes: 10,
          difficulty_level: 2,
          is_active: true,
        });
      }
      if (inserts.length) {
        const ins = await supabase.from('lessons').insert(inserts);
        if (ins.error) throw ins.error;
      }
      results.phase_3 = { reviews_added: inserts.length, topics_total: ids.length };
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('seed-curriculum error', e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
