import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  Clock,
  Users,
  Bot,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Flame,
  Crown,
  Star,
  Zap,
} from "lucide-react";
import mentavoLogo from "@/assets/mentavo-logo-full.png";
import shapes3d from "@/assets/mentavo-3d-shapes.svg";
import { saveReferralCode } from "@/lib/referralStorage";
import { logEvent } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [isLoadingSpots, setIsLoadingSpots] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      console.log("[LandingPage] Detected referral code, saving:", refCode);
      saveReferralCode(refCode);
    }
  }, []);

  // Fetch founding spots
  useEffect(() => {
    const fetchFoundingSpots = async () => {
      try {
        console.log('[LandingPage] Fetching founding spots...');
        const { data, error } = await supabase.functions.invoke('founding-registration', {
          method: 'GET'
        });
        
        console.log('[LandingPage] Response:', data, error);
        
        if (error) {
          console.error('[LandingPage] Error fetching founding spots:', error);
          setSpotsLeft(0);
        } else {
          // API returns slotsLeft (not spotsLeft)
          const spots = data?.slotsLeft ?? data?.spotsLeft ?? 0;
          console.log('[LandingPage] Spots left:', spots);
          setSpotsLeft(spots);
        }
      } catch (err) {
        console.error('[LandingPage] Failed to fetch founding spots:', err);
        setSpotsLeft(0);
      } finally {
        setIsLoadingSpots(false);
      }
    };

    fetchFoundingSpots();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchFoundingSpots, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTrial = () => {
    logEvent("landing_cta_click", { action: "start_trial" });
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth?mode=signup&trial=true");
    }
  };

  const handleStartLearning = () => {
    logEvent("landing_cta_click", { action: "start_learning" });
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth?mode=signup");
    }
  };

  const handleJoinFounding = () => {
    logEvent("landing_cta_click", { action: "join_founding" });
    if (user) {
      navigate("/founding/register");
    } else {
      navigate("/founding/register");
    }
  };

  const hasFoundingSpots = spotsLeft !== null && spotsLeft > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={mentavoLogo} alt="Mentavo AI" className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} variant="default">
                Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => navigate("/auth")} variant="ghost">
                  Zaloguj się
                </Button>
                {hasFoundingSpots ? (
                  <Button 
                    onClick={handleJoinFounding}
                    className="bg-gradient-to-r from-primary to-secondary text-white"
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    30 dni gratis
                  </Button>
                ) : (
                  <Button onClick={handleStartTrial}>
                    Bezpłatny dostęp przez 7 dni
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Founding Badge - only show when spots available */}
            {hasFoundingSpots && !isLoadingSpots && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-sm font-semibold animate-pulse">
                <Flame className="w-4 h-4 text-destructive" />
                Pozostało tylko {spotsLeft}/100 miejsc w programie Founding!
              </div>
            )}
            
            {!hasFoundingSpots && !isLoadingSpots && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Zaufany przez tysiące uczniów
              </div>
            )}
            
            <h1 className="font-poppins font-bold text-5xl lg:text-6xl text-neutral leading-tight">
              AI Tutor Matematyczny
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Spersonalizowana nauka matematyki z AI, dostępna 24/7. 
              Osiągnij lepsze wyniki szybciej i taniej niż z tradycyjnymi korepetycjami.
            </p>

            {/* Founding CTA when spots available */}
            {hasFoundingSpots && !isLoadingSpots ? (
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  onClick={handleJoinFounding}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold text-lg h-16 px-10 shadow-lg hover:shadow-xl transition-all"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Dołącz do Founding 100 – 30 dni gratis
                </Button>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    30 dni Premium za darmo
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Status Founding na zawsze
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Wpływ na rozwój produktu
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleStartTrial}
                  className="bg-neutral hover:bg-neutral/90 text-white font-semibold text-lg h-14 px-8"
                >
                  Bezpłatny dostęp przez 7 dni
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={handleStartLearning}
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold text-lg h-14 px-8"
                >
                  Rozpocznij naukę
                </Button>
              </div>
            )}

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Bez karty kredytowej</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Anuluj w każdej chwili</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <img 
              src={shapes3d} 
              alt="3D Geometric Shapes" 
              className="w-full h-auto animate-float"
            />
          </div>
        </div>
      </section>

      {/* Choose Your Path Section - only when founding spots available */}
      {hasFoundingSpots && !isLoadingSpots && (
        <section className="bg-support-light py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-neutral mb-4">
                Wybierz swoją ścieżkę
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dołącz do ekskluzywnego programu Founding lub rozpocznij standardowy trial
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Founding Card - Highlighted */}
              <Card className="relative overflow-hidden border-2 border-primary bg-white shadow-lg hover:shadow-xl transition-all group">
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold">
                    <Flame className="w-3 h-3" />
                    LIMITOWANE
                  </span>
                </div>
                
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-bold text-xl text-neutral">Founding Member</h3>
                      <p className="text-sm text-muted-foreground">Ekskluzywny program dla pierwszych 100 osób</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">0 zł</span>
                    <span className="text-lg text-muted-foreground line-through">49,99 zł</span>
                    <span className="text-sm text-muted-foreground">/ przez 30 dni</span>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">30 dni pełnego dostępu Premium</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-warning flex-shrink-0" />
                      <span className="text-foreground">Status Founding Member na zawsze</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-secondary flex-shrink-0" />
                      <span className="text-foreground">Wpływ na rozwój produktu</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Crown className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">Ekskluzywne bonusy i nagrody</span>
                    </li>
                  </ul>

                  {/* Spots counter */}
                  <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-destructive/10 text-destructive">
                    <Flame className="w-4 h-4 animate-pulse" />
                    <span className="font-semibold">Pozostało tylko {spotsLeft} z 100 miejsc!</span>
                  </div>

                  <Button 
                    onClick={handleJoinFounding}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                  >
                    Zostań Founding Member
                  </Button>
                </CardContent>
              </Card>

              {/* Standard Trial Card */}
              <Card className="border bg-white shadow-card hover:shadow-elevated transition-all">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-poppins font-bold text-xl text-neutral">Darmowy Trial</h3>
                      <p className="text-sm text-muted-foreground">Standardowa wersja próbna</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-neutral">0 zł</span>
                    <span className="text-sm text-muted-foreground">/ przez 7 dni</span>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">7 dni dostępu do platformy</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">Bez karty kredytowej</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">Podstawowe funkcje AI Tutora</span>
                    </li>
                    <li className="flex items-center gap-3 opacity-50">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">Brak statusu Founding</span>
                    </li>
                  </ul>

                  <div className="py-3 px-4 rounded-lg bg-muted/50 text-muted-foreground text-center">
                    <span>Zawsze dostępny</span>
                  </div>

                  <Button 
                    onClick={handleStartTrial}
                    variant="outline"
                    className="w-full h-14 text-lg font-semibold border-2"
                  >
                    Rozpocznij 7-dniowy trial
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Problem Section */}
      <section className="bg-support-light py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-4xl text-neutral mb-4">
              Tradycyjne korepetycje mają swoje ograniczenia
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rozumiemy, że tradycyjne metody nauki nie zawsze są idealne
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-neutral">
                  Wysokie koszty
                </h3>
                <p className="text-muted-foreground">
                  Tradycyjne korepetycje mogą kosztować nawet 100-150 zł za godzinę, co szybko się sumuje
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-neutral">
                  Ograniczone godziny
                </h3>
                <p className="text-muted-foreground">
                  Musisz dopasować się do harmonogramu korepetytora, co nie zawsze jest wygodne
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-neutral">
                  Brak personalizacji
                </h3>
                <p className="text-muted-foreground">
                  Jeden styl nauczania nie pasuje do każdego ucznia i jego unikalnych potrzeb
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-4xl text-neutral mb-4">
              Mentavo AI: Inteligentne rozwiązanie
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nowoczesna platforma, która dostosowuje się do Twoich potrzeb
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <Bot className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-neutral">
                  24/7 Dostępność
                </h3>
                <p className="text-muted-foreground">
                  Ucz się kiedy chcesz, gdzie chcesz. AI Tutor jest zawsze gotowy do pomocy
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-neutral">
                  Przystępna cena
                </h3>
                <p className="text-muted-foreground">
                  Za cenę jednej godziny korepetycji otrzymujesz cały miesiąc nieograniczonego dostępu
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-neutral">
                  Interaktywne uczenie
                </h3>
                <p className="text-muted-foreground">
                  Spersonalizowane ścieżki nauki dopasowane do Twojego poziomu i tempa
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Dynamic based on founding spots */}
      <section className="bg-gradient-to-br from-primary via-primary to-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            {hasFoundingSpots ? (
              <>
                <h2 className="font-poppins font-bold text-4xl text-white">
                  Ostatnia szansa na 30 dni gratis!
                </h2>
                
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-lg font-semibold">
                  <Flame className="w-5 h-5 animate-pulse" />
                  Founding 100 – zostało {spotsLeft} miejsc
                </div>

                <p className="text-xl text-white/90">
                  Dołącz do ekskluzywnego programu i otrzymaj 30 dni Premium całkowicie za darmo
                </p>

                <Button 
                  size="lg"
                  onClick={handleJoinFounding}
                  className="bg-white text-primary hover:bg-white/90 font-bold text-lg h-14 px-12"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Zostań Founding Member
                </Button>

                <p className="text-white/80 text-sm">
                  Bez zobowiązań • Bez karty kredytowej • Status Founding na zawsze
                </p>
              </>
            ) : (
              <>
                <h2 className="font-poppins font-bold text-4xl text-white">
                  Kluczowe funkcje platformy
                </h2>
                
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-lg font-semibold">
                  <Sparkles className="w-5 h-5" />
                  Darmowy trial 7 dni
                </div>

                <p className="text-2xl text-white font-poppins font-semibold">
                  Plan miesięczny 49,99 zł
                </p>

                <Button 
                  size="lg"
                  onClick={handleStartLearning}
                  className="bg-white text-primary hover:bg-white/90 font-semibold text-lg h-14 px-12"
                >
                  Rozpocznij naukę
                </Button>

                <p className="text-white/90 text-sm">
                  Bez zobowiązań • Anuluj w każdej chwili
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src={mentavoLogo} alt="Mentavo AI" className="h-8 invert" />
            </div>
            
            <div className="flex gap-6 text-white/80 text-sm">
              <a href="/privacy-policy" className="hover:text-white transition-colors">
                Polityka Prywatności
              </a>
              <a href="/terms-of-service" className="hover:text-white transition-colors">
                Regulamin
              </a>
              <a href="mailto:kontakt@mentavo.ai" className="hover:text-white transition-colors">
                Kontakt
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-white/60 text-sm">
            © 2025 Mentavo AI. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
}
