import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, BookOpen, Trophy, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  value: string;
}

const goalOptions: GoalOption[] = [
  {
    id: 'matura-basic',
    title: '📘 Matura podstawowa',
    description: 'Przygotowanie do matury na poziomie podstawowym',
    icon: GraduationCap,
    value: 'matura_podstawowa'
  },
  {
    id: 'matura-extended',
    title: '📗 Matura rozszerzona', 
    description: 'Przygotowanie do matury na poziomie rozszerzonym',
    icon: GraduationCap,
    value: 'matura_rozszerzona'
  },
  {
    id: 'school-improvement',
    title: '📝 Poprawa ocen w szkole',
    description: 'Nadrobienie zaległości i lepsza ocena na świadectwie',
    icon: BookOpen,
    value: 'poprawa_ocen'
  },
  {
    id: 'olympiad',
    title: '🏆 Olimpiada',
    description: 'Przygotowanie do olimpiad matematycznych',
    icon: Trophy,
    value: 'olimpiada'
  },
  {
    id: 'specific-topic',
    title: '🔄 Nadrabianie konkretnego działu',
    description: 'Skupienie się na określonym dziale matematyki',
    icon: RefreshCw,
    value: 'konkretny_dzial'
  }
];

const mathTopics = [
  'Liczby rzeczywiste',
  'Równania i nierówności',
  'Funkcje',
  'Trygonometria',
  'Planimetria',
  'Stereometria',
  'Analiza matematyczna',
  'Kombinatoryka i prawdopodobieństwo',
  'Statystyka'
];

export function GoalSelection() {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isSpecificTopic = selectedGoal === 'konkretny_dzial';
  const canSubmit = selectedGoal && (!isSpecificTopic || selectedTopic);
  
  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    
    setLoading(true);
    
    const goalValue = isSpecificTopic 
      ? `${selectedGoal}:${selectedTopic}`
      : selectedGoal;
    
    try {
      await supabase
        .from('profiles')
        .update({ learning_goal: goalValue })
        .eq('user_id', user.id);
        
      navigate('/onboarding/checklist');
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            🎯 Jaki jest Twój cel nauki?
          </h1>
          <p className="text-muted-foreground">
            Wybierz główny powód, dla którego chcesz uczyć się matematyki
          </p>
        </div>

        <RadioGroup 
          value={selectedGoal} 
          onValueChange={setSelectedGoal}
          className="space-y-4 mb-6"
        >
          {goalOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div key={option.id} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label 
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer"
                >
                  <Card className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <IconComponent className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {isSpecificTopic && (
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">
              Wybierz dział matematyki:
            </Label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz dział..." />
              </SelectTrigger>
              <SelectContent>
                {mathTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Zapisywanie...' : 'Zatwierdź cel'}
        </Button>
      </Card>
    </div>
  );
}