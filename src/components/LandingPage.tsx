import { BookOpen, GraduationCap, Layers, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-education.jpg";
import { logEvent } from "@/lib/logger";

export function LandingPage() {
  const handleCtaClick = (action: string) => {
    logEvent('landing_cta_click', { action });
  };

  return (
    <div className="font-sans text-foreground bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary to-primary/80 text-primary-foreground text-center py-20 px-6 relative overflow-hidden">
        <img
          src={heroImage}
          alt="Edukacja"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Twój prywatny nauczyciel matematyki 24/7
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 font-medium">
            Ucz się we własnym tempie – AI tłumaczy krok po kroku, powtarza, gdy tego potrzebujesz
            i dopasowuje się do Twojego stylu nauki. Krótkie lekcje, szybkie powtórki i pełna podstawa
            programowa w jednym miejscu.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button 
              asChild 
              variant="secondary" 
              size="lg"
              onClick={() => handleCtaClick('start_ai_tutor')}
            >
              <Link to="/chat">
                Rozpocznij lekcję z AI Tutorem
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="bg-secondary text-secondary-foreground border-secondary-foreground/20 hover:bg-secondary/80"
              onClick={() => handleCtaClick('discover_study_learn')}
            >
              <Link to="/lessons">
                Odkryj Study & Learn
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Tutor Section */}
      <section className="py-16 px-6 text-center max-w-5xl mx-auto">
        <GraduationCap className="w-12 h-12 mx-auto text-primary mb-6" />
        <h2 className="text-3xl font-bold mb-6">Twój nauczyciel, który zawsze ma czas</h2>
        <p className="text-lg mb-8 max-w-3xl mx-auto font-medium text-muted-foreground">
          AI Tutor dostosowuje się do Ciebie:
        </p>
        <ul className="text-left max-w-xl mx-auto space-y-4 text-lg">
          <li>• tłumaczy zadania krok po kroku w prosty sposób</li>
          <li>• dopasowuje poziom trudności do Twojej wiedzy</li>
          <li>• pomaga szybko przygotować się do sprawdzianu czy kartkówki</li>
        </ul>
        <Button 
          asChild 
          className="mt-8" 
          size="lg"
          onClick={() => handleCtaClick('see_ai_tutor_demo')}
        >
          <Link to="/chat">
            Zobacz, jak działa AI Tutor
          </Link>
        </Button>
      </section>

      {/* Study & Learn Section */}
      <section className="bg-muted py-16 px-6 text-center">
        <BookOpen className="w-12 h-12 mx-auto text-secondary mb-6" />
        <h2 className="text-3xl font-bold mb-6">Cała matematyka liceum zawsze pod ręką</h2>
        <p className="text-lg mb-8 max-w-3xl mx-auto font-medium text-muted-foreground">
          Study & Learn to interaktywna baza tematów zgodna z programem MEN:
        </p>
        <ul className="text-left max-w-xl mx-auto space-y-4 text-lg">
          <li>• wszystkie działy – od równań po całki</li>
          <li>• czytelny progres bar i raporty, które pokazują, co już umiesz</li>
          <li>• krótkie lekcje i quizy zamiast długich, nudnych samouczków</li>
        </ul>
        <Button 
          asChild 
          variant="secondary" 
          className="mt-8" 
          size="lg"
          onClick={() => handleCtaClick('check_progress')}
        >
          <Link to="/progress">
            Sprawdź swoje postępy
          </Link>
        </Button>
      </section>

      {/* Why Us Section */}
      <section className="py-16 px-6 text-center max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-10">Dlaczego uczniowie kochają tę aplikację?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card shadow-md rounded-2xl p-6 hover:shadow-lg transition border">
            <Layers className="w-10 h-10 text-primary mb-4" />
            <h3 className="font-semibold text-xl mb-3">Uczysz się tak, jak lubisz</h3>
            <p className="text-muted-foreground">Aplikacja dopasowuje tempo i sposób tłumaczenia do Ciebie.</p>
          </div>
          <div className="bg-card shadow-md rounded-2xl p-6 hover:shadow-lg transition border">
            <GraduationCap className="w-10 h-10 text-secondary mb-4" />
            <h3 className="font-semibold text-xl mb-3">Dostęp zawsze i wszędzie</h3>
            <p className="text-muted-foreground">Na telefonie i komputerze, bez ograniczeń czasowych.</p>
          </div>
          <div className="bg-card shadow-md rounded-2xl p-6 hover:shadow-lg transition border">
            <BookOpen className="w-10 h-10 text-accent mb-4" />
            <h3 className="font-semibold text-xl mb-3">Pełna podstawa programowa</h3>
            <p className="text-muted-foreground">Wszystko od podstaw po rozszerzenie, w jednym miejscu.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-accent/10 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Pełen dostęp za jedną niską cenę</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto font-medium text-muted-foreground">
          49,99 zł miesięcznie → nielimitowane lekcje, szybkie powtórki i dostęp do wszystkich tematów.
          To mniej niż koszt jednej godziny korepetycji – a korzystasz ile chcesz, kiedy chcesz.
        </p>
        <Button 
          size="lg" 
          className="px-8 py-4 text-lg"
          onClick={() => handleCtaClick('start_trial')}
        >
          Rozpocznij darmowy okres próbny
        </Button>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center">Najczęściej zadawane pytania</h2>
        <div className="space-y-6 text-lg">
          <div className="bg-card rounded-2xl shadow-md p-6 border">
            <h3 className="font-semibold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Czy to zastępuje nauczyciela?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Aplikacja działa jak osobisty przewodnik. Prowadzi Cię krok po kroku, sprawdza postępy i pokazuje, co musisz powtórzyć.
            </p>
          </div>
          <div className="bg-card rounded-2xl shadow-md p-6 border">
            <h3 className="font-semibold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Czy działa na telefonie?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Tak – działa w przeglądarce na komputerze i telefonie. Nie musisz nic instalować.
            </p>
          </div>
          <div className="bg-card rounded-2xl shadow-md p-6 border">
            <h3 className="font-semibold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Czy oprócz matematyki są inne przedmioty?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Na początek matematyka. Wkrótce dodamy fizykę, chemię i biologię.
            </p>
          </div>
          <div className="bg-card rounded-2xl shadow-md p-6 border">
            <h3 className="font-semibold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Czy potrzebuję karty płatniczej do darmowego triala?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Nie. Rejestrujesz się i korzystasz przez 7 dni bez żadnych zobowiązań.
            </p>
          </div>
          <div className="bg-card rounded-2xl shadow-md p-6 border">
            <h3 className="font-semibold flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Czy mogę zobaczyć raporty postępów?
            </h3>
            <p className="mt-2 text-muted-foreground">
              Tak – każdy uczeń ma panel z procentami opanowania materiału.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted-foreground text-muted py-10 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-4">
          <p className="text-sm">© 2025 AI Tutor. Wszelkie prawa zastrzeżone.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:underline">O nas</a>
            <a href="#" className="hover:underline">Kontakt</a>
            <a href="#" className="hover:underline">Polityka prywatności</a>
          </div>
        </div>
      </footer>
    </div>
  );
}