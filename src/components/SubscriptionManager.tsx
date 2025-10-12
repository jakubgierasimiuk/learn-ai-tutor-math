import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Crown, CreditCard, RefreshCw } from 'lucide-react';
import { useReferralV2 } from '@/hooks/useReferralV2';

interface SubscriptionData {
  subscription_type: 'free' | 'paid' | 'super';
  token_limit_soft: number;
  token_limit_hard: number;
  tokens_used_total: number;
  monthly_tokens_used?: number;
  subscription_end?: string;
  is_active: boolean;
}

export const SubscriptionManager = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { completeConversion } = useReferralV2();

  const checkSubscription = async () => {
    if (!user) return;
    
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się sprawdzić statusu subskrypcji",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'paid' }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('Brak adresu płatności');

      // Always redirect in the same tab (fixes Safari/Chrome pop-up blockers)
      try { (window.top || window).location.href = data.url; } catch { window.location.href = data.url; }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć sesji płatności",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      try { (window.top || window).location.href = data.url; } catch { window.location.href = data.url; }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się otworzyć panelu zarządzania subskrypcją",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subskrypcja</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Zaloguj się, aby zarządzać subskrypcją.</p>
        </CardContent>
      </Card>
    );
  }

  const getSubscriptionBadge = (type: string) => {
    switch (type) {
      case 'paid':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CreditCard className="w-3 h-3 mr-1" /> Płatny</Badge>;
      case 'super':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><Crown className="w-3 h-3 mr-1" /> Super</Badge>;
      default:
        return <Badge variant="outline">Darmowy</Badge>;
    }
  };

  const getPlanFeatures = (type: string) => {
    switch (type) {
      case 'paid':
        return {
          name: 'Plan Płatny',
          tokens: '10,000,000 tokenów/miesiąc',
          price: '49.99 PLN/miesiąc',
          features: ['10,000,000 tokenów AI', 'Priorytetowe wsparcie', 'Zaawansowane funkcje AI', 'Dostęp do beta funkcji']
        };
      case 'super':
        return {
          name: 'Plan Super (Admin)',
          tokens: 'Nieograniczone tokeny',
          price: 'Plan specjalny',
          features: ['Nieograniczone tokeny', 'VIP wsparcie', 'Wszystkie funkcje premium', 'Dostęp API', 'Dedykowane sesje']
        };
      case 'test':
        return {
          name: 'Plan Testowy',
          tokens: 'Nieograniczone tokeny',
          price: 'Dla developerów',
          features: ['Nieograniczone tokeny', 'Wszystkie funkcje', 'Dostęp developerski']
        };
      default:
        return {
          name: 'Plan Darmowy',
          tokens: '25,000 tokenów (7 dni trial)',
          price: 'Darmowy',
          features: ['25,000 tokenów AI', 'Podstawowe funkcje', 'Wsparcie społeczności']
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Twoja Subskrypcja</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={checkSubscription}
            disabled={checking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Odśwież
          </Button>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  {getSubscriptionBadge(subscription.subscription_type)}
                  <p className="text-sm text-muted-foreground mt-1">
                    {getPlanFeatures(subscription.subscription_type).name}
                  </p>
                </div>
                {subscription.subscription_end && (
                  <div className="text-right">
                    <p className="text-sm font-medium">Odnawia się</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(subscription.subscription_end).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium">
                  Limit tokenów: {subscription.token_limit_hard.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subscription.subscription_type === 'free' 
                    ? 'Tokeny są liczone od rejestracji' 
                    : 'Tokeny resetują się co miesiąc w dniu wykupienia subskrypcji'}
                </p>
              </div>

              {(subscription.subscription_type === 'paid' || subscription.subscription_type === 'super') && (
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  className="w-full"
                >
                  Zarządzaj Subskrypcją
                </Button>
              )}
            </div>
          ) : (
            <p>Brak informacji o subskrypcji</p>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Options - Only show paid plan for upgrade */}
      {(!subscription || subscription.subscription_type === 'free') && (
        <div className="max-w-md mx-auto">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Plan Płatny
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">49.99 PLN</div>
                <div className="text-sm text-muted-foreground">miesięcznie</div>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✓ 10,000,000 tokenów AI miesięcznie</li>
                <li>✓ Priorytetowe wsparcie</li>
                <li>✓ Zaawansowane funkcje AI</li>
                <li>✓ Dostęp do beta funkcji</li>
              </ul>
              <Button 
                onClick={handleUpgrade} 
                className="w-full"
                variant="default"
              >
                Wybierz Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};