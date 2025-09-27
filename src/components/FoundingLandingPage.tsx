import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, Flame, Users, Star, Gift, ChevronRight, Mail, Lock, 
  MessageCircle, Target, BarChart3, FlaskConical,
  DollarSign, Frown, Home, Shield, Clock, Zap,
  TrendingUp, Heart, Award, BookOpen, Brain
} from "lucide-react";
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

  return (
    <>
      <Seo 
        title="Founding 100 - Dołącz do pierwszych 100 użytkowników Mentavo AI" 
        description="Zostań jednym z pierwszych 100 użytkowników Mentavo AI. Miesiąc Premium za darmo i ekskluzywne korzyści dla Founding Members."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SpecialOffer",
          "name": "Founding 100 Program - Mentavo AI",
          "description": "Ekskluzywny program dla pierwszych 100 użytkowników Mentavo AI",
          "validThrough": "2025-12-31",
          "url": window.location.href
        }} 
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
          <div className="container flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-semibold">Mentavo AI</span>
            </div>
            <Button 
              onClick={handleJoinNow}
              disabled={spotsLeft === 0}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              Zostań Founding Member
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 lg:py-20">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-600 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                  <Flame className="w-4 h-4" />
                  Pozostało tylko <strong>{spotsLeft}</strong>/100 miejsc
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Dołącz do pierwszych 100 użytkowników{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Mentavo AI
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Inteligentny tutor matematyki dostępny 24/7. Rewolucyjna aplikacja która pomaga uczniom szkół średnich opanować matematykę dzięki sztucznej inteligencji.
                </p>
                
                <div className="space-y-3">
                  {[
                    "Bezpłatny miesiąc Premium (wartość 49 zł)",
                    "Wpływ na kształt aplikacji", 
                    "Status Founding Member na zawsze"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-success/20 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Registration Form or CTA */}
                {showRegistrationForm && !user ? (
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2">Dołącz do Founding 100</h3>
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
                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                          >
                            {isLoading ? "Tworzę konto..." : "Utwórz konto i dołącz"}
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
                            className="w-full h-12 text-base font-medium"
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
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={handleJoinNow} 
                      disabled={isLoading || spotsLeft === 0} 
                      size="lg"
                      className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-6"
                    >
                      {isLoading ? (user ? "Dołączam..." : "Rejestruję...") : spotsLeft === 0 ? "Brak miejsc" : user ? "Dołącz teraz" : "Zostań Founding Member"}
                    </Button>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Bez zobowiązań • Możesz zrezygnować w każdej chwili
                </p>
              </div>

              {/* AI Demo Visual */}
              <div className="lg:pl-12">
                <Card className="bg-gradient-to-br from-card/50 to-primary/5 backdrop-blur-sm border-primary/10">
                  <CardContent className="p-6">
                    <div className="bg-background rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="ml-4 text-sm font-medium">Mentavo AI</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-muted rounded-lg p-3 ml-8">
                          <p className="text-sm">Jak rozwiązać równanie x² - 5x + 6 = 0?</p>
                        </div>
                        
                        <div className="bg-primary/10 rounded-lg p-3 mr-8">
                          <p className="text-sm">Świetne pytanie! To równanie kwadratowe. Rozwiążemy je krok po kroku...</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span>Chat 24/7</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span>Spersonalizowane</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span>Śledzenie postępów</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Dlaczego potrzebujesz Mentavo AI?
              </h2>
              <p className="text-xl text-muted-foreground">
                Matematyka to największy problem polskich licealistów
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: DollarSign,
                  title: "Drogie korepetycje",
                  description: "Korepetycje kosztują 150-200 zł/h (600-800 zł miesięcznie)",
                  stat: "78% rodziców uważa korepetycje za zbyt drogie"
                },
                {
                  icon: Frown,
                  title: "Strach przed pytaniami",
                  description: "Uczniowie boją się zadawać pytania na lekcjach",
                  stat: "63% uczniów nie pyta o pomoc gdy czegoś nie rozumie"
                },
                {
                  icon: Home,
                  title: "Brak pomocy w domu",
                  description: "Rodzice nie pamiętają licealnej matematyki i nie mogą pomóc dziecku",
                  stat: "85% rodziców czuje się bezradnie przy zadaniach z liceum"
                }
              ].map((problem, index) => (
                <Card key={index} className="text-center p-6">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
                      <problem.icon className="w-8 h-8 text-destructive" />
                    </div>
                    <h3 className="text-xl font-semibold">{problem.title}</h3>
                    <p className="text-muted-foreground">{problem.description}</p>
                    <div className="bg-destructive/5 rounded-lg p-3">
                      <p className="text-sm font-medium text-destructive">{problem.stat}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-destructive mb-2">57%</div>
                <div className="text-sm text-muted-foreground">uczniów ma problemy z matematyką</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-destructive mb-2">55%</div>
                <div className="text-sm text-muted-foreground">średnia ocena z matury</div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Jak działa Mentavo AI?
              </h2>
              <p className="text-xl text-muted-foreground">
                Twój osobisty tutor matematyki zawsze dostępny
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: MessageCircle,
                  title: "Chat z AI tutorem",
                  description: "Zadaj pytanie o każdej porze. AI wyjaśni krok po kroku każde zadanie matematyczne."
                },
                {
                  icon: Target,
                  title: "Spersonalizowane lekcje",
                  description: "Algorytm dostosowuje tempo i styl nauki do Twojego poziomu i potrzeb."
                },
                {
                  icon: BarChart3,
                  title: "Śledzenie postępów",
                  description: "Szczegółowe raporty pokazują mocne strony i obszary do poprawy."
                },
                {
                  icon: FlaskConical,
                  title: "Quiz diagnostyczny",
                  description: "Znajdź luki w wiedzy i otrzymaj spersonalizowany plan nauki."
                }
              ].map((feature, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Founding Benefits Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Dlaczego warto być w pierwszych 100?
              </h2>
              <p className="text-xl text-muted-foreground">
                Ekskluzywne korzyści tylko dla Founding Members
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Gift,
                  title: "Darmowy miesiąc Premium",
                  description: "Otrzymujesz pełny dostęp do Mentavo AI Premium na miesiąc za darmo (wartość 49 zł)",
                  value: "49 zł"
                },
                {
                  icon: Users,
                  title: "Wpływ na rozwój",
                  description: "Twoja opinia bezpośrednio wpłynie na nowe funkcje i kierunek rozwoju aplikacji",
                  value: "Bezcenne"
                },
                {
                  icon: Award,
                  title: "Status na zawsze",
                  description: "Odznaka 'Founding Member' widoczna w Twoim profilu przez cały czas",
                  value: "Prestiż"
                },
                {
                  icon: TrendingUp,
                  title: "Bonusy za polecenia",
                  description: "Otrzymujesz dodatkowe dni Premium za każdego poleconego znajomego",
                  value: "+3 dni"
                },
                {
                  icon: Shield,
                  title: "Ochrona ceny",
                  description: "Gwarantujemy, że nigdy nie zapłacisz więcej niż obecni użytkownicy",
                  value: "Gwarancja"
                },
                {
                  icon: Heart,
                  title: "Społeczność",
                  description: "Dostęp do ekskluzywnej grupy pierwszych użytkowników",
                  value: "Ekskluzywne"
                }
              ].map((benefit, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {benefit.value}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Kim jesteśmy i dlaczego możesz nam zaufać?
              </h2>
              <p className="text-xl text-muted-foreground">
                Mentavo AI to polska firma edukacyjna z misją demokratyzacji dostępu do wysokiej jakości edukacji
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <CardContent className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Nowoczesna technologia</h3>
                      <p className="text-sm text-muted-foreground">
                        Wykorzystujemy najnowsze modele AI do personalizacji nauki
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Bezpieczeństwo danych</h3>
                      <p className="text-sm text-muted-foreground">
                        Pełna zgodność z RODO i najwyższe standardy bezpieczeństwa
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Doświadczenie EdTech</h3>
                      <p className="text-sm text-muted-foreground">
                        Nasz zespół ma wieloletnie doświadczenie w technologiach edukacyjnych
                      </p>
                    </div>
                  </div>

                  <div className="text-center bg-muted/30 rounded-lg p-6">
                    <p className="text-lg mb-4">
                      <strong>Nasza misja:</strong> Sprawiamy, że każdy uczeń może osiągnąć sukces w matematyce, 
                      niezależnie od sytuacji finansowej rodziny czy dostępu do korepetycji.
                    </p>
                    <p className="text-muted-foreground">
                      Dołącz do nas w budowaniu przyszłości edukacji w Polsce.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Najczęściej zadawane pytania
              </h2>
              <p className="text-xl text-muted-foreground">
                Wszystko co musisz wiedzieć o programie Founding 100
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {[
                  {
                    question: "Co to jest Mentavo AI?",
                    answer: "Mentavo AI to inteligentna aplikacja edukacyjna, która zastępuje tradycyjne korepetycje z matematyki dla uczniów szkół średnich. Dzięki wykorzystaniu najnowszego modelu AI, aplikacja zapewnia indywidualne wsparcie edukacyjne 24/7, dostosowując się do tempa i stylu nauki każdego ucznia."
                  },
                  {
                    question: "Czy program Founding 100 to naprawdę za darmo?",
                    answer: "Tak! Jako Founding Member otrzymujesz całkowicie darmowy miesiąc Premium (wartość 49 zł). Po miesiącu możesz zdecydować, czy chcesz kontynuować za 49 zł miesięcznie, lub zrezygnować bez żadnych zobowiązań."
                  },
                  {
                    question: "Czy moje dane będą bezpieczne?",
                    answer: "Absolutnie tak. Jesteśmy w pełni zgodni z RODO i stosujemy najwyższe standardy bezpieczeństwa. Twoje dane są szyfrowane i nigdy nie są udostępniane osobom trzecim. Dodatkowo, jesteś polską firmą podlegającą polskiemu prawu."
                  },
                  {
                    question: "Co się stanie po wypełnieniu 100 miejsc?",
                    answer: "Po zapełnieniu wszystkich miejsc program Founding 100 zostanie zamknięty na zawsze. Nowi użytkownicy będą mogli skorzystać tylko z 7-dniowego okresu próbnego, bez dodatkowych korzyści ekskluzywnych dla pierwszych 100 członków."
                  },
                  {
                    question: "Jak mogę wpływać na rozwój aplikacji?",
                    answer: "Jako Founding Member będziesz mieć bezpośredni dostęp do zespołu deweloperskiego poprzez specjalny kanał komunikacji. Twoje sugestie, zgłaszane problemy i pomysły na nowe funkcje będą miały priorytet w naszym roadmapie rozwoju."
                  },
                  {
                    question: "Czy aplikacja jest odpowiednia dla wszystkich poziomów?",
                    answer: "Tak! Mentavo AI automatycznie dostosowuje się do poziomu ucznia - od podstaw matematyki po zaawansowane tematy maturalne. AI analizuje Twoje odpowiedzi i dostosowuje trudność oraz styl wyjaśnień."
                  },
                  {
                    question: "Co jeśli nie będę zadowolony z aplikacji?",
                    answer: "Oferujemy 30-dniową gwarancję zwrotu pieniędzy bez zadawania pytań. Dodatkowo, jako Founding Member masz miesiąc Premium za darmo, więc możesz w pełni przetestować aplikację bez ryzyka finansowego."
                  },
                  {
                    question: "Kiedy aplikacja będzie dostępna?",
                    answer: "Aplikacja jest już dostępna! Po rejestracji w programie Founding 100 otrzymasz natychmiastowy dostęp do pełnej wersji Mentavo AI Premium. Możesz rozpocząć naukę już dziś."
                  }
                ].map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-lg">
                    <AccordionTrigger className="px-6 text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
          <div className="container text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                <Clock className="w-4 h-4" />
                Miejsca szybko się zapełniają!
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-bold">
                Nie przegap tej szansy
              </h2>
              
              <p className="text-xl opacity-90">
                Dołącz do Founding 100 już dziś i otrzymaj darmowy miesiąc Premium 
                oraz wpływ na przyszłość edukacji w Polsce.
              </p>

              <div className="bg-white/10 rounded-2xl p-6 max-w-md mx-auto">
                <div className="text-4xl font-bold mb-2">{spotsLeft}</div>
                <div>wolnych miejsc z 100</div>
                <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-300" 
                    style={{width: `${((100 - spotsLeft) / 100) * 100}%`}}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleJoinNow}
                  disabled={isLoading || spotsLeft === 0}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-xl font-bold px-12 py-6 h-auto"
                >
                  {isLoading ? "Dołączam..." : spotsLeft === 0 ? "Brak miejsc" : "Zostań Founding Member"}
                </Button>
                
                <p className="text-sm opacity-75">
                  ✓ Bez zobowiązań ✓ Możesz zrezygnować w każdej chwili ✓ 30-dniowa gwarancja zwrotu
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-background border-t">
          <div className="container text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-lg font-semibold">Mentavo AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Mentavo AI. Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}