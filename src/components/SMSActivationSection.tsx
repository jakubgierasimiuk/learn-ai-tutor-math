import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useSMSGamification } from '@/hooks/useSMSGamification';
import { useReferralV2 } from '@/hooks/useReferralV2';
import { supabase } from '@/integrations/supabase/client';
import { SMSActivationModal } from '@/components/SMSActivationModal';
import { 
  Smartphone, 
  Gift, 
  CheckCircle, 
  Clock, 
  Sparkles,
  Users,
  Zap
} from 'lucide-react';

interface SMSActivationSectionProps {
  variant?: 'account' | 'referral';
}

export const SMSActivationSection: React.FC<SMSActivationSectionProps> = ({ 
  variant = 'account' 
}) => {
  const { user } = useAuth();
  const { getPersonalizedSMSContext, triggerSMSViralMoments } = useSMSGamification();
  const { stats, referralCode, checkActivation } = useReferralV2();
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isFromReferral, setIsFromReferral] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
    checkReferralStatus();
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone_e164, phone_verified_at')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setPhoneVerified(!!(profile?.phone_e164 && profile?.phone_verified_at));
    } catch (error) {
      console.error('Error checking phone verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkReferralStatus = () => {
    // Check if user came with referral code
    const urlReferral = new URLSearchParams(window.location.search).get('ref');
    const hasReferralCode = urlReferral || referralCode;
    setIsFromReferral(!!hasReferralCode);
  };

  const handleActivateSMS = () => {
    triggerSMSViralMoments();
    setShowSMSModal(true);
  };

  const handleVerificationComplete = (phoneNumber: string) => {
    setPhoneVerified(true);
    setShowSMSModal(false);
    
    // Auto-trigger referral activation after verification
    if (isFromReferral) {
      setTimeout(() => {
        checkActivation();
      }, 1000);
    }
  };

  const smsContext = getPersonalizedSMSContext();
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phoneVerified && variant === 'account') {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="font-medium text-success">Telefon zweryfikowany ✓</p>
              <p className="text-sm text-muted-foreground">
                Masz dostęp do wszystkich funkcji premium
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phoneVerified && variant === 'referral') {
    return null; // Don't show if already verified on referral page
  }

  const getRewardText = () => {
    if (isFromReferral) {
      return "7 dni darmowo + 4000 tokenów";
    }
    return "4000 tokenów premium";
  };

  const getUrgencyColor = () => {
    switch (smsContext.urgencyLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  // Only show verification section if user is from referral or has already started verification
  if (variant === 'account' && !isFromReferral && !phoneVerified) {
    return null; // Don't show for non-referred users
  }

  if (variant === 'account') {
    return (
      <>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Weryfikacja i bonusy
            </CardTitle>
            <CardDescription>
              Zweryfikuj telefon i odblokuj funkcje premium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status weryfikacji</span>
              </div>
              <Badge variant="outline" className="border-warning text-warning">
                Niezweryfikowany
              </Badge>
            </div>

            {isFromReferral && (
              <div className="bg-gradient-primary/10 p-3 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Bonusy referalne dostępne!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ktoś zaprosił Cię do Mentavo AI. Odbierz swoje bonusy!
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Postęp aktywacji</span>
                <span>Krok 1/2</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-primary" />
                Co otrzymasz po weryfikacji:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary" />
                  <span>{getRewardText()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-primary" />
                  <span>Dostęp do funkcji premium</span>
                </div>
                {isFromReferral && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-primary" />
                    <span>Nagrody za polecenia</span>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleActivateSMS}
              className="w-full bg-gradient-primary hover:opacity-90 text-white border-0"
              size="lg"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Zweryfikuj telefon i odbierz {getRewardText()}
            </Button>

            {smsContext.timeLeft && (
              <p className="text-xs text-center text-muted-foreground">
                {smsContext.timeLeft}
              </p>
            )}
          </CardContent>
        </Card>

        <SMSActivationModal
          isOpen={showSMSModal}
          onClose={() => setShowSMSModal(false)}
          onVerificationComplete={handleVerificationComplete}
        />
      </>
    );
  }

  // Referral page variant
  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="w-5 h-5 text-primary" />
              Aktywuj swoje nagrody
            </CardTitle>
            <Badge variant={getUrgencyColor() as any} className="animate-pulse">
              {smsContext.urgencyLevel === 'critical' ? '🔥 Pilne' : 
               smsContext.urgencyLevel === 'high' ? '⚡ Ważne' : '🎁 Dostępne'}
            </Badge>
          </div>
          <CardDescription className="text-base">
            {smsContext.personalizedMessage || 'Zweryfikuj telefon w 2 minuty i odbierz bonusy'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
              <div className="text-2xl font-bold text-success">+{smsContext.rewardAmount}</div>
              <div className="text-xs text-muted-foreground">Tokenów premium</div>
            </div>
            {isFromReferral && (
              <div className="text-center p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                <div className="text-2xl font-bold text-secondary">+7</div>
                <div className="text-xs text-muted-foreground">Dni darmowo</div>
              </div>
            )}
          </div>

          {smsContext.showReferrerInfo && (
            <div className="bg-gradient-secondary/10 p-3 rounded-lg border border-secondary/20">
              <p className="text-sm text-center text-secondary font-medium">
                🎉 Twój znajomy przygotował dla Ciebie specjalną nagrodę!
              </p>
            </div>
          )}

          <Button 
            onClick={handleActivateSMS}
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90 text-white border-0 h-12"
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Odbierz nagrody teraz (2 min)
          </Button>

          {smsContext.socialProofMessage && (
            <p className="text-xs text-center text-muted-foreground">
              💡 {smsContext.socialProofMessage}
            </p>
          )}
        </CardContent>
      </Card>

      <SMSActivationModal
        isOpen={showSMSModal}
        onClose={() => setShowSMSModal(false)}
        onVerificationComplete={handleVerificationComplete}
      />
    </>
  );
};