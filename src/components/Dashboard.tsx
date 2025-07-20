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
import { useState } from "react";

// Mock data for dashboard
const mockUserData = {
  name: "Jan Kowalski",
  level: 2,
  totalPoints: 150,
  pointsToNextLevel: 200,
  completedLessons: 3,
  lastActivity: "2 godziny temu",
  streak: 5,
  mastery: [
    { topic: "Algebra", mastery: 85, color: "bg-primary" },
    { topic: "Geometria", mastery: 92, color: "bg-success" },
    { topic: "Trygonometria", mastery: 45, color: "bg-warning" },
    { topic: "Analiza", mastery: 0, color: "bg-muted" },
    { topic: "Statystyka", mastery: 78, color: "bg-accent" },
    { topic: "Logarytmy", mastery: 100, color: "bg-success" },
  ],
  recentLessons: [
    { id: 1, title: "Twierdzenie Pitagorasa", completed: true, points: 50, date: "Dzisiaj" },
    { id: 2, title: "Równania kwadratowe", completed: true, points: 50, date: "Wczoraj" },
    { id: 3, title: "Funkcje liniowe", completed: true, points: 50, date: "2 dni temu" },
  ],
  achievements: [
    { id: 1, title: "Pierwszy krok", description: "Ukończ pierwszą lekcję", unlocked: true },
    { id: 2, title: "Perfekcjonista", description: "Zdobądź 100% w lekcji", unlocked: true },
    { id: 3, title: "Wytrwały", description: "Utrzymaj 5-dniową passę", unlocked: true },
    { id: 4, title: "Ekspert", description: "Osiągnij poziom 5", unlocked: false },
  ]
};

export const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  
  const progressToNextLevel = (mockUserData.totalPoints / mockUserData.pointsToNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Witaj z powrotem, {mockUserData.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Ostatnia aktywność: {mockUserData.lastActivity}
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
                <div className="text-2xl font-bold text-primary">{mockUserData.totalPoints}</div>
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
                <div className="text-2xl font-bold text-accent">Poziom {mockUserData.level}</div>
                <div className="text-sm text-muted-foreground">Nowicjusz</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-success transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{mockUserData.completedLessons}</div>
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
                <div className="text-2xl font-bold text-warning">{mockUserData.streak}</div>
                <div className="text-sm text-muted-foreground">Dni z rzędu</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress to Next Level */}
        <Card className="p-6 mb-8 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Postęp do kolejnego poziomu</h3>
            <Badge variant="outline">{mockUserData.totalPoints}/{mockUserData.pointsToNextLevel} pkt</Badge>
          </div>
          <Progress value={progressToNextLevel} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Zostało {mockUserData.pointsToNextLevel - mockUserData.totalPoints} punktów do poziomu {mockUserData.level + 1}
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
                {mockUserData.mastery.map((skill, index) => (
                  <div key={skill.topic} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{skill.topic}</span>
                      <span className="text-sm text-muted-foreground">{skill.mastery}%</span>
                    </div>
                    <Progress value={skill.mastery} className="h-2" />
                  </div>
                ))}
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
                {mockUserData.recentLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{lesson.title}</div>
                      <div className="text-xs text-muted-foreground">{lesson.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        +{lesson.points} pkt
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Achievements */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold">Osiągnięcia</h3>
              </div>
              
              <div className="space-y-3">
                {mockUserData.achievements.map((achievement) => (
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