import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, Target, TrendingUp, BookOpen, Star, Trophy, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface DailyStat {
  date: string;
  lessons_completed: number;
  total_time_minutes: number;
  points_earned: number;
  topics_practiced: number;
  average_accuracy: number;
}

interface LearningGoal {
  id: number;
  goal_type: string;
  target_value: number;
  current_value: number;
  deadline: string | null;
  status: string;
}

interface TopicProgress {
  topic_id: number;
  topic_name: string;
  mastery_percentage: number;
  recorded_at: string;
}

interface SessionAnalytics {
  topic_name: string;
  duration_minutes: number;
  completion_rate: number;
  engagement_score: number;
  correct_answers: number;
  questions_answered: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics[]>([]);
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

      const [dailyStatsResponse, goalsResponse, topicProgressResponse, sessionResponse] = await Promise.all([
        supabase
          .from('daily_stats')
          .select('*')
          .eq('user_id', user!.id)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: true }),

        supabase
          .from('learning_goals')
          .select('*')
          .eq('user_id', user!.id)
          .eq('status', 'active'),

        supabase
          .from('topic_progress_history')
          .select(`
            topic_id,
            mastery_percentage,
            recorded_at,
            topics(name)
          `)
          .eq('user_id', user!.id)
          .order('recorded_at', { ascending: false })
          .limit(50),

        supabase
          .from('session_analytics')
          .select(`
            duration_minutes,
            completion_rate,
            engagement_score,
            correct_answers,
            questions_answered,
            topics(name)
          `)
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      // Generate mock data for demo purposes
      const mockDailyStats = generateMockDailyStats();
      const mockGoals = generateMockGoals();
      const mockTopicProgress = generateMockTopicProgress();
      const mockSessionAnalytics = generateMockSessionAnalytics();

      setDailyStats(mockDailyStats);
      setGoals(mockGoals);
      setTopicProgress(mockTopicProgress);
      setSessionAnalytics(mockSessionAnalytics);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockDailyStats = (): DailyStat[] => {
    const stats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      stats.push({
        date: date.toISOString().split('T')[0],
        lessons_completed: Math.floor(Math.random() * 5) + 1,
        total_time_minutes: Math.floor(Math.random() * 120) + 30,
        points_earned: Math.floor(Math.random() * 300) + 50,
        topics_practiced: Math.floor(Math.random() * 3) + 1,
        average_accuracy: Math.floor(Math.random() * 40) + 60
      });
    }
    return stats;
  };

  const generateMockGoals = (): LearningGoal[] => {
    return [
      {
        id: 1,
        goal_type: 'daily_lessons',
        target_value: 3,
        current_value: 2,
        deadline: null,
        status: 'active'
      },
      {
        id: 2,
        goal_type: 'weekly_time',
        target_value: 600,
        current_value: 420,
        deadline: null,
        status: 'active'
      },
      {
        id: 3,
        goal_type: 'points_target',
        target_value: 1000,
        current_value: 750,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      }
    ];
  };

  const generateMockTopicProgress = (): TopicProgress[] => {
    const topics = ['Twierdzenie Pitagorasa', 'Równania liniowe', 'Funkcje kwadratowe', 'Procenty', 'Geometria'];
    return topics.map((topic, index) => ({
      topic_id: index + 1,
      topic_name: topic,
      mastery_percentage: Math.floor(Math.random() * 100),
      recorded_at: new Date().toISOString()
    }));
  };

  const generateMockSessionAnalytics = (): SessionAnalytics[] => {
    const topics = ['Twierdzenie Pitagorasa', 'Równania liniowe', 'Funkcje kwadratowe'];
    return topics.map(topic => ({
      topic_name: topic,
      duration_minutes: Math.floor(Math.random() * 45) + 15,
      completion_rate: Math.floor(Math.random() * 40) + 60,
      engagement_score: Math.floor(Math.random() * 30) + 70,
      correct_answers: Math.floor(Math.random() * 8) + 5,
      questions_answered: Math.floor(Math.random() * 5) + 10
    }));
  };

  const goalTypeLabels = {
    daily_lessons: 'Dzienne lekcje',
    weekly_time: 'Tygodniowy czas (min)',
    points_target: 'Cel punktowy',
    topic_mastery: 'Opanowanie tematu'
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--chart-1))'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <TrendingUp className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Analytics i Postęp</h1>
          <p className="text-muted-foreground">Śledź swój rozwój w nauce matematyki</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Przegląd</TabsTrigger>
          <TabsTrigger value="progress">Postęp</TabsTrigger>
          <TabsTrigger value="goals">Cele</TabsTrigger>
          <TabsTrigger value="performance">Wydajność</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dzisiejsze lekcje</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">+1 od wczoraj</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Czas nauki</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2h 15m</div>
                <p className="text-xs text-muted-foreground">Ten tydzień</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Punkty</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">750</div>
                <p className="text-xs text-muted-foreground">+180 w tym tygodniu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Średnia dokładność</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+5% od ostatniego tygodnia</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Dzienny postęp</CardTitle>
              <CardDescription>Twoja aktywność w ciągu ostatnich 30 dni</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString('pl-PL')} />
                  <Line type="monotone" dataKey="points_earned" stroke="hsl(var(--primary))" strokeWidth={2} name="Punkty" />
                  <Line type="monotone" dataKey="total_time_minutes" stroke="hsl(var(--secondary))" strokeWidth={2} name="Czas (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Topic Mastery */}
          <Card>
            <CardHeader>
              <CardTitle>Opanowanie tematów</CardTitle>
              <CardDescription>Twój postęp w różnych obszarach matematyki</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topicProgress.map((topic, index) => (
                <div key={topic.topic_id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{topic.topic_name}</span>
                    <span className="text-sm text-muted-foreground">{topic.mastery_percentage}%</span>
                  </div>
                  <Progress value={topic.mastery_percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Tygodniowa aktywność</CardTitle>
              <CardDescription>Porównanie punktów zdobytych w ostatnich tygodniach</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyStats.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('pl-PL', { weekday: 'short' })} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString('pl-PL')} />
                  <Bar dataKey="points_earned" fill="hsl(var(--primary))" name="Punkty" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Active Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {goalTypeLabels[goal.goal_type as keyof typeof goalTypeLabels]}
                  </CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{goal.current_value}</span>
                    <span className="text-muted-foreground">/ {goal.target_value}</span>
                  </div>
                  <Progress value={(goal.current_value / goal.target_value) * 100} className="h-2" />
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">
                      {Math.round((goal.current_value / goal.target_value) * 100)}%
                    </Badge>
                    {goal.deadline && (
                      <span className="text-xs text-muted-foreground">
                        Do: {new Date(goal.deadline).toLocaleDateString('pl-PL')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Goal Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Postęp celów</CardTitle>
              <CardDescription>Wizualizacja realizacji Twoich celów nauki</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={goals.map(goal => ({
                      name: goalTypeLabels[goal.goal_type as keyof typeof goalTypeLabels],
                      value: Math.round((goal.current_value / goal.target_value) * 100),
                      target: goal.target_value,
                      current: goal.current_value
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {goals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Session Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Wydajność sesji</CardTitle>
              <CardDescription>Analiza Twoich ostatnich sesji nauki</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessionAnalytics.map((session, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{session.topic_name}</h4>
                    <Badge variant="outline">{session.duration_minutes} min</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Ukończenie:</span>
                      <div className="font-medium">{session.completion_rate}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Zaangażowanie:</span>
                      <div className="font-medium">{session.engagement_score}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Poprawne:</span>
                      <div className="font-medium">{session.correct_answers}/{session.questions_answered}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dokładność:</span>
                      <div className="font-medium">{Math.round((session.correct_answers / session.questions_answered) * 100)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Trendy wydajności</CardTitle>
              <CardDescription>Analiza dokładności i zaangażowania w czasie</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyStats.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString('pl-PL')} />
                  <Line type="monotone" dataKey="average_accuracy" stroke="hsl(var(--primary))" strokeWidth={2} name="Dokładność (%)" />
                  <Line type="monotone" dataKey="lessons_completed" stroke="hsl(var(--secondary))" strokeWidth={2} name="Lekcje" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;