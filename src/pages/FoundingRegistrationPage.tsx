import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/Seo";
import { Link, useNavigate } from "react-router-dom";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
export default function FoundingRegistrationPage() {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);

  // Fetch current spots left
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data
        } = await supabase.rpc('get_virtual_spots_left');
        setSpotsLeft(data || 0);
      } catch (error) {
        console.error('Error fetching spots:', error);
      }
    };
    fetchStats();
  }, []);

  // Handle existing user who clicked join
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (user && urlParams.get('join') === 'true') {
      handleJoinNow();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);
  const handleJoinNow = async () => {
    if (spotsLeft !== null && spotsLeft <= 0) {
      toast({
        title: "Brak miejsc",
        description: "Niestety, wszystkie miejsca zostały już zajęte",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const requestBody = user ? {
        // Already authenticated user (Google OAuth or existing user)
        email: user.email || '',
        name: user.user_metadata?.name || '',
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height
        }
      } : {
        // New user registration
        email: email.trim(),
        password: password || undefined,
        name: email.split('@')[0],
        // Use email prefix as default name
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height
        }
      };
      const {
        data,
        error
      } = await supabase.functions.invoke('founding-registration', {
        body: requestBody
      });
      if (error) {
        throw error;
      }
      if (data?.success) {
        toast({
          title: "Gratulacje! 🎉",
          description: user ? "Dołączyłeś do Founding 100! Dostałeś darmowy miesiąc Premium." : "Konto zostało utworzone! Dołączyłeś do Founding 100 z darmowym miesiącem Premium. Sprawdź email z danymi do logowania."
        });
        setSpotsLeft(data.slotsLeft || 0);
        setEmail("");
        setPassword("");

        // Redirect to dashboard after successful registration
        setTimeout(() => {
          if (user) {
            navigate('/dashboard');
          } else {
            navigate('/auth');
          }
        }, 2000);
      } else if (data?.code === 'ALREADY_REGISTERED') {
        toast({
          title: "Już jesteś w programie!",
          description: "Jesteś już członkiem Founding 100",
          variant: "default"
        });
        navigate('/dashboard');
      } else {
        throw new Error(data?.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error joining Founding 100:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleJoin = () => {
    setSocialLoading(true);
    // Redirect back to this page with join parameter after Google OAuth
    const redirectUrl = `${window.location.origin}/founding/register?join=true`;
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    }).catch(error => {
      console.error('Google OAuth error:', error);
      setSocialLoading(false);
      toast({
        title: "Błąd",
        description: "Wystąpił problem z logowaniem Google",
        variant: "destructive"
      });
    });
  };
  return <>
      <Seo title="Rejestracja Founding 100 - Mentavo AI" description="Dołącz do pierwszych 100 użytkowników Mentavo AI i otrzymaj darmowy miesiąc Premium oraz ekskluzywne korzyści." />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="container mx-auto flex items-center justify-between">
            <Link to="/founding" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do Founding 100
            </Link>
            <div className="text-sm text-muted-foreground">
              {spotsLeft !== null && <span className="font-medium">
                  Pozostało miejsc: <span className="text-primary font-bold">{spotsLeft}</span>
                </span>}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-8">
            {/* Title Section */}
            <div className="text-center space-y-4">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-medium text-primary">Founding 100</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Dołącz jako pierwszy, miesiąc w prezencie!</h1>
              <p className="text-muted-foreground">
                Zostań jednym z pierwszych 100 użytkowników i otrzymaj darmowy miesiąc Premium
              </p>
            </div>

            {/* Registration Card */}
            <Card className="w-full">
              <CardHeader className="space-y-2">
                <CardTitle className="text-center">
                  {user ? "Potwierdź dołączenie" : "Utwórz konto"}
                </CardTitle>
                <CardDescription className="text-center">
                  {user ? "Kliknij poniżej, aby dołączyć do Founding 100" : "Uzupełnij dane, aby dołączyć do programu"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user ?
              // Already logged in - just confirm joining
              <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Zalogowany jako:</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <Button onClick={handleJoinNow} disabled={isLoading || spotsLeft !== null && spotsLeft <= 0} className="w-full" size="lg">
                      {isLoading ? "Dołączam..." : "Dołącz do Founding 100"}
                    </Button>
                  </div> :
              // Not logged in - show registration form
              <div className="space-y-4">
                    {/* Social Login */}
                    <div className="space-y-3">
                      <Button onClick={handleGoogleJoin} disabled={socialLoading || spotsLeft !== null && spotsLeft <= 0} variant="outline" className="w-full" size="lg">
                        {socialLoading ? "Łączę z Google..." : "Dołącz przez Google"}
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          lub przez email
                        </span>
                      </div>
                    </div>

                    {/* Email/Password Form */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input type="email" placeholder="Twój email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input type="password" placeholder="Hasło (opcjonalne - będzie wygenerowane)" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Jeśli nie podasz hasła, wygenerujemy je i wyślemy na email
                        </p>
                      </div>

                      <Button onClick={handleJoinNow} disabled={isLoading || !email.trim() || spotsLeft !== null && spotsLeft <= 0} className="w-full" size="lg">
                        {isLoading ? "Tworzę konto..." : "Dołącz do Founding 100"}
                      </Button>
                    </div>
                  </div>}

                {/* Benefits Reminder */}
                <div className="border-t pt-4">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Co otrzymujesz:</p>
                    <ul className="space-y-1">
                      <li>• Darmowy miesiąc Premium</li>
                      <li>• Ekskluzywny dostęp do nowych funkcji</li>
                      <li>• Bezpośredni kontakt z zespołem</li>
                      <li>• Specjalne odznaczenie w aplikacji</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground">
              Dołączając akceptujesz{" "}
              <Link to="/terms-of-service" className="underline hover:text-foreground">
                Regulamin
              </Link>{" "}
              i{" "}
              <Link to="/privacy-policy" className="underline hover:text-foreground">
                Politykę Prywatności
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>;
}