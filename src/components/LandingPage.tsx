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
  return <div className="font-sans text-foreground bg-background overflow-hidden">
      {/* Navigation Bar */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-sm border-b border-border/20">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Tutor
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="outline" className="hover-scale">
              Zaloguj się
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="button-glow hover-scale" onClick={() => handleCtaClick('header_signup')}>
              Darmowy dostęp
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-accent">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-accent/20 rounded-lg rotate-45 animate-float" style={{
        animationDelay: '2s'
      }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-success/20 rounded-full animate-float" style={{
        animationDelay: '4s'
      }}></div>
        
        {/* Hero image with overlay */}
        <img src={heroImage} alt="Edukacja" className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-warning" />
            <span className="text-primary-foreground font-medium">Najnowsza technologia AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-primary-foreground leading-tight animate-fadeIn" style={{
          animationDelay: '0.2s'
        }}>
            Twój prywatny <span className="bg-gradient-to-r from-warning to-success bg-clip-text text-transparent">nauczyciel matematyki</span> 24/7
          </h1>
          
          <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-10 font-medium text-primary-foreground/90 leading-relaxed animate-fadeIn" style={{
          animationDelay: '0.4s'
        }}>
            Ucz się we własnym tempie – AI tłumaczy krok po kroku, powtarza, gdy tego potrzebujesz
            i dopasowuje się do Twojego stylu nauki. Krótkie lekcje, szybkie powtórki i pełna podstawa
            programowa w jednym miejscu.
          </p>
          
          
          {/* Główne opcje nauki */}
          <div className="max-w-4xl mx-auto animate-fadeIn" style={{
          animationDelay: '0.6s'
        }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chat z AI Tutorem */}
              <div className="group relative p-6 rounded-xl bg-gradient-to-br from-white/20 via-white/10 to-transparent border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="text-lg font-semibold text-primary-foreground">Chat z AI Tutorem</h3>
                  </div>
                  <p className="text-sm text-primary-foreground/80 mb-4 leading-relaxed">
                    Zadaj pytanie, wyślij zdjęcie zadania lub po prostu powiedz czego nie rozumiesz. 
                    AI pomoże Ci krok po kroku.
                  </p>
                  <Button asChild className="w-full bg-warning text-warning-foreground hover:bg-warning/90 group-hover:shadow-warning transition-all" onClick={() => handleCtaClick('start_ai_tutor')}>
                    <Link to="/auth">
                      Rozpocznij rozmowę
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Study & Learn */}
              <div className="group relative p-6 rounded-xl bg-gradient-to-br from-white/20 via-white/10 to-transparent border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <BookOpen className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-primary-foreground">Study & Learn</h3>
                  </div>
                  <p className="text-sm text-primary-foreground/80 mb-4 leading-relaxed">
                    Systematyczna nauka z AI. Wybierz temat, rozwiązuj zadania dopasowane do Twojego poziomu
                    i śledź postępy.
                  </p>
                  <Button asChild variant="outline" className="w-full bg-white/10 text-primary-foreground border-white/30 hover:bg-white/20 group-hover:shadow-accent transition-all" onClick={() => handleCtaClick('discover_study_learn')}>
                    <Link to="/auth">
                      Zacznij naukę
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats badges */}
          <div className="flex justify-center gap-8 mt-12 flex-wrap animate-fadeIn" style={{
          animationDelay: '0.8s'
        }}>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-success" />
                <span className="text-primary-foreground font-semibold">10,000+ uczniów</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                <span className="text-primary-foreground font-semibold">Natychmiastowy feedback</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Import Section */}
      

      {/* AI Tutor Section */}
      <section className="py-20 px-6 text-center max-w-6xl mx-auto animate-fadeIn">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-12 border border-primary/10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-2xl mb-8 shadow-lg animate-float">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Twój nauczyciel, który zawsze ma czas
          </h2>
          
          <p className="text-xl mb-10 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            AI Tutor dostosowuje się do Ciebie:
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-success/70 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Krok po kroku</h3>
              <p className="text-muted-foreground">Tłumaczy zadania w prosty sposób</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Dopasowany poziom</h3>
              <p className="text-muted-foreground">Dostosowuje trudność do Twojej wiedzy</p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-warning/70 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Szybka pomoc</h3>
              <p className="text-muted-foreground">Przygotowuje do sprawdzianów i kartkówek</p>
            </div>
          </div>
          
          <Button asChild className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" size="lg" onClick={() => handleCtaClick('see_ai_tutor_demo')}>
            <Link to="/chat">
              Zobacz, jak działa AI Tutor
            </Link>
          </Button>
        </div>
      </section>

      {/* Study & Learn Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-muted/30 to-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-2xl mb-8 shadow-lg animate-float" style={{
          animationDelay: '1s'
        }}>
            <BookOpen className="w-10 h-10 text-accent-foreground" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Cała matematyka liceum zawsze pod ręką
          </h2>
          
          <p className="text-xl mb-12 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            Study & Learn to interaktywna baza tematów zgodna z programem MEN:
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-border">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">📖</span>
              </div>
              <h3 className="font-bold text-xl mb-4">Wszystkie działy</h3>
              <p className="text-muted-foreground text-lg">Od równań po całki - kompletny materiał</p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-border">
              <div className="w-16 h-16 bg-gradient-to-br from-success to-success/70 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="font-bold text-xl mb-4">Czytelny progres</h3>
              <p className="text-muted-foreground text-lg">Raporty pokazują co już umiesz</p>
            </div>
            
            <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-border">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="font-bold text-xl mb-4">Krótkie lekcje</h3>
              <p className="text-muted-foreground text-lg">Quizy zamiast nudnych samouczków</p>
            </div>
          </div>
          
          <Button asChild variant="default" className="bg-gradient-to-r from-accent to-secondary hover:from-secondary hover:to-accent text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" size="lg" onClick={() => handleCtaClick('check_progress')}>
            <Link to="/progress">
              Sprawdź swoje postępy
            </Link>
          </Button>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 px-6 text-center max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
          Dlaczego uczniowie kochają tę aplikację?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-gradient-to-br from-card to-muted/20 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-border/50 hover:border-primary/30">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:animate-float">
              <Layers className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-2xl mb-4 group-hover:text-primary transition-colors">Uczysz się tak, jak lubisz</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">Aplikacja dopasowuje tempo i sposób tłumaczenia do Ciebie.</p>
          </div>
          
          <div className="group bg-gradient-to-br from-card to-accent/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-border/50 hover:border-accent/30">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:animate-float" style={{
            animationDelay: '0.5s'
          }}>
              <GraduationCap className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="font-bold text-2xl mb-4 group-hover:text-accent transition-colors">Dostęp zawsze i wszędzie</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">Na telefonie i komputerze, bez ograniczeń czasowych.</p>
          </div>
          
          <div className="group bg-gradient-to-br from-card to-success/10 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-border/50 hover:border-success/30">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-success/70 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:animate-float" style={{
            animationDelay: '1s'
          }}>
              <BookOpen className="w-8 h-8 text-success-foreground" />
            </div>
            <h3 className="font-bold text-2xl mb-4 group-hover:text-success transition-colors">Pełna podstawa programowa</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">Wszystko od podstaw po rozszerzenie, w jednym miejscu.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent/10 to-transparent rounded-full"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            Pełen dostęp za jedną niską cenę
          </h2>
          
          <div className="bg-gradient-to-br from-card to-card/50 rounded-3xl p-12 shadow-2xl border border-border/50 backdrop-blur-sm">
            <div className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-warning to-success bg-clip-text text-transparent">
              49,99 zł
            </div>
            <p className="text-lg text-muted-foreground mb-2">miesięcznie</p>
            
            <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
              Nielimitowane lekcje, szybkie powtórki i dostęp do wszystkich tematów.
              To mniej niż koszt jednej godziny korepetycji – a korzystasz ile chcesz, kiedy chcesz.
            </p>
            
            <Button size="lg" className="bg-gradient-to-r from-success to-warning hover:from-warning hover:to-success text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 text-white font-bold border-2 border-success/20 animate-glow" onClick={() => handleCtaClick('start_trial')}>
              <span className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                Rozpocznij darmowy okres próbny
                <span className="bg-white/20 rounded-full px-3 py-1 text-sm">7 dni</span>
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
        }].map((faq, index) => <div key={index} className="group bg-gradient-to-r from-card to-card/80 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/30 hover:scale-[1.02]">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-3 group-hover:text-primary transition-colors">
                <HelpCircle className="w-6 h-6 text-primary group-hover:animate-float" />
                {faq.question}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed pl-9">
                {faq.answer}
              </p>
            </div>)}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-foreground to-foreground/90 text-primary-foreground py-12 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">AI Tutor</span>
            </div>
          </div>
          <p className="text-muted-foreground mb-6">© 2025 AI Tutor. Wszelkie prawa zastrzeżone.</p>
          <div className="flex justify-center gap-8 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors hover:underline">O nas</a>
            <a href="#" className="hover:text-primary transition-colors hover:underline">Kontakt</a>
            <a href="#" className="hover:text-primary transition-colors hover:underline">Polityka prywatności</a>
          </div>
        </div>
      </footer>
    </div>;
}