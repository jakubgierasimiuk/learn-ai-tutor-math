import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, Crown, Sparkles, Users, X, Clock, AlertTriangle } from 'lucide-react';
import { useTokenUsage } from '@/hooks/useTokenUsage';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TrialCountdown } from '@/components/TrialCountdown';

interface UpgradePromptsProps {
  context?: 'chat' | 'dashboard' | 'progress' | 'navigation';
  compact?: boolean;
}

export const UpgradePrompts = ({ context = 'chat', compact = false }: UpgradePromptsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    subscription, 
    shouldShowUpgradePrompt, 
    shouldShowSoftPaywall, 
    getRemainingTokens, 
    getUsagePercentage,
    isOnTrial,
    getTrialDaysLeft
  } = useTokenUsage();
  
  const [showSoftPaywall, setShowSoftPaywall] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'paid' }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się rozpocząć procesu upgrade'u",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  // Show soft paywall modal when no tokens left
  if (shouldShowSoftPaywall() && !showSoftPaywall) {
    setShowSoftPaywall(true);
  }

  // Contextual upgrade prompts based on token usage and trial status
  const renderContextualPrompt = () => {
    if (!shouldShowUpgradePrompt()) return null;

    const remaining = getRemainingTokens();
    const percentage = getUsagePercentage();
    const onTrial = isOnTrial();
    const daysLeft = getTrialDaysLeft();

    // For trial users - show trial countdown
    if (onTrial && (context === 'dashboard' || context === 'navigation')) {
      return <TrialCountdown onUpgrade={handleUpgrade} compact={compact} />;
    }

    // For chat context - show warning when usage is high or trial ending
    if (context === 'chat' && (percentage >= 75 || (onTrial && daysLeft <= 1))) {
      const isTrialEnding = onTrial && daysLeft <= 1;
      
      return (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  {isTrialEnding ? (
                    <Clock className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Zap className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-orange-800">
                    {isTrialEnding 
                      ? `Trial kończy się ${daysLeft === 0 ? 'dziś' : `za ${daysLeft} dni`}!`
                      : `Zostało Ci tylko ${remaining} tokenów`
                    }
                  </p>
                  <p className="text-sm text-orange-600">
                    {isTrialEnding 
                      ? 'Upgrade teraz, aby zachować pełny dostęp'
                      : 'Ulepsz plan, aby kontynuować naukę bez ograniczeń'
                    }
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={handleUpgrade} disabled={isUpgrading}>
                <Crown className="w-4 h-4 mr-2" />
                Ulepsz teraz
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // For limited_free users - show upgrade card
    if (subscription?.subscription_type === 'limited_free' && context === 'dashboard' && !compact) {
      return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <h3 className="text-lg font-semibold text-warning">Twój trial się skończył</h3>
                  <Badge variant="secondary">
                    1K tokenów/miesiąc
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Korzystasz teraz z ograniczonego planu. Przywróć pełny dostęp!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm">10M tokenów miesięcznie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm">Zaawansowane analizy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm">Priorytetowe wsparcie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-sm">Ekskluzywne funkcje</span>
                  </div>
                </div>
              </div>
              <div className="text-center ml-4">
                <Button 
                  onClick={handleUpgrade} 
                  disabled={isUpgrading}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Przywróć pełny dostęp
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  49.99 PLN/miesiąc
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // For regular dashboard upgrades
    if (context === 'dashboard' && !compact) {
      return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-primary">Ulepsz swój plan nauki</h3>
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                    Popularne
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Odblokuj nieograniczone możliwości nauki z mentavo.ai
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm">Nieograniczone tokeny AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm">Zaawansowane analizy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm">Priorytetowe wsparcie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-sm">Ekskluzywne funkcje</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Dołącz do 1000+ uczniów, którzy już ulepszyli swój plan!
                </p>
              </div>
              <div className="text-center ml-4">
                <Button 
                  onClick={handleUpgrade} 
                  disabled={isUpgrading}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Odblokuj nieograniczoną naukę
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  49.99 PLN/miesiąc
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <>
      {renderContextualPrompt()}
      
      {/* Soft Paywall Modal */}
      <Dialog open={showSoftPaywall} onOpenChange={setShowSoftPaywall}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                {subscription?.subscription_type === 'limited_free' 
                  ? 'Miesięczny limit osiągnięty'
                  : 'Wykorzystałeś wszystkie tokeny'
                }
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSoftPaywall(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Kontynuuj naukę bez ograniczeń!</h3>
            <p className="text-muted-foreground mb-6">
              {subscription?.subscription_type === 'limited_free'
                ? 'Wykorzystałeś swój miesięczny limit. Przywróć pełny dostęp!'
                : 'Ulepsz plan, aby otrzymać nieograniczone tokeny AI i ekskluzywne funkcje'
              }
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleUpgrade} 
                disabled={isUpgrading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Crown className="w-4 h-4 mr-2" />
                {subscription?.subscription_type === 'limited_free'
                  ? 'Przywróć pełny dostęp (49.99 PLN/miesiąc)'
                  : 'Ulepsz plan (49.99 PLN/miesiąc)'
                }
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSoftPaywall(false)}
                className="w-full"
              >
                {subscription?.subscription_type === 'limited_free' ? 'Zamknij' : 'Może później'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};