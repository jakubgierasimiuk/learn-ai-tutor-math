import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Clock, Play, CheckCircle, Circle, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Topic {
  id: number;
  name: string;
  description: string;
  difficulty_level: number;
  learning_objectives: string[];
  estimated_time_minutes: number;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  content_type: string;
  lesson_order: number;
  estimated_time_minutes: number;
  difficulty_level: number;
}

interface LessonProgress {
  lesson_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  score?: number;
}

const TopicDetailPage = () => {
  const { topicId } = useParams();
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<number, LessonProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      fetchTopicAndLessons();
    }
  }, [topicId]);

  const fetchTopicAndLessons = async () => {
    try {
      // Fetch topic
      const { data: topicData, error: topicError } = await supabase
        .from("topics")
        .select("*")
        .eq("id", parseInt(topicId))
        .maybeSingle();

      if (topicError) throw topicError;

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("topic_id", parseInt(topicId))
        .eq("is_active", true)
        .order("lesson_order");

      if (lessonsError) throw lessonsError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("topic_id", parseInt(topicId))
        .eq("user_id", user?.id);

      if (progressError) throw progressError;

      // Process progress data
      const progressByLesson: Record<number, LessonProgress> = {};
      progressData?.forEach(p => {
        progressByLesson[p.lesson_id] = {
          lesson_id: p.lesson_id,
          status: p.status as 'not_started' | 'in_progress' | 'completed',
          completion_percentage: p.completion_percentage || 0,
          score: p.score
        };
      });

      setTopic(topicData);
      setLessons(lessonsData || []);
      setProgress(progressByLesson);
    } catch (error) {
      console.error("Error fetching topic data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (lesson: Lesson) => {
    const lessonProgress = progress[lesson.id];
    if (!lessonProgress || lessonProgress.status === 'not_started') {
      return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
    if (lessonProgress.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Play className="w-5 h-5 text-primary" />;
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'theory': return 'Teoria';
      case 'practice': return 'Ćwiczenia';
      case 'quiz': return 'Quiz';
      case 'interactive': return 'Interaktywne';
      default: return type;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'theory': return 'bg-primary text-primary-foreground';
      case 'practice': return 'bg-success text-success-foreground';
      case 'quiz': return 'bg-accent text-accent-foreground';
      case 'interactive': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const calculateOverallProgress = () => {
    if (lessons.length === 0) return 0;
    const totalProgress = lessons.reduce((sum, lesson) => {
      const lessonProgress = progress[lesson.id];
      return sum + (lessonProgress?.completion_percentage || 0);
    }, 0);
    return Math.round(totalProgress / lessons.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Temat nie został znaleziony</h2>
          <Link to="/lessons">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do tematów
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/lessons">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do tematów
            </Button>
          </Link>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold gradient-text">{topic.name}</h1>
            <p className="text-muted-foreground text-lg">{topic.description}</p>

            {/* Topic Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Szacowany czas: {topic.estimated_time_minutes} min</span>
              </div>
              <Badge variant="secondary">
                Poziom {topic.difficulty_level}
              </Badge>
            </div>

            {/* Overall Progress */}
            {lessons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Postęp ogólny</span>
                  <span className="text-sm text-muted-foreground">
                    {calculateOverallProgress()}%
                  </span>
                </div>
                <Progress value={calculateOverallProgress()} className="h-3" />
              </div>
            )}

            {/* Learning Objectives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Cele nauki
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topic.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Lekcje</h2>
          
          {lessons.map((lesson) => {
            const lessonProgress = progress[lesson.id];
            const isCompleted = lessonProgress?.status === 'completed';
            const isInProgress = lessonProgress?.status === 'in_progress';

            return (
              <Card key={lesson.id} className={`card-hover transition-all ${
                isCompleted ? 'border-green-200 bg-green-50/30' : 
                isInProgress ? 'border-primary/20 bg-primary/5' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(lesson)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{lesson.title}</CardTitle>
                          <Badge className={getContentTypeColor(lesson.content_type)}>
                            {getContentTypeLabel(lesson.content_type)}
                          </Badge>
                        </div>
                        <CardDescription>{lesson.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {lesson.estimated_time_minutes}min
                    </div>
                  </div>

                  {/* Progress Bar for lesson */}
                  {lessonProgress && lessonProgress.completion_percentage > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Postęp</span>
                        <span>{lessonProgress.completion_percentage}%</span>
                      </div>
                      <Progress value={lessonProgress.completion_percentage} className="h-2" />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <Link to={`/lesson/${lesson.id}`}>
                    <Button className="w-full">
                      {isCompleted ? 'Przejrzyj ponownie' : 
                       isInProgress ? 'Kontynuuj' : 'Rozpocznij'}
                      <BookOpen className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}

          {lessons.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Brak dostępnych lekcji</h3>
              <p className="text-muted-foreground">
                Lekcje dla tego tematu będą wkrótce dostępne.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicDetailPage;