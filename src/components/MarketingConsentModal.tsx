import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gift, Sparkles, Clock, X } from 'lucide-react';

interface MarketingConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'registration' | 'first_lesson' | 'reengagement' | 'token_warning';
}

export const MarketingConsentModal: React.FC<MarketingConsentModalProps> = ({
  isOpen,
  onClose,
  trigger = 'registration'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEligible, setIsEligible] = useState(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');

  useEffect(() => {
    // Generate device fingerprint
    const generateFingerprint = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx?.fillText('fingerprint', 2, 2);
      const canvasData = canvas.toDataURL();
      
      const fingerprint = btoa(
        navigator.userAgent + 
        screen.width + screen.height + 
        new Date().getTimezoneOffset() +
        canvasData.substring(0, 100)
      );
      
      setDeviceFingerprint(fingerprint);
    };

    if (isOpen) {
      generateFingerprint();
      checkEligibility();
    }
  }, [isOpen, user]);

  const checkEligibility = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('marketing-consent-reward', {
        body: { action: 'check_eligibility' }
      });

      if (error) throw error;
      setIsEligible(data.eligible);
    } catch (error) {
      console.error('Eligibility check error:', error);
      setIsEligible(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !isEligible) return;

    setIsLoading(true);
    try {
      // Set device fingerprint in headers
      const headers = {
        'x-device-fingerprint': deviceFingerprint
      };

      // Update marketing consent
      const { error: consentError } = await supabase.functions.invoke('marketing-consent-manager', {
        body: {
          action: 'update_consent',
          consent_type: 'general',
          is_granted: true,
          source: trigger === 'registration' ? 'registration_popup' : trigger
        },
        headers
      });

      if (consentError) throw consentError;

      // Grant reward
      const { data: rewardData, error: rewardError } = await supabase.functions.invoke('marketing-consent-reward', {
        body: { action: 'grant_reward' },
        headers
      });

      if (rewardError) throw rewardError;

      toast({
        title: "🎉 Gratulacje!",
        description: rewardData.message,
        duration: 5000,
      });

      // Track event
      await supabase.from('app_event_logs').insert({
        user_id: user.id,
        event_type: 'marketing_consent_granted',
        payload: {
          trigger,
          reward: rewardData.reward,
          device_fingerprint: deviceFingerprint
        }
      });

      onClose();
    } catch (error) {
      console.error('Marketing consent error:', error);
      toast({
        title: "Wystąpił błąd",
        description: "Nie udało się udzielić zgody. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!user) return;

    try {
      // Track decline event
      await supabase.from('app_event_logs').insert({
        user_id: user.id,
        event_type: 'marketing_consent_declined',
        payload: {
          trigger,
          device_fingerprint: deviceFingerprint
        }
      });

      onClose();
    } catch (error) {
      console.error('Decline tracking error:', error);
      onClose();
    }
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'first_lesson':
        return "Świetnie! Ukończyłeś pierwszą lekcję. Chcesz otrzymać ekskluzywny bonus?";
      case 'reengagement':
        return "Wróć do nauki! Mamy dla Ciebie specjalną ofertę.";
      case 'token_warning':
        return "Używasz już 80% swoich tokenów. Czas na bonus!";
      default:
        return "Witaj w Mentavo AI! Mamy dla Ciebie specjalną ofertę powitalną.";
    }
  };

  if (!isEligible) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8 w-8 p-0"
            onClick={handleDecline}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Gift className="h-16 w-16 text-primary" />
                <Sparkles className="h-6 w-6 text-secondary absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                🎓 Spersonalizowany Plan Nauki
              </DialogTitle>
            </DialogHeader>

            <p className="text-muted-foreground text-center">
              {getTriggerMessage()}
            </p>

            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 space-y-3">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Otrzymasz natychmiast:</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-3 bg-primary/10 rounded-lg">
                    <Clock className="h-8 w-8 text-primary mb-1" />
                    <span className="font-bold text-xl">2 dni</span>
                    <span className="text-sm text-muted-foreground">dostępu premium</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-secondary/10 rounded-lg">
                    <Sparkles className="h-8 w-8 text-secondary mb-1" />
                    <span className="font-bold text-xl">3000</span>
                    <span className="text-sm text-muted-foreground">tokenów AI</span>
                  </div>
                </div>
              </div>

              <div className="bg-accent/20 rounded-lg p-3 mt-4">
                <p className="text-sm text-center">
                  <strong>💡 Spersonalizowany Plan Nauki</strong>
                  <br />
                  Otrzymasz dostęp do ekskluzywnych materiałów dostosowanych do Twojego poziomu i stylu uczenia się.
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Wyrażając zgodę, akceptujesz otrzymywanie komunikacji marketingowej.
              Możesz wycofać zgodę w każdej chwili w ustawieniach konta.
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleDecline}
                className="flex-1"
              >
                Nie, dziękuję
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Przyznawanie...
                  </div>
                ) : (
                  "🎁 Tak, chcę bonus!"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};