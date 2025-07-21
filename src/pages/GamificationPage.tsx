import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  TrendingUp, 
  Award,
  Crown,
  Flame,
  Shield,
  Gift,
  Calendar,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
  condition_type: string;
  condition_value: number;
  category: string;
  is_unlocked: boolean;
  unlocked_at?: string;
}

interface UserStats {
  level: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  avg_score: number;
  points_to_next_level: number;
  experience_percentage: number;
}

interface LeaderboardEntry {
  user_id: string;
  name: string;
  total_points: number;
  position: number;
  current_streak: number;
}

export default function GamificationPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchAchievements(),
        fetchUserStats(),
        fetchLeaderboards()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      // Fetch all achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      // Fetch user's unlocked achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user?.id);

      const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
      const achievementMap = new Map(userAchievements?.map(ua => [ua.achievement_id, ua.unlocked_at]) || []);

      const enrichedAchievements = allAchievements?.map(achievement => ({
        ...achievement,
        is_unlocked: unlockedIds.has(achievement.id),
        unlocked_at: achievementMap.get(achievement.id)
      })) || [];

      setAchievements(enrichedAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('level, total_points')
        .eq('user_id', user?.id)
        .single();

      // Get streak data
      const { data: streak } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', user?.id)
        .single();

      // Get lesson progress
      const { data: progress } = await supabase
        .from('user_lesson_progress')
        .select('score, status')
        .eq('user_id', user?.id);

      const completedLessons = progress?.filter(p => p.status === 'completed') || [];
      const avgScore = completedLessons.length > 0 
        ? completedLessons.reduce((sum, p) => sum + (p.score || 0), 0) / completedLessons.length 
        : 0;

      // Calculate level progression
      const currentLevel = profile?.level || 1;
      const currentPoints = profile?.total_points || 0;
      const pointsForNextLevel = currentLevel * 1000; // 1000 points per level
      const pointsInCurrentLevel = currentPoints % 1000;
      const experiencePercentage = (pointsInCurrentLevel / 1000) * 100;

      setUserStats({
        level: currentLevel,
        total_points: currentPoints,
        current_streak: streak?.current_streak || 0,
        longest_streak: streak?.longest_streak || 0,
        lessons_completed: completedLessons.length,
        avg_score: Math.round(avgScore),
        points_to_next_level: 1000 - pointsInCurrentLevel,
        experience_percentage: experiencePercentage
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchLeaderboards = async () => {
    try {
      const currentWeek = new Date();
      currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
      const weekStart = currentWeek.toISOString().split('T')[0];

      const currentMonth = new Date();
      currentMonth.setDate(1);
      const monthStart = currentMonth.toISOString().split('T')[0];

      // Simplified leaderboard queries
      const { data: weeklyData } = await supabase
        .from('leaderboards')
        .select('user_id, total_points')
        .eq('period_type', 'weekly')
        .eq('period_start', weekStart)
        .order('total_points', { ascending: false })
        .limit(10);

      const { data: monthlyData } = await supabase
        .from('leaderboards')
        .select('user_id, total_points')
        .eq('period_type', 'monthly')
        .eq('period_start', monthStart)
        .order('total_points', { ascending: false })
        .limit(10);

      setWeeklyLeaderboard(weeklyData?.map((entry, index) => ({
        user_id: entry.user_id,
        name: 'Użytkownik',
        total_points: entry.total_points,
        position: index + 1,
        current_streak: 0
      })) || []);

      setMonthlyLeaderboard(monthlyData?.map((entry, index) => ({
        user_id: entry.user_id,
        name: 'Użytkownik', 
        total_points: entry.total_points,
        position: index + 1,
        current_streak: 0
      })) || []);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    }
  };

  const getAchievementIcon = (icon: string) => {
    const icons = {
      trophy: Trophy,
      star: Star,
      target: Target,
      trending: TrendingUp,
      award: Award,
      crown: Crown,
      flame: Flame,
      shield: Shield,
      gift: Gift
    };
    const IconComponent = icons[icon as keyof typeof icons] || Trophy;
    return <IconComponent className="h-6 w-6" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      learning: 'bg-green-100 text-green-800',
      social: 'bg-purple-100 text-purple-800',
      streak: 'bg-orange-100 text-orange-800',
      mastery: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getLevelTitle = (level: number) => {
    if (level < 5) return "Początkujący";
    if (level < 10) return "Uczeń";
    if (level < 20) return "Adept";
    if (level < 30) return "Ekspert";
    if (level < 50) return "Mistrz";
    return "Legenda";
  };

  const handleClaimReward = async (achievementId: number) => {
    try {
      // In a real app, this would trigger a reward claim
      toast.success("Nagroda została odebrana!");
    } catch (error) {
      toast.error("Błąd podczas odbierania nagrody");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          Gamifikacja
        </h1>
        <p className="text-muted-foreground">
          Śledź swoje postępy, zdobywaj osiągnięcia i rywalizuj z innymi
        </p>
      </div>

      {/* User Stats Overview */}
      {userStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Poziom {userStats.level}</div>
                  <div className="text-sm text-muted-foreground">{getLevelTitle(userStats.level)}</div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Do następnego poziomu</span>
                  <span>{userStats.points_to_next_level} pkt</span>
                </div>
                <Progress value={userStats.experience_percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.total_points}</div>
                  <div className="text-sm text-muted-foreground">Punkty</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.current_streak}</div>
                  <div className="text-sm text-muted-foreground">Dni z rzędu</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{userStats.avg_score}%</div>
                  <div className="text-sm text-muted-foreground">Średni wynik</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Osiągnięcia</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="rewards">Nagrody</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-6">
            {['general', 'learning', 'social', 'streak', 'mastery'].map(category => {
              const categoryAchievements = achievements.filter(a => a.category === category);
              if (categoryAchievements.length === 0) return null;

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {category === 'general' && 'Ogólne'}
                      {category === 'learning' && 'Nauka'}
                      {category === 'social' && 'Społeczność'}
                      {category === 'streak' && 'Konsekwencja'}
                      {category === 'mastery' && 'Mistrzostwo'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryAchievements.map((achievement) => (
                        <Card 
                          key={achievement.id} 
                          className={`relative ${achievement.is_unlocked ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${achievement.is_unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {getAchievementIcon(achievement.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{achievement.name}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {achievement.description}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                  <Badge className={getCategoryColor(achievement.category)}>
                                    {achievement.points_reward} pkt
                                  </Badge>
                                  {achievement.is_unlocked && (
                                    <Badge variant="outline" className="border-green-300 text-green-600">
                                      Zdobyte!
                                    </Badge>
                                  )}
                                </div>
                                {achievement.is_unlocked && achievement.unlocked_at && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Zdobyte: {new Date(achievement.unlocked_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Ranking Tygodniowy
                </CardTitle>
                <CardDescription>
                  Najlepsi gracze w tym tygodniu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyLeaderboard.map((entry, index) => (
                    <div 
                      key={entry.user_id} 
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        entry.user_id === user?.id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {entry.position}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{entry.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.total_points} pkt • {entry.current_streak} dni streak
                        </div>
                      </div>
                      {index < 3 && (
                        <div className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ranking Miesięczny
                </CardTitle>
                <CardDescription>
                  Najlepsi gracze w tym miesiącu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyLeaderboard.map((entry, index) => (
                    <div 
                      key={entry.user_id} 
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        entry.user_id === user?.id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {entry.position}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{entry.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {entry.total_points} pkt • {entry.current_streak} dni streak
                        </div>
                      </div>
                      {index < 3 && (
                        <div className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Nagrody i Bonusy
              </CardTitle>
              <CardDescription>
                Odbierz nagrody za swoje osiągnięcia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-green-300 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Star className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium">Bonus dzienny</h4>
                      <p className="text-sm text-muted-foreground">+50 punktów za codzienną naukę</p>
                      <Button size="sm" className="w-full">
                        Odbierz (50 pkt)
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-300 bg-blue-50">
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Flame className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium">Bonus za streak</h4>
                      <p className="text-sm text-muted-foreground">+{userStats?.current_streak || 0 * 10} punktów za {userStats?.current_streak || 0} dni</p>
                      <Button size="sm" className="w-full" variant="outline">
                        Niedostępne
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-300 bg-purple-50">
                  <CardContent className="pt-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <Trophy className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-medium">Bonus tygodniowy</h4>
                      <p className="text-sm text-muted-foreground">+200 punktów za 7 lekcji</p>
                      <Button size="sm" className="w-full" variant="outline">
                        Niedostępne
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}