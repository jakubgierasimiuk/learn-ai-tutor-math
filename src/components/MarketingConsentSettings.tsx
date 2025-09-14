import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageSquare, Settings, History, Gift, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ConsentStatus {
  [key: string]: boolean;
}

interface ConsentHistory {
  [key: string]: any[];
}

interface RewardStatus {
  status: string;
  bonus_days?: number;
  bonus_tokens?: number;
  reward_granted_at?: string;
  clawback_eligible_until?: string;
}

export const MarketingConsentSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [consents, setConsents] = useState<ConsentStatus>({});
  const [consentHistory, setConsentHistory] = useState<ConsentHistory>({});
  const [rewardStatus, setRewardStatus] = useState<RewardStatus | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      loadConsents();
      loadRewardStatus();
    }
  }, [user]);

  const loadConsents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('marketing-consent-manager', {
        body: { action: 'get_consents' }
      });

      if (error) throw error;

      setConsents(data.current_status);
      setConsentHistory(data.history);
    } catch (error) {
      console.error('Load consents error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować ustawień zgód.",
        variant: "destructive"
      });
    }
  };

  const loadRewardStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('marketing-consent-manager', {
        body: { action: 'check_reward_status' }
      });

      if (error) throw error;
      setRewardStatus(data.reward_status);
    } catch (error) {
      console.error('Load reward status error:', error);
    }
  };

  const handleConsentChange = async (consentType: string, isGranted: boolean) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('marketing-consent-manager', {
        body: {
          action: 'update_consent',
          consent_type: consentType,
          is_granted: isGranted,
          source: 'settings_manual'
        }
      });

      if (error) throw error;

      // Update local state
      setConsents(prev => ({
        ...prev,
        [consentType]: isGranted
      }));

      toast({
        title: isGranted ? "Zgoda udzielona" : "Zgoda cofnięta",
        description: `Twoje preferencje zostały zaktualizowane.`,
      });

      // Reload data to get updated history
      await loadConsents();
      await loadRewardStatus();

      // Warning about clawback if revoking general consent with active reward
      if (!isGranted && consentType === 'general' && rewardStatus?.status === 'granted') {
        const clawbackDeadline = rewardStatus.clawback_eligible_until ? 
          new Date(rewardStatus.clawback_eligible_until) : null;
        const now = new Date();

        if (clawbackDeadline && now <= clawbackDeadline) {
          toast({
            title: "⚠️ Uwaga!",
            description: "Twój bonus zostanie automatycznie cofnięty z powodu wycofania zgody marketingowej.",
            variant: "destructive",
            duration: 8000
          });
        }
      }

    } catch (error) {
      console.error('Consent change error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować zgody. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConsentLabel = (type: string) => {
    const labels: { [key: string]: { title: string; description: string; icon: React.ReactNode } } = {
      general: {
        title: "Zgoda ogólna marketingowa",
        description: "Otrzymywanie informacji o nowych funkcjach, promocjach i wskazówkach edukacyjnych",
        icon: <Mail className="h-4 w-4" />
      },
      email: {
        title: "Marketing e-mailowy",
        description: "Otrzymywanie e-maili z materiałami edukacyjnymi i promocjami",
        icon: <Mail className="h-4 w-4" />
      },
      sms: {
        title: "Marketing SMS",
        description: "Otrzymywanie wiadomości SMS z przypomnieniami i promocjami",
        icon: <MessageSquare className="h-4 w-4" />
      },
      personalization: {
        title: "Personalizacja",
        description: "Wykorzystanie danych do personalizacji treści i rekomendacji",
        icon: <Settings className="h-4 w-4" />
      },
      analytics: {
        title: "Analityka",
        description: "Analiza sposobu korzystania z aplikacji w celu ulepszenia usług",
        icon: <Settings className="h-4 w-4" />
      }
    };

    return labels[type] || { 
      title: type, 
      description: "Nieokreślony typ zgody", 
      icon: <Settings className="h-4 w-4" /> 
    };
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: pl });
  };

  const getRewardStatusBadge = () => {
    if (!rewardStatus) return null;

    const badgeConfig = {
      pending: { label: "Oczekuje", variant: "secondary" as const },
      granted: { label: "Przyznany", variant: "default" as const },
      clawed_back: { label: "Cofnięty", variant: "destructive" as const },
      expired: { label: "Wygasł", variant: "outline" as const }
    };

    const config = badgeConfig[rewardStatus.status as keyof typeof badgeConfig];
    return config ? <Badge variant={config.variant}>{config.label}</Badge> : null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Zgody marketingowe
          </CardTitle>
          <CardDescription>
            Zarządzaj swoimi preferencjami dotyczącymi komunikacji marketingowej
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(consents).map(([type, isGranted]) => {
            const label = getConsentLabel(type);
            return (
              <div key={type} className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  {label.icon}
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">{label.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {label.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isGranted}
                  onCheckedChange={(checked) => handleConsentChange(type, checked)}
                  disabled={isLoading}
                />
              </div>
            );
          })}

          {Object.keys(consents).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak zapisanych zgód marketingowych</p>
            </div>
          )}
        </CardContent>
      </Card>

      {rewardStatus && rewardStatus.status !== 'not_initialized' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Status bonusu marketingowego
            </CardTitle>
            <CardDescription>
              Informacje o bonusie za zgodę marketingową
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Status bonusu:</span>
              {getRewardStatusBadge()}
            </div>

            {rewardStatus.status === 'granted' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Dodatkowe dni:</span>
                  <span className="font-medium">{rewardStatus.bonus_days || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dodatkowe tokeny:</span>
                  <span className="font-medium">{rewardStatus.bonus_tokens || 0}</span>
                </div>
                {rewardStatus.reward_granted_at && (
                  <div className="flex justify-between">
                    <span>Data przyznania:</span>
                    <span className="font-medium">{formatDate(rewardStatus.reward_granted_at)}</span>
                  </div>
                )}
                {rewardStatus.clawback_eligible_until && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Uwaga!</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Jeśli wycofasz zgodę marketingową przed{' '}
                      <strong>{formatDate(rewardStatus.clawback_eligible_until)}</strong>,
                      Twój bonus zostanie automatycznie cofnięty.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historia zgód
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Ukryj' : 'Pokaż'}
            </Button>
          </CardTitle>
          <CardDescription>
            Historia zmian Twoich zgód marketingowych
          </CardDescription>
        </CardHeader>
        {showHistory && (
          <CardContent>
            <div className="space-y-4">
              {Object.entries(consentHistory).map(([type, history]) => (
                <div key={type} className="space-y-2">
                  <h4 className="font-medium">{getConsentLabel(type).title}</h4>
                  <div className="space-y-1">
                    {history.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={record.is_granted ? "default" : "secondary"}>
                            {record.is_granted ? 'Udzielona' : 'Cofnięta'}
                          </Badge>
                          <span className="text-muted-foreground">
                            {record.source === 'registration_popup' ? 'Popup rejestracyjny' :
                             record.source === 'settings_manual' ? 'Ustawienia manualne' :
                             record.source === 'first_lesson' ? 'Po pierwszej lekcji' :
                             record.source}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatDate(record.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(consentHistory).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Brak historii zgód</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};