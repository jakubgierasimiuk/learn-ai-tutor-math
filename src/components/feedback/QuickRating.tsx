import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Star, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface QuickRatingProps {
  content: string;
  contentType: 'ai_explanation' | 'lesson_content' | 'task' | 'feature';
  contentId?: string;
  onRated?: (rating: number, feedback?: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const QuickRating: React.FC<QuickRatingProps> = ({
  content,
  contentType,
  contentId,
  onRated,
  size = 'sm',
  className = ''
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRating = async (value: number) => {
    if (!user?.id) return;

    setRating(value);
    
    // For negative ratings, show feedback input
    if (value <= 2) {
      setShowFeedback(true);
      return;
    }

    // Submit positive rating immediately
    await submitRating(value);
  };

  const submitRating = async (ratingValue: number, feedbackText?: string) => {
    if (!user?.id) return;

    setIsSubmitting(true);

    try {
      // Create a micro-survey response
      const { error } = await supabase.from('survey_responses').insert({
        user_id: user.id,
        survey_id: crypto.randomUUID(), // Generate a temporary survey ID for micro feedback
        question_id: `quick_rating_${contentType}`,
        question_text: `Jak oceniasz: ${content.substring(0, 100)}...`,
        response_value: { rating: ratingValue, content_type: contentType, content_id: contentId },
        response_text: feedbackText || null,
      });

      if (error) throw error;

      toast({
        title: ratingValue >= 4 ? "Dziękujemy!" : "Dzięki za opinię",
        description: ratingValue >= 4 
          ? "Cieszymy się, że Ci się podoba!" 
          : "Twoja opinia pomoże nam się poprawić.",
      });

      onRated?.(ratingValue, feedbackText);
      setShowFeedback(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać oceny.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = () => {
    if (rating !== null) {
      submitRating(rating, feedback);
    }
  };

  if (rating !== null && !showFeedback) {
    return (
      <div className={`flex items-center gap-1 text-muted-foreground ${className}`}>
        <span className="text-xs">Dziękujemy!</span>
        {rating >= 4 ? (
          <ThumbsUp className="h-3 w-3 text-green-500" />
        ) : (
          <ThumbsDown className="h-3 w-3 text-orange-500" />
        )}
      </div>
    );
  }

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'sm' : 'default';

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {!showFeedback ? (
        <>
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={() => handleRating(5)}
            className="h-6 px-2"
            title="Pomocne"
          >
            <ThumbsUp className={iconSize} />
          </Button>
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={() => handleRating(2)}
            className="h-6 px-2"
            title="Nie pomocne"
          >
            <ThumbsDown className={iconSize} />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size={buttonSize}
                className="h-6 px-2"
                title="Oceń szczegółowo"
              >
                <Star className={iconSize} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-3">
                <p className="text-sm font-medium">Oceń na skali 1-5:</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleRating(value)}
                      className="w-8 h-8 p-0"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <Popover open={showFeedback} onOpenChange={setShowFeedback}>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <p className="text-sm font-medium">Co możemy poprawić?</p>
              </div>
              <Textarea
                placeholder="Podziel się swoimi uwagami..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFeedback(false)}
                  className="flex-1"
                >
                  Anuluj
                </Button>
                <Button
                  size="sm"
                  onClick={handleFeedbackSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Wysyłam...' : 'Wyślij'}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};