import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { X, Star } from 'lucide-react';

interface SurveyQuestion {
  id: string;
  type: 'scale' | 'textarea' | 'multiple_choice' | 'emoji';
  question: string;
  required: boolean;
  scale?: { min: number; max: number; labels: Record<string, string> };
  options?: Array<{ value: string | number; label: string; emoji?: string }>;
  placeholder?: string;
}

interface Survey {
  survey_id: string;
  survey_type: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  context: Record<string, any>;
}

interface SmartSurveyModalProps {
  survey: Survey | null;
  open: boolean;
  onClose: () => void;
}

export const SmartSurveyModal: React.FC<SmartSurveyModalProps> = ({
  survey,
  open,
  onClose,
}) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!survey || !user?.id) return;

    // Validate required fields
    const requiredQuestions = survey.questions.filter(q => q.required);
    const missingResponses = requiredQuestions.filter(q => !responses[q.id]);
    
    if (missingResponses.length > 0) {
      toast({
        title: "Wypełnij wymagane pola",
        description: "Proszę odpowiedzieć na wszystkie wymagane pytania.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit responses to database
      const responsePromises = survey.questions.map(question => {
        const responseValue = responses[question.id];
        if (responseValue === undefined) return null;

        return supabase.from('survey_responses').insert({
          user_id: user.id,
          survey_id: survey.survey_id,
          question_id: question.id,
          question_text: question.question,
          response_value: typeof responseValue === 'object' ? responseValue : { value: responseValue },
          response_text: typeof responseValue === 'string' ? responseValue : null,
        });
      }).filter(Boolean);

      await Promise.all(responsePromises);

      // Update survey status to completed
      await supabase
        .from('user_surveys')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', survey.survey_id);

      toast({
        title: "Dziękujemy za opinię!",
        description: "Twoja odpowiedź pomoże nam ulepszać Mentavo AI.",
      });

      onClose();
      setResponses({});
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się przesłać ankiety. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    if (!survey) return;

    try {
      await supabase
        .from('user_surveys')
        .update({ 
          status: 'dismissed',
          dismissed_at: new Date().toISOString()
        })
        .eq('id', survey.survey_id);
    } catch (error) {
      console.error('Error dismissing survey:', error);
    }

    onClose();
  };

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-3">
            <p className="text-sm font-medium">{question.question}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {question.scale?.labels?.[question.scale.min.toString()] || question.scale?.min}
              </span>
              <div className="flex gap-2">
                {Array.from({ length: (question.scale?.max || 10) - (question.scale?.min || 0) + 1 }, (_, i) => {
                  const value = (question.scale?.min || 0) + i;
                  return (
                    <Button
                      key={value}
                      variant={responses[question.id] === value ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handleResponse(question.id, value)}
                    >
                      {value}
                    </Button>
                  );
                })}
              </div>
              <span className="text-xs text-muted-foreground">
                {question.scale?.labels?.[question.scale.max.toString()] || question.scale?.max}
              </span>
            </div>
          </div>
        );

      case 'emoji':
        return (
          <div className="space-y-3">
            <p className="text-sm font-medium">{question.question}</p>
            <div className="flex gap-3 justify-center">
              {question.options?.map((option) => (
                <Button
                  key={option.value}
                  variant={responses[question.id] === option.value ? "default" : "outline"}
                  className="flex flex-col gap-1 h-auto p-3"
                  onClick={() => handleResponse(question.id, option.value)}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-xs">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            <p className="text-sm font-medium">{question.question}</p>
            <RadioGroup
              value={responses[question.id]}
              onValueChange={(value) => handleResponse(question.id, value)}
            >
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`${question.id}-${option.value}`} />
                  <Label htmlFor={`${question.id}-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <p className="text-sm font-medium">{question.question}</p>
            <Textarea
              placeholder={question.placeholder}
              value={responses[question.id] || ''}
              onChange={(e) => handleResponse(question.id, e.target.value)}
              rows={3}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!survey) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {survey.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {survey.description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {survey.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {survey.questions.map((question) => (
            <div key={question.id}>
              {renderQuestion(question)}
              {question.required && !responses[question.id] && (
                <p className="text-xs text-destructive mt-1">* Wymagane</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1"
          >
            Może później
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Wysyłam...' : 'Wyślij'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};