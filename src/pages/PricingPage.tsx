import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { logEvent } from "@/lib/logger";
import {
  Check,
  X,
  Zap,
  Brain,
  Clock,
  MessageCircle,
  BarChart3,
  Shield,
  Gift,
  ArrowLeft,
  Crown,
  Sparkles,
} from "lucide-react";

const PricingPage = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTrial = () => {
    logEvent('pricing_cta_click', { action: 'start_trial', logged_in: !!user });
    navigate('/auth');
  };

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    logEvent('pricing_cta_click', { action: 'upgrade', current_plan: subscription?.subscription_type });

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'paid' }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się otworzyć płatności. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { name: "AI Tutor dostępny 24/7", free: true, paid: true, icon: MessageCircle },
    { name: "Spersonalizowane wyjaśnienia", free: true, paid: true, icon: Brain },
    { name: "Śledzenie postępu", free: true, paid: true, icon: BarChart3 },
    { name: "Podstawa programowa liceum", free: true, paid: true, icon: Check },
    { name: "Limit tokenów", free: "25 000", paid: "Bez limitu", icon: Zap },
    { name: "Priorytetowe wsparcie", free: false, paid: true, icon: Shield },
    { name: "Zaawansowana analityka", free: false, paid: true, icon: Sparkles },
  ];

  const faqs = [
    {
      question: "Czy mogę wypróbować za darmo?",
      answer: "Tak! Oferujemy 7-dniowy darmowy okres próbny z pełnym dostępem do wszystkich funkcji. Nie wymagamy karty kredytowej do rejestracji."
    },
    {
      question: "Co się stanie po zakończeniu trialu?",
      answer: "Po zakończeniu 7-dniowego trialu Twoje konto przejdzie na plan darmowy z ograniczeniem 25 000 tokenów. Możesz kontynuować naukę, ale z ograniczeniami. W każdej chwili możesz wykupić subskrypcję."
    },
    {
      question: "Czy mogę anulować subskrypcję?",
      answer: "Tak, możesz anulować subskrypcję w dowolnym momencie. Dostęp do funkcji Premium pozostanie aktywny do końca opłaconego okresu rozliczeniowego."
    },
    {
      question: "Jakie metody płatności akceptujecie?",
      answer: "Akceptujemy karty kredytowe i debetowe (Visa, Mastercard, American Express) oraz BLIK. Płatności są obsługiwane przez Stripe — bezpiecznego dostawcę płatności."
    },
    {
      question: "Czy dane mojego dziecka są bezpieczne?",
      answer: "Absolutnie tak. Jesteśmy w pełni zgodni z RODO. Dane są szyfrowane i nigdy nie są udostępniane osobom trzecim. Jako polska firma podlegamy polskiemu prawu."
    },
    {
      question: "Ile kosztują tradycyjne korepetycje?",
      answer: "Średnia cena korepetycji z matematyki to 100–150 PLN/h. Przy 4–6 godzinach miesięcznie to 400–900 PLN. Mentavo AI za 49,99 PLN/mies. daje nieograniczony dostęp 24/7."
    },
  ];

  const isPaidUser = subscription?.subscription_type === 'paid' || subscription?.subscription_type === 'super';

  return (
    <>
      <Seo
        title="Cennik — Mentavo AI | Tutor matematyki"
        description="Sprawdź cennik Mentavo AI. 7 dni za darmo, potem tylko 49,99 zł miesięcznie. Nieograniczony dostęp do AI tutora matematyki 24/7."
        canonical="https://mentavo.pl/pricing"
      />

      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Strona główna
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="font-semibold">Mentavo AI</span>
            </Link>
            {user ? (
              <Link to="/dashboard">
                <Button variant="outline" size="sm">Panel ucznia</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">Zaloguj się</Button>
              </Link>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Gift className="w-3 h-3 mr-1" />
              7 dni za darmo
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Prosty i przejrzysty cennik
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Jeden plan, pełny dostęp. Zacznij za darmo i przekonaj się, jak Mentavo AI może pomóc w nauce matematyki.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Trial Card */}
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Darmowy trial
                  </CardTitle>
                  <CardDescription>Wypróbuj bez zobowiązań</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">0 zł</span>
                      <span className="text-muted-foreground">/ 7 dni</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pełny dostęp przez tydzień
                    </p>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Pełny dostęp do AI Tutora</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>25 000 tokenów</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Wszystkie materiały</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Bez karty kredytowej</span>
                    </li>
                  </ul>

                  <Button
                    onClick={handleStartTrial}
                    variant="outline"
                    className="w-full"
                    disabled={!!user}
                  >
                    {user ? "Masz już konto" : "Rozpocznij trial"}
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Card */}
              <Card className="relative border-primary shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Najpopularniejszy
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Premium
                  </CardTitle>
                  <CardDescription>Pełny dostęp bez ograniczeń</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">49,99 zł</span>
                      <span className="text-muted-foreground">/ miesiąc</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Anuluj w dowolnym momencie
                    </p>
                  </div>

                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="font-medium">Nieograniczone tokeny</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>AI Tutor 24/7</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Zaawansowana analityka</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Priorytetowe wsparcie</span>
                    </li>
                  </ul>

                  <Button
                    onClick={handleUpgrade}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    disabled={isLoading || isPaidUser}
                  >
                    {isPaidUser ? (
                      "Masz już Premium"
                    ) : isLoading ? (
                      "Przekierowywanie..."
                    ) : user ? (
                      "Kup Premium"
                    ) : (
                      "Zacznij z Premium"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Porównanie planów</h2>

            <div className="max-w-3xl mx-auto">
              <div className="bg-background rounded-xl border overflow-hidden">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 font-semibold text-sm">
                  <div>Funkcja</div>
                  <div className="text-center">Darmowy</div>
                  <div className="text-center">Premium</div>
                </div>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-3 gap-4 p-4 items-center ${
                      index % 2 === 0 ? "" : "bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <feature.icon className="w-4 h-4 text-muted-foreground" />
                      {feature.name}
                    </div>
                    <div className="text-center">
                      {typeof feature.free === "boolean" ? (
                        feature.free ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{feature.free}</span>
                      )}
                    </div>
                    <div className="text-center">
                      {typeof feature.paid === "boolean" ? (
                        feature.paid ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-primary">{feature.paid}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Korepetycje vs Mentavo AI
              </h2>
              <p className="text-muted-foreground mb-8">
                Zobacz, ile możesz zaoszczędzić z Mentavo AI
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="text-left">
                  <CardHeader>
                    <CardTitle className="text-destructive">Tradycyjne korepetycje</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Cena za godzinę</span>
                      <span className="font-semibold">100–150 PLN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Godziny miesięcznie (4–6h)</span>
                      <span className="font-semibold">400–900 PLN</span>
                    </div>
                    <div className="flex justify-between text-destructive">
                      <span>Dostępność</span>
                      <span className="font-semibold">Ograniczona</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-left border-primary">
                  <CardHeader>
                    <CardTitle className="text-primary">Mentavo AI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Cena miesięczna</span>
                      <span className="font-semibold text-primary">49,99 PLN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Oszczędność miesięcznie</span>
                      <span className="font-semibold text-green-600">350–850 PLN</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Dostępność</span>
                      <span className="font-semibold">24/7</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Często zadawane pytania
            </h2>

            <div className="max-w-2xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-background rounded-lg border"
                  >
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

        {/* Final CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Gotowy, aby zacząć?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Dołącz do uczniów, którzy już poprawiają swoje wyniki z matematyki dzięki Mentavo AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button
                  onClick={handleUpgrade}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  disabled={isLoading || isPaidUser}
                >
                  {isPaidUser ? "Masz już Premium" : "Kup Premium — 49,99 PLN/mies."}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleStartTrial}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  >
                    Zacznij 7-dniowy trial
                  </Button>
                  <Button onClick={handleUpgrade} variant="outline" size="lg">
                    Od razu Premium
                  </Button>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Bez zobowiązań — anuluj kiedy chcesz
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="font-semibold">Mentavo AI</span>
            </div>
            <div className="flex justify-center gap-4 mb-4">
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
                Polityka prywatności
              </Link>
              <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
                Regulamin
              </Link>
            </div>
            <p>© 2026 Mentavo AI. Wszystkie prawa zastrzeżone.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PricingPage;
