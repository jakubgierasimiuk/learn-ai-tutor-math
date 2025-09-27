import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
const testimonials = [{
  name: "Kasia",
  grade: "3 LO",
  content: "Wreszcie aplikacja, która dostosowuje się do mojego poziomu! Nie muszę się męczyć z zadaniami za trudnymi ani nudnymi.",
  aspect: "Personalizacja"
}, {
  name: "Marcin",
  grade: "1 LO",
  content: "Mogę zadać to samo pytanie 10 razy i AI nigdy się nie irytuje. W przeciwieństwie do mojego brata...",
  aspect: "Cierpliwość"
}, {
  name: "Ania",
  grade: "2 LO",
  content: "Jak AI pokazuje mi wykresy funkcji krok po kroku, to w końcu wszystko kliknęło w głowie!",
  aspect: "Wizualizacja"
}, {
  name: "Maja",
  grade: "2 LO",
  content: "Przestałam się uczyć na pamięć wzorów. Teraz wiem DLACZEGO tak się robi równania kwadratowe.",
  aspect: "Zrozumienie"
}, {
  name: "Jakub",
  grade: "4 LO",
  content: "Z trojki na piątkę w pół roku. Matematyka przestała być moim koszmarem!",
  aspect: "Budowanie pewności siebie"
}, {
  name: "Tomek",
  grade: "3 LO",
  content: "Umiem teraz rozwiązać każde zadanie z prawdopodobieństwa. Na maturze będę gotowy!",
  aspect: "Praktyczność"
}, {
  name: "Wiktoria",
  grade: "1 LO",
  content: "Uczę się o 23:00? Nie ma problemu. AI zawsze jest gotowe pomóc.",
  aspect: "Dostępność 24/7"
}, {
  name: "Adam",
  grade: "3 LO",
  content: "Jedni uczą się z notatek, ja potrzebuję przykładów. Tutaj każdy znajdzie swój sposób.",
  aspect: "Różne style uczenia"
}, {
  name: "Ola",
  grade: "2 LO",
  content: "Widzę jak z tygodnia na tydzień rozumiem więcej. To motywuje do dalszej nauki!",
  aspect: "Progres"
}, {
  name: "Zuzia",
  grade: "4 LO",
  content: "Nigdy nie myślałam, że będę mówiła 'lubię matematykę'. A jednak!",
  aspect: "Motywacja"
}];
export function TestimonialsCarousel() {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    onSelect();

    // Auto-scroll every 4 seconds
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 4000);
    return () => {
      clearInterval(interval);
      api?.off("select", onSelect);
    };
  }, [api]);
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };
  return <section className="py-24 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-border shadow-card animate-fadeIn">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-muted-foreground font-medium">Co mówią uczniowie</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight animate-fadeIn" style={{
          animationDelay: '0.2s'
        }}>
            Opinie naszych<br />
            <span className="text-primary">licealistów</span>
          </h2>
          
          
        </div>

        <div className="relative animate-fadeIn" style={{
        animationDelay: '0.6s'
      }}>
          <Carousel setApi={setApi} className="w-full max-w-5xl mx-auto" opts={{
          align: "start",
          loop: true
        }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full bg-card/80 backdrop-blur-sm border border-border hover-lift shadow-card transition-all duration-300">
                    <CardContent className="p-6">
                      {/* Header with avatar and info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-primary">
                          <span className="text-primary-foreground font-bold">
                            {getInitials(testimonial.name)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                          <p className="text-sm text-muted-foreground">{testimonial.grade}</p>
                        </div>
                      </div>

                      {/* Quote */}
                      <div className="relative mb-4">
                        <div className="absolute -top-2 -left-2 text-primary/20 text-4xl font-bold">"</div>
                        <p className="text-foreground leading-relaxed pl-4">
                          {testimonial.content}
                        </p>
                      </div>

                      {/* Stars */}
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, i) => <span key={i} className="text-warning text-lg">⭐</span>)}
                      </div>

                      {/* Aspect tag */}
                      <div className="inline-flex items-center bg-primary/10 rounded-full px-3 py-1 border border-primary/20">
                        <span className="text-primary text-xs font-medium uppercase tracking-wide">
                          {testimonial.aspect}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>)}
            </CarouselContent>
            
            <CarouselPrevious className="hidden md:flex -left-12 bg-card/80 backdrop-blur-sm border-border hover:bg-accent hover:text-accent-foreground" />
            <CarouselNext className="hidden md:flex -right-12 bg-card/80 backdrop-blur-sm border-border hover:bg-accent hover:text-accent-foreground" />
          </Carousel>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => <button key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === current ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`} onClick={() => api?.scrollTo(index)} />)}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="text-center mt-16 animate-fadeIn" style={{
        animationDelay: '0.8s'
      }}>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-border shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-foreground font-semibold">500+ zadowolonych uczniów</span>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-border shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-foreground font-semibold">Średnio +1.5 oceny</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
}