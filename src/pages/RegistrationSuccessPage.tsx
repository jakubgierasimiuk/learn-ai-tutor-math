import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Mail, ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PRODUCTION_DOMAIN } from "@/lib/constants";

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  // Get email from navigation state
  const email = location.state?.email;

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/auth");
    }
  }, [email, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;
    
    setIsResending(true);
    try {
      const redirectUrl = `${PRODUCTION_DOMAIN}/`;
      
      // Trigger password reset email (Supabase doesn't have direct "resend confirmation" endpoint)
      // We'll use signUp again with the same credentials
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się wysłać ponownie emaila. Spróbuj za chwilę.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email wysłany",
          description: "Link weryfikacyjny został wysłany ponownie na podany adres.",
        });
        setResendCooldown(60);
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-gradient-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/auth")}
          className="bg-background/80 backdrop-blur-sm border-primary/20 text-foreground hover:bg-primary/10 hover:border-primary/40 shadow-md"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Wróć do logowania
        </Button>
      </div>

      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-2xl glass-card animate-fade-in">
          <CardHeader className="text-center space-y-4 pb-8">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-full flex items-center justify-center animate-bounce-slow">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Konto zostało utworzone!
              </CardTitle>
              <CardDescription className="text-lg mt-4">
                Link weryfikacyjny wysłany na:
              </CardDescription>
              <div className="mt-3 px-4 py-2 bg-primary/5 rounded-lg inline-block">
                <p className="text-base font-semibold text-foreground">{email}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email Illustration */}
            <div className="flex justify-center py-4">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Mail className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <Alert className="border-primary/20 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription className="text-base">
                <strong className="font-semibold">Sprawdź swoją skrzynkę pocztową</strong>
                <br />
                Kliknij w link weryfikacyjny, aby aktywować swoje konto w Mentavo AI i rozpocząć naukę.
              </AlertDescription>
            </Alert>

            {/* Help section */}
            <div className="bg-muted/30 rounded-lg p-6 space-y-3">
              <p className="font-semibold text-foreground">Nie widzisz emaila?</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">📧</span>
                  <span>Sprawdź folder <strong>SPAM</strong> lub <strong>Oferty/Promocje</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">⏱️</span>
                  <span>Email może dotrzeć z opóźnieniem (do 5 minut)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✉️</span>
                  <span>Upewnij się, że podałeś prawidłowy adres email</span>
                </li>
              </ul>
            </div>

            {/* Resend button */}
            <div className="pt-4">
              <Button 
                onClick={handleResendEmail}
                variant="outline"
                className="w-full h-12 text-base"
                disabled={isResending || resendCooldown > 0}
              >
                {isResending ? (
                  "Wysyłanie..."
                ) : resendCooldown > 0 ? (
                  `Wyślij ponownie za ${resendCooldown}s`
                ) : (
                  "📨 Wyślij link ponownie"
                )}
              </Button>
            </div>

            {/* Back to login */}
            <div className="text-center pt-4 border-t">
              <Button 
                variant="link" 
                onClick={() => navigate("/auth")}
                className="text-base"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wróć do strony logowania
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
