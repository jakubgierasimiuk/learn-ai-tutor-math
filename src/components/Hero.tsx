import { Button } from "@/components/ui/button";
import { BookOpen, ClipboardList, FolderOpen, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-education.jpg";
import { logEvent } from "@/lib/logger";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float animation-delay-3s"></div>
      
      <div className="container mx-auto px-4 py-16 lg:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-slideInFromLeft">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                Ucz się matematyki z{" "}
                <span className="gradient-hero bg-clip-text text-transparent animate-glow">
                  mentavo.ai
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Personalizowana nauka matematyki z wykorzystaniem sztucznej inteligencji. 
                Dostosowujemy się do Twojego tempa i stylu uczenia się.
              </p>
            </div>

            {/* Główne opcje nauki */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chat z mentavo.ai */}
                <div className="group relative p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105 flex flex-col h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <h3 className="text-lg font-semibold">Chat z mentavo.ai</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
                      Zadaj pytanie, wyślij zdjęcie zadania lub po prostu powiedz czego nie rozumiesz. 
                      AI pomoże Ci krok po kroku.
                    </p>
                    <Button asChild className="w-full group-hover:shadow-primary transition-all mt-auto">
                      <Link to="/chat" onClick={() => logEvent('cta_click', { source: 'hero', target: 'chat' })}>
                        Rozpocznij rozmowę
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Study & Learn */}
                <div className="group relative p-6 rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:scale-105 flex flex-col h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <GraduationCap className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold">Study & Learn</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-1">
                      Systematyczna nauka z AI. Wybierz temat, rozwiązuj zadania dopasowane do Twojego poziomu
                      i śledź postępy.
                    </p>
                    <Button asChild variant="outline" className="w-full group-hover:shadow-accent transition-all mt-auto">
                      <Link to="/study" onClick={() => logEvent('cta_click', { source: 'hero', target: 'study' })}>
                        Zacznij naukę
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">15K+</div>
                <div className="text-sm text-muted-foreground">Aktywnych uczniów</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">98%</div>
                <div className="text-sm text-muted-foreground">Satysfakcji</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">50+</div>
                <div className="text-sm text-muted-foreground">Tematów</div>
              </div>
            </div>
          </div>

          {/* Right content - Hero Image */}
          <div className="relative animate-fadeIn animation-delay-2s">
            <div className="relative rounded-2xl overflow-hidden shadow-accent">
              <img 
                src={heroImage} 
                alt="Studenci uczący się z AI" 
                className="w-full h-auto object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              
              {/* Floating UI elements */}
              <div className="absolute top-6 right-6 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-card animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">AI aktywne</span>
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 bg-card/90 backdrop-blur-sm rounded-lg p-4 shadow-card animate-float animation-delay-2s">
                <div className="text-sm text-muted-foreground">Aktualny postęp</div>
                <div className="text-2xl font-bold text-primary">85%</div>
              </div>
            </div>

            {/* Decorative math symbols */}
            <div className="absolute -top-4 -left-4 text-4xl text-primary/30 animate-float">π</div>
            <div className="absolute top-1/3 -right-8 text-3xl text-accent/30 animate-float animation-delay-1s">∫</div>
            <div className="absolute bottom-1/4 -left-8 text-5xl text-success/30 animate-float animation-delay-3s">Σ</div>
          </div>
        </div>
      </div>
    </div>
  );
};