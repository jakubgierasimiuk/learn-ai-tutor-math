import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Clock, Trophy, Target, BookCheck, Calendar, TrendingUp, Award, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { UpgradePrompts } from "@/components/UpgradePrompts";

interface DailyStats {
  date: string;
  lessons_completed: number;
  total_time_minutes: number;
  points_earned: number;
  topics_practiced: number;
  average_accuracy: number;
}

interface SkillProgress {
  skill_id: string;
  mastery_level: number;
  is_mastered: boolean;
  total_attempts: number;
  correct_attempts: number;
}

const ProgressPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalPoints: 0,
    totalLessons: 0,
    totalTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    avgAccuracy: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchProgressData();
    }
  }, [user?.id]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Fetch daily stats for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [dailyStatsResponse, skillProgressResponse, profileResponse, streakResponse] = await Promise.all([
        supabase
          .from("daily_stats")
          .select("date, lessons_completed, total_time_minutes, points_earned, topics_practiced, average_accuracy")
          .eq("user_id", user!.id)
          .gte("date", thirtyDaysAgo.toISOString().slice(0, 10))
          .order("date", { ascending: true }),
        
        supabase
          .from("skill_progress")
          .select("skill_id, mastery_level, is_mastered, total_attempts, correct_attempts")
          .eq("user_id", user!.id)
          .limit(10),
        
        supabase
          .from("profiles")
          .select("total_points")
          .eq("user_id", user!.id)
          .maybeSingle(),
        
        supabase
          .from("user_streaks")
          .select("current_streak, longest_streak")
          .eq("user_id", user!.id)
          .maybeSingle()
      ]);

      if (dailyStatsResponse.data) {
        setDailyStats(dailyStatsResponse.data);
      }

      if (skillProgressResponse.data) {
        setSkillProgress(skillProgressResponse.data);
      }

      // Calculate total statistics
      const totalLessons = dailyStatsResponse.data?.reduce((sum, day) => sum + (day.lessons_completed || 0), 0) || 0;
      const totalTime = dailyStatsResponse.data?.reduce((sum, day) => sum + (day.total_time_minutes || 0), 0) || 0;
      const avgAccuracy = dailyStatsResponse.data?.length > 0 
        ? dailyStatsResponse.data.reduce((sum, day) => sum + (day.average_accuracy || 0), 0) / dailyStatsResponse.data.length 
        : 0;

      setTotalStats({
        totalPoints: profileResponse.data?.total_points || 0,
        totalLessons,
        totalTime,
        currentStreak: streakResponse.data?.current_streak || 0,
        longestStreak: streakResponse.data?.longest_streak || 0,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100
      });

    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const weeklyData = useMemo(() => {
    const last7Days = dailyStats.slice(-7);
    return last7Days.map(day => ({
      ...day,
      dayName: new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'short' })
    }));
  }, [dailyStats]);

  const masteredSkills = skillProgress.filter(skill => skill.is_mastered).length;
  const avgMastery = skillProgress.length > 0 
    ? skillProgress.reduce((sum, skill) => sum + skill.mastery_level, 0) / skillProgress.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Twoje Postępy
        </h1>
        <p className="text-muted-foreground">Kompletna analiza Twojego rozwoju w nauce matematyki</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card className="glass-card border border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">Passa</div>
            </div>
            <div className="text-xl font-bold text-primary">{totalStats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Najlepsza: {totalStats.longestStreak}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">Czas</div>
            </div>
            <div className="text-xl font-bold text-primary">{formatTime(totalStats.totalTime)}</div>
            <div className="text-xs text-muted-foreground">Łącznie</div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <BookCheck className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">Lekcje</div>
            </div>
            <div className="text-xl font-bold text-primary">{totalStats.totalLessons}</div>
            <div className="text-xs text-muted-foreground">Ukończone</div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">Punkty</div>
            </div>
            <div className="text-xl font-bold text-primary">{totalStats.totalPoints}</div>
            <div className="text-xs text-muted-foreground">Zdobyte</div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">Dokładność</div>
            </div>
            <div className="text-xl font-bold text-primary">{totalStats.avgAccuracy}%</div>
            <div className="text-xs text-muted-foreground">Średnia</div>
          </CardContent>
        </Card>

        <Card className="glass-card border border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xs font-medium text-muted-foreground">Opanowane</div>
            </div>
            <div className="text-xl font-bold text-primary">{masteredSkills}</div>
            <div className="text-xs text-muted-foreground">umiejętności</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Przegląd</TabsTrigger>
          <TabsTrigger value="activity">Aktywność</TabsTrigger>
          <TabsTrigger value="skills">Umiejętności</TabsTrigger>
          <TabsTrigger value="trends">Trendy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Aktywność w tym tygodniu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="dayName" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="lessons_completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Dzienny czas nauki
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="dayName" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      formatter={(value: any) => [formatTime(value), 'Czas nauki']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total_time_minutes" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-2 border-primary/20">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Łączne osiągnięcia</h3>
                <div className="text-3xl font-bold text-primary mb-2">{totalStats.totalPoints}</div>
                <p className="text-muted-foreground text-sm">punktów zdobytych</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-accent/20">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Poziom opanowania</h3>
                <div className="text-3xl font-bold text-accent mb-2">{Math.round(avgMastery * 10)}%</div>
                <p className="text-muted-foreground text-sm">średnie opanowanie</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-2 border-secondary/20">
              <CardContent className="p-6 text-center">
                <Flame className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Konsystencja</h3>
                <div className="text-3xl font-bold text-secondary mb-2">{totalStats.currentStreak}</div>
                <p className="text-muted-foreground text-sm">dni z rzędu</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Ostatnie 30 dni aktywności</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pl-PL')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lessons_completed" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    name="Lekcje"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="points_earned" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2} 
                    name="Punkty"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Postęp w umiejętnościach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillProgress.map((skill, index) => {
                  const accuracy = skill.total_attempts > 0 
                    ? (skill.correct_attempts / skill.total_attempts) * 100 
                    : 0;
                  
                  return (
                    <div key={skill.skill_id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Umiejętność {skill.skill_id.slice(0, 8)}...</span>
                          {skill.is_mastered && (
                            <Badge className="bg-green-100 text-green-800">Opanowane</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {skill.mastery_level * 10}% • {accuracy.toFixed(0)}% trafności
                        </div>
                      </div>
                      <Progress value={skill.mastery_level * 10} className="h-2" />
                    </div>
                  );
                })}
                
                {skillProgress.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Rozpocznij naukę, aby zobaczyć swój postęp</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Premium Insights Teaser */}
          <Card className="glass-card border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Premium Insights</h3>
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                      PRO
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Odblokuj zaawansowane analizy swojego postępu: predykcje trudności, rekomendacje AI, szczegółowe raporty
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>• Predykcyjne modele nauki</span>
                    <span>• Spersonalizowane strategie</span>
                    <span>• Szczegółowe metryki</span>
                    <span>• Porównania z benchmarkami</span>
                  </div>
                </div>
                <div className="text-center ml-6">
                  <UpgradePrompts context="progress" compact />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Dokładność w czasie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pl-PL')}
                    formatter={(value: any) => [`${value}%`, 'Dokładność']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="average_accuracy" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;