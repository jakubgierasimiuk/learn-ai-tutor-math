import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrialCountdown } from "@/components/TrialCountdown";
import { useTokenUsage } from "@/hooks/useTokenUsage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Crown, 
  Sparkles, 
  Users, 
  AlertTriangle,
  Clock
} from "lucide-react";

export const PremiumStatusCard = () => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    subscription,
    getRemainingTokens,
    getUsagePercentage,
    isOnTrial,
    getTrialDaysLeft,
    shouldShowUpgradePrompt
  } = useTokenUsage();

  if (!subscription || !shouldShowUpgradePrompt()) return null;

  const remaining = getRemainingTokens();
  const percentage = getUsagePercentage();
  const onTrial = isOnTrial();
  const daysLeft = getTrialDaysLeft();
  
  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: 'price_1QSAzYRrQcGEJWK2Qv8NsMkJ',
          userId: user.id
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        try { (window.top || window).location.href = data.url; } catch { window.location.href = data.url; }
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas przekierowania do płatności. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const getSubscriptionBadge = () => {
    if (subscription.subscription_type === 'paid') return { label: 'Premium', variant: 'default' as const };
    if (onTrial) return { label: 'Trial Premium', variant: 'secondary' as const };
    return { label: 'Plan Darmowy', variant: 'secondary' as const };
  };

  const badge = getSubscriptionBadge();

  // For trial users - show trial countdown with token info
  if (onTrial) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Status Premium</CardTitle>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              {remaining.toLocaleString()} tokenów
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wykorzystane tokeny</span>
              <span className="font-medium">
                {(subscription.tokens_used_total || 0).toLocaleString()} / {subscription.token_limit_soft.toLocaleString()}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          {/* Trial countdown */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">
                    Trial kończy się za {daysLeft} {daysLeft === 1 ? 'dzień' : 'dni'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Zachowaj pełny dostęp do wszystkich funkcji
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleUpgrade} 
                disabled={isUpgrading}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Crown className="w-4 h-4 mr-2" />
                Zachowaj dostęp
              </Button>
            </div>
          </div>

          {/* Premium benefits preview */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>10M tokenów/miesiąc</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Zaawansowane analizy</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For expired trial users (limited_free)
  if (subscription.subscription_type === 'limited_free') {
    return (
      <Card className="border-warning/20 bg-gradient-to-r from-warning/5 to-orange-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <CardTitle className="text-lg">Status Premium</CardTitle>
              <Badge variant="secondary">Plan Darmowy</Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              {remaining.toLocaleString()} / 1,000 tokenów
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Token usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wykorzystane tokeny w tym miesiącu</span>
              <span className="font-medium">
                {(subscription.monthly_tokens_used || 0).toLocaleString()} / 1,000
              </span>
            </div>
            <Progress value={(subscription.monthly_tokens_used || 0) / 10} className="h-2" />
          </div>

          {/* Trial expired message */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-warning">
                  Twój trial się skończył
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Korzystasz teraz z ograniczonego planu. Przywróć pełny dostęp!
                </p>
              </div>
            </div>
          </div>

          {/* Premium benefits */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Przywróć pełny dostęp:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>10M tokenów miesięcznie</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Zaawansowane analizy</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Priorytetowe wsparcie</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <span>Ekskluzywne funkcje</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">49.99 PLN/miesiąc</p>
              <Button 
                onClick={handleUpgrade} 
                disabled={isUpgrading}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Crown className="w-4 h-4 mr-2" />
                Przywróć pełny dostęp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // For regular free users with high token usage
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Wykorzystanie tokenów</CardTitle>
            <Badge variant="secondary">Plan Darmowy</Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            {remaining.toLocaleString()} pozostało
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Wykorzystane tokeny</span>
            <span className="font-medium">
              {(subscription.tokens_used_total || 0).toLocaleString()} / {subscription.token_limit_soft.toLocaleString()}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        
        {percentage > 70 && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-warning mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-warning">
                  Zbliżasz się do limitu tokenów
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ulepsz do planu płatnego, aby cieszyć się nieograniczoną nauką z AI
                </p>
              </div>
              <Button size="sm" onClick={handleUpgrade} disabled={isUpgrading}>
                <Crown className="w-3 h-3 mr-1" />
                Ulepsz
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};