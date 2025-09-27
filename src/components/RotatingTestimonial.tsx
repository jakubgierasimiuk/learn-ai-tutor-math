import { useEffect, useState } from "react";

const miniTestimonials = [
  {
    name: "Anna K.",
    grade: "Klasa 2 LO",
    content: "W końcu rozumiem pochodne! AI tłumaczy w sposób, który dociera do mnie.",
    initials: "AK"
  },
  {
    name: "Maja S.",
    grade: "Klasa 2 LO", 
    content: "Przestałam się uczyć na pamięć wzorów. Teraz rozumiem matematykę!",
    initials: "MS"
  },
  {
    name: "Jakub P.",
    grade: "Klasa 4 LO",
    content: "Z trojki na piątkę w pół roku. Matematyka przestała być koszmarem!",
    initials: "JP"
  },
  {
    name: "Wiktoria L.",
    grade: "Klasa 1 LO",
    content: "Uczę się o 23:00? Nie ma problemu. AI zawsze jest gotowe pomóc.",
    initials: "WL"
  },
  {
    name: "Tomek R.",
    grade: "Klasa 3 LO",
    content: "Umiem teraz rozwiązać każde zadanie z prawdopodobieństwa!",
    initials: "TR"
  }
];

export function RotatingTestimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === miniTestimonials.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 150);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = miniTestimonials[currentIndex];

  return (
    <div className="bg-muted/50 rounded-xl p-6 border border-border/50 min-h-[140px] flex flex-col justify-between">
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'}`}>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-accent-foreground font-bold text-sm">
              {currentTestimonial.initials}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{currentTestimonial.name}</p>
            <p className="text-xs text-muted-foreground">{currentTestimonial.grade}</p>
          </div>
        </div>
        <p className="text-foreground text-sm italic leading-relaxed">
          "{currentTestimonial.content}"
        </p>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-warning text-sm">⭐</span>
          ))}
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-1">
          {miniTestimonials.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}