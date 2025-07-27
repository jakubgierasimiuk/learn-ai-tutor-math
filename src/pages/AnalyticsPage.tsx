import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, Target, Clock, Award, Brain, BarChart3, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface DailyStats {
  date: string;
  lessons_completed: number;
  points_earned: number;
  total_time_minutes: number;
  topics_practiced: number;
  average_accuracy: number;
}

interface TopicMastery {
  topic_name: string;
  mastery_percentage: number;
  lessons_completed: number;
  time_spent: number;
}

interface LearningPattern {
  hour: number;
  activity_count: number;
  avg_performance: number;
}

interface WeeklyGoal {
  goal_type: string;
  target_value: number;
  current_value: number;
  deadline: string;
  status: string;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [topicMastery, setTopicMastery] = useState<TopicMastery[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalLessons: 0,
    totalPoints: 0,
    totalHours: 0,
    currentStreak: 0,
    avgAccuracy: 0,
    weakestTopic: '',
    strongestTopic: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch daily stats for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: dailyData } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (dailyData) {
        setDailyStats(dailyData);
      }

      // Fetch topic mastery
      const { data: masteryData } = await supabase
        .from('skill_mastery')
        .select(`
          mastery_percentage,
          topic_id,
          topics (name)
        `)
        .eq('user_id', user?.id);

      if (masteryData) {
        const processedMastery = masteryData.map(item => ({
          topic_name: item.topics?.name || 'Unknown',
          mastery_percentage: item.mastery_percentage,
          lessons_completed: 0,
          time_spent: 0
        }));
        setTopicMastery(processedMastery);
      }

      // Generate learning patterns (mock data for now)
      const patterns = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        activity_count: Math.floor(Math.random() * 10),
        avg_performance: 60 + Math.random() * 40
      }));
      setLearningPatterns(patterns);

      // Fetch weekly goals
      const { data: goalsData } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (goalsData) {
        setWeeklyGoals(goalsData);
      }

      // Calculate total stats
      const { data: profileData } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user?.id)
        .maybeSingle();

      const { data: progressData } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'completed');

      const totalLessons = progressData?.length || 0;
      const totalHours = dailyData?.reduce((sum, day) => sum + (day.total_time_minutes || 0), 0) / 60 || 0;
      const avgAccuracy = dailyData?.length > 0 
        ? dailyData.reduce((sum, day) => sum + (day.average_accuracy || 0), 0) / dailyData.length 
        : 0;

      setTotalStats({
        totalLessons,
        totalPoints: profileData?.total_points || 0,
        totalHours: Math.round(totalHours * 10) / 10,
        currentStreak: streakData?.current_streak || 0,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        weakestTopic: topicMastery.length > 0 ? topicMastery.reduce((min, topic) => 
          topic.mastery_percentage < min.mastery_percentage ? topic : min).topic_name : '',
        strongestTopic: topicMastery.length > 0 ? topicMastery.reduce((max, topic) => 
          topic.mastery_percentage > max.mastery_percentage ? topic : max).topic_name : ''
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Błąd podczas ładowania analityki');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Analityka Postępów</h1>
        <p className="text-muted-foreground">Szczegółowa analiza Twojej nauki i postępów</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukończone Lekcje</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalLessons}</div>
            <p className="text-xs text-muted-foreground">+12% od ostatniego miesiąca</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Łączne Punkty</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalPoints}</div>
            <p className="text-xs text-muted-foreground">+18% od ostatniego miesiąca</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Czas Nauki</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">W ostatnich 30 dniach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktualna Passa</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">dni z rzędu</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Postępy</TabsTrigger>
          <TabsTrigger value="performance">Wydajność</TabsTrigger>
          <TabsTrigger value="topics">Tematy</TabsTrigger>
          <TabsTrigger value="goals">Cele</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aktywność w Ostatnich 30 Dniach</CardTitle>
                <CardDescription>Twoja dzienna aktywność nauki</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="lessons_completed" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zdobyte Punkty</CardTitle>
                <CardDescription>Dzienny postęp punktowy</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="points_earned" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Wzorce Aktywności</CardTitle>
                <CardDescription>Twoja aktywność w ciągu dnia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={learningPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activity_count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Średnia Dokładność</CardTitle>
                <CardDescription>Twoja wydajność w czasie</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="average_accuracy" stroke="hsl(var(--accent))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Opanowanie Tematów</CardTitle>
                <CardDescription>Poziom opanowania każdego tematu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topicMastery.map((topic, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{topic.topic_name}</span>
                        <span className="text-sm text-muted-foreground">{topic.mastery_percentage}%</span>
                      </div>
                      <Progress value={topic.mastery_percentage} className="w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rozkład Tematów</CardTitle>
                <CardDescription>Podział czasu między tematy</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topicMastery}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ topic_name, mastery_percentage }) => `${topic_name}: ${mastery_percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="mastery_percentage"
                    >
                      {topicMastery.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-500" />
                  Najmocniejszy Temat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{totalStats.strongestTopic || 'Brak danych'}</p>
                <p className="text-sm text-muted-foreground">Świetna robota! Kontynuuj w tym tempie.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Wymaga Uwagi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{totalStats.weakestTopic || 'Brak danych'}</p>
                <p className="text-sm text-muted-foreground">Poświęć więcej czasu na ten temat.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktywne Cele</CardTitle>
              <CardDescription>Twoje bieżące cele nauki</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyGoals.map((goal, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{goal.goal_type}</h3>
                      <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Postęp: {goal.current_value} / {goal.target_value}</span>
                        <span>{Math.round((goal.current_value / goal.target_value) * 100)}%</span>
                      </div>
                      <Progress value={(goal.current_value / goal.target_value) * 100} />
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground">
                          Termin: {new Date(goal.deadline).toLocaleDateString('pl-PL')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {weeklyGoals.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Nie masz aktywnych celów</p>
                    <Button onClick={() => {/* TODO: Add goal creation */}}>
                      Ustaw Nowy Cel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}