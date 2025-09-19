import { useEffect } from 'react';
import { useViralLoop } from '@/components/viral/ViralLoopProvider';
import { useAuth } from '@/hooks/useAuth';

interface ViralTriggerOptions {
  enableLessonComplete?: boolean;
  enableCorrectAnswer?: boolean;
  enableMilestones?: boolean;
  enableStreaks?: boolean;
  enableSocialProof?: boolean;
}

export const useViralTriggers = (options: ViralTriggerOptions = {}) => {
  const { user } = useAuth();
  const { showSuccessPopup, showSocialProof, trackViralMoment } = useViralLoop();
  
  const {
    enableLessonComplete = true,
    enableCorrectAnswer = true,
    enableMilestones = true,
    enableStreaks = true,
    enableSocialProof = true,
  } = options;

  // Track lesson completion
  const triggerLessonComplete = (lessonData?: any) => {
    if (!enableLessonComplete || !user) return;
    
    trackViralMoment('lesson_completed', lessonData);
    
    // 30% chance to show popup after lesson completion
    if (Math.random() < 0.3) {
      showSuccessPopup('lesson_completed', lessonData);
    }
  };

  // Track correct answers
  const triggerCorrectAnswer = (answerData?: any) => {
    if (!enableCorrectAnswer || !user) return;
    
    trackViralMoment('correct_answer', answerData);
    
    // 15% chance to show popup after correct answer
    if (Math.random() < 0.15) {
      showSuccessPopup('correct_answer', answerData);
    }
  };

  // Track milestones
  const triggerMilestone = (milestone: string, data?: any) => {
    if (!enableMilestones || !user) return;
    
    trackViralMoment('milestone_reached', { milestone, ...data });
    showSuccessPopup('milestone_reached', { milestone, ...data });
  };

  // Track streaks
  const triggerStreak = (days: number, data?: any) => {
    if (!enableStreaks || !user) return;
    
    trackViralMoment('streak_bonus', { days, ...data });
    
    // Show popup for streaks of 3+ days
    if (days >= 3) {
      showSuccessPopup('streak_bonus', { days, ...data });
    }
  };

  // Social proof triggers
  const triggerTestimonial = (name: string, subject: string, improvement: number) => {
    if (!enableSocialProof) return;
    
    showSocialProof('testimonial', { name, subject, improvement });
  };

  const triggerLocalStats = (city: string, count: number) => {
    if (!enableSocialProof) return;
    
    showSocialProof('local_stats', { city, count });
  };

  const triggerFomo = (message: string, timeLeft: string) => {
    if (!enableSocialProof) return;
    
    showSocialProof('fomo', { message, timeLeft });
  };

  // Auto-trigger social proof periodically (much less aggressive)
  useEffect(() => {
    if (!enableSocialProof || !user) return;

    const interval = setInterval(() => {
      const randomTrigger = Math.random();
      
      if (randomTrigger < 0.02) { // 2% chance every 5 minutes (was 10% every minute)
        const testimonials = [
          { name: 'Ania', subject: 'algebrą', improvement: 40 },
          { name: 'Kuba', subject: 'geometrią', improvement: 35 },
          { name: 'Maja', subject: 'funkcjami', improvement: 50 },
          { name: 'Tomek', subject: 'równaniami', improvement: 45 },
        ];
        const testimonial = testimonials[Math.floor(Math.random() * testimonials.length)];
        triggerTestimonial(testimonial.name, testimonial.subject, testimonial.improvement);
      } else if (randomTrigger < 0.03) { // 1% chance (was 5%)
        const cities = ['Warszawie', 'Krakowie', 'Gdańsku', 'Wrocławiu', 'Poznaniu'];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const count = 50 + Math.floor(Math.random() * 200);
        triggerLocalStats(city, count);
      }
    }, 300000); // Every 5 minutes (was 1 minute)

    return () => clearInterval(interval);
  }, [enableSocialProof, user, triggerTestimonial, triggerLocalStats]);

  // FOMO triggers - show periodically (much less aggressive)
  useEffect(() => {
    if (!enableSocialProof || !user) return;

    const fomoMessages = [
      { message: 'Zwiększone bonusy za polecenia!', timeLeft: '2h' },
      { message: 'Dodatkowe tokeny dla nowych użytkowników', timeLeft: '4h' },
      { message: 'Bonus za aktywację - podwójna nagroda', timeLeft: '1h' },
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.01) { // 1% chance every 10 minutes (was 5% every 2 minutes)
        const fomo = fomoMessages[Math.floor(Math.random() * fomoMessages.length)];
        triggerFomo(fomo.message, fomo.timeLeft);
      }
    }, 600000); // Every 10 minutes (was 2 minutes)

    return () => clearInterval(interval);
  }, [enableSocialProof, user, triggerFomo]);

  return {
    triggerLessonComplete,
    triggerCorrectAnswer,
    triggerMilestone,
    triggerStreak,
    triggerTestimonial,
    triggerLocalStats,
    triggerFomo,
    showSocialProof,
  };
};