import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { ArrowLeft, CheckCircle, Users, Zap, Gift } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PRODUCTION_DOMAIN } from "@/lib/constants";

// Function to translate Supabase error messages to Polish
const translateAuthError = (errorMessage: string): string => {
  const errorTranslations: { [key: string]: string } = {
    "User already registered": "Użytkownik już istnieje",
    "Email not confirmed": "Email nie został potwierdzony",
    "Invalid login credentials": "Nieprawidłowe dane logowania",
    "Password should be at least 6 characters": "Hasło powinno mieć co najmniej 6 znaków",
    "Email address not valid": "Nieprawidłowy adres email", 
    "Password is too weak": "Hasło jest za słabe",
    "Invalid email": "Nieprawidłowy email",
    "Invalid password": "Nieprawidłowe hasło",
    "Email already exists": "Email już istnieje",
    "Email already taken": "Email już jest zajęty",
    "Account already exists": "Konto już istnieje",
    "User not found": "Użytkownik nie znaleziony",
    "Email rate limit exceeded": "Przekroczono limit wysyłania emaili",
    "Too many requests": "Zbyt wiele żądań",
    "Signup disabled": "Rejestracja wyłączona",
    "Email confirmation required": "Wymagane potwierdzenie email",
    "Password reset required": "Wymagane zresetowanie hasła"
  };

  // Check for exact matches first
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }

  // Check for partial matches (case insensitive)
  const lowerMessage = errorMessage.toLowerCase();
  for (const [englishError, polishError] of Object.entries(errorTranslations)) {
    if (lowerMessage.includes(englishError.toLowerCase())) {
      return polishError;
    }
  }

  // If no translation found, return original message
  return errorMessage;
};

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showEmailSignup, setShowEmailSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if already authenticated, except during password recovery
  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isRecovery = recoveryMode || hash.includes("type=recovery") || search.includes("type=recovery");
    if (user && !isRecovery) {
      // do not auto-redirect; allow access to auth page even when logged in
      // users may want to switch accounts or manage password
    }
  }, [user, navigate, recoveryMode]);

  // Enable password recovery mode when user opens recovery link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        toast({ title: "Ustal nowe hasło", description: "Wpisz nowe hasło do konta." });
      }
    });

    // Fallback: detect via URL params/hash
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    if (hash.includes("type=recovery") || search.includes("type=recovery")) {
      setRecoveryMode(true);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Błąd logowania",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Zalogowano pomyślnie",
          description: "Witaj z powrotem!",
        });
        navigate("/app");
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${PRODUCTION_DOMAIN}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Błąd rejestracji",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Konto utworzone",
          description: "Sprawdź swoją skrzynkę email aby potwierdzić konto",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Błąd",
        description: "Wprowadź adres email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${PRODUCTION_DOMAIN}/auth?type=recovery`
      });

      if (error) {
        toast({
          title: "Błąd",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email wysłany",
          description: "Sprawdź swoją skrzynkę email z linkiem do zresetowania hasła",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast({
        title: "Zbyt słabe hasło",
        description: "Min. 8 znaków oraz kombinacja liter i cyfr",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Hasła się nie zgadzają",
        description: "Wpisz identyczne hasła",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: "Błąd", description: translateAuthError(error.message), variant: "destructive" });
      } else {
        toast({ title: "Hasło zaktualizowane", description: "Zalogowano na nowe hasło" });
        setRecoveryMode(false);
        setNewPassword("");
        setConfirmPassword("");
        navigate("/app");
      }
    } finally {
      setLoading(false);
    }
  };

  if (recoveryMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Nowe hasło</CardTitle>
            <CardDescription>
              Ustaw nowe hasło dla swojego konta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Nowe hasło"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Powtórz nowe hasło"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleUpdatePassword}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Aktualizowanie..." : "Ustaw nowe hasło"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setRecoveryMode(false)}
              >
                Anuluj
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-gradient-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-accent rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="bg-background/80 backdrop-blur-sm border-primary/20 text-foreground hover:bg-primary/10 hover:border-primary/40 shadow-md"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Strona główna
        </Button>
      </div>

      <div className="flex min-h-screen">
        {/* Left side - Marketing content */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary p-12 text-white flex-col justify-center relative overflow-hidden">
          <div className="relative z-10 max-w-lg">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-white/30 backdrop-blur-sm rounded-full px-6 py-3 mb-8 text-lg font-bold">
                <Gift className="w-5 h-5 mr-3" />
                <span>7 DNI PREMIUM GRATIS</span>
              </div>
              <h1 className="text-4xl font-bold mb-6">
                Ucz się matematyki<br />z AI tutorem
              </h1>
              <p className="text-xl opacity-90">
                Spersonalizowane wyjaśnienia 24/7.<br />
                Bez stresu, za to z sukcesem.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-2xl font-bold mb-2">🎯 Zacznij już dziś</div>
              <p className="text-sm opacity-90">
                Darmowe konto • Bez zobowiązań • Anuluj w dowolnym momencie
              </p>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-2xl backdrop-blur-sm transform rotate-12"></div>
          <div className="absolute bottom-32 right-32 w-20 h-20 bg-accent/30 rounded-full backdrop-blur-sm"></div>
        </div>

        {/* Right side - Auth form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <Card className="w-full max-w-md glass-card animate-fade-in">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Załóż DARMOWE konto
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  <span className="inline-flex items-center bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium mb-2">
                    <Gift className="w-3 h-3 mr-1" />
                    7 dni Premium GRATIS
                  </span>
                  <br />
                  Zacznij naukę już dziś, bez żadnych zobowiązań
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Social Login Buttons */}
              <SocialLoginButtons loading={loading} setLoading={setLoading} />
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">lub</span>
                </div>
              </div>

              {/* Email Signup Form - Always Visible */}
              <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Twój adres email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Utwórz hasło (min. 8 znaków)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 text-base"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full h-12 text-base font-medium button-glow"
                  disabled={loading}
                >
                  {loading ? "Tworzenie konta..." : "🚀 Rozpocznij darmowy trial"}
                </Button>
              </form>

              {/* Login Toggle */}
              <Collapsible open={showLogin} onOpenChange={setShowLogin}>
                <div className="text-center">
                  <CollapsibleTrigger asChild>
                    <Button variant="link" className="text-sm text-muted-foreground">
                      Masz już konto? Zaloguj się
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-4 mt-4">
                  <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-4">
                    <div className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Twój adres email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                      <Input
                        type="password"
                        placeholder="Hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full h-12 text-base font-medium"
                      disabled={loading}
                      variant="secondary"
                    >
                      {loading ? "Logowanie..." : "Zaloguj się"}
                    </Button>
                    <Button 
                      onClick={handleForgotPassword} 
                      variant="link" 
                      className="w-full text-sm" 
                      disabled={loading}
                    >
                      Zapomniałeś hasła?
                    </Button>
                  </form>
                </CollapsibleContent>
              </Collapsible>

              {/* Trust signals */}
              <div className="text-center text-xs text-muted-foreground space-y-2 pt-4 border-t">
                <div className="flex items-center justify-center space-x-4">
                  <span>🔒 Bezpieczne</span>
                  <span>📱 Mobilne</span>
                  <span>⚡ Szybkie</span>
                </div>
                <p>
                  Rejestrując się, akceptujesz nasze warunki użytkowania.
                  <br />
                  Anuluj w dowolnym momencie - bez zobowiązań.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}