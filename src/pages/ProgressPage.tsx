import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Flame, Clock, Target, BookOpen } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ProgressPage() {
  const { user } = useAuth();

  // Today & streak
  const { data: today } = useQuery({
    queryKey: ["pp-today", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const todayStr = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("daily_stats")
        .select("date,total_time_minutes,lessons_completed,points_earned")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: streak } = useQuery({
    queryKey: ["pp-streak", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_streaks")
        .select("current_streak,longest_streak")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Weekly trends
  const { data: week } = useQuery({
    queryKey: ["pp-week", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as any[];
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("daily_stats")
        .select("date,total_time_minutes,lessons_completed,points_earned,average_accuracy")
        .eq("user_id", user.id)
        .gte("date", since)
        .order("date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Mastery by topic
  const { data: mastery } = useQuery({
    queryKey: ["pp-mastery", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as any[];
      const { data, error } = await supabase
        .from("skill_mastery")
        .select("topic_id,mastery_percentage")
        .eq("user_id", user.id);
      if (error) throw error;
      const topicIds = Array.from(new Set((data || []).map(d => d.topic_id))).filter(Boolean) as number[];
      if (topicIds.length === 0) return [] as any[];
      const { data: topics, error: tErr } = await supabase
        .from("topics")
        .select("id,name")
        .in("id", topicIds);
      if (tErr) throw tErr;
      const topicMap = new Map(topics?.map(t => [t.id, t.name] as const));
      return (data || []).map(d => ({
        id: d.topic_id,
        name: topicMap.get(d.topic_id) ?? `Temat ${d.topic_id}`,
        mastery: d.mastery_percentage ?? 0,
      }));
    },
    enabled: !!user?.id,
  });

  // Goals
  const { data: goals } = useQuery({
    queryKey: ["pp-goals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as any[];
      const { data, error } = await supabase
        .from("learning_goals")
        .select("id,goal_type,target_value,current_value,deadline,status")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const weekChart = useMemo(() => (week || []).map((d: any) => ({
    date: d.date?.slice(5),
    min: d.total_time_minutes || 0,
    acc: Number(d.average_accuracy || 0),
    lessons: d.lessons_completed || 0,
  })), [week]);

  const topMastery = useMemo(() => (mastery || [])
    .sort((a: any, b: any) => b.mastery - a.mastery)
    .slice(0, 6), [mastery]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Raport postępów – AI Tutor Matematyki",
    description: "Podsumowanie postępów nauki: dzisiaj, trendy tygodniowe, opanowanie tematów i cele.",
  } as const;

  return (
    <>
      <Seo
        title="Postępy w nauce – AI Tutor Matematyki"
        description="Zobacz swoje postępy: czas nauki, dokładność, mastery tematów i cele."
        jsonLd={jsonLd}
      />
      <main className="container mx-auto px-6 py-8 space-y-6" aria-labelledby="progress-title">
        <header>
          <h1 id="progress-title" className="text-3xl font-bold tracking-tight">Postępy w nauce</h1>
          <p className="text-muted-foreground">Motywujące podsumowanie Twojej pracy i kolejnych kroków.</p>
        </header>

        {/* Today & streak */}
        <section aria-labelledby="pp-today" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seria dni</CardTitle>
              <CardDescription>Utrzymuj nawyk!</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" /> {streak?.current_streak ?? 0}
              <span className="text-sm text-muted-foreground">dni</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dzisiejszy czas</CardTitle>
              <CardDescription>Wystarczy 15 min dziennie</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> {today?.total_time_minutes ?? 0}
              <span className="text-sm text-muted-foreground">min</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ukończone lekcje</CardTitle>
              <CardDescription>Świetna robota!</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {today?.lessons_completed ?? 0}
            </CardContent>
          </Card>
        </section>

        {/* Trends */}
        <section aria-labelledby="pp-trends" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">Trendy 7 dni – czas nauki</CardTitle>
                <CardDescription>Minuty dziennie</CardDescription>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekChart} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="min" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trendy 7 dni – dokładność</CardTitle>
              <CardDescription>Procent poprawnych odpowiedzi</CardDescription>
            </CardHeader>
            <CardContent style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekChart} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="acc" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* Mastery */}
        <section aria-labelledby="pp-mastery" className="space-y-2">
          <h2 id="pp-mastery" className="text-xl font-semibold">Opanowanie tematów</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topMastery.map((m: any) => (
              <Card key={m.id}>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> {m.name}
                  </CardTitle>
                  <span className="text-sm text-primary font-semibold">{m.mastery}%</span>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-2 bg-muted rounded">
                    <div className="h-2 bg-primary rounded" style={{ width: `${m.mastery}%` }} />
                  </div>
                </CardContent>
              </Card>
            ))}
            {topMastery.length === 0 && (
              <Card className="md:col-span-3">
                <CardContent className="py-6 text-muted-foreground">Brak danych – rozpocznij naukę, by zobaczyć postępy.</CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Goals & next step */}
        <section aria-labelledby="pp-goals" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Twoje cele</CardTitle>
              <CardDescription>Mikro‑cele na ten tydzień</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals && goals.length > 0 ? (
                goals.slice(0, 3).map((g: any) => {
                  const pct = Math.min(100, Math.round(((g.current_value || 0) / g.target_value) * 100));
                  return (
                    <div key={g.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{g.goal_type.replace('_', ' ')}</span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded">
                        <div className="h-2 bg-primary rounded" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">Brak zdefiniowanych celów. Ustal cel czasu lub zadań na ten tydzień.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rekomendowane teraz</CardTitle>
              <CardDescription>Krótka sesja dopasowana do Ciebie</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground pr-4">
                Proponujemy 10 min powtórki i 1 mini‑quiz, by utrzymać serię.
              </div>
              <Link to="/recommendations">
                <Button className="shadow-primary">
                  <Target className="w-4 h-4 mr-2" /> Zacznij teraz
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
