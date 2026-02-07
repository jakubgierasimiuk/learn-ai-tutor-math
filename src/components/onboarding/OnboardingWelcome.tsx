import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, GraduationCap, MessageCircle, Search, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const welcomeScreens = [
  {
    icon: MessageCircle,
    title: "Jak rozmawiać z AI-nauczycielem?",
    description: "Naucz się, jak skutecznie komunikować z AI, aby maksymalnie wykorzystać swoją naukę.",
    color: "text-primary"
  },
  {
    icon: Search,
    title: "Zadawaj pytania cierpliwie",
    description: "Jeśli czegoś nie rozumiesz - pytaj! AI wyjaśni każdy krok tak długo, aż zrozumiesz.",
    color: "text-accent"
  },
  {
    icon: GraduationCap,
    title: "AI będzie naprawiać Twoje błędy",
    description: "Nie martw się o pomyłki - AI je znajdzie, wyjaśni dlaczego są błędne i pokaże poprawną drogę.",
    color: "text-success"
  },
  {
    icon: Rocket,
    title: "Gotowy na interaktywną naukę?",
    description: "Teraz przećwiczysz rozmowę z AI i rozpoczniesz swoją przygodę z matematyką!",
    color: "text-warning"
  }
];

export function OnboardingWelcome() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();
  
  const isLast = currentScreen === welcomeScreens.length - 1;
  const isFirst = currentScreen === 0;
  
  const handleNext = () => {
    if (isLast) {
      // Check if user has referral code and trigger SMS prompt
      const hasReferralCode = new URLSearchParams(window.location.search).get('ref');
      if (hasReferralCode) {
        // Trigger SMS prompt after a short delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('trigger-sms-prompt', {
            detail: { triggerType: 'onboarding_with_referral' }
          }));
        }, 1000);
      }
      navigate('/onboarding/checklist');
    } else {
      setCurrentScreen(prev => prev + 1);
    }
  };
  
  const handlePrevious = () => {
    setCurrentScreen(prev => prev - 1);
  };

  const currentScreenData = welcomeScreens[currentScreen];
  const IconComponent = currentScreenData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4 ${currentScreenData.color}`}>
            <IconComponent size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">
            {currentScreenData.title}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {currentScreenData.description}
          </p>
        </div>

        {/* Progress indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {welcomeScreens.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentScreen ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirst}
            className="flex items-center space-x-2"
          >
            <ChevronLeft size={16} />
            <span>Wstecz</span>
          </Button>

          <Button onClick={handleNext} className="flex items-center space-x-2">
            <span>{isLast ? 'Zaczynamy!' : 'Dalej'}</span>
            {!isLast && <ChevronRight size={16} />}
          </Button>
        </div>

        <button
          onClick={() => navigate('/onboarding/checklist')}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pomiń wprowadzenie →
        </button>
      </Card>
    </div>
  );
}