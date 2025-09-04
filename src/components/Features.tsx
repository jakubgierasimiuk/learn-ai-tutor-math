import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  MessageSquare, 
  BarChart3, 
  Trophy, 
  Target, 
  Zap,
  CheckCircle,
  Users
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "mentavo.ai",
    description: "Inteligentny nauczyciel dostosowuje się do Twojego stylu uczenia się.",
    color: "primary",
    benefits: ["Personalizowane wyjaśnienia", "Dostępny 24/7", "Nieskończona cierpliwość"]
  },
  {
    icon: MessageSquare,
    title: "Interaktywne lekcje",
    description: "Ucz się przez rozmowę, zadawaj pytania i otrzymuj natychmiastowe odpowiedzi.",
    color: "accent",
    benefits: ["Czat w czasie rzeczywistym", "Naturalna konwersacja", "Brak stresu z oceną"]
  },
  {
    icon: BarChart3,
    title: "Diagnostyka wiedzy",
    description: "System analizuje Twoje mocne i słabe strony w matematyce.",
    color: "success",
    benefits: ["Precyzyjna ocena", "Wizualizacja postępów", "Spersonalizowane ścieżki"]
  },
  {
    icon: Trophy,
    title: "Śledzenie postępów",
    description: "Monitoruj swoje osiągnięcia i postępy w nauce matematyki.",
    color: "warning",
    benefits: ["Wizualizacja postępów", "Historia rozwiązanych zadań", "Identyfikacja mocnych stron"]
  }
];

const stats = [
  { number: "Beta", label: "Wersja testowa", icon: Users },
  { number: "AI", label: "Personalizacja", icon: CheckCircle },
  { number: "50+", label: "Dostępnych tematów", icon: Target },
  { number: "24/7", label: "Wsparcie AI", icon: Zap }
];

export const Features = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Dlaczego wybierać{" "}
            <span className="gradient-hero bg-clip-text text-transparent">mentavo.ai</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Rewolucyjny sposób nauki matematyki, który łączy najnowsze technologie AI 
            z sprawdzonymi metodami pedagogicznymi.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="p-8 hover:shadow-primary transition-all duration-300 hover:-translate-y-2 group animate-fadeIn h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col h-full">
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 mb-6
                  ${feature.color === 'primary' ? 'bg-primary/10 text-primary' : ''}
                  ${feature.color === 'accent' ? 'bg-accent/10 text-accent' : ''}
                  ${feature.color === 'success' ? 'bg-success/10 text-success' : ''}
                  ${feature.color === 'warning' ? 'bg-warning/10 text-warning' : ''}
                `}>
                  <feature.icon className="w-8 h-8" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-card rounded-3xl p-8 md:p-12 shadow-card">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              mentavo.ai w liczbach
            </h3>
            <p className="text-muted-foreground">
              Dołącz do tysięcy zadowolonych uczniów
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="text-center animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};