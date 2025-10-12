import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useReferralV2 } from "@/hooks/useReferralV2";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { completeConversion } = useReferralV2();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [referralProcessed, setReferralProcessed] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processReferralConversion = async () => {
      if (!user) {
        console.log('[SubscriptionSuccess] No user found');
        setIsProcessing(false);
        return;
      }

      console.log('[SubscriptionSuccess] Processing referral conversion for user:', user.id);
      
      try {
        // Call completeConversion - this handles all the referral logic
        await completeConversion();
        
        console.log('[SubscriptionSuccess] Referral conversion completed successfully');
        setReferralProcessed(true);
      } catch (error: any) {
        console.error('[SubscriptionSuccess] Referral conversion error:', error);
        
        // Don't show error if user simply wasn't referred
        if (error.message?.includes('not found') || error.message?.includes('no referral')) {
          console.log('[SubscriptionSuccess] User was not referred - this is okay');
          setReferralError(null);
        } else {
          setReferralError(error.message || 'Wystąpił błąd podczas przetwarzania polecenia');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    processReferralConversion();
  }, [user, completeConversion]);

  // Countdown and redirect
  useEffect(() => {
    if (!isProcessing && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      navigate('/dashboard');
    }
  }, [isProcessing, countdown, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">
            🎉 Dziękujemy za zakup!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              Twoja subskrypcja została aktywowana.
            </p>
            <p className="text-muted-foreground">
              Możesz teraz korzystać ze wszystkich funkcji Premium.
            </p>
          </div>

          {sessionId && (
            <div className="text-xs text-muted-foreground text-center font-mono">
              ID sesji: {sessionId.substring(0, 20)}...
            </div>
          )}

          {/* Referral Processing Status */}
          {isProcessing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Sprawdzamy polecenia</AlertTitle>
              <AlertDescription>
                Weryfikujemy czy byłeś polecony przez znajomego...
              </AlertDescription>
            </Alert>
          )}

          {!isProcessing && referralProcessed && (
            <Alert className="border-primary/50 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">Twój znajomy otrzymał nagrodę!</AlertTitle>
              <AlertDescription>
                Osoba która Cię poleciła otrzymała <strong>30 dni Premium</strong> jako podziękowanie za polecenie.
              </AlertDescription>
            </Alert>
          )}

          {!isProcessing && referralError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Uwaga</AlertTitle>
              <AlertDescription>
                {referralError}
              </AlertDescription>
            </Alert>
          )}

          {!isProcessing && !referralProcessed && !referralError && (
            <div className="text-center text-sm text-muted-foreground">
              Polecenie nie zostało zastosowane (prawdopodobnie nie byłeś polecony).
            </div>
          )}

          {/* Countdown and redirect info */}
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Przekierowujemy Cię do panelu za {countdown} sekund...
            </p>
            <Progress value={(5 - countdown) * 20} className="h-2" />
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-primary hover:underline"
            >
              Przejdź teraz do panelu →
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}