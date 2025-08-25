import { BookOpen, GraduationCap, Layers, HelpCircle, Sparkles, Users, Trophy, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-education.jpg";
import { logEvent } from "@/lib/logger";
export function LandingPage() {
  const handleCtaClick = (action: string) => {
    logEvent('landing_cta_click', {
      action
    });
  };
  return <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Bar */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-6 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">
            AI Tutor
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="outline" className="hover-lift">
              Zaloguj się
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="shadow-primary hover-lift" onClick={() => handleCtaClick('header_signup')}>
              Rozpocznij za darmo
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Elegant background */}
        <div className="absolute inset-0 gradient-elegant opacity-50"></div>
        
        {/* Subtle geometric elements */}
        <div className="absolute top-32 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-float" style={{
        animationDelay: '3s'
      }}></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-border shadow-card animate-fadeIn">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-muted-foreground font-medium">Najnowsza technologia AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-foreground leading-tight animate-fadeIn" style={{
          animationDelay: '0.2s'
        }}>
            Twój <span className="text-primary">osobisty nauczyciel</span><br />
            matematyki zawsze pod ręką
          </h1>
          
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-12 text-muted-foreground leading-relaxed animate-fadeIn" style={{
          animationDelay: '0.4s'
        }}>
            Ucz się matematyki we własnym tempie z AI, które rozumie Twoje potrzeby. 
            Personalizowane wyjaśnienia, interaktywne zadania i stały dostęp do pomocy.
          </p>
          
          
          {/* Główne opcje nauki */}
          <div className="max-w-4xl mx-auto animate-fadeIn" style={{
          animationDelay: '0.6s'
        }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chat z AI Tutorem */}
              <div className="group relative p-8 rounded-2xl bg-card border border-border hover-lift shadow-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Chat z AI Tutorem</h3>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Zadaj pytanie, wyślij zdjęcie zadania lub po prostu powiedz czego nie rozumiesz. 
                  AI pomoże Ci krok po kroku.
                </p>
                <Button asChild className="w-full shadow-primary" onClick={() => handleCtaClick('start_ai_tutor')}>
                  <Link to="/auth">
                    Rozpocznij rozmowę
                  </Link>
                </Button>
              </div>

              {/* Study & Learn */}
              <div className="group relative p-8 rounded-2xl bg-card border border-border hover-lift shadow-card">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Study & Learn</h3>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Systematyczna nauka z AI. Wybierz temat, rozwiązuj zadania dopasowane do Twojego poziomu
                  i śledź postępy.
                </p>
                <Button asChild variant="outline" className="w-full hover-lift" onClick={() => handleCtaClick('discover_study_learn')}>
                  <Link to="/auth">
                    Zacznij naukę
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Stats badges */}
          <div className="flex justify-center gap-8 mt-16 flex-wrap animate-fadeIn" style={{
          animationDelay: '0.8s'
        }}>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-border shadow-card">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-success" />
                <span className="text-foreground font-semibold">500+ zadań</span>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-border shadow-card">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-warning" />
                <span className="text-foreground font-semibold">Natychmiastowe feedback</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Import Section */}
      

      {/* AI Tutor Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl mb-8 shadow-primary animate-float">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Twój nauczyciel, który zawsze ma czas
          </h2>
          
          <p className="text-xl mb-16 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            AI Tutor dostosowuje się do Ciebie i Twojego stylu nauki
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card rounded-2xl p-8 border border-border hover-lift shadow-card">
              <div className="w-14 h-14 bg-gradient-to-br from-success to-success rounded-xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-semibold text-xl mb-4 text-foreground">Krok po kroku</h3>
              <p className="text-muted-foreground">Tłumaczy zadania w prosty i zrozumiały sposób</p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 border border-border hover-lift shadow-card">
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent rounded-xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-xl mb-4 text-foreground">Dopasowany poziom</h3>
              <p className="text-muted-foreground">Dostosowuje trudność do Twojej wiedzy</p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 border border-border hover-lift shadow-card">
              <div className="w-14 h-14 bg-gradient-to-br from-warning to-warning rounded-xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-xl mb-4 text-foreground">Szybka pomoc</h3>
              <p className="text-muted-foreground">Przygotowuje do sprawdzianów i egzaminów</p>
            </div>
          </div>
          
          <Button asChild className="shadow-primary hover-lift text-lg px-8 py-4" size="lg" onClick={() => handleCtaClick('see_ai_tutor_demo')}>
            <Link to="/auth">
              Zobacz, jak działa AI Tutor
            </Link>
          </Button>
        </div>
      </section>

      {/* Study & Learn Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-accent rounded-2xl mb-8 shadow-accent animate-float" style={{
          animationDelay: '1s'
        }}>
            <BookOpen className="w-8 h-8 text-accent-foreground" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Cała matematyka liceum w jednym miejscu
          </h2>
          
          <p className="text-xl mb-16 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            Study & Learn to interaktywna baza tematów zgodna z programem MEN
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card rounded-2xl p-8 border border-border hover-lift shadow-card">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">📖</span>
              </div>
              <h3 className="font-bold text-xl mb-4 text-foreground">Wszystkie działy</h3>
              <p className="text-muted-foreground text-lg">Od równań po całki - kompletny materiał</p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 border border-border hover-lift shadow-card">
              <div className="w-16 h-16 bg-gradient-to-br from-success to-success rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="font-bold text-xl mb-4 text-foreground">Czytelny progres</h3>
              <p className="text-muted-foreground text-lg">Raporty pokazują co już umiesz</p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 border border-border hover-lift shadow-card">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-bold text-xl mb-4 text-foreground">Krótkie lekcje</h3>
              <p className="text-muted-foreground text-lg">Quizy zamiast nudnych podręczników</p>
            </div>
          </div>
          
          <Button asChild variant="outline" className="hover-lift text-lg px-8 py-4" size="lg" onClick={() => handleCtaClick('check_progress')}>
            <Link to="/auth">
              Sprawdź swoje postępy
            </Link>
          </Button>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-foreground">
            Dlaczego uczniowie wybierają AI Tutor?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-card rounded-3xl p-8 border border-border hover-lift shadow-card">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:animate-float">
                <Layers className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-2xl mb-4 text-foreground">Uczysz się tak, jak lubisz</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">Aplikacja dopasowuje tempo i sposób tłumaczenia do Ciebie.</p>
            </div>
            
            <div className="group bg-card rounded-3xl p-8 border border-border hover-lift shadow-card">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:animate-float" style={{
              animationDelay: '0.5s'
            }}>
                <GraduationCap className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="font-bold text-2xl mb-4 text-foreground">Dostęp zawsze i wszędzie</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">Na telefonie i komputerze, bez ograniczeń czasowych.</p>
            </div>
            
            <div className="group bg-card rounded-3xl p-8 border border-border hover-lift shadow-card">
              <div className="w-16 h-16 bg-gradient-to-br from-success to-success rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:animate-float" style={{
              animationDelay: '1s'
            }}>
                <BookOpen className="w-8 h-8 text-success-foreground" />
              </div>
              <h3 className="font-bold text-2xl mb-4 text-foreground">Pełna podstawa programowa</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">Wszystko od podstaw po rozszerzenie, w jednym miejscu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-gradient-elegant relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-2xl"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">
            Pełen dostęp za jedną niską cenę
          </h2>
          
          <div className="bg-card rounded-3xl p-12 border border-border shadow-primary backdrop-blur-sm">
            <div className="text-6xl md:text-7xl font-black mb-4 text-primary">
              49,99 zł
            </div>
            <p className="text-lg text-muted-foreground mb-2">miesięcznie</p>
            
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
              Nielimitowane lekcje, szybkie powtórki i dostęp do wszystkich tematów.
              To mniej niż koszt jednej godziny korepetycji – a korzystasz ile chcesz, kiedy chcesz.
            </p>
            
            <Button asChild size="lg" className="shadow-primary hover-lift text-xl px-12 py-6 font-bold" onClick={() => handleCtaClick('start_trial')}>
              <Link to="/auth">
                <span className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Rozpocznij darmowy okres próbny
                  <span className="bg-accent/20 rounded-full px-3 py-1 text-sm">7 dni</span>
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center text-foreground">
          Najczęściej zadawane pytania
        </h2>
        
        <div className="space-y-6">
          {[{
          question: "Czy to zastępuje nauczyciela?",
          answer: "Aplikacja działa jak osobisty przewodnik. Prowadzi Cię krok po kroku, sprawdza postępy i pokazuje, co musisz powtórzyć."
        }, {
          question: "Czy działa na telefonie?",
          answer: "Tak – działa w przeglądarce na komputerze i telefonie. Nie musisz nic instalować."
        }, {
          question: "Czy oprócz matematyki są inne przedmioty?",
          answer: "Na początek matematyka. Wkrótce dodamy fizykę, chemię i biologię."
        }, {
          question: "Czy potrzebuję karty płatniczej do darmowego triala?",
          answer: "Nie. Rejestrujesz się i korzystasz przez 7 dni bez żadnych zobowiązań."
        }, {
          question: "Czy mogę zobaczyć raporty postępów?",
          answer: "Tak – każdy uczeń ma panel z procentami opanowania materiału."
        }].map((faq, index) => <div key={index} className="group bg-card rounded-2xl p-8 border border-border hover-lift shadow-card">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-3 text-foreground">
                <HelpCircle className="w-6 h-6 text-accent group-hover:animate-float" />
                {faq.question}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed pl-9">
                {faq.answer}
              </p>
            </div>)}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-elegant opacity-30"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">AI Tutor</span>
            </div>
          </div>
          <p className="text-muted-foreground mb-8">© 2025 AI Tutor. Wszelkie prawa zastrzeżone.</p>
          <div className="flex justify-center gap-8 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors hover:underline">O nas</a>
            <a href="#" className="hover:text-primary transition-colors hover:underline">Kontakt</a>
            <a href="#" className="hover:text-primary transition-colors hover:underline">Polityka prywatności</a>
          </div>
        </div>
      </footer>
    </div>;
}