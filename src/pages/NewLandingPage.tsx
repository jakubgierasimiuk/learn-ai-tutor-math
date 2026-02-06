import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  MessageCircle,
  Brain,
} from "lucide-react";
import mentavoLogo from "@/assets/mentavo-logo-full.png";
import { saveReferralCode } from "@/lib/referralStorage";
import { Seo } from "@/components/Seo";
import { ThreeDShapes } from "@/components/ThreeDShapes";
import { supabase } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/logger";

const NewLandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [isLoadingSpots, setIsLoadingSpots] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      console.log("[NewLandingPage] Detected referral code, saving:", refCode);
      saveReferralCode(refCode);
    }
  }, []);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  // Fetch founding spots
  useEffect(() => {
    const fetchFoundingSpots = async () => {
      try {
        console.log('[NewLandingPage] Fetching founding spots...');
        const { data, error } = await supabase.functions.invoke('founding-registration', {
          method: 'GET'
        });
        
        console.log('[NewLandingPage] Response:', data, error);
        
        if (error) {
          console.error('[NewLandingPage] Error fetching founding spots:', error);
          setSpotsLeft(0);
        } else {
          // API returns slotsLeft (not spotsLeft)
          const spots = data?.slotsLeft ?? data?.spotsLeft ?? 0;
          console.log('[NewLandingPage] Spots left:', spots);
          setSpotsLeft(spots);
        }
      } catch (err) {
        console.error('[NewLandingPage] Failed to fetch founding spots:', err);
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
    navigate("/auth?mode=signup&trial=true");
  };

  const handleStartLearning = () => {
    logEvent("landing_cta_click", { action: "start_learning" });
    navigate("/auth?mode=signup");
  };

  const handleJoinFounding = () => {
    logEvent("landing_cta_click", { action: "join_founding" });
    navigate("/founding/register");
  };

  const hasFoundingSpots = spotsLeft !== null && spotsLeft > 0;

  return (
    <>
      <Seo
        title="Mentavo AI - Inteligentna Nauka Matematyki | Tutor AI 24/7"
        description="Mentavo AI to spersonalizowany tutor matematyki dostępny 24/7. Testuj za darmo przez 7 dni, potem 49,99 zł/mies."
        canonical="https://mentavo.pl/"
      />
      
      <div className="min-h-screen bg-white overflow-x-hidden">
        {/* Navigation */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={mentavoLogo} alt="Mentavo AI" className="h-10 sm:h-14" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button onClick={() => navigate("/auth")} variant="ghost" size="sm" className="hidden sm:flex">
                Zaloguj się
              </Button>
              {isLoadingSpots ? (
                <div className="h-9 w-24 sm:w-32 bg-muted animate-pulse rounded-md" />
              ) : hasFoundingSpots ? (
                <Button 
                  onClick={handleJoinFounding}
                  className="bg-gradient-to-r from-primary to-secondary text-white text-xs sm:text-sm"
                  size="sm"
                >
                  <Flame className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">30 dni gratis</span>
                  <span className="sm:hidden">30 dni</span>
                </Button>
              ) : (
                <Button onClick={handleStartTrial} size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">7 dni za darmo</span>
                  <span className="sm:hidden">7 dni</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 sm:py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              {/* Loading skeleton for badge */}
              {isLoadingSpots && (
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-muted animate-pulse">
                  <div className="w-4 h-4 bg-muted-foreground/20 rounded-full flex-shrink-0" />
                  <div className="w-32 sm:w-48 h-4 bg-muted-foreground/20 rounded" />
                </div>
              )}
              
              {/* Founding Badge - only show when spots available */}
              {hasFoundingSpots && !isLoadingSpots && (
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-xs sm:text-sm font-semibold animate-pulse">
                  <Flame className="w-4 h-4 text-destructive flex-shrink-0" />
                  <span>Pozostało {spotsLeft}/100 miejsc Founding!</span>
                </div>
              )}
              
              {!hasFoundingSpots && !isLoadingSpots && (
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Zaufany przez tysiące uczniów</span>
                </div>
              )}
              
              <h1 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-neutral leading-tight">
                Matematyka w liceum nie musi być trudna
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                Twój osobisty AI tutor, który nie daje gotowych odpowiedzi — pomaga Ci zrozumieć.
                Metodą sokratejską prowadzi Cię krok po kroku do rozwiązania. Dostępny 24/7 za 49,99 zł/mies.
              </p>

              {/* Loading skeleton for CTA */}
              {isLoadingSpots && (
                <div className="space-y-4">
                  <div className="h-12 sm:h-14 w-full sm:w-64 bg-muted animate-pulse rounded-md" />
                  <div className="flex flex-wrap gap-4">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              )}

              {/* Founding CTA when spots available */}
              {hasFoundingSpots && !isLoadingSpots && (
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    onClick={handleJoinFounding}
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold text-sm sm:text-base md:text-lg h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Dołącz do Founding 100 – 30 dni gratis</span>
                    <span className="sm:hidden">30 dni Premium gratis</span>
                  </Button>
                  
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span>30 dni Premium za darmo</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span>Status Founding na zawsze</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span>Wpływ na rozwój produktu</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!hasFoundingSpots && !isLoadingSpots && (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button 
                    size="lg" 
                    onClick={handleStartTrial}
                    className="bg-[#1E3A5F] hover:bg-[#1E3A5F]/90 text-white font-semibold text-sm sm:text-base md:text-lg h-12 sm:h-14 px-6 sm:px-8 shadow-elegant"
                  >
                    <span className="hidden sm:inline">Bezpłatny dostęp przez 7 dni</span>
                    <span className="sm:hidden">7 dni za darmo</span>
                  </Button>
                  <Button 
                    size="lg" 
                    onClick={handleStartLearning}
                    className="bg-[#4A90E2] hover:bg-[#4A90E2]/90 text-white font-semibold text-sm sm:text-base md:text-lg h-12 sm:h-14 px-6 sm:px-8 shadow-primary"
                  >
                    Rozpocznij naukę
                  </Button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 pt-2 sm:pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Bez karty kredytowej</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Anuluj w każdej chwili</span>
                </div>
              </div>
            </div>

             <div className="relative hidden lg:block h-[500px] overflow-hidden">
              <ThreeDShapes />
            </div>
          </div>
        </section>

        {/* How It Works - Chat Demo Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-support-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-neutral mb-3 sm:mb-4">
                Zobacz jak uczy Mentavo
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Metoda sokratejska — nie dajemy gotowych odpowiedzi, prowadzimy Cię pytaniami do rozwiązania
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="bg-white shadow-elevated overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* AI Message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-sm sm:text-base">Cześć! Jak mogę Ci dzisiaj pomóc? 🎯</p>
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                        <p className="text-sm sm:text-base">Jak rozwiązać x² - 5x + 6 = 0?</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* AI Response - Socratic */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-sm sm:text-base">Świetne pytanie! To równanie kwadratowe. Zanim podpowiem rozwiązanie — <strong>czy potrafisz wskazać współczynniki a, b i c?</strong></p>
                      </div>
                    </div>

                    {/* User Response */}
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                        <p className="text-sm sm:text-base">a=1, b=-5, c=6</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* AI Final */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-sm sm:text-base">Dokładnie! 🎯 Teraz oblicz deltę używając wzoru Δ = b² - 4ac. Co otrzymujesz?</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-center text-sm text-muted-foreground mt-6">
                <Brain className="w-4 h-4 inline mr-1" />
                Mentavo prowadzi Cię krok po kroku pytaniami — tak jak najlepszy korepetytor
              </p>
            </div>
          </div>
        </section>

        {/* Choose Your Path Section - only when founding spots available */}
        {hasFoundingSpots && !isLoadingSpots && (
          <section className="bg-support-light py-10 sm:py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral mb-3 sm:mb-4">
                  Wybierz swoją ścieżkę
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                  Dołącz do ekskluzywnego programu Founding lub rozpocznij standardowy trial
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto items-stretch">
                {/* Founding Card - Highlighted */}
                <Card className="relative overflow-hidden border-2 border-primary bg-white shadow-lg hover:shadow-xl transition-all group flex flex-col">
                  {/* Badge */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] sm:text-xs font-bold">
                      <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      LIMITOWANE
                    </span>
                  </div>
                  
                  <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-poppins font-bold text-lg sm:text-xl text-neutral">Founding Member</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Ekskluzywny program dla pierwszych 100 osób</p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-bold text-primary">0 zł</span>
                      <span className="text-base sm:text-lg text-muted-foreground line-through">49,99 zł</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">/ przez 30 dni</span>
                    </div>

                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex items-center gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                        <span className="text-sm sm:text-base text-foreground">30 dni pełnego dostępu Premium</span>
                      </li>
                      <li className="flex items-center gap-2 sm:gap-3">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-warning flex-shrink-0" />
                        <span className="text-sm sm:text-base text-foreground">Status Founding Member na zawsze</span>
                      </li>
                      <li className="flex items-center gap-2 sm:gap-3">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                        <span className="text-sm sm:text-base text-foreground">Wpływ na rozwój produktu</span>
                      </li>
                    </ul>

                    {/* Spacer to push button to bottom */}
                    <div className="flex-1" />

                    {/* Spots counter */}
                    <div className="flex flex-wrap items-center justify-center gap-2 py-2 sm:py-3 px-3 sm:px-4 rounded-lg bg-destructive/10 text-destructive text-sm sm:text-base">
                      <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse flex-shrink-0" />
                      <span className="font-semibold text-center break-words">Pozostało tylko {spotsLeft} z 100 miejsc!</span>
                    </div>

                    <Button 
                      onClick={handleJoinFounding}
                      className="w-full h-11 sm:h-14 text-sm sm:text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                    >
                      Zostań Founding Member
                    </Button>
                  </CardContent>
                </Card>

                {/* Standard Trial Card */}
                <Card className="border bg-white shadow-card hover:shadow-elevated transition-all flex flex-col">
                  <CardContent className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-poppins font-bold text-lg sm:text-xl text-neutral">Darmowy Trial</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Standardowa wersja próbna</p>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span className="text-3xl sm:text-4xl font-bold text-neutral">0 zł</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">/ przez 7 dni</span>
                    </div>

                    <ul className="space-y-2 sm:space-y-3">
                      <li className="flex items-center gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                        <span className="text-sm sm:text-base text-foreground">7 dni dostępu do platformy</span>
                      </li>
                      <li className="flex items-center gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                        <span className="text-sm sm:text-base text-foreground">Bez karty kredytowej</span>
                      </li>
                      <li className="flex items-center gap-2 sm:gap-3">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                        <span className="text-sm sm:text-base text-foreground">Podstawowe funkcje AI Tutora</span>
                      </li>
                      <li className="flex items-center gap-2 sm:gap-3 opacity-50">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm sm:text-base text-muted-foreground">Brak statusu Founding</span>
                      </li>
                    </ul>

                    {/* Spacer to push button to bottom */}
                    <div className="flex-1" />

                    <div className="py-2 sm:py-3 px-3 sm:px-4 rounded-lg bg-muted/50 text-muted-foreground text-center text-sm sm:text-base">
                      <span>Zawsze dostępny</span>
                    </div>

                    <Button 
                      onClick={handleStartTrial}
                      variant="outline"
                      className="w-full h-11 sm:h-14 text-sm sm:text-lg font-semibold border-2"
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
        <section className="bg-support-light py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-neutral mb-3 sm:mb-4">
                Tradycyjne korepetycje mają swoje ograniczenia
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Rozumiemy, że tradycyjne metody nauki nie zawsze są idealne
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
                <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#4A90E2] flex items-center justify-center mx-auto">
                    <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl text-neutral">
                    Wysokie koszty
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Tradycyjne korepetycje mogą kosztować nawet 100-150 zł za godzinę, co szybko się sumuje
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
                <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#4A90E2] flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl text-neutral">
                    Ograniczone godziny
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Musisz dopasować się do harmonogramu korepetytora, co nie zawsze jest wygodne
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all sm:col-span-2 md:col-span-1">
                <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#4A90E2] flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl text-neutral">
                    Brak personalizacji
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Jeden styl nauczania nie pasuje do każdego ucznia i jego unikalnych potrzeb
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-neutral mb-3 sm:mb-4">
                Mentavo AI: Inteligentne rozwiązanie
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Nowoczesna platforma, która dostosowuje się do Twoich potrzeb
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
                <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#4A90E2] flex items-center justify-center mx-auto">
                    <Bot className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl text-neutral">
                    24/7 Dostępność
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Ucz się kiedy chcesz, gdzie chcesz. AI Tutor jest zawsze gotowy do pomocy
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all">
                <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#4A90E2] flex items-center justify-center mx-auto">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl text-neutral">
                    Przystępna cena
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Za cenę jednej godziny korepetycji otrzymujesz cały miesiąc nieograniczonego dostępu
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-card hover:shadow-elevated transition-all sm:col-span-2 md:col-span-1">
                <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#4A90E2] flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl text-neutral">
                    Interaktywne uczenie
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Spersonalizowane ścieżki nauki dopasowane do Twojego poziomu i tempa
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={hasFoundingSpots ? "bg-gradient-to-r from-primary to-secondary py-12 sm:py-16 md:py-20" : "bg-[#4A90E2] py-12 sm:py-16 md:py-20"}>
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
              {hasFoundingSpots ? (
                <>
                  <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-white">
                    Ostatnia szansa na 30 dni gratis!
                  </h2>
                  
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm sm:text-base md:text-lg font-semibold">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse flex-shrink-0" />
                    <span>Founding 100 – zostało {spotsLeft} miejsc</span>
                  </div>

                  <p className="text-lg sm:text-xl md:text-2xl text-white font-poppins font-semibold px-2">
                    Dołącz teraz i otrzymaj 30 dni Premium za darmo
                  </p>

                  <Button 
                    size="lg"
                    onClick={handleJoinFounding}
                    className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-bold text-sm sm:text-base md:text-lg h-12 sm:h-14 px-8 sm:px-12 shadow-elegant"
                  >
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Zostań Founding Member</span>
                    <span className="sm:hidden">Zostań Founding</span>
                  </Button>

                  <p className="text-white/90 text-xs sm:text-sm">
                    Bez zobowiązań • Bez karty kredytowej • Status Founding na zawsze
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-white">
                    Kluczowe funkcje platformy
                  </h2>
                  
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm sm:text-base md:text-lg font-semibold">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Darmowy trial 7 dni</span>
                  </div>

                  <p className="text-lg sm:text-xl md:text-2xl text-white font-poppins font-semibold">
                    Plan miesięczny 49,99 zł
                  </p>

                  <Button 
                    size="lg"
                    onClick={handleStartLearning}
                    className="w-full sm:w-auto bg-white text-[#4A90E2] hover:bg-white/90 font-semibold text-sm sm:text-base md:text-lg h-12 sm:h-14 px-8 sm:px-12 shadow-elegant"
                  >
                    Rozpocznij naukę
                  </Button>

                  <p className="text-white/90 text-xs sm:text-sm">
                    Bez zobowiązań • Anuluj w każdej chwili
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-neutral mb-3 sm:mb-4">
                Najczęściej zadawane pytania
              </h2>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="bg-support-light rounded-lg border-none px-4 sm:px-6">
                  <AccordionTrigger className="text-left font-medium text-sm sm:text-base hover:no-underline">
                    Czy po trialu automatycznie pobieracie opłatę?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4">
                    Nie. Po 7 dniach konto przechodzi na darmowy plan z ograniczeniami. NIE pobieramy automatycznie żadnych opłat.
                    Aby kontynuować Premium, aktywujesz subskrypcję ręcznie w ustawieniach konta.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-support-light rounded-lg border-none px-4 sm:px-6">
                  <AccordionTrigger className="text-left font-medium text-sm sm:text-base hover:no-underline">
                    Czy mogę korzystać na telefonie?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4">
                    Tak! Mentavo działa w przeglądarce na telefonie, tablecie i komputerze.
                    Nie musisz instalować żadnej aplikacji — wystarczy otworzyć mentavo.pl.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-support-light rounded-lg border-none px-4 sm:px-6">
                  <AccordionTrigger className="text-left font-medium text-sm sm:text-base hover:no-underline">
                    Czym Mentavo różni się od ChatGPT?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4">
                    Mentavo to specjalizowany tutor matematyki zgodny z polską podstawą programową.
                    W przeciwieństwie do ChatGPT, nie daje gotowych odpowiedzi — prowadzi Cię pytaniami do samodzielnego rozwiązania (metoda sokratejska).
                    Dzięki temu naprawdę zrozumiesz materiał.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="bg-support-light rounded-lg border-none px-4 sm:px-6">
                  <AccordionTrigger className="text-left font-medium text-sm sm:text-base hover:no-underline">
                    Mogę anulować kiedy chcę?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4">
                    Tak, jednym kliknięciem w ustawieniach konta. Zero zobowiązań, zero ukrytych opłat.
                    Po anulowaniu masz dostęp do końca opłaconego okresu.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="bg-support-light rounded-lg border-none px-4 sm:px-6">
                  <AccordionTrigger className="text-left font-medium text-sm sm:text-base hover:no-underline">
                    Dla kogo jest Mentavo?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4">
                    Dla uczniów liceum (klasy 1-4). Niezależnie czy potrzebujesz pomocy z podstawami
                    czy przygotowujesz się do matury rozszerzonej — Mentavo dostosowuje się do Twojego poziomu.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1E3A5F] py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
              <div className="flex items-center gap-2">
                <img src={mentavoLogo} alt="Mentavo AI" className="h-10 sm:h-14 invert" />
              </div>

              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-white/80 text-xs sm:text-sm">
                <a href="/pricing" className="hover:text-white transition-colors">
                  Cennik
                </a>
                <a href="/privacy-policy" className="hover:text-white transition-colors">
                  Polityka Prywatności
                </a>
                <a href="/terms-of-service" className="hover:text-white transition-colors">
                  Regulamin
                </a>
                <a href="mailto:kontakt@mentavo.pl" className="hover:text-white transition-colors">
                  Kontakt
                </a>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 text-center text-white/60 text-xs sm:text-sm">
              © 2026 Mentavo AI. Wszystkie prawa zastrzeżone.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default NewLandingPage;