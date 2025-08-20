import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, GraduationCap, MessageCircle, Search, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const welcomeScreens = [
  {
    icon: GraduationCap,
    title: "Twój osobisty AI-nauczyciel matematyki",
    description: "Inteligentny system dostosuje się do Twojego tempa nauki i stylu uczenia się.",
    color: "text-primary"
  },
  {
    icon: MessageCircle,
    title: "Rozmawia z Tobą jak korepetytor",
    description: "Zadaje pytania krok po kroku, wyjaśnia bez stresu i dostosowuje się do Ciebie.",
    color: "text-accent"
  },
  {
    icon: Search,
    title: "Szybki test → AI sprawdzi Twój poziom",
    description: "Kilka pytań pozwoli AI ustalić idealne miejsce startu dla Twojej nauki.",
    color: "text-success"
  },
  {
    icon: Rocket,
    title: "Zaczynasz pierwszą lekcję w mniej niż 10 minut",
    description: "Wszystko jest gotowe – wystarczy wybrać swój cel i zacząć naukę!",
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
      </Card>
    </div>
  );
}