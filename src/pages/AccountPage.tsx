import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User, Shield, CreditCard, Calendar, Lock, CheckCircle, Crown, Zap, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SMSActivationSection } from "@/components/SMSActivationSection";
import { logEvent } from "@/lib/logger";

const AccountPage = () => {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Błąd",
        description: "Nowe hasła nie są identyczne",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Błąd",
        description: "Nowe hasło musi mieć co najmniej 6 znaków",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się zmienić hasła: " + error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sukces",
          description: "Hasło zostało pomyślnie zmienione",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUpgradeClick = async () => {
    if (!user) {
      toast({
        title: "Błąd",
        description: "Musisz być zalogowany aby ulepszyć plan",
        variant: "destructive",
      });
      return;
    }

    logEvent('subscription_upgrade_cta_click', { 
      source: 'account_page',
      current_subscription: subscription?.subscription_type 
    });

    setIsChangingPassword(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'paid' }
      });

      if (error) {
        console.error('Checkout error:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się utworzyć sesji płatności",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Otwórz Stripe Checkout w nowej karcie
        window.open(data.url, '_blank');
        toast({
          title: "Przekierowanie do płatności",
          description: "Otwarto stronę płatności w nowej karcie",
        });
      } else {
        toast({
          title: "Błąd",
          description: "Nie otrzymano URL płatności",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas otwierania płatności",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getSubscriptionTypeDisplay = (type: string) => {
    switch (type) {
      case 'free':
        return { name: 'Darmowy', color: 'bg-slate-100 text-slate-800' };
      case 'paid':
        return { name: 'Płatny', color: 'bg-blue-100 text-blue-800' };
      case 'super':
        return { name: 'Super', color: 'bg-purple-100 text-purple-800' };
      default:
        return { name: 'Nieznany', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTokenLimitDisplay = () => {
    if (!subscription) return 'Ładowanie...';
    if (subscription.subscription_type === 'free') {
      return subscription.token_limit_hard?.toLocaleString() || '25 000';
    }
    return 'Nieograniczone';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Zarządzanie kontem</h1>
          <p className="text-lg text-muted-foreground">
            Zarządzaj swoim kontem, subskrypcją i ustawieniami bezpieczeństwa
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informacje o koncie
              </CardTitle>
              <CardDescription>
                Podstawowe informacje o Twoim koncie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Adres email</Label>
                <div className="flex items-center gap-2">
                  <span className="text-base">{user?.email}</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data utworzenia konta</Label>
                <span className="text-base">
                  {user?.created_at ? formatDate(user.created_at) : 'Nieznana'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* SMS Verification and Bonuses */}
          <SMSActivationSection variant="account" />

          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Informacje o subskrypcji
              </CardTitle>
              <CardDescription>
                Szczegóły Twojej aktualnej subskrypcji
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ) : subscription ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Typ subskrypcji</Label>
                    <div>
                      <Badge className={getSubscriptionTypeDisplay(subscription.subscription_type).color}>
                        {getSubscriptionTypeDisplay(subscription.subscription_type).name}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Limit tokenów na konto</Label>
                    <span className="text-base font-semibold">
                      {getTokenLimitDisplay()} tokenów
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Wykorzystane tokeny od rejestracji</Label>
                    <div className="space-y-1">
                      <span className="text-base">
                        {subscription.tokens_used_total?.toLocaleString() || 0} tokenów
                      </span>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, (subscription.tokens_used_total / subscription.token_limit_hard) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {subscription.subscription_type === 'free' 
                          ? `Wykorzystano ${(subscription.tokens_used_total || 0).toLocaleString()} z ${subscription.token_limit_hard.toLocaleString()} tokenów`
                          : 'Nieograniczone wykorzystanie'
                        }
                      </p>
                    </div>
                  </div>

                  {subscription.subscription_end && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data wygaśnięcia subskrypcji
                      </Label>
                      <span className="text-base">
                        {formatDate(subscription.subscription_end)}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status === 'active' ? 'Aktywna' : 'Nieaktywna'}
                    </Badge>
                  </div>

                  {/* Upgrade CTA for free accounts */}
                  {subscription.subscription_type === 'free' && (
                    <div className="pt-4 border-t border-border">
                      <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/20">
                        <div className="flex items-start gap-3">
                          <Crown className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-primary mb-1">
                              Odblokuj pełny potencjał nauki
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              Przejdź na plan płatny i ciesz się nieograniczonym dostępem do AI tutora, 
                              zaawansowanych funkcji i priorytetowym wsparciem.
                            </p>
                            <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                              <li className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                Nieograniczone tokeny AI
                              </li>
                              <li className="flex items-center gap-2">
                                <Crown className="w-3 h-3 text-purple-500" />
                                Priorytetowe wsparcie
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                Zaawansowane analityki postępów
                              </li>
                            </ul>
                            <Button 
                              onClick={handleUpgradeClick}
                              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-primary"
                              size="sm"
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Ulepsz subskrypcję
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Nie udało się załadować informacji o subskrypcji</p>
              )}
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Zmiana hasła
              </CardTitle>
              <CardDescription>
                Zaktualizuj swoje hasło, aby zachować bezpieczeństwo konta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm font-medium">
                    Obecne hasło
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Wprowadź obecne hasło"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    Nowe hasło
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Wprowadź nowe hasło (min. 6 znaków)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Potwierdź nowe hasło
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Potwierdź nowe hasło"
                  />
                </div>

                <Button 
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                  className="w-full"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Zmienianie hasła...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Zmień hasło
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;