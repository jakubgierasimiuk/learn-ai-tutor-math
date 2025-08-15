import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { areAnswersEquivalent } from "@/lib/mathValidation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Target, Trophy, BookOpen, Brain } from "lucide-react";

interface Lesson {
  id: number;
  topic_id: number;
  title: string;
  description: string;
  content_type: string;
  content_data: any;
  lesson_order: number;
  estimated_time_minutes: number;
  difficulty_level: number;
}

interface Exercise {
  question: string;
  answer: string;
  type: string;
  explanation?: string;
}

interface LessonProgress {
  id?: number;
  lesson_id: number;
  topic_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_percentage: number;
  score?: number;
  time_spent_minutes: number;
  started_at?: string;
  completed_at?: string;
  last_accessed_at?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

const LessonPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (lessonId) {
      fetchLessonAndProgress();
    }
  }, [lessonId]);

  const fetchLessonAndProgress = async () => {
    try {
      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", parseInt(lessonId!))
        .maybeSingle();

      if (lessonError) throw lessonError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("lesson_id", parseInt(lessonId!))
        .eq("user_id", user?.id)
        .maybeSingle();

      if (progressError) throw progressError;

      setLesson(lessonData);
      setProgress(progressData ? {
        ...progressData,
        status: progressData.status as 'not_started' | 'in_progress' | 'completed'
      } : {
        lesson_id: lessonData.id,
        topic_id: lessonData.topic_id,
        status: 'not_started' as const,
        completion_percentage: 0,
        time_spent_minutes: 0
      });

      // Mark as started if not already
      if (!progressData) {
        await createInitialProgress(lessonData);
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast({
        title: "Błąd",
        description: "Nie można załadować lekcji",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createInitialProgress = async (lessonData: Lesson) => {
    try {
      const { data, error } = await supabase
        .from("user_lesson_progress")
        .insert({
          user_id: user?.id,
          lesson_id: lessonData.id,
          topic_id: lessonData.topic_id,
          status: 'in_progress',
          completion_percentage: 0,
          time_spent_minutes: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      setProgress({
        ...data,
        status: data.status as 'not_started' | 'in_progress' | 'completed'
      });
    } catch (error) {
      console.error("Error creating progress:", error);
    }
  };

  const updateProgress = async (newProgress: Partial<LessonProgress>) => {
    if (!progress) return;

    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60);
      
      const { data, error } = await supabase
        .from("user_lesson_progress")
        .update({
          ...newProgress,
          time_spent_minutes: timeSpent,
          last_accessed_at: new Date().toISOString()
        })
        .eq("lesson_id", parseInt(lessonId!))
        .eq("user_id", user?.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      setProgress({
        ...data,
        status: data.status as 'not_started' | 'in_progress' | 'completed'
      });

      // Award points for completion
      if (newProgress.status === 'completed' && progress.status !== 'completed') {
        await awardPoints();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const awardPoints = async () => {
    if (!lesson || !progress) return;

    try {
      const basePoints = lesson.difficulty_level * 10;
      const scoreBonus = progress.score ? Math.round(progress.score * 0.5) : 0;
      const totalPoints = basePoints + scoreBonus;

      // Insert points history
      await supabase.from("points_history").insert({
        user_id: user?.id,
        session_id: progress.id,
        points: totalPoints,
        reason: `Ukończenie lekcji: ${lesson.title}`
      });

      // Update user profile points
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_points")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ total_points: (profile.total_points || 0) + totalPoints })
          .eq("user_id", user?.id);
      }

      toast({
        title: "Gratulacje!",
        description: `Zdobyłeś ${totalPoints} punktów za ukończenie lekcji!`,
      });

      // Update streak and check achievements
      await supabase.rpc('update_user_streak', { p_user_id: user?.id });
      await supabase.rpc('check_and_award_achievements', { p_user_id: user?.id });
    } catch (error) {
      console.error("Error awarding points:", error);
    }
  };

  const handleAnswerSubmit = (exerciseIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [exerciseIndex]: answer }));
  };

  // Enhanced answer validation function
  const validateExerciseAnswer = (userAnswer: string, expectedAnswer: string): boolean => {
    if (!userAnswer || !expectedAnswer) return false;
    return areAnswersEquivalent(userAnswer, expectedAnswer);
  };

  const calculateScore = () => {
    if (!lesson?.content_data?.exercises) return 0;
    
    const exercises = lesson.content_data.exercises;
    let correct = 0;
    
    exercises.forEach((exercise: Exercise, index: number) => {
      if (validateExerciseAnswer(userAnswers[index] || '', exercise.answer)) {
        correct++;
      }
    });
    
    return Math.round((correct / exercises.length) * 100);
  };

  const completeLesson = async () => {
    const score = calculateScore();
    await updateProgress({
      status: 'completed',
      completion_percentage: 100,
      score
    });
    
    setShowResults(true);
  };

  const renderTheoryContent = () => {
    if (!lesson?.content_data) return null;

    return (
      <div className="space-y-6">
        {/* Theory Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Teoria
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed">{lesson.content_data.theory_content}</p>
          </CardContent>
        </Card>

        {/* Key Concepts */}
        {lesson.content_data.key_concepts && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                Kluczowe pojęcia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lesson.content_data.key_concepts.map((concept: string, index: number) => (
                  <Badge key={index} variant="secondary">{concept}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Examples */}
        {lesson.content_data.examples && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-success" />
                Przykłady
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lesson.content_data.examples.map((example: any, index: number) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <div className="font-medium text-primary mb-2">{example.question}</div>
                  <div className="text-success font-medium mb-1">Odpowiedź: {example.answer}</div>
                  {example.explanation && (
                    <div className="text-sm text-muted-foreground">{example.explanation}</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={() => updateProgress({ completion_percentage: 100, status: 'completed' })}>
            Zakończ lekcję
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderPracticeContent = () => {
    if (!lesson?.content_data?.exercises) return null;

    const exercises = lesson.content_data.exercises;

    if (showResults) {
      const score = calculateScore();
      const correct = exercises.filter((exercise: Exercise, index: number) => 
        validateExerciseAnswer(userAnswers[index] || '', exercise.answer)
      ).length;

      return (
        <div className="space-y-6">
          <Card className="border-success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <Trophy className="w-6 h-6" />
                Wyniki ćwiczeń
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{correct}/{exercises.length}</div>
                  <div className="text-sm text-muted-foreground">Poprawne odpowiedzi</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">{score}%</div>
                  <div className="text-sm text-muted-foreground">Wynik</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">
                    {lesson.difficulty_level * 10 + Math.round(score * 0.5)}
                  </div>
                  <div className="text-sm text-muted-foreground">Punkty</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <div className="space-y-3">
            {exercises.map((exercise: Exercise, index: number) => {
              const userAnswer = userAnswers[index] || '';
              const isCorrect = validateExerciseAnswer(userAnswer, exercise.answer);
              
              return (
                <Card key={index} className={isCorrect ? 'border-green-200' : 'border-red-200'}>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="font-medium">{exercise.question}</div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          Twoja odpowiedź: {userAnswer}
                        </span>
                        <span className="text-green-600 font-medium">
                          Poprawna: {exercise.answer}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Link to={`/topic/${lesson?.topic_id}`}>
              <Button>
                Powrót do tematu
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Ćwiczenie {currentExercise + 1} z {exercises.length}
          </h3>
          <Progress value={((currentExercise + 1) / exercises.length) * 100} className="w-32" />
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-lg font-medium">{exercises[currentExercise].question}</div>
            
            <Input
              placeholder="Wpisz swoją odpowiedź..."
              value={userAnswers[currentExercise] || ''}
              onChange={(e) => handleAnswerSubmit(currentExercise, e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNextExercise()}
            />

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentExercise(Math.max(0, currentExercise - 1))}
                disabled={currentExercise === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Poprzednie
              </Button>

              {currentExercise === exercises.length - 1 ? (
                <Button onClick={completeLesson} disabled={!userAnswers[currentExercise]}>
                  Zakończ ćwiczenia
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNextExercise}
                  disabled={!userAnswers[currentExercise]}
                >
                  Następne
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const handleNextExercise = () => {
    if (currentExercise < (lesson?.content_data?.exercises?.length || 0) - 1) {
      setCurrentExercise(currentExercise + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lekcja nie została znaleziona</h2>
          <Link to="/lessons">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do lekcji
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
          <Link to={`/topic/${lesson.topic_id}`}>
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do tematu
            </Button>
          </Link>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold gradient-text">{lesson.title}</h1>
              <Badge variant="secondary">
                {lesson.content_type === 'theory' ? 'Teoria' : 'Ćwiczenia'}
              </Badge>
            </div>
            
            <p className="text-muted-foreground">{lesson.description}</p>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Szacowany czas: {lesson.estimated_time_minutes} min</span>
              </div>
              {progress && progress.completion_percentage > 0 && (
                <div className="flex items-center gap-2">
                  <div className="text-sm">Postęp: {progress.completion_percentage}%</div>
                  <Progress value={progress.completion_percentage} className="w-20 h-2" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {lesson.content_type === 'theory' ? renderTheoryContent() : renderPracticeContent()}
      </div>
    </div>
  );
};

export default LessonPage;