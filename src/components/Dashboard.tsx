import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UpgradePrompts } from "@/components/UpgradePrompts";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Flame, 
  BookOpen, 
  Star,
  Award,
  Calendar,
  BarChart3,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTokenUsage } from "@/hooks/useTokenUsage";

interface UserStats {
  total_points: number;
  lessons_completed: number;
  topics_started: number;
  current_streak: number;
  longest_streak: number;
  average_score: number;
  recent_achievements: Achievement[];
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked_at: string;
}

interface RecentActivity {
  lesson_title: string;
  topic_name: string;
  score: number;
  completed_at: string;
  points_earned: number;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const { getTokenStatus, shouldShowUpgradePrompt } = useTokenUsage();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    checkDiagnosticStatus();
    checkSMSTriggerConditions();
  }, []);

  const checkSMSTriggerConditions = () => {
    // Trigger SMS prompt if conditions are met
    const tokenStatus = getTokenStatus();
    const shouldUpgrade = shouldShowUpgradePrompt();
    
    if ((tokenStatus === 'warning' || shouldUpgrade) && user) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trigger-sms-prompt', {
          detail: { triggerType: 'dashboard_token_warning' }
        }));
      }, 5000); // 5 second delay for better UX
    }
  };

  const checkDiagnosticStatus = async () => {
    // Skip diagnostic check for now to allow access to admin dashboards
    return;
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile and basic stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points")
        .eq("user_id", user?.id)
        .maybeSingle();

      // Fetch skill progress stats
      const { data: skillStats } = await supabase
        .from("skill_progress")
        .select(`
          skill_id,
          mastery_level,
          total_attempts,
          correct_attempts,
          is_mastered,
          updated_at
        `)
        .eq("user_id", user?.id);

      // Fetch streak data
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user?.id)
        .maybeSingle();

      // Fetch recent achievements
      const { data: achievements } = await supabase
        .from("user_achievements")
        .select(`
          unlocked_at,
          achievements!inner(
            id,
            name,
            description,
            icon,
            category
          )
        `)
        .eq("user_id", user?.id)
        .order("unlocked_at", { ascending: false })
        .limit(5);

      // Fetch recent learning sessions as activity
      const { data: activity } = await supabase
        .from("unified_learning_sessions")
        .select(`
          completed_at,
          tasks_completed,
          correct_answers,
          engagement_score,
          skill_focus,
          department
        `)
        .eq("user_id", user?.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(5);

      // Process data
      const masteredSkills = skillStats?.filter(s => s.is_mastered) || [];
      const skillsStarted = skillStats?.length || 0;
      const averageScore = skillStats && skillStats.length > 0
        ? skillStats.reduce((sum, skill) => {
            const accuracy = skill.total_attempts > 0 ? (skill.correct_attempts / skill.total_attempts) * 100 : 0;
            return sum + accuracy;
          }, 0) / skillStats.length
        : 0;

      const processedAchievements = achievements?.map(ua => ({
        id: ua.achievements.id,
        name: ua.achievements.name,
        description: ua.achievements.description,
        icon: ua.achievements.icon,
        category: ua.achievements.category,
        unlocked_at: ua.unlocked_at
      })) || [];

      const processedActivity = activity?.map(a => ({
        lesson_title: `Learning Session`,
        topic_name: (a.department || 'matematyka').replace('_', ' '),
        score: a.tasks_completed > 0 ? Math.round((a.correct_answers / a.tasks_completed) * 100) : 0,
        completed_at: a.completed_at!,
        points_earned: Math.round((a.engagement_score || 0.5) * 20) + 10 // Estimate based on engagement
      })) || [];

      setStats({
        total_points: profile?.total_points || 0,
        lessons_completed: masteredSkills.length,
        topics_started: skillsStarted,
        current_streak: streakData?.current_streak || 0,
        longest_streak: streakData?.longest_streak || 0,
        average_score: Math.round(averageScore),
        recent_achievements: processedAchievements
      });

      setRecentActivity(processedActivity);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning': return 'bg-primary text-primary-foreground';
      case 'general': return 'bg-success text-success-foreground';
      case 'social': return 'bg-accent text-accent-foreground';
      case 'special': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
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
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground">Przegląd Twojego postępu w nauce</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Punkty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.total_points || 0}</div>
              <p className="text-xs text-muted-foreground">Łącznie zdobyte</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Umiejętności
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.lessons_completed || 0}</div>
              <p className="text-xs text-muted-foreground">Opanowane umiejętności</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Flame className="w-4 h-4 text-orange-500" />
                Passa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.current_streak || 0}</div>
              <p className="text-xs text-muted-foreground">Dni z rzędu</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Star className="w-4 h-4 text-green-500" />
                Średnia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.average_score || 0}%</div>
              <p className="text-xs text-muted-foreground">Wynik z lekcji</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Ostatnie osiągnięcia
              </CardTitle>
              <CardDescription>Twoje najnowsze sukcesy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.recent_achievements.length ? (
                stats.recent_achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(achievement.unlocked_at)}
                      </div>
                    </div>
                    <Badge className={getCategoryColor(achievement.category)}>
                      {achievement.category}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Ukończ pierwszą sesję nauki, aby zdobyć osiągnięcia!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Ostatnia aktywność
              </CardTitle>
              <CardDescription>Twoje najnowsze sesje nauki</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.length ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="font-medium">{activity.lesson_title}</div>
                      <div className="text-sm text-muted-foreground">{activity.topic_name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDate(activity.completed_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-success">{activity.score}%</div>
                      <div className="text-xs text-muted-foreground">+{activity.points_earned} pkt</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Rozpocznij pierwszą sesję nauki!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Promotion for Free Users */}
        
        <UpgradePrompts context="dashboard" />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Szybkie akcje
            </CardTitle>
            <CardDescription>Kontynuuj swoją naukę</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/study-dashboard">
                <Button className="w-full h-auto p-4 flex-col gap-2">
                  <BookOpen className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">Przeglądaj umiejętności</div>
                    <div className="text-xs opacity-80">Wybierz nową umiejętność</div>
                  </div>
                </Button>
              </Link>
              
              <Link to="/chat">
                <Button variant="outline" className="w-full h-auto p-4 flex-col gap-2">
                  <Brain className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">mentavo.ai</div>
                    <div className="text-xs opacity-80">Zadaj pytanie AI</div>
                  </div>
                </Button>
              </Link>

              <Link to="/quiz">
                <Button variant="outline" className="w-full h-auto p-4 flex-col gap-2">
                  <Target className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-medium">Quiz</div>
                    <div className="text-xs opacity-80">Sprawdź wiedzę</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};