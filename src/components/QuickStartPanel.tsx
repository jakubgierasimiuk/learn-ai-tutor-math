import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Sigma } from "lucide-react";
import { Link } from "react-router-dom";

const prompts = [
  {
    label: "Przygotuj do kartkówki z funkcji liniowych",
    icon: <Target className="w-4 h-4" />, 
    text: "Przygotuj mnie do kartkówki z funkcji liniowych: definicje, przykładowe zadania i krótkie podsumowanie."
  },
  {
    label: "Powtórz wzory skróconego mnożenia",
    icon: <Sigma className="w-4 h-4" />, 
    text: "Powtórz ze mną wzory skróconego mnożenia i daj 3 zadania do przećwiczenia z rosnącą trudnością."
  },
  {
    label: "Zrób zestaw zadań z trygonometrii",
    icon: <Brain className="w-4 h-4" />, 
    text: "Przygotuj zestaw 5 zadań z trygonometrii (podstawa) i sprawdzaj moje odpowiedzi krok po kroku."
  }
];

export const QuickStartPanel = () => {
  return (
    <section className="container mx-auto px-6 py-8">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Szybki start do kartkówki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {prompts.map((p, idx) => (
              <Link key={idx} to={`/chat?prompt=${encodeURIComponent(p.text)}&source=quickstart`}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => console.log('cta_chat_clicked', { source: 'quickstart', idx })}
                >
                  {p.icon}
                  {p.label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default QuickStartPanel;
