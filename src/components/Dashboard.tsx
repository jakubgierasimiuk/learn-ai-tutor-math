import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  BookOpen, 
  Target, 
  TrendingUp,
  PlayCircle,
  Calendar,
  Award,
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  user_id: string;
  name: string | null;
  email: string;
  level: number;
  total_points: number;
  diagnosis_completed: boolean;
}

interface SkillMastery {
  id: number;
  mastery_percentage: number;
  topics: {
    name: string;
  } | null;
}

interface LessonSession {
  id: number;
  completed_at: string | null;
  points_earned: number | null;
  topics: {
    name: string;
  } | null;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skillMastery, setSkillMastery] = useState<SkillMastery[]>([]);
  const [recentLessons, setRecentLessons] = useState<LessonSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch skill mastery with topic names
      const { data: masteryData } = await supabase
        .from('skill_mastery')
        .select(`
          id,
          mastery_percentage,
          topics:topic_id (
            name
          )
        `)
        .eq('user_id', user?.id);

      if (masteryData) {
        setSkillMastery(masteryData);
      }

      // Fetch recent completed lessons
      const { data: lessonsData } = await supabase
        .from('lesson_sessions')
        .select(`
          id,
          completed_at,
          points_earned,
          topics:topic_id (
            name
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      if (lessonsData) {
        setRecentLessons(lessonsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pointsToNextLevel = 50 * ((profile?.level || 1) + 1);
  const progressToNextLevel = ((profile?.total_points || 0) % 50) / 50 * 100;
  const completedLessonsCount = recentLessons.length;

  // Mock achievements for now
  const achievements = [
    { id: 1, title: "Pierwszy krok", description: "Ukończ pierwszą lekcję", unlocked: completedLessonsCount > 0 },
    { id: 2, title: "Perfekcjonista", description: "Zdobądź 100% w diagnozie", unlocked: skillMastery.some(s => s.mastery_percentage === 100) },
    { id: 3, title: "Wytrwały", description: "Ukończ 3 lekcje", unlocked: completedLessonsCount >= 3 },
    { id: 4, title: "Ekspert", description: "Osiągnij poziom 3", unlocked: (profile?.level || 1) >= 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Witaj z powrotem, {profile?.name || profile?.email || "Uczniu"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Poziom {profile?.level || 1} • {profile?.total_points || 0} punktów
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-card hover:shadow-primary transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{profile?.total_points || 0}</div>
                <div className="text-sm text-muted-foreground">Punktów</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-accent transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">Poziom {profile?.level || 1}</div>
                <div className="text-sm text-muted-foreground">{profile?.level === 1 ? "Nowicjusz" : "Zaawansowany"}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-success transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{completedLessonsCount}</div>
                <div className="text-sm text-muted-foreground">Ukończone lekcje</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-warning transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">0</div>
                <div className="text-sm text-muted-foreground">Dni z rzędu</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress to Next Level */}
        <Card className="p-6 mb-8 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Postęp do kolejnego poziomu</h3>
            <Badge variant="outline">{profile?.total_points || 0}/{pointsToNextLevel} pkt</Badge>
          </div>
          <Progress value={progressToNextLevel} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Zostało {pointsToNextLevel - (profile?.total_points || 0)} punktów do poziomu {(profile?.level || 1) + 1}
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mastery Overview */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Opanowanie materiału</h3>
              </div>
              
              <div className="space-y-4">
                {skillMastery.length > 0 ? (
                  skillMastery.map((skill) => (
                    <div key={skill.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{skill.topics?.name || "Nieznany temat"}</span>
                        <span className="text-sm text-muted-foreground">{skill.mastery_percentage}%</span>
                      </div>
                      <Progress value={skill.mastery_percentage} className="h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Ukończ test diagnostyczny, aby zobaczyć swoje umiejętności
                  </p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button className="w-full shadow-primary">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Rozpocznij kolejną lekcję
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Activity & Achievements */}
          <div className="space-y-6">
            {/* Recent Lessons */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold">Ostatnie lekcje</h3>
              </div>
              
              <div className="space-y-3">
                {recentLessons.length > 0 ? (
                  recentLessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{lesson.topics?.name || "Lekcja"}</div>
                        <div className="text-xs text-muted-foreground">
                          {lesson.completed_at ? new Date(lesson.completed_at).toLocaleDateString('pl-PL') : "Brak daty"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          +{lesson.points_earned || 0} pkt
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Brak ukończonych lekcji
                  </p>
                )}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold">Osiągnięcia</h3>
              </div>
              
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-3 rounded-lg border ${
                      achievement.unlocked 
                        ? 'bg-success/10 border-success/20' 
                        : 'bg-muted/50 border-muted opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? 'bg-success/20' : 'bg-muted'
                      }`}>
                        <Award className={`w-4 h-4 ${
                          achievement.unlocked ? 'text-success' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.title}</div>
                        <div className="text-xs text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};