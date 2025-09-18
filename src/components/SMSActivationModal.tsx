import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SMSVerification } from '@/components/SMSVerification';
import { useSMSGamification } from '@/hooks/useSMSGamification';
import { useReferralV2 } from '@/hooks/useReferralV2';
import { 
  Smartphone, 
  Gift, 
  Clock, 
  Users, 
  Star, 
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface SMSActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (phoneNumber: string) => void;
}

export const SMSActivationModal: React.FC<SMSActivationModalProps> = ({
  isOpen,
  onClose,
  onVerificationComplete
}) => {
  const [step, setStep] = useState<'prompt' | 'verification'>('prompt');
  const [countdown, setCountdown] = useState(24 * 60 * 60); // 24 hours in seconds
  const { getPersonalizedSMSContext, triggerSMSViralMoments, markSMSShownToday } = useSMSGamification();
  const { referralCode } = useReferralV2();

  const context = getPersonalizedSMSContext();

  useEffect(() => {
    if (isOpen && (context.urgencyLevel === 'high' || context.urgencyLevel === 'critical')) {
      const timer = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, context.urgencyLevel]);

  useEffect(() => {
    if (isOpen) {
      markSMSShownToday();
    }
  }, [isOpen, markSMSShownToday]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartVerification = () => {
    setStep('verification');
    triggerSMSViralMoments();
  };

  const handleVerificationComplete = (phoneNumber: string) => {
    onVerificationComplete(phoneNumber);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const getUrgencyBadge = () => {
    switch (context.urgencyLevel) {
      case 'critical':
        return <Badge variant="destructive" className="animate-pulse">🔥 OSTATNIA SZANSA</Badge>;
      case 'high':
        return <Badge variant="destructive">⚡ PILNE</Badge>;
      case 'medium':
        return <Badge className="bg-primary">🎁 NAGRODA CZEKA</Badge>;
      case 'low':
        return <Badge variant="secondary">✨ ODBLOKUJ PREMIUM</Badge>;
      default:
        return null;
    }
  };

  if (step === 'verification') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <SMSVerification
            onVerificationComplete={handleVerificationComplete}
            onSkip={handleSkip}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md min-h-[600px] flex flex-col justify-between overflow-hidden">
        <div className="flex-1 space-y-6">
        <DialogHeader className="text-center space-y-4">
          {getUrgencyBadge()}
          
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          
          <DialogTitle className="text-xl font-bold">
            Odblokuj Premium Mode!
          </DialogTitle>
          
          <p className="text-muted-foreground">
            {context.personalizedMessage}
          </p>
        </DialogHeader>

        <div className="space-y-6 flex-1">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Postęp odblokowania</span>
              <span>{context.progressBar.currentStep}/{context.progressBar.totalSteps}</span>
            </div>
            <Progress value={(context.progressBar.currentStep / context.progressBar.totalSteps) * 100} />
            <p className="text-xs text-muted-foreground text-center">
              {context.progressBar.label}
            </p>
          </div>

          {/* Countdown Timer */}
          {(context.urgencyLevel === 'high' || context.urgencyLevel === 'critical') && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-primary">
                  <Clock className="w-5 h-5" />
                  <span className="font-mono text-lg font-bold">{formatTime(countdown)}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {context.timeLeft}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Rewards Preview */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center">
              <Gift className="w-4 h-4 mr-2 text-primary" />
              Odbierz natychmiast:
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">+{context.rewardAmount.toLocaleString()} tokenów AI</p>
                  <p className="text-xs text-muted-foreground">Instant dodanie do konta</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Star className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">7 dni Premium</p>
                  <p className="text-xs text-muted-foreground">Pełny dostęp do wszystkich funkcji</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>

          {/* Conditional Content Container with Fixed Height */}
          <div className="min-h-[140px] transition-all duration-300 ease-in-out">
            {/* Referrer Info */}
            {context.showReferrerInfo && (
              <Card className="border-accent/20 bg-accent/5 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">Twój znajomy również otrzyma nagrodę!</p>
                      <p className="text-sm text-muted-foreground">+3 dni Premium za Twoją aktywację</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Proof */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground break-words hyphens-auto leading-relaxed px-2">
                {context.socialProofMessage}
              </p>
            </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleStartVerification} 
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              <span>Odbierz nagrody</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            {context.urgencyLevel !== 'critical' && (
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                className="w-full"
              >
                Może później
              </Button>
            )}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>Bezpieczne</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>2 minuty</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>Darmowe</span>
            </div>
          </div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};