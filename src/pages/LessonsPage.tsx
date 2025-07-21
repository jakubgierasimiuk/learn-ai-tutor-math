import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Topic {
  id: number;
  name: string;
  description: string;
  difficulty_level: number;
  learning_objectives: string[];
  estimated_time_minutes: number;
}

interface UserProgress {
  topic_id: number;
  completion_percentage: number;
  lessons_completed: number;
  total_lessons: number;
}

const LessonsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userProgress, setUserProgress] = useState<Record<number, UserProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopicsAndProgress();
  }, []);

  const fetchTopicsAndProgress = async () => {
    try {
      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("*")
        .eq("is_active", true)
        .order("difficulty_level");

      if (topicsError) throw topicsError;

      // Fetch user progress for each topic
      const { data: progressData, error: progressError } = await supabase
        .from("user_lesson_progress")
        .select(`
          topic_id,
          completion_percentage,
          status,
          lessons!inner(topic_id)
        `);

      if (progressError) throw progressError;

      // Process progress data
      const progressByTopic: Record<number, UserProgress> = {};
      topicsData?.forEach(topic => {
        const topicProgress = progressData?.filter(p => p.topic_id === topic.id) || [];
        const totalLessons = topicProgress.length;
        const completedLessons = topicProgress.filter(p => p.status === 'completed').length;
        const avgCompletion = totalLessons > 0 
          ? topicProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / totalLessons 
          : 0;

        progressByTopic[topic.id] = {
          topic_id: topic.id,
          completion_percentage: Math.round(avgCompletion),
          lessons_completed: completedLessons,
          total_lessons: totalLessons
        };
      });

      setTopics(topicsData || []);
      setUserProgress(progressByTopic);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-500 text-white";
      case 2: return "bg-yellow-500 text-white";
      case 3: return "bg-orange-500 text-white";
      case 4: return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return "Łatwy";
      case 2: return "Średni";
      case 3: return "Trudny";
      case 4: return "Bardzo trudny";
      default: return "Nieokreślony";
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
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Tematy matematyczne</h1>
          <p className="text-muted-foreground text-lg">
            Wybierz temat, aby rozpocząć naukę. Każdy temat zawiera strukturyzowane lekcje dostosowane do Twojego poziomu.
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const progress = userProgress[topic.id];
            const hasProgress = progress && progress.total_lessons > 0;

            return (
              <Card key={topic.id} className="card-hover group">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <Badge className={getDifficultyColor(topic.difficulty_level)}>
                        {getDifficultyLabel(topic.difficulty_level)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {topic.estimated_time_minutes}min
                    </div>
                  </div>

                  <CardTitle className="text-xl group-hover:text-primary transition-smooth">
                    {topic.name}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {topic.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  {hasProgress && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          Postęp
                        </span>
                        <span className="font-medium">
                          {progress.lessons_completed}/{progress.total_lessons} lekcji
                        </span>
                      </div>
                      <Progress value={progress.completion_percentage} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {progress.completion_percentage}% ukończone
                      </span>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Target className="w-4 h-4 text-primary" />
                      Cele nauki:
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {topic.learning_objectives.slice(0, 2).map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {objective}
                        </li>
                      ))}
                      {topic.learning_objectives.length > 2 && (
                        <li className="text-xs text-muted-foreground/70">
                          +{topic.learning_objectives.length - 2} więcej celów...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <Link to={`/topic/${topic.id}`}>
                    <Button className="w-full group/btn">
                      {hasProgress && progress.completion_percentage > 0 ? 'Kontynuuj' : 'Rozpocznij'}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {topics.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Brak dostępnych tematów</h3>
            <p className="text-muted-foreground">
              Tematy matematyczne będą wkrótce dostępne.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsPage;