import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Flame, Users, Star, Gift, ChevronRight } from "lucide-react";

export function FoundingLandingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [membersCount, setMembersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch current members count
    const fetchMembersCount = async () => {
      const { data, error } = await supabase.rpc('get_founding_members_count');
      if (data && !error) {
        setMembersCount(data);
      }
    };
    
    fetchMembersCount();
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

    if (membersCount >= 100) {
      toast({
        title: "Brak miejsc",
        description: "Niestety, wszystkie 100 miejsc zostało już zajętych",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.from('founding_members').insert({
        user_id: user.id,
        email: user.email || '',
        registration_source: 'landing_page',
        device_info: {
          userAgent: navigator.userAgent,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height
        }
      });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Już jesteś w programie!",
            description: "Jesteś już członkiem Founding 100",
            variant: "default"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Gratulacje! 🎉",
          description: "Dołączyłeś do Founding 100! Sprawdź swoją skrzynkę mailową.",
        });
        // Refresh count
        setMembersCount(prev => prev + 1);
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

  const spotsLeft = Math.max(0, 100 - membersCount);

  return (
    <>
      <Seo 
        title="Dołącz do Founding 100 - Mentavo AI"
        description="Wyjątkowa grupa uczniów i rodziców, którzy jako pierwsi testują Mentavo AI i tworzą przyszłość nauki matematyki. Darmowy miesiąc Premium!"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SpecialOffer",
          "name": "Founding 100 Program - Mentavo AI",
          "description": "Ekskluzywny program dla pierwszych 100 użytkowników Mentavo AI",
          "validThrough": "2025-12-31",
          "url": window.location.href
        }}
      />
      
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
              Wyjątkowa grupa uczniów i rodziców, którzy jako pierwsi testują Mentavo AI 
              i tworzą przyszłość nauki matematyki.
            </p>

            {/* Urgency Counter */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold">
                <Flame className="w-5 h-5" />
                <span>Zostało tylko {spotsLeft} miejsc!</span>
              </div>
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
                {[
                  { icon: Gift, text: "Darmowy miesiąc Premium", color: "text-success" },
                  { icon: Users, text: "Wpływ na rozwój aplikacji", color: "text-primary" },
                  { icon: Star, text: "Status Foundera na zawsze", color: "text-secondary" },
                  { icon: ChevronRight, text: "+3 dni za polecenie znajomego", color: "text-warning" }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                    <div className={`${benefit.color} bg-current/10 p-2 rounded-lg`}>
                      <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                    </div>
                    <span className="text-foreground font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Process Section */}
        <section className="px-4 py-8">
          <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
            Jak to działa?
          </h2>
          
          <div className="space-y-4">
            {[
              "Rejestrujesz się → Dostęp do AI",
              "Testujesz → Dzielisz się opinią",
              "Zapraszasz znajomych → Bonusy",
              "Twój feedback → Nowe funkcje"
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-card/30 rounded-xl border border-primary/5">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {index + 1}
                </div>
                <span className="text-foreground font-medium">{step}</span>
              </div>
            ))}
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
            
            <Button 
              onClick={handleJoinNow}
              disabled={isLoading || spotsLeft === 0}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                "Dołączam..."
              ) : spotsLeft === 0 ? (
                "Brak miejsc"
              ) : (
                "Dołącz teraz"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Członek #{membersCount + 1} z 100
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}