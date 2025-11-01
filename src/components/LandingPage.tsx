import { useEffect } from "react";
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
} from "lucide-react";
import mentavoLogo from "@/assets/mentavo-logo-full.png";
import shapes3d from "@/assets/mentavo-3d-shapes.svg";
import { saveReferralCode } from "@/lib/referralStorage";
import { logEvent } from "@/lib/logger";

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      console.log("[LandingPage] Detected referral code, saving:", refCode);
      saveReferralCode(refCode);
    }
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
                <Button onClick={handleStartTrial}>
                  Bezpłatny dostęp przez 7 dni
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Zaufany przez tysiące uczniów
            </div>
            
            <h1 className="font-poppins font-bold text-5xl lg:text-6xl text-neutral leading-tight">
              AI Tutor Matematyczny
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Spersonalizowana nauka matematyki z AI, dostępna 24/7. 
              Osiągnij lepsze wyniki szybciej i taniej niż z tradycyjnymi korepetycjami.
            </p>

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

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
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
