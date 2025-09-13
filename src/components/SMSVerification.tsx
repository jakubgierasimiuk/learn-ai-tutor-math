import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useViralTriggers } from '@/hooks/useViralTriggers';
import { Phone, Shield, Clock, Share2, Users } from 'lucide-react';

interface SMSVerificationProps {
  onVerificationComplete: (phoneNumber: string) => void;
  onSkip?: () => void;
  required?: boolean;
}

export const SMSVerification: React.FC<SMSVerificationProps> = ({
  onVerificationComplete,
  onSkip,
  required = false
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [showViralPrompt, setShowViralPrompt] = useState(false);
  const { toast } = useToast();
  const { showSocialProof, triggerMilestone } = useViralTriggers();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatPhoneNumber = (phone: string) => {
    // Simple Polish phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('48')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+48${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      return `+48${cleaned}`;
    }
    return `+${cleaned}`;
  };

  const sendSMS = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź numer telefonu",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phoneNumber: formattedPhone,
        }
      });

      if (error) {
        throw new Error(error.message || 'Błąd wysyłania SMS');
      }

      toast({
        title: "SMS wysłany",
        description: "Kod weryfikacyjny został wysłany na Twój telefon",
      });

      setStep('code');
      setTimeLeft(300); // 5 minutes
      setCanResend(false);
      setShowViralPrompt(true);
      
      // Show social proof during waiting
      setTimeout(() => {
        showSocialProof('local_stats', {
          city: 'Twojej okolicy',
          count: Math.floor(Math.random() * 500) + 800
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : 'Nie udało się wysłać SMS',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifySMS = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Błąd",
        description: "Wprowadź kod weryfikacyjny",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('verify-sms', {
        body: {
          phoneNumber: formattedPhone,
          code: verificationCode,
        }
      });

      if (error) {
        throw new Error(error.message || 'Nieprawidłowy kod');
      }

      toast({
        title: "Telefon zweryfikowany",
        description: "Numer telefonu został pomyślnie zweryfikowany",
      });

      // Trigger viral milestone
      triggerMilestone('phone_verified', {
        phoneNumber: formattedPhone,
        bonusTokens: 4000
      });

      onVerificationComplete(formattedPhone);
      
    } catch (error) {
      console.error('Error verifying SMS:', error);
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : 'Nieprawidłowy kod weryfikacyjny',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (canResend) {
      sendSMS();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Viral sharing prompt during SMS waiting
  const renderViralSharingPrompt = () => (
    <Card className="w-full max-w-md mx-auto mb-4 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Poczekaj 2-3 minuty na SMS</p>
            <p className="text-xs text-muted-foreground">W międzyczasie poleć znajomemu i zarobij dodatkowe dni!</p>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => {
              // Copy referral link
              const referralUrl = `${window.location.origin}?ref=YOUR_CODE`;
              navigator.clipboard.writeText(referralUrl);
              toast({
                title: "Link skopiowany!",
                description: "Wyślij go znajomemu, aby zarobić więcej dni premium"
              });
            }}
          >
            <Users className="w-3 h-3 mr-1" />
            Skopiuj link
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 text-xs"
            onClick={() => setShowViralPrompt(false)}
          >
            Później
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (step === 'phone') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Weryfikacja telefonu</CardTitle>
          <CardDescription>
            Wprowadź swój numer telefonu, aby otrzymać kod weryfikacyjny
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Numer telefonu</label>
            <Input
              type="tel"
              placeholder="+48 123 456 789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendSMS()}
            />
          </div>
          
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Twój numer będzie używany do weryfikacji i bezpieczeństwa konta. 
              Nie będziemy wysyłać niechcianych wiadomości.
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={sendSMS} disabled={loading} className="w-full">
              {loading ? "Wysyłanie..." : "Wyślij kod SMS"}
            </Button>
            
            {!required && onSkip && (
              <Button variant="ghost" onClick={onSkip} className="w-full">
                Pomiń na razie
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {showViralPrompt && renderViralSharingPrompt()}
      
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Wprowadź kod weryfikacyjny</CardTitle>
          <CardDescription>
            Kod został wysłany na numer {formatPhoneNumber(phoneNumber)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kod weryfikacyjny</label>
            <Input
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={(e) => e.key === 'Enter' && verifySMS()}
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          {timeLeft > 0 && (
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Kod ważny przez {formatTime(timeLeft)}</span>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <Button onClick={verifySMS} disabled={loading} className="w-full">
              {loading ? "Weryfikowanie..." : "Zweryfikuj"}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleResend} 
              disabled={!canResend || loading}
              className="w-full"
            >
              {canResend ? "Wyślij ponownie" : `Wyślij ponownie za ${formatTime(timeLeft)}`}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setStep('phone')} 
              className="w-full text-sm"
            >
              Zmień numer telefonu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};