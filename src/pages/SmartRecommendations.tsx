import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { Link } from "react-router-dom";

interface SmartRecommendation {
  id: string;
  type: 'weak_area' | 'next_topic' | 'review' | 'challenge';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  actionUrl?: string;
  actionText: string;
  confidence: number;
  reasoning: string;
}

interface LearningAnalytics {
  overallProgress: number;
  weakAreas: string[];
  strongAreas: string[];
  learningVelocity: number;
  consistencyScore: number;
  nextMilestone: string;
  recommendedDifficulty: number;
}

const SmartRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  const generateRecommendations = async () => {
    try {
      // Fetch comprehensive user data
      const [progressData, streakData, achievementsData, topicsData] = await Promise.all([
        // Recent learning progress
        supabase
          .from("user_lesson_progress")
          .select(`
            score,
            completion_percentage,
            time_spent_minutes,
            completed_at,
            lessons!inner(title, difficulty_level),
            topics!inner(name, difficulty_level)
          `)
          .eq("user_id", user?.id)
          .order("completed_at", { ascending: false })
          .limit(20),

        // Streak data
        supabase
          .from("user_streaks")
          .select("current_streak, longest_streak")
          .eq("user_id", user?.id)
          .maybeSingle(),

        // Achievement data
        supabase
          .from("user_achievements")
          .select("achievements!inner(*)")
          .eq("user_id", user?.id),

        // Available topics
        supabase
          .from("topics")
          .select("*")
          .eq("is_active", true)
          .order("difficulty_level")
      ]);

      if (!progressData.data) {
        setRecommendations(getNewUserRecommendations());
        setLoading(false);
        return;
      }

      // Analyze learning patterns
      const learningAnalytics = analyzeLearningPatterns(
        progressData.data,
        streakData.data,
        achievementsData.data,
        topicsData.data
      );

      setAnalytics(learningAnalytics);

      // Generate personalized recommendations
      const smartRecommendations = await generateSmartRecommendations(
        learningAnalytics,
        progressData.data,
        topicsData.data
      );

      setRecommendations(smartRecommendations);

    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeLearningPatterns = (progressData: any[], streakData: any, achievementsData: any[], topicsData: any[]): LearningAnalytics => {
    const completedLessons = progressData.filter(p => p.completion_percentage === 100);
    const averageScore = completedLessons.length > 0 
      ? completedLessons.reduce((sum, p) => sum + (p.score || 0), 0) / completedLessons.length 
      : 0;

    // Identify weak and strong areas
    const topicPerformance = progressData.reduce((acc, p) => {
      const topicName = p.topics.name;
      if (!acc[topicName]) {
        acc[topicName] = { scores: [], count: 0 };
      }
      acc[topicName].scores.push(p.score || 0);
      acc[topicName].count++;
      return acc;
    }, {} as Record<string, { scores: number[], count: number }>);

    const weakAreas = Object.entries(topicPerformance)
      .filter(([_, data]) => {
        const avg = (data as { scores: number[], count: number }).scores.reduce((sum, s) => sum + s, 0) / (data as { scores: number[], count: number }).scores.length;
        return avg < 70;
      })
      .map(([topic]) => topic);

    const strongAreas = Object.entries(topicPerformance)
      .filter(([_, data]) => {
        const avg = (data as { scores: number[], count: number }).scores.reduce((sum, s) => sum + s, 0) / (data as { scores: number[], count: number }).scores.length;
        return avg >= 85;
      })
      .map(([topic]) => topic);

    // Calculate learning velocity (lessons per week)
    const recentLessons = progressData.filter(p => {
      const completedDate = new Date(p.completed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completedDate > weekAgo;
    });

    // Calculate consistency score based on streak and regularity
    const consistencyScore = streakData 
      ? Math.min(100, (streakData.current_streak * 10) + (streakData.longest_streak * 2))
      : 0;

    return {
      overallProgress: Math.round(averageScore),
      weakAreas,
      strongAreas,
      learningVelocity: recentLessons.length,
      consistencyScore,
      nextMilestone: averageScore < 50 ? "Podstawy matematyki" : 
                     averageScore < 75 ? "Średni poziom" : "Zaawansowany poziom",
      recommendedDifficulty: averageScore < 60 ? 1 : averageScore < 80 ? 2 : 3
    };
  };

  const generateSmartRecommendations = async (
    analytics: LearningAnalytics, 
    progressData: any[], 
    topicsData: any[]
  ): Promise<SmartRecommendation[]> => {
    const recs: SmartRecommendation[] = [];

    // 1. Address weak areas with high priority
    if (analytics.weakAreas.length > 0) {
      analytics.weakAreas.forEach(weakArea => {
        recs.push({
          id: `weak-${weakArea}`,
          type: 'weak_area',
          title: `Popraw się w: ${weakArea}`,
          description: `Twoja średnia w tym temacie jest poniżej 70%. Warto to poprawić.`,
          priority: 'high',
          estimatedTime: 30,
          actionText: 'Powtórz lekcje',
          confidence: 90,
          reasoning: 'Analiza wyników pokazuje trudności w tym obszarze'
        });
      });
    }

    // 2. Suggest next difficulty level
    const userTopics = [...new Set(progressData.map(p => p.topics.name))];
    const untriedTopics = topicsData.filter(t => 
      !userTopics.includes(t.name) && 
      t.difficulty_level <= analytics.recommendedDifficulty + 1
    );

    if (untriedTopics.length > 0) {
      const nextTopic = untriedTopics[0];
      recs.push({
        id: `next-${nextTopic.id}`,
        type: 'next_topic',
        title: `Nowy temat: ${nextTopic.name}`,
        description: nextTopic.description,
        priority: 'medium',
        estimatedTime: nextTopic.estimated_time_minutes,
        actionUrl: `/topic/${nextTopic.id}`,
        actionText: 'Rozpocznij naukę',
        confidence: 85,
        reasoning: 'Odpowiedni poziom trudności na podstawie Twojego postępu'
      });
    }

    // 3. Review recommendations for strong areas
    if (analytics.strongAreas.length > 0 && analytics.overallProgress > 60) {
      recs.push({
        id: 'challenge',
        type: 'challenge',
        title: 'Czas na wyzwanie!',
        description: `Radzisz sobie świetnie z: ${analytics.strongAreas.join(', ')}. Spróbuj trudniejszych zadań!`,
        priority: 'medium',
        estimatedTime: 25,
        actionText: 'Zaawansowane ćwiczenia',
        confidence: 75,
        reasoning: 'Wysokie wyniki w tych obszarach sugerują gotowość na większe wyzwania'
      });
    }

    // 4. Consistency improvement
    if (analytics.consistencyScore < 50) {
      recs.push({
        id: 'consistency',
        type: 'review',
        title: 'Regularna nauka',
        description: 'Spróbuj uczyć się codziennie przez 15 minut. To pomoże w budowaniu nawyków.',
        priority: 'high',
        estimatedTime: 15,
        actionText: 'Rozpocznij krótką lekcję',
        confidence: 95,
        reasoning: 'Regularna nauka znacznie poprawia rezultaty'
      });
    }

    // Sort by priority and confidence
    return recs
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.confidence - a.confidence;
      })
      .slice(0, 4); // Show top 4 recommendations
  };

  const getNewUserRecommendations = (): SmartRecommendation[] => [
    {
      id: 'first-lesson',
      type: 'next_topic',
      title: 'Rozpocznij swoją przygodę z matematyką',
      description: 'Zacznij od podstaw arytmetyki i poznaj działania matematyczne.',
      priority: 'high',
      estimatedTime: 20,
      actionUrl: '/lessons',
      actionText: 'Przeglądaj lekcje',
      confidence: 100,
      reasoning: 'Idealne miejsce na start dla nowych użytkowników'
    },
    {
      id: 'diagnostic',
      type: 'review',
      title: 'Sprawdź swój poziom',
      description: 'Zrób quiz diagnostyczny, aby dopasować naukę do Twojego poziomu.',
      priority: 'high',
      estimatedTime: 15,
      actionUrl: '/quiz',
      actionText: 'Rozpocznij quiz',
      confidence: 95,
      reasoning: 'Diagnostyka pomoże spersonalizować naukę'
    }
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Lightbulb className="w-4 h-4 text-blue-500" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weak_area': return 'bg-red-50 border-red-200 text-red-800';
      case 'next_topic': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'review': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'challenge': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold gradient-text">Inteligentne Rekomendacje</h1>
          <p className="text-muted-foreground">AI analizuje Twój postęp i sugeruje następne kroki</p>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overallProgress}%</div>
                    <div className="text-sm text-muted-foreground">Ogólny postęp</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.consistencyScore}</div>
                    <div className="text-sm text-muted-foreground">Regularność</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.learningVelocity}</div>
                    <div className="text-sm text-muted-foreground">Lekcji/tydzień</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="text-lg font-bold">{analytics.nextMilestone}</div>
                    <div className="text-sm text-muted-foreground">Następny cel</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Smart Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Personalizowane rekomendacje
            </CardTitle>
            <CardDescription>
              Na podstawie analizy Twojego postępu i stylu nauki
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className={`p-4 rounded-lg border ${getTypeColor(rec.type)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getPriorityIcon(rec.priority)}
                    <div>
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm opacity-80">{rec.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {rec.estimatedTime}min
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span>Pewność AI: {rec.confidence}%</span>
                    <Progress value={rec.confidence} className="w-16 h-1" />
                  </div>
                  
                  {rec.actionUrl ? (
                    <Link to={rec.actionUrl}>
                      <Button size="sm" variant="outline">
                        {rec.actionText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="outline">
                      {rec.actionText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>

                <details className="mt-3">
                  <summary className="text-xs cursor-pointer opacity-60 hover:opacity-100">
                    Dlaczego to rekomendujemy?
                  </summary>
                  <p className="text-xs mt-1 opacity-70">{rec.reasoning}</p>
                </details>
              </div>
            ))}

            {recommendations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Brak rekomendacji. Ukończ więcej lekcji, aby AI mogło lepiej Cię poznać!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Insights */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mocne strony</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.strongAreas.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.strongAreas.map((area) => (
                      <div key={area} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Kontynuuj naukę, aby zidentyfikować mocne strony
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Obszary do poprawy</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.weakAreas.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.weakAreas.map((area) => (
                      <div key={area} className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Świetnie! Nie zidentyfikowano obszarów wymagających poprawy
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartRecommendations;