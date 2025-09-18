import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, RefreshCw, Play, Clock, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LessonResumeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId: string;
  skillName: string;
  onContinue: () => void;
  onStartOver: () => void;
}

interface ResumeSummary {
  summary: string;
  interactionCount: number;
  skillName: string;
  recommendations: string[];
}

export function LessonResumeModal({ 
  open, 
  onOpenChange, 
  skillId, 
  skillName, 
  onContinue, 
  onStartOver 
}: LessonResumeModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ResumeSummary | null>(null);

  useEffect(() => {
    if (open && skillId && user?.id) {
      generateSummary();
    }
  }, [open, skillId, user?.id]);

  const generateSummary = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('resume-lesson-summary', {
        body: {
          skillId,
          userId: user?.id
        }
      });

      if (error) throw error;

      setSummary(data);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować podsumowania. Możesz kontynuować naukę.",
        variant: "destructive"
      });
      
      // Fallback summary
      setSummary({
        summary: "Rozpocząłeś już naukę tej umiejętności. Możesz kontynuować od miejsca przerwania lub zacząć od nowa.",
        interactionCount: 0,
        skillName,
        recommendations: ["Kontynuuj naukę", "Zacznij od nowa"]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = async () => {
    try {
      setLoading(true);
      
      // Clear all data for this specific skill
      if (user?.id) {
        // Get all sessions for this skill to find their IDs
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('skill_id', skillId);

        if (sessions && sessions.length > 0) {
          const sessionIds = sessions.map(s => s.id);
          
          // Delete learning interactions first
          await supabase
            .from('learning_interactions')
            .delete()
            .in('session_id', sessionIds);
        }

        // Delete study sessions
        await supabase
          .from('study_sessions')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillId);

        // Delete skill progress
        await supabase
          .from('skill_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillId);

        // Delete phase progress
        await supabase
          .from('learning_phase_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('skill_id', skillId);

        toast({
          title: "Dane wyczyszczone",
          description: "Wszystkie dane dotyczące tej umiejętności zostały usunięte. Możesz zacząć od nowa.",
        });
      }

      onOpenChange(false);
      onStartOver();
    } catch (error) {
      console.error('Error clearing skill data:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wyczyścić danych. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Wznów naukę: {skillName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-3">Generowanie podsumowania...</span>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            {/* AI Generated Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-2">Podsumowanie Twojego postępu</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {summary.summary}
                    </p>
                    {summary.interactionCount > 0 && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {summary.interactionCount} interakcji
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {summary.recommendations && summary.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Co możesz zrobić dalej:</h4>
                <div className="space-y-2">
                  {summary.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {recommendation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={() => { onOpenChange(false); onContinue(); }}
                className="flex-1"
                disabled={loading}
              >
                <Play className="w-4 h-4 mr-2" />
                Kontynuuj naukę
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleStartOver}
                disabled={loading}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Zacznij od nowa
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Anuluj
              </Button>
            </div>

            {/* Info about starting over */}
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <strong>Uwaga:</strong> "Zacznij od nowa" usunie wszystkie dane dotyczące tej umiejętności, 
              włączając postęp, interakcje i statystyki. Tej operacji nie można cofnąć.
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}