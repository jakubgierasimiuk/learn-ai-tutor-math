import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Circle, Target, Rocket, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: string;
  route: string;
  icon: any;
}

export function OnboardingChecklist() {
  const [steps, setSteps] = useState<ChecklistStep[]>([
    {
      id: 'ai-tutorial',
      title: 'Naucz się rozmawiać z AI',
      description: 'interaktywny tutorial, 3 minuty',
      completed: false,
      action: 'Rozpocznij tutorial',
      route: '/onboarding/ai-tutorial',
      icon: MessageCircle
    },
    {
      id: 'goal',
      title: 'Wybór celu nauki',
      description: 'matura, poprawa ocen, olimpiada...',
      completed: false,
      action: 'Wybierz cel',
      route: '/onboarding/goal-selection',
      icon: Target
    },
    {
      id: 'lesson',
      title: 'Pierwsza lekcja',
      description: 'krótkie intro z AI, 8 minut',
      completed: false,
      action: 'Zacznij lekcję',
      route: '/study',
      icon: Rocket
    }
  ]);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  // Reload data when returning from other onboarding steps
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        console.log('Window focused, reloading profile data...');
        loadProfileData();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('Page became visible, reloading profile data...');
        loadProfileData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also reload when component mounts or user changes
    if (user) {
      loadProfileData();
    }
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);
  
  const loadProfileData = async () => {
    if (!user) return;
    
    console.log('Loading profile data for user:', user.id);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('learning_goal, ai_tutorial_completed, first_lesson_completed')
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      console.error('Error loading profile:', error);
      return;
    }
    
    console.log('Profile data:', profile);
      
    if (profile) {
      const updatedSteps = steps.map(step => {
        const completed = 
          (step.id === 'ai-tutorial' && profile.ai_tutorial_completed) ||
          (step.id === 'goal' && profile.learning_goal) ||
          (step.id === 'lesson' && profile.first_lesson_completed);
        
        console.log(`Step ${step.id}: completed = ${completed}`);
        
        return {
          ...step,
          completed: Boolean(completed)
        };
      });
      
      setSteps(updatedSteps);
    }
  };
  
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;
  
  const handleStepClick = (step: ChecklistStep) => {
    navigate(step.route);
  };
  
  const handleComplete = async () => {
    if (!user) return;
    
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id);
      
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Overlay */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
      
      {/* Checklist Card */}
      <div className="relative z-50 min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 text-foreground">
              🎯 Witamy! Aby zacząć naukę:
            </h1>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Progress: {Math.round(progress)}%
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border ${
                    step.completed 
                      ? 'border-success/20 bg-success/5' 
                      : 'border-border bg-muted/20'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle className="w-6 h-6 text-success" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <IconComponent className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-foreground">
                        [{index + 1}] {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    
                    {!step.completed && (
                      <Button
                        size="sm"
                        onClick={() => handleStepClick(step)}
                        className="w-full"
                      >
                        {step.action}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {completedSteps === steps.length && (
            <Button 
              onClick={handleComplete}
              className="w-full"
              size="lg"
            >
              Przejdź do Dashboard
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}