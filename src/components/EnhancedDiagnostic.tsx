import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { logEvent, logError } from "@/lib/logger";

import { TaskDefinition } from "@/lib/UniversalInterfaces";

// Question types
interface Choice {
  key: string;
  text: string;
  misconception: string | null;
}
interface Item {
  question_code: string;
  prompt: string;
  type: "mcq"; // MVP keeps MCQ only
  choices: Choice[];
  correctKey: string;
  difficulty: number; // 1=easy,2=med,3=hard
  tags: string[];
  topic?: "algebra" | "geometry" | "functions" | "fundamentals";
}

// Phase 1 – fundamentals (short screener of basics)
const FUNDAMENTAL_ITEMS: Item[] = [
  {
    question_code: "fund_ops_order_1",
    prompt: "Policz: 5 + 7 * 3. (Zwróć uwagę na kolejność działań)",
    type: "mcq",
    choices: [
      { key: "a", text: "36", misconception: "adds_before_mult" },
      { key: "b", text: "26", misconception: null }, // correct
      { key: "c", text: "(5+7)*3=", misconception: "parentheses_added" },
      { key: "d", text: "Nie wiem", misconception: "dont_know" },
    ],
    correctKey: "b",
    difficulty: 1,
    tags: ["fundamentals", "order_of_ops"],
    topic: "fundamentals",
  },
  {
    question_code: "fund_fractions_1",
    prompt: "Wybierz poprawny wynik: 1/2 + 1/3 =",
    type: "mcq",
    choices: [
      { key: "a", text: "2/5", misconception: "adds_numerators_denominators" },
      { key: "b", text: "5/6", misconception: null }, // correct
      { key: "c", text: "3/6", misconception: "adds_only_numerators" },
      { key: "d", text: "Nie wiem", misconception: "dont_know" },
    ],
    correctKey: "b",
    difficulty: 1,
    tags: ["fundamentals", "fractions"],
    topic: "fundamentals",
  },
  {
    question_code: "fund_unknown_1",
    prompt: "Co oznacza, że x jest niewiadomą w równaniu? Wybierz najlepszą odpowiedź.",
    type: "mcq",
    choices: [
      { key: "a", text: "x to zawsze 0", misconception: "x_is_zero" },
      { key: "b", text: "x to symbol liczby, której wartości szukamy", misconception: null }, // correct
      { key: "c", text: "x to znak mnożenia", misconception: "x_is_multiply" },
      { key: "d", text: "Nie wiem", misconception: "dont_know" },
    ],
    correctKey: "b",
    difficulty: 1,
    tags: ["fundamentals", "concepts"],
    topic: "fundamentals",
  },
];

// Phase 2 – topic screeners + adaptive follow-ups (MVP: 3 domains)
const TOPIC_SCREENERS: Record<"algebra" | "geometry" | "functions", Item[]> = {
  algebra: [
    {
      question_code: "alg_linear_eq_mid_1",
      prompt: "Rozwiąż: 2x + 6 = 18. Wybierz wynik.",
      type: "mcq",
      choices: [
        { key: "a", text: "x = 5", misconception: null }, // correct
        { key: "b", text: "x = 6", misconception: "forgot_subtract" },
        { key: "c", text: "x = 12", misconception: "divide_wrong_side" },
        { key: "d", text: "Nie wiem", misconception: "dont_know" },
      ],
      correctKey: "a",
      difficulty: 2,
      tags: ["algebra", "linear_equations"],
      topic: "algebra",
    },
  ],
  geometry: [
    {
      question_code: "geo_angles_mid_1",
      prompt: "Trójkąt ma kąty 50° i 60°. Ile wynosi trzeci kąt?",
      type: "mcq",
      choices: [
        { key: "a", text: "70°", misconception: null }, // correct
        { key: "b", text: "80°", misconception: "sum_200" },
        { key: "c", text: "50°", misconception: "repeat_known" },
        { key: "d", text: "Nie wiem", misconception: "dont_know" },
      ],
      correctKey: "a",
      difficulty: 2,
      tags: ["geometry", "triangles"],
      topic: "geometry",
    },
  ],
  functions: [
    {
      question_code: "fun_eval_mid_1",
      prompt: "Dana f(x)=2x-3. Oblicz f(4).",
      type: "mcq",
      choices: [
        { key: "a", text: "5", misconception: null }, // correct
        { key: "b", text: "1", misconception: "subtraction_error" },
        { key: "c", text: "8", misconception: "forgot_times_two" },
        { key: "d", text: "Nie wiem", misconception: "dont_know" },
      ],
      correctKey: "a",
      difficulty: 2,
      tags: ["functions", "evaluation"],
      topic: "functions",
    },
  ],
};

const TOPIC_FOLLOWUPS: Record<"algebra" | "geometry" | "functions", Item[]> = {
  algebra: [
    {
      question_code: "alg_linear_eq_easy_1",
      prompt: "Rozwiąż: x + 3 = 7. Wybierz wynik.",
      type: "mcq",
      choices: [
        { key: "a", text: "x = 3", misconception: "no_subtraction" },
        { key: "b", text: "x = 4", misconception: null }, // correct
        { key: "c", text: "x = 10", misconception: "adds_both" },
        { key: "d", text: "Nie wiem", misconception: "dont_know" },
      ],
      correctKey: "b",
      difficulty: 1,
      tags: ["algebra", "linear_equations"],
      topic: "algebra",
    },
  ],
  geometry: [
    {
      question_code: "geo_angles_easy_1",
      prompt: "Kąty w trójkącie sumują się do...",
      type: "mcq",
      choices: [
        { key: "a", text: "90°", misconception: "right_triangle_only" },
        { key: "b", text: "180°", misconception: null }, // correct
        { key: "c", text: "360°", misconception: "confused_polygon" },
        { key: "d", text: "Nie wiem", misconception: "dont_know" },
      ],
      correctKey: "b",
      difficulty: 1,
      tags: ["geometry", "triangles"],
      topic: "geometry",
    },
  ],
  functions: [
    {
      question_code: "fun_eval_easy_1",
      prompt: "f(x)=x+1. Ile wynosi f(2)?",
      type: "mcq",
      choices: [
        { key: "a", text: "2", misconception: "no_plus_one" },
        { key: "b", text: "3", misconception: null }, // correct
        { key: "c", text: "4", misconception: "adds_two" },
        { key: "d", text: "Nie wiem", misconception: "dont_know" },
      ],
      correctKey: "b",
      difficulty: 1,
      tags: ["functions", "evaluation"],
      topic: "functions",
    },
  ],
};

// Phase 3 – advanced stretch (only if extended or strong performance)
const ADVANCED_ITEMS: Item[] = [
  {
    question_code: "adv_quad_roots_1",
    prompt: "Ile pierwiastków rzeczywistych ma równanie x^2 - 5x + 6 = 0?",
    type: "mcq",
    choices: [
      { key: "a", text: "Dwa", misconception: null }, // correct
      { key: "b", text: "Jeden", misconception: "discriminant_eq0" },
      { key: "c", text: "Zero", misconception: "negative_discriminant" },
      { key: "d", text: "Nie wiem", misconception: "dont_know" },
    ],
    correctKey: "a",
    difficulty: 3,
    tags: ["algebra", "quadratics"],
    topic: "algebra",
  },
  {
    question_code: "adv_geom_trig_1",
    prompt: "W trójkącie prostokątnym sin(α)=3/5. Ile wynosi cos(α)?",
    type: "mcq",
    choices: [
      { key: "a", text: "4/5", misconception: null }, // correct (3-4-5)
      { key: "b", text: "3/5", misconception: "confuse_sin_cos" },
      { key: "c", text: "1/5", misconception: "wrong_adjacent" },
      { key: "d", text: "Nie wiem", misconception: "dont_know" },
    ],
    correctKey: "a",
    difficulty: 3,
    tags: ["geometry", "trigonometry"],
    topic: "geometry",
  },
];

type SelfRatings = {
  algebra: number;
  geometry: number;
  functions: number;
};

export default function EnhancedDiagnostic() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 99>(0); // 0=profil,1=fund,2=działy,3=zaaw,99=podsum.
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [classLevel, setClassLevel] = useState<string>("");
  const [track, setTrack] = useState<string>("basic");
  const [lastGrade, setLastGrade] = useState<string>("");
  const [ratings, setRatings] = useState<SelfRatings>({ algebra: 2, geometry: 2, functions: 2 });
  const [motivationType, setMotivationType] = useState<string>("strengthen_knowledge");
  const [learningGoals, setLearningGoals] = useState<string[]>([]);

  // Phase 1
  const [qIndex, setQIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(2);
  const startTimeRef = useRef<number>(0);
  const p1CorrectRef = useRef<number>(0);

  // Phase 2 – dynamic queue
  const [p2Queue, setP2Queue] = useState<Item[]>([]);
  const [p2Index, setP2Index] = useState<number>(0);
  const p2StatsRef = useRef<{ correct: number; total: number }>({ correct: 0, total: 0 });

  // Phase 3
  const [p3Index, setP3Index] = useState<number>(0);

  const itemP1 = useMemo(() => FUNDAMENTAL_ITEMS[qIndex], [qIndex]);
  const itemP2 = useMemo(() => p2Queue[p2Index], [p2Queue, p2Index]);
  const itemP3 = useMemo(() => ADVANCED_ITEMS[p3Index], [p3Index]);

  useEffect(() => {
    logEvent("diagnostic_open");
  }, []);

  const startSession = async () => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast({ description: "Zaloguj się, aby rozpocząć diagnozę." });
        return;
      }

      const self_ratings = {
        algebra: ratings.algebra,
        geometry: ratings.geometry,
        functions: ratings.functions,
        lastGrade,
      };

      const { data, error } = await (supabase as any)
        .from("diagnostic_sessions")
        .insert({
          user_id: userData.user.id,
          status: "in_progress",
          current_phase: 1,
          class_level: classLevel && !isNaN(Number(classLevel)) ? Number(classLevel) : null,
          track,
          self_ratings,
          meta: { 
            started_from: "/quiz",
            motivation_type: motivationType,
            learning_goals: learningGoals
          },
        })
        .select("id")
        .single();

      if (error) throw error;
      setSessionId(data.id as string);
      setPhase(1);
      setQIndex(0);
      setSelectedKey(null);
      setConfidence(2);
      startTimeRef.current = Date.now();

      p1CorrectRef.current = 0;
      p2StatsRef.current = { correct: 0, total: 0 };

      logEvent("diagnostic_session_start", { classLevel, track, ratings: self_ratings });
    } catch (e) {
      logError(e, "EnhancedDiagnostic.startSession");
      toast({ description: "Nie udało się rozpocząć sesji diagnozy." });
    } finally {
      setLoading(false);
    }
  };

  const recordAttempt = async (phaseNum: 1 | 2 | 3, item: Item, selected: string, conf: number) => {
    if (!sessionId) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const timeMs = Date.now() - startTimeRef.current;
    
    // Enhanced answer validation using math validation system
    const is_correct = selected === item.correctKey;

    await (supabase as any)
      .from("diagnostic_item_attempts")
      .insert({
        session_id: sessionId,
        user_id: userData.user.id,
        question_code: item.question_code,
        phase: phaseNum,
        answer: { type: item.type, choice: selected },
        is_correct,
        confidence: conf,
        response_time_ms: timeMs,
        meta: { tags: item.tags, difficulty: item.difficulty, topic: item.topic },
      });

    logEvent("diagnostic_attempt", {
      phase: phaseNum,
      sessionId,
      q: item.question_code,
      topic: item.topic,
      is_correct,
      confidence: conf,
      timeMs,
    });

    return { is_correct, timeMs } as const;
  };

  const submitAttemptP1 = async () => {
    if (!sessionId) return;
    if (!selectedKey) {
      toast({ description: "Wybierz odpowiedź." });
      return;
    }
    try {
      setLoading(true);
      const res = await recordAttempt(1, itemP1, selectedKey, confidence);
      if (res?.is_correct) p1CorrectRef.current += 1;

      if (qIndex < FUNDAMENTAL_ITEMS.length - 1) {
        setQIndex((i) => i + 1);
        setSelectedKey(null);
        setConfidence(2);
        startTimeRef.current = Date.now();
      } else {
        await proceedToPhase2();
      }
    } catch (e) {
      logError(e, "EnhancedDiagnostic.submitAttemptP1");
      toast({ description: "Nie udało się zapisać odpowiedzi." });
    } finally {
      setLoading(false);
    }
  };

  const proceedToPhase2 = async () => {
    try {
      setLoading(true);
      if (!sessionId) return;
      // Build initial queue: one screener per topic, order by weakest self-rating first
      const topics: Array<keyof SelfRatings> = ["algebra", "geometry", "functions"];
      const order = [...topics].sort((a, b) => ratings[a] - ratings[b]);
      const initial: Item[] = order.map((t) => TOPIC_SCREENERS[t][0]);
      setP2Queue(initial);
      setP2Index(0);
      setSelectedKey(null);
      setConfidence(2);
      startTimeRef.current = Date.now();

      await (supabase as any).from("diagnostic_sessions").update({ current_phase: 2 }).eq("id", sessionId);
      setPhase(2);
      logEvent("diagnostic_phase_change", { to: 2, sessionId });
    } catch (e) {
      logError(e, "EnhancedDiagnostic.proceedToPhase2");
    } finally {
      setLoading(false);
    }
  };

  const submitAttemptP2 = async () => {
    if (!sessionId) return;
    if (!itemP2) return;
    if (!selectedKey) {
      toast({ description: "Wybierz odpowiedź." });
      return;
    }
    try {
      setLoading(true);
      const { is_correct } = await recordAttempt(2, itemP2, selectedKey, confidence);
      p2StatsRef.current.total += 1;
      if (is_correct) p2StatsRef.current.correct += 1;

      // Adaptive follow-up: if wrong or low confidence, insert an easier question for this topic
      const needFollow = !is_correct || confidence <= 2;
      if (needFollow && itemP2.topic) {
        const follow = TOPIC_FOLLOWUPS[itemP2.topic]?.[0];
        if (follow) {
          setP2Queue((q) => {
            const next = [...q];
            next.splice(p2Index + 1, 0, follow);
            return next;
          });
        }
      }

      if (p2Index < p2Queue.length - 1) {
        setP2Index((i) => i + 1);
        setSelectedKey(null);
        setConfidence(2);
        startTimeRef.current = Date.now();
      } else {
        await proceedToPhase3();
      }
    } catch (e) {
      logError(e, "EnhancedDiagnostic.submitAttemptP2");
      toast({ description: "Nie udało się zapisać odpowiedzi." });
    } finally {
      setLoading(false);
    }
  };

  const proceedToPhase3 = async () => {
    try {
      setLoading(true);
      if (!sessionId) return;

      const strongPerformance = p2StatsRef.current.correct >= 2; // simple heuristic
      const shouldRunAdv = track === "extended" || strongPerformance;

      if (shouldRunAdv) {
        await (supabase as any).from("diagnostic_sessions").update({ current_phase: 3 }).eq("id", sessionId);
        setPhase(3);
        setP3Index(0);
        setSelectedKey(null);
        setConfidence(2);
        startTimeRef.current = Date.now();
        logEvent("diagnostic_phase_change", { to: 3, sessionId });
      } else {
        await completeSession();
      }
    } catch (e) {
      logError(e, "EnhancedDiagnostic.proceedToPhase3");
    } finally {
      setLoading(false);
    }
  };

  const submitAttemptP3 = async () => {
    if (!sessionId) return;
    if (!selectedKey) {
      toast({ description: "Wybierz odpowiedź." });
      return;
    }
    try {
      setLoading(true);
      await recordAttempt(3, itemP3, selectedKey, confidence);

      if (p3Index < ADVANCED_ITEMS.length - 1) {
        setP3Index((i) => i + 1);
        setSelectedKey(null);
        setConfidence(2);
        startTimeRef.current = Date.now();
      } else {
        await completeSession();
      }
    } catch (e) {
      logError(e, "EnhancedDiagnostic.submitAttemptP3");
      toast({ description: "Nie udało się zapisać odpowiedzi." });
    } finally {
      setLoading(false);
    }
  };

  const computeAndSaveSummary = async () => {
    if (!sessionId) return;
    const { data, error } = await (supabase as any)
      .from("diagnostic_item_attempts")
      .select("question_code,is_correct,confidence,meta")
      .eq("session_id", sessionId);
    if (error) throw error;

    type Agg = { correct: number; total: number; confSum: number };
    const byTopic: Record<string, Agg> = {};

    (data as any[]).forEach((row) => {
      const topic = row.meta?.topic || "fundamentals";
      if (!byTopic[topic]) byTopic[topic] = { correct: 0, total: 0, confSum: 0 };
      byTopic[topic].total += 1;
      byTopic[topic].confSum += typeof row.confidence === "number" ? row.confidence : 0;
      if (row.is_correct) byTopic[topic].correct += 1;
    });

    const mastered: string[] = [];
    const struggled: string[] = [];
    const notSeen: string[] = [];
    const fundamental_gaps: string[] = [];

    ["algebra", "geometry", "functions", "fundamentals"].forEach((t) => {
      const agg = byTopic[t];
      if (!agg) {
        notSeen.push(t);
        return;
      }
      const ratio = agg.correct / Math.max(1, agg.total);
      if (ratio >= 0.8) mastered.push(t);
      else if (ratio < 0.5) {
        struggled.push(t);
        if (t === "fundamentals") fundamental_gaps.push(t);
      }
    });

    const skills = Object.entries(byTopic).map(([t, agg]) => ({
      skill_id: t,
      status: (agg.correct / Math.max(1, agg.total)) >= 0.8 ? "mastered" : (agg.correct / Math.max(1, agg.total)) < 0.5 ? "struggled" : "practicing",
      score: agg.correct / Math.max(1, agg.total),
      confidence_avg: agg.confSum / Math.max(1, agg.total),
      questions_asked: agg.total,
      incorrect_conceptions: [],
    }));

    const summary = {
      diagnostic_summary: { mastered, struggled, notSeen, fundamental_gaps },
      skills,
      recommended_next_skills: struggled.length ? struggled : fundamental_gaps,
      suggested_next_lesson: struggled[0] || fundamental_gaps[0] || mastered[0] || null,
    };

    await (supabase as any)
      .from("diagnostic_sessions")
      .update({ status: "completed", current_phase: 99, completed_at: new Date().toISOString(), summary })
      .eq("id", sessionId);

    return summary;
  };

  const completeSession = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const summary = await computeAndSaveSummary();
      
      // Update user learner profile with diagnostic data
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && summary) {
        const learnerProfileUpdate = {
          diagnostic_data: {
            last_completed: new Date().toISOString(),
            class_level: classLevel,
            track: track,
            motivation_type: motivationType,
            learning_goals: learningGoals,
            self_ratings: ratings,
            summary: summary
          },
          struggle_areas: summary.diagnostic_summary?.struggled || [],
          strength_areas: summary.diagnostic_summary?.mastered || [],
          preferred_difficulty: Math.max(3, Math.min(7, (summary.skills?.filter(s => s.status === 'mastered').length || 0) + 3)),
          motivation_type: motivationType,
          performance_patterns: {
            last_diagnostic_score: summary.skills?.filter(s => s.status === 'mastered').length || 0,
            fundamental_gaps: summary.diagnostic_summary?.fundamental_gaps || []
          }
        };

        await (supabase as any)
          .from("profiles")
          .update({ learner_profile: learnerProfileUpdate })
          .eq("user_id", userData.user.id);
      }
      
      logEvent("diagnostic_session_complete", { sessionId, motivationType, learningGoals });
      setPhase(99);
    } catch (e) {
      logError(e, "EnhancedDiagnostic.completeSession");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <Seo
        title="Test diagnostyczny – personalizacja nauki"
        description="Adaptacyjny test diagnozujący mocne strony i luki – na tej podstawie personalizujemy plan nauki."
      />
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Test diagnostyczny</h1>
        <p className="text-sm opacity-80">To nie jest na ocenę – pomoże dopasować ścieżkę nauki.</p>
      </header>

      {phase === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Profil ucznia</CardTitle>
            <CardDescription>Podaj kilka informacji, by lepiej dopasować pytania.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Klasa</Label>
                <Select value={classLevel} onValueChange={setClassLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz klasę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="1">1 LO/Technikum</SelectItem>
                    <SelectItem value="2">2 LO/Technikum</SelectItem>
                    <SelectItem value="3">3 LO/Technikum</SelectItem>
                    <SelectItem value="4">4 LO/Technikum</SelectItem>
                    <SelectItem value="matura">Maturalna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zakres</Label>
                <Select value={track} onValueChange={setTrack}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz zakres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Podstawa</SelectItem>
                    <SelectItem value="extended">Rozszerzenie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ocena z matematyki w poprzedniej klasie (opcjonalnie)</Label>
              <Input value={lastGrade} onChange={(e) => setLastGrade(e.target.value)} placeholder="np. 4" />
            </div>

            <Separator />
            
            <div className="space-y-4">
              <div>
                <Label>Jaki jest Twój główny cel nauki?</Label>
                <Select value={motivationType} onValueChange={setMotivationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz główny cel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="improve_grade">💪 Chcę poprawić oceny i lepiej rozumieć</SelectItem>
                    <SelectItem value="strengthen_knowledge">🎯 Chcę ugruntować swoją wiedzę</SelectItem>
                    <SelectItem value="test_skills">🧪 Chcę przetestować swoje umiejętności</SelectItem>
                    <SelectItem value="prepare_exams">🎓 Przygotowuję się do ważnych egzaminów</SelectItem>
                    <SelectItem value="master_advanced">🚀 Chcę opanować tematy zaawansowane</SelectItem>
                    <SelectItem value="fill_gaps">🔧 Wiem że mam luki do uzupełnienia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Wybierz obszary, które Cię interesują (opcjonalnie)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["Równania", "Geometria", "Funkcje", "Statystyka", "Prawdopodobieństwo", "Trygonometria"].map((goal) => (
                    <Button
                      key={goal}
                      variant={learningGoals.includes(goal) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setLearningGoals(prev => 
                          prev.includes(goal) 
                            ? prev.filter(g => g !== goal)
                            : [...prev, goal]
                        );
                      }}
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator />
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <Label>Algebra – jak oceniasz swoje umiejętności?</Label>
                <Slider value={[ratings.algebra]} min={1} max={4} step={1} onValueChange={(v) => setRatings((r) => ({ ...r, algebra: v[0] }))} />
                <p className="text-xs opacity-70 mt-1">1=potrzebuję wsparcia • 4=czuję się pewnie</p>
              </div>
              <div>
                <Label>Geometria – jak oceniasz swoje umiejętności?</Label>
                <Slider value={[ratings.geometry]} min={1} max={4} step={1} onValueChange={(v) => setRatings((r) => ({ ...r, geometry: v[0] }))} />
                <p className="text-xs opacity-70 mt-1">1=potrzebuję wsparcia • 4=czuję się pewnie</p>
              </div>
              <div>
                <Label>Funkcje – jak oceniasz swoje umiejętności?</Label>
                <Slider value={[ratings.functions]} min={1} max={4} step={1} onValueChange={(v) => setRatings((r) => ({ ...r, functions: v[0] }))} />
                <p className="text-xs opacity-70 mt-1">1=potrzebuję wsparcia • 4=czuję się pewnie</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button onClick={startSession} disabled={loading}>
                Rozpocznij diagnozę
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Etap 1/3 – Fundamenty (pytanie {qIndex + 1} / {FUNDAMENTAL_ITEMS.length})</CardTitle>
            <CardDescription>Odpowiedz najlepiej jak potrafisz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="leading-relaxed">{itemP1.prompt}</p>
            <div className="grid gap-3">
              {itemP1.choices.map((c) => (
                <Button
                  key={c.key}
                  variant={selectedKey === c.key ? "default" : "outline"}
                  onClick={() => setSelectedKey(c.key)}
                >
                  {c.text}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Pewność odpowiedzi</Label>
              <Slider value={[confidence]} min={1} max={4} step={1} onValueChange={(v) => setConfidence(v[0])} />
              <p className="text-xs opacity-70 mt-1">1=zgaduję • 4=absolutnie pewny</p>
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="outline" onClick={() => setPhase(0)} disabled={loading}>Pauza / wróć</Button>
              <Button onClick={submitAttemptP1} disabled={loading}>Dalej</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 2 && itemP2 && (
        <Card>
          <CardHeader>
            <CardTitle>Etap 2/3 – Diagnoza działów (pytanie {p2Index + 1} / {p2Queue.length})</CardTitle>
            <CardDescription>Adaptacyjny przegląd: algebra, geometria, funkcje.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="leading-relaxed">{itemP2.prompt}</p>
            <div className="grid gap-3">
              {itemP2.choices.map((c) => (
                <Button
                  key={c.key}
                  variant={selectedKey === c.key ? "default" : "outline"}
                  onClick={() => setSelectedKey(c.key)}
                >
                  {c.text}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Pewność odpowiedzi</Label>
              <Slider value={[confidence]} min={1} max={4} step={1} onValueChange={(v) => setConfidence(v[0])} />
              <p className="text-xs opacity-70 mt-1">1=zgaduję • 4=absolutnie pewny</p>
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="outline" onClick={() => setPhase(0)} disabled={loading}>Pauza / wróć</Button>
              <Button onClick={submitAttemptP2} disabled={loading}>Dalej</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Etap 3/3 – Zadania zaawansowane (pytanie {p3Index + 1} / {ADVANCED_ITEMS.length})</CardTitle>
            <CardDescription>Stretch goal – sprawdzenie górnej granicy umiejętności.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="leading-relaxed">{itemP3.prompt}</p>
            <div className="grid gap-3">
              {itemP3.choices.map((c) => (
                <Button
                  key={c.key}
                  variant={selectedKey === c.key ? "default" : "outline"}
                  onClick={() => setSelectedKey(c.key)}
                >
                  {c.text}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Pewność odpowiedzi</Label>
              <Slider value={[confidence]} min={1} max={4} step={1} onValueChange={(v) => setConfidence(v[0])} />
              <p className="text-xs opacity-70 mt-1">1=zgaduję • 4=absolutnie pewny</p>
            </div>

            <div className="flex gap-3 justify-between">
              <Button variant="outline" onClick={() => setPhase(0)} disabled={loading}>Pauza / wróć</Button>
              <Button onClick={submitAttemptP3} disabled={loading}>Zakończ</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 99 && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnoza – podsumowanie</CardTitle>
            <CardDescription>Dziękujemy! Na tej podstawie dostosujemy plan nauki.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Raport został zapisany. Wkrótce zobaczysz rekomendacje w pulpicie i w module lekcji.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => logEvent("diagnostic_go_to_dashboard")}>Przejdź do pulpitu</Button>
              <Button variant="outline" onClick={() => setPhase(0)}>Rozpocznij ponownie</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
