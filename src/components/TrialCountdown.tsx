import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Gift, Zap, ArrowRight } from 'lucide-react';
import { useTokenUsage } from '@/hooks/useTokenUsage';

interface TrialCountdownProps {
  onUpgrade?: () => void;
  compact?: boolean;
}

export const TrialCountdown: React.FC<TrialCountdownProps> = ({ 
  onUpgrade, 
  compact = false 
}) => {
  const { subscription, loading } = useTokenUsage();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!subscription?.trial_end_date) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const trialEnd = new Date(subscription.trial_end_date).getTime();
      const difference = trialEnd - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const total = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        
        setTimeLeft({ days, hours, minutes, total: difference });
      } else {
        setTimeLeft(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [subscription?.trial_end_date]);

  if (loading || !subscription || subscription.subscription_type !== 'free' || !subscription.trial_end_date) {
    return null;
  }

  if (!timeLeft) {
    // Trial expired
    return null;
  }

  const progressPercentage = Math.max(0, Math.min(100, 100 - (timeLeft.total / (7 * 24 * 60 * 60 * 1000)) * 100));
  const isUrgent = timeLeft.days === 0;
  const isWarning = timeLeft.days <= 1;

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gradient-subtle rounded-lg border border-border/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-primary" />
            <Badge 
              variant={isUrgent ? "destructive" : isWarning ? "secondary" : "default"}
              className="text-xs"
            >
              {timeLeft.days}d {timeLeft.hours}h
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">trial left</span>
        </div>
        <Button 
          size="sm" 
          onClick={onUpgrade}
          className="h-8 text-xs"
        >
          Upgrade <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-subtle">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-xs font-medium">
              TRIAL PREMIUM
            </Badge>
          </div>
          <Badge 
            variant={isUrgent ? "destructive" : isWarning ? "secondary" : "default"}
          >
            {timeLeft.days === 0 ? `${timeLeft.hours}h ${timeLeft.minutes}m` : `${timeLeft.days} dni`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pozostały czas trial</span>
            <span className="font-medium">
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center py-2">
          <div>
            <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
            <div className="text-xs text-muted-foreground">dni</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
            <div className="text-xs text-muted-foreground">godzin</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
            <div className="text-xs text-muted-foreground">minut</div>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
          <h4 className="font-medium text-sm flex items-center">
            <Zap className="w-4 h-4 mr-2 text-accent" />
            Po trial otrzymasz:
          </h4>
          <ul className="text-xs space-y-1 text-muted-foreground ml-6">
            <li>• 1,000 tokenów miesięcznie</li>
            <li>• Podstawowe funkcje AI</li>
            <li>• Bez dostępu premium</li>
          </ul>
        </div>

        <Button 
          onClick={onUpgrade}
          className="w-full"
          size="lg"
        >
          <Gift className="w-4 h-4 mr-2" />
          Zachowaj pełny dostęp
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Upgrade teraz i zachowaj wszystkie funkcje premium
        </p>
      </CardContent>
    </Card>
  );
};