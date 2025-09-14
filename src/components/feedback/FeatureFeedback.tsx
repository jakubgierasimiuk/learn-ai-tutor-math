import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, X, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface FeatureFeedbackProps {
  featureName: string;
  featureDescription: string;
  isNewFeature?: boolean;
  onDismiss?: () => void;
}

export const FeatureFeedback: React.FC<FeatureFeedbackProps> = ({
  featureName,
  featureDescription,
  isNewFeature = false,
  onDismiss
}) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user?.id || !feedback.trim()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('survey_responses').insert({
        user_id: user.id,
        survey_id: crypto.randomUUID(), // Generate a temporary survey ID for feature feedback
        question_id: `feature_feedback_${featureName}`,
        question_text: `Opinia o funkcji: ${featureName}`,
        response_value: { 
          feature_name: featureName,
          feature_description: featureDescription,
          is_new_feature: isNewFeature
        },
        response_text: feedback.trim(),
      });

      if (error) throw error;

      toast({
        title: "Dziękujemy za opinię!",
        description: "Twoja opinia pomoże nam rozwijać tę funkcję.",
      });

      setIsVisible(false);
      onDismiss?.();
    } catch (error) {
      console.error('Error submitting feature feedback:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się przesłać opinii. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">{featureName}</h4>
            {isNewFeature && (
              <Badge variant="secondary" className="text-xs">
                Nowość
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3">
          {featureDescription}
        </p>

        <div className="space-y-2">
          <Textarea
            placeholder="Jak oceniasz tę funkcję? Co można poprawić?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="flex-1 text-xs"
            >
              Później
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!feedback.trim() || isSubmitting}
              className="flex-1 text-xs gap-1"
            >
              <Send className="h-3 w-3" />
              {isSubmitting ? 'Wysyłam...' : 'Wyślij'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};