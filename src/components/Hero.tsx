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
                  AI Tutorem
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Personalizowana nauka matematyki z wykorzystaniem sztucznej inteligencji. 
                Dostosowujemy się do Twojego tempa i stylu uczenia się.
              </p>
            </div>

            {/* Główne CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="shadow-primary transition-bounce hover:scale-105 w-full sm:w-auto" onClick={() => logEvent('cta_click', { source: 'hero' })}>
                <Link to="/chat" aria-label="Rozpocznij korepetycje z AI">Rozpocznij korepetycje</Link>
              </Button>
            </div>

            {/* Główne funkcje */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="outline" className="shadow-accent transition-bounce hover:scale-105 w-full sm:w-auto" onClick={() => logEvent('cta_click', { source: 'hero', target: 'study' })}>
                <Link to="/study" aria-label="Study & Learn — Twoja ścieżka nauki">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Study & Learn
                </Link>
              </Button>
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