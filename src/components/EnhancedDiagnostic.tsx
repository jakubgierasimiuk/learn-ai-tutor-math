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

// Minimal local bank for Phase 1 (fundamentals) – MVP
// Each item mimics a future diagnostic_items row
const FUNDAMENTAL_ITEMS = [
  {
    question_code: "fund_ops_order_1",
    prompt: "Policz: 5 + 7 * 3. (Zwróć uwagę na kolejność działań)",
    type: "mcq" as const,
    choices: [
      { key: "a", text: "36", misconception: "adds_before_mult" },
      { key: "b", text: "26", misconception: null }, // correct
      { key: "c", text: "(5+7)*3=", misconception: "parentheses_added" },
      { key: "d", text: "Nie wiem", misconception: "dont_know" },
    ],
    correctKey: "b",
    difficulty: 1,
    tags: ["fundamentals", "order_of_ops"],
  },
  {
    question_code: "fund_fractions_1",
    prompt: "Wybierz poprawny wynik: 1/2 + 1/3 =",
    type: "mcq" as const,
    choices: [
      { key: "a", text: "2/5", misconception: "adds_numerators_denominators" },
      { key: "b", text: "5/6", misconception: null }, // correct
      { key: "c", text: "3/6", misconception: "adds_only_numerators" },
      { key: "d", text: "Nie wiem", misconception: "dont_know" },
    ],
    correctKey: "b",
    difficulty: 1,
    tags: ["fundamentals", "fractions"],
  },
  {
    question_code: "fund_unknown_1",
    prompt: "Co oznacza, że x jest niewiadomą w równaniu? Wybierz najlepszą odpowiedź.",
    type: "mcq" as const,
    choices: [
      { key: "a", text: "x to zawsze 0", misconception: "x_is_zero" },
      { key: "b", text: "x to symbol liczby, której wartości szukamy", misconception: null }, // correct
      { key: "c", text: "x to znak mnożenia", misconception: "x_is_multiply" },
      { key: "d", text: "Nie wiem", misconception: "dont_know" },
    ],
    correctKey: "b",
    difficulty: 1,
    tags: ["fundamentals", "concepts"],
  },
];

type SelfRatings = {
  algebra: number;
  geometry: number;
  functions: number;
};

export default function EnhancedDiagnostic() {
  const [phase, setPhase] = useState<0 | 1 | 99>(0); // 0=profil, 1=fundamenty, 99=podsumowanie
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [classLevel, setClassLevel] = useState<string>("");
  const [track, setTrack] = useState<string>("basic");
  const [lastGrade, setLastGrade] = useState<string>("");
  const [ratings, setRatings] = useState<SelfRatings>({ algebra: 2, geometry: 2, functions: 2 });

  const [qIndex, setQIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(2);
  const startTimeRef = useRef<number>(0);

  const item = useMemo(() => FUNDAMENTAL_ITEMS[qIndex], [qIndex]);

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
          class_level: classLevel ? Number(classLevel) : null,
          track,
          self_ratings,
          meta: { started_from: "/quiz" },
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

      logEvent("diagnostic_session_start", { classLevel, track, ratings: self_ratings });
    } catch (e) {
      logError(e, "EnhancedDiagnostic.startSession");
      toast({ description: "Nie udało się rozpocząć sesji diagnozy." });
    } finally {
      setLoading(false);
    }
  };

  const submitAttempt = async () => {
    if (!sessionId) return;
    if (!selectedKey) {
      toast({ description: "Wybierz odpowiedź." });
      return;
    }
    try {
      setLoading(true);
      const timeMs = Date.now() - startTimeRef.current;
      const is_correct = selectedKey === item.correctKey;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      await (supabase as any)
        .from("diagnostic_item_attempts")
        .insert({
          session_id: sessionId,
          user_id: userData.user.id,
          question_code: item.question_code,
          phase: 1,
          answer: { type: item.type, choice: selectedKey },
          is_correct,
          confidence,
          response_time_ms: timeMs,
          meta: { tags: item.tags, difficulty: item.difficulty },
        });

      logEvent("diagnostic_attempt", {
        sessionId,
        q: item.question_code,
        is_correct,
        confidence,
        timeMs,
      });

      // next or finish
      if (qIndex < FUNDAMENTAL_ITEMS.length - 1) {
        setQIndex((i) => i + 1);
        setSelectedKey(null);
        setConfidence(2);
        startTimeRef.current = Date.now();
      } else {
        await completeSession();
      }
    } catch (e) {
      logError(e, "EnhancedDiagnostic.submitAttempt");
      toast({ description: "Nie udało się zapisać odpowiedzi." });
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      // Simple MVP summary (real logic will aggregate attempts)
      const summary = {
        diagnostic_summary: {
          mastered: [],
          struggled: [],
          notSeen: [],
          fundamental_gaps: [],
        },
        suggested_next_lesson: null,
      };

      await (supabase as any)
        .from("diagnostic_sessions")
        .update({ status: "completed", current_phase: 99, completed_at: new Date().toISOString(), summary })
        .eq("id", sessionId);

      logEvent("diagnostic_session_complete", { sessionId });
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
        <h1 className="text-2xl font-semibold tracking-tight">Test diagnostyczny (MVP)</h1>
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
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <Label>Algebra – samoocena</Label>
                <Slider value={[ratings.algebra]} min={1} max={4} step={1} onValueChange={(v) => setRatings((r) => ({ ...r, algebra: v[0] }))} />
                <p className="text-xs opacity-70 mt-1">1=niepewny • 4=pewny</p>
              </div>
              <div>
                <Label>Geometria – samoocena</Label>
                <Slider value={[ratings.geometry]} min={1} max={4} step={1} onValueChange={(v) => setRatings((r) => ({ ...r, geometry: v[0] }))} />
                <p className="text-xs opacity-70 mt-1">1=niepewny • 4=pewny</p>
              </div>
              <div>
                <Label>Funkcje – samoocena</Label>
                <Slider value={[ratings.functions]} min={1} max={4} step={1} onValueChange={(v) => setRatings((r) => ({ ...r, functions: v[0] }))} />
                <p className="text-xs opacity-70 mt-1">1=niepewny • 4=pewny</p>
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
            <CardTitle>Fundamenty – pytanie {qIndex + 1} / {FUNDAMENTAL_ITEMS.length}</CardTitle>
            <CardDescription>Odpowiedz najlepiej jak potrafisz.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="leading-relaxed">{item.prompt}</p>
            <div className="grid gap-3">
              {item.choices.map((c) => (
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
              <Button onClick={submitAttempt} disabled={loading}>Dalej</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === 99 && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnoza – wstępne podsumowanie</CardTitle>
            <CardDescription>Dziękujemy! Na tej podstawie dostosujemy plan nauki.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To wczesne MVP. Pełny raport (per umiejętność, rekomendacje) pojawi się po rozwinięciu banku zadań i
              logiki agregacji.
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
