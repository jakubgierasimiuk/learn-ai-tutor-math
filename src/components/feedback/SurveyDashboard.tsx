import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart3, MessageSquare, TrendingUp, Users, Star, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SurveyStats {
  total_surveys: number;
  completed_surveys: number;
  nps_average: number;
  lesson_feedback_average: number;
  recent_feedback: Array<{
    id: string;
    question_text: string;
    response_text: string;
    created_at: string;
    response_value: any;
  }>;
}

export const SurveyDashboard: React.FC = () => {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchSurveyStats();
    }
  }, [user?.id]);

  const fetchSurveyStats = async () => {
    if (!user?.id) return;

    try {  
      // Get survey statistics
      const { data: surveys } = await supabase
        .from('user_surveys')
        .select('status')
        .eq('user_id', user.id);

      const { data: responses } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate NPS average
      const npsResponses = responses?.filter(r => 
        r.question_id?.includes('nps_score')
      ) || [];
      
      const npsAverage = npsResponses.length > 0 
        ? npsResponses.reduce((sum, r) => sum + (r.response_value as any)?.value || 0, 0) / npsResponses.length
        : 0;

      // Calculate lesson feedback average
      const lessonResponses = responses?.filter(r => 
        r.question_id?.includes('lesson_rating')
      ) || [];
      
      const lessonAverage = lessonResponses.length > 0 
        ? lessonResponses.reduce((sum, r) => sum + (r.response_value as any)?.value || 0, 0) / lessonResponses.length
        : 0;

      setStats({
        total_surveys: surveys?.length || 0,
        completed_surveys: surveys?.filter(s => s.status === 'completed').length || 0,
        nps_average: npsAverage,
        lesson_feedback_average: lessonAverage,
        recent_feedback: responses?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching survey stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Brak danych o ankietach</h3>
          <p className="text-muted-foreground">
            Gdy wypełnisz swoje pierwsze ankiety, zobaczysz tutaj statystyki.
          </p>
        </CardContent>
      </Card>
    );
  }

  const completionRate = stats.total_surveys > 0 
    ? (stats.completed_surveys / stats.total_surveys) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Ukończone ankiety</p>
                <p className="text-2xl font-bold">{stats.completed_surveys}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Wskaźnik NPS</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.nps_average.toFixed(1)}</p>
                  {stats.nps_average >= 7 && <Badge variant="default">Promotor</Badge>}
                  {stats.nps_average >= 4 && stats.nps_average < 7 && <Badge variant="secondary">Neutralny</Badge>}
                  {stats.nps_average < 4 && <Badge variant="destructive">Krytyk</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ocena lekcji</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{stats.lesson_feedback_average.toFixed(1)}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= stats.lesson_feedback_average
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Współczynnik</p>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{completionRate.toFixed(0)}%</p>
                  <Progress value={completionRate} className="h-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ostatnie opinie
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recent_feedback.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_feedback.map((feedback, index) => (
                <div key={feedback.id} className="border-l-2 border-primary/20 pl-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {feedback.question_text}
                      </p>
                      {feedback.response_text && (
                        <p className="text-sm text-muted-foreground mt-1">
                          "{feedback.response_text}"
                        </p>
                      )}
                      {feedback.response_value && typeof feedback.response_value === 'object' && (
                        <div className="flex items-center gap-2 mt-1">
                          {(feedback.response_value as any).rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs">
                                {(feedback.response_value as any).rating}/5
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(feedback.created_at).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Brak ostatnich opinii. Wypełnij ankiety, aby zobaczyć swoje odpowiedzi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};