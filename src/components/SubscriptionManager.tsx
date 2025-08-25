import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Crown, CreditCard, RefreshCw } from 'lucide-react';

interface SubscriptionData {
  subscription_type: 'free' | 'paid' | 'super';
  monthly_token_limit: number;
  subscription_end?: string;
  is_active: boolean;
  tokens_used_this_month?: number;
}

export const SubscriptionManager = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'paid' }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Przekierowanie do płatności",
        description: "Otwarto nową kartę z formularzem płatności"
      });
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się utworzyć sesji płatności",
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      window.open(data.url, '_blank');
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
          tokens: '10,000 tokenów/miesiąc',
          price: '49.99 PLN/miesiąc',
          features: ['10,000 tokenów AI', 'Wsparcie email', 'Wszystkie funkcje']
        };
      case 'super':
        return {
          name: 'Plan Super',
          tokens: '50,000 tokenów/miesiąc',
          price: 'Przydzielany przez administratora',
          features: ['50,000 tokenów AI', 'Priorytetowe wsparcie', 'Wszystkie funkcje', 'Beta dostęp', 'VIP status']
        };
      default:
        return {
          name: 'Plan Darmowy',
          tokens: '500 tokenów/miesiąc',
          price: 'Darmowy',
          features: ['500 tokenów AI', 'Podstawowe funkcje', 'Wsparcie społeczności']
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
                  Limit tokenów: {subscription.monthly_token_limit.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tokeny resetują się co miesiąc w dniu wykupienia subskrypcji
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
                <li>✓ 10,000 tokenów AI</li>
                <li>✓ Wsparcie email</li>
                <li>✓ Wszystkie funkcje</li>
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
          
          {/* Info about Super plan - not purchasable */}
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Crown className="w-4 h-4 text-purple-600 mr-2" />
              <span className="font-medium text-purple-800">Plan Super</span>
            </div>
            <p className="text-sm text-purple-700">
              50,000 tokenów miesięcznie + VIP wsparcie. Przydzielany przez administratora na specjalne okazje.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};