import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { Check, Flame, Users, Star, Gift, ChevronRight, Mail, Lock } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
export function FoundingLandingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [membersCount, setMembersCount] = useState<number>(0);
  const [spotsLeft, setSpotsLeft] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [socialLoading, setSocialLoading] = useState(false);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('founding-registration', {
          method: 'GET'
        });
        if (error) {
          console.error('Error fetching stats:', error);
          return;
        }
        if (data) {
          setMembersCount(data.totalMembers || 0);
          setSpotsLeft(data.slotsLeft || 0);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchStats();

    // Poll for updates every 30 seconds for real-time scarcity
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check for Google OAuth return with join parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('join') === 'true' && user) {
      handleJoinNow();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);
  const handleJoinNow = async () => {
    if (!user && !showRegistrationForm) {
      setShowRegistrationForm(true);
      return;
    }

    if (spotsLeft <= 0) {
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
        name: email.split('@')[0], // Use email prefix as default name
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height
        }
      };

      const { data, error } = await supabase.functions.invoke('founding-registration', {
        body: requestBody
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Gratulacje! 🎉",
          description: user 
            ? "Dołączyłeś do Founding 100! Dostałeś darmowy miesiąc Premium."
            : "Konto zostało utworzone! Dołączyłeś do Founding 100 z darmowym miesiącem Premium. Sprawdź email z danymi do logowania."
        });
        setMembersCount(data.totalMembers || 0);
        setSpotsLeft(data.slotsLeft || 0);
        setShowRegistrationForm(false);
        setEmail("");
        setPassword("");
      } else if (data?.code === 'ALREADY_REGISTERED') {
        toast({
          title: "Już jesteś w programie!",
          description: "Jesteś już członkiem Founding 100",
          variant: "default"
        });
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
    // Redirect to founding page with join parameter after Google OAuth
    const redirectUrl = `${window.location.origin}/founding?join=true`;
    
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    }).catch((error) => {
      console.error('Google OAuth error:', error);
      setSocialLoading(false);
      toast({
        title: "Błąd",
        description: "Wystąpił problem z logowaniem Google",
        variant: "destructive"
      });
    });
  };

  // Get dynamic messaging based on spots left
  const getUrgencyMessage = () => {
    if (spotsLeft > 3) {
      return <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold animate-pulse">
            <Flame className="w-5 h-5" />
            <span>🔥 Zostało tylko {spotsLeft} miejsc!</span>
            <Flame className="w-5 h-5" />
          </div>
        </div>;
    } else if (spotsLeft === 3) {
      return <div className="relative">
          <div className="animate-bounce bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-600 animate-pulse">
              <span className="text-2xl">⚠️</span>
              <span>OSTATNIE 3 MIEJSCA!</span>
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>;
    } else {
      return <div className="bg-muted/50 border border-border rounded-xl p-4">
          <p className="text-lg text-muted-foreground text-center">
            Darmowe miejsca się wyczerpały, ale możesz zapisać się za darmo na Free Trial
          </p>
        </div>;
    }
  };
  return <>
      <Seo title="Dołącz do Founding 100 - Mentavo AI" description="Dołącz do pierwszych 100 użytkowników Mentavo AI i otrzymaj darmowy miesiąc Premium." jsonLd={{
      "@context": "https://schema.org",
      "@type": "SpecialOffer",
      "name": "Founding 100 Program - Mentavo AI",
      "description": "Ekskluzywny program dla pierwszych 100 użytkowników Mentavo AI",
      "validThrough": "2025-12-31",
      "url": window.location.href
    }} />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Header */}
        <header className="pt-6 pb-4 px-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
              M
            </div>
            <h1 className="text-xl font-semibold text-foreground">Mentavo AI</h1>
            <p className="text-sm text-muted-foreground">Inteligentna nauka, realne wyniki.</p>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-4 py-8 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              Ekskluzywny Program
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Dołącz do <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Founding 100
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              Dołącz do pierwszych 100 użytkowników Mentavo AI i otrzymaj darmowy miesiąc Premium.
            </p>

            {/* Dynamic Urgency Message */}
            {getUrgencyMessage()}
            
            {/* Registration Form or CTA */}
            {showRegistrationForm && !user ? (
              <Card className="mt-6 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Dołącz do Founding 100</h3>
                      <p className="text-sm text-muted-foreground">Utwórz konto i otrzymaj darmowy miesiąc Premium</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="twoj@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-sm font-medium">Hasło (opcjonalne)</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Zostaw puste dla losowego hasła"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Jeśli zostawisz puste, wygenerujemy hasło i wyślemy je na email</p>
                      </div>

                      <Button 
                        onClick={handleJoinNow} 
                        disabled={isLoading || !email.trim() || spotsLeft === 0} 
                        className={`w-full h-12 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300 ${spotsLeft === 3 ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse" : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"}`}
                      >
                        {isLoading ? "Tworzę konto..." : spotsLeft === 3 ? "DOŁĄCZ TERAZ!" : "Utwórz konto i dołącz"}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">lub</span>
                        </div>
                      </div>

                      <Button
                        onClick={handleGoogleJoin}
                        disabled={socialLoading || spotsLeft === 0}
                        variant="outline"
                        className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 border border-gray-300 text-gray-700"
                      >
                        <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
                        {socialLoading ? "Przekierowuję..." : "Dołącz przez Google"}
                      </Button>

                      <Button
                        onClick={() => {
                          setShowRegistrationForm(false);
                          setEmail("");
                          setPassword("");
                        }}
                        variant="ghost"
                        className="w-full"
                      >
                        Anuluj
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="mt-6">
                <Button onClick={handleJoinNow} disabled={isLoading || spotsLeft === 0} className={`w-full h-12 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300 ${spotsLeft === 3 ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse" : spotsLeft < 3 ? "bg-muted hover:bg-muted/80 text-muted-foreground" : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"}`}>
                  {isLoading ? (user ? "Dołączam..." : "Rejestruję...") : spotsLeft === 0 ? "Brak miejsc" : spotsLeft < 3 ? "Zapisz się na Free Trial" : spotsLeft === 3 ? "DOŁĄCZ TERAZ!" : user ? "Dołącz teraz" : "Dołącz teraz"}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
                Dlaczego warto?
              </h2>
              
              <div className="space-y-4 max-w-sm mx-auto">
                {[{
                icon: Gift,
                text: "Darmowy miesiąc Premium",
                color: "text-success"
              }, {
                icon: Users,
                text: "Wpływ na rozwój aplikacji",
                color: "text-primary"
              }, {
                icon: Star,
                text: "Status Foundera na zawsze",
                color: "text-secondary"
              }, {
                icon: ChevronRight,
                text: "+3 dni za polecenie znajomego",
                color: "text-warning"
              }].map((benefit, index) => <div key={index} className="flex items-center justify-center gap-4 p-3 rounded-lg bg-background/50 text-center">
                    <div className={`${benefit.color} bg-current/10 p-2 rounded-lg flex-shrink-0`}>
                      <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                    </div>
                    <span className="text-foreground font-medium">{benefit.text}</span>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA before "Jak to działa" */}
        {!showRegistrationForm && (
          <section className="px-4 py-4">
            <Button onClick={handleJoinNow} disabled={isLoading || spotsLeft === 0} className={`w-full h-12 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300 ${spotsLeft === 3 ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse" : spotsLeft < 3 ? "bg-muted hover:bg-muted/80 text-muted-foreground" : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"}`}>
              {isLoading ? (user ? "Dołączam..." : "Rejestruję...") : spotsLeft === 0 ? "Brak miejsc" : spotsLeft < 3 ? "Zapisz się na Free Trial" : spotsLeft === 3 ? "DOŁĄCZ TERAZ!" : user ? "Dołącz teraz" : "Dołącz teraz"}
            </Button>
          </section>
        )}

        {/* Process Section */}
        <section className="px-4 py-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
            Jak to działa?
          </h2>
          
          <div className="space-y-4 max-w-sm mx-auto">
            {["Rejestrujesz się → Dostęp do AI", "Testujesz → Dzielisz się opinią", "Zapraszasz znajomych → Bonusy", "Twój feedback → Nowe funkcje"].map((step, index) => <div key={index} className="flex items-center justify-center gap-4 p-4 bg-card/30 rounded-xl border border-primary/5 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-foreground font-medium">{step}</span>
              </div>)}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-8 pb-12">
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-orange-600 font-semibold mb-4">
                <Flame className="w-5 h-5" />
                <span>Tylko 100 miejsc!</span>
              </div>
            </div>
            
            {!showRegistrationForm && (
              <Button onClick={handleJoinNow} disabled={isLoading || spotsLeft === 0} className={`w-full h-14 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300 ${spotsLeft === 3 ? "h-16 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse" : spotsLeft < 3 ? "bg-muted hover:bg-muted/80 text-muted-foreground" : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"}`}>
                {isLoading ? (user ? "Dołączam..." : "Rejestruję...") : spotsLeft === 0 ? "Brak miejsc" : spotsLeft < 3 ? "Zapisz się na Free Trial" : spotsLeft === 3 ? "DOŁĄCZ TERAZ - OSTATNIE MIEJSCA!" : user ? "Dołącz teraz" : "Dołącz teraz"}
              </Button>
            )}

            <div className="text-center">
              
            </div>
          </div>
        </section>
      </div>
    </>;
}