import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Flame, Users, Star, Gift, ChevronRight } from "lucide-react";
export function FoundingLandingPage() {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [membersCount, setMembersCount] = useState<number>(0);
  const [spotsLeft, setSpotsLeft] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const {
          data,
          error
        } = await supabase.functions.invoke('founding-registration', {
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
  const handleJoinNow = async () => {
    if (!user) {
      toast({
        title: "Zaloguj się",
        description: "Musisz się zalogować, aby dołączyć do Founding 100",
        variant: "destructive"
      });
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
      const {
        data,
        error
      } = await supabase.functions.invoke('founding-registration', {
        body: {
          email: user.email || '',
          name: user.user_metadata?.name || '',
          deviceInfo: {
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
          }
        }
      });
      if (error) {
        throw error;
      }
      if (data?.success) {
        toast({
          title: "Gratulacje! 🎉",
          description: "Dołączyłeś do Founding 100! Sprawdź swoją skrzynkę mailową."
        });
        setMembersCount(data.totalMembers || 0);
        setSpotsLeft(data.slotsLeft || 0);
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
            
            {/* CTA after urgency message */}
            <div className="mt-6">
              <Button onClick={handleJoinNow} disabled={isLoading || spotsLeft === 0} className={`w-full h-12 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300 ${spotsLeft === 3 ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse" : spotsLeft < 3 ? "bg-muted hover:bg-muted/80 text-muted-foreground" : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"}`}>
                {isLoading ? "Dołączam..." : spotsLeft === 0 ? "Brak miejsc" : spotsLeft < 3 ? "Zapisz się na Free Trial" : spotsLeft === 3 ? "DOŁĄCZ TERAZ!" : "Dołącz teraz"}
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
                Dlaczego warto?
              </h2>
              
              <div className="space-y-4">
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
              }].map((benefit, index) => <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                    <div className={`${benefit.color} bg-current/10 p-2 rounded-lg`}>
                      <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                    </div>
                    <span className="text-foreground font-medium">{benefit.text}</span>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA before "Jak to działa" */}
        <section className="px-4 py-4">
          <Button onClick={handleJoinNow} disabled={isLoading || spotsLeft === 0} className={`w-full h-12 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300 ${spotsLeft === 3 ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse" : spotsLeft < 3 ? "bg-muted hover:bg-muted/80 text-muted-foreground" : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"}`}>
            {isLoading ? "Dołączam..." : spotsLeft === 0 ? "Brak miejsc" : spotsLeft < 3 ? "Zapisz się na Free Trial" : spotsLeft === 3 ? "DOŁĄCZ TERAZ!" : "Dołącz teraz"}
          </Button>
        </section>

        {/* Process Section */}
        <section className="px-4 py-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
            Jak to działa?
          </h2>
          
          <div className="space-y-4">
            {["Rejestrujesz się → Dostęp do AI", "Testujesz → Dzielisz się opinią", "Zapraszasz znajomych → Bonusy", "Twój feedback → Nowe funkcje"].map((step, index) => <div key={index} className="flex items-center gap-4 p-4 bg-card/30 rounded-xl border border-primary/5">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
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
            
            <Button onClick={handleJoinNow} disabled={isLoading || spotsLeft === 0} className={`w-full h-14 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 transition-all duration-300 ${spotsLeft === 3 ? "h-16 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white animate-pulse" : spotsLeft < 3 ? "bg-muted hover:bg-muted/80 text-muted-foreground" : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"}`}>
              {isLoading ? "Dołączam..." : spotsLeft === 0 ? "Brak miejsc" : spotsLeft < 3 ? "Zapisz się na Free Trial" : spotsLeft === 3 ? "DOŁĄCZ TERAZ - OSTATNIE MIEJSCA!" : "Dołącz teraz"}
            </Button>

            <div className="text-center">
              
            </div>
          </div>
        </section>
      </div>
    </>;
}