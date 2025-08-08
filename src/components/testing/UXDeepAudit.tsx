import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Filter, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { ScenarioResult, generateAIChatScenarios, generateMaterialsScenarios, generateQuizScenarios, simulateExecution } from "./ScenarioGenerator";

function Summary({ title, results }: { title: string; results: ScenarioResult[] }) {
  const total = results.length;
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline">{total} scenariuszy</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success"/><span>Zaliczonych: <strong>{passed}</strong></span></div>
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-warning"/><span>Ostrzeżenia: <strong>{warnings}</strong></span></div>
          <div className="flex items-center gap-2"><XCircle className="w-4 h-4 text-destructive"/><span>Niepow.: <strong>{failed}</strong></span></div>
          <div className="text-sm text-muted-foreground">Pokrycie: 100 przypadków (persona × urządzenie × sieć × a11y)</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionList({ title, results }: { title: string; results: ScenarioResult[] }) {
  const top = useMemo(() => {
    const issues = results.filter(r => r.status !== 'pass' && r.recommendation);
    // Order by priority: high > medium > low
    const weight = { high: 3, medium: 2, low: 1 } as const;
    return issues.sort((a, b) => weight[b.priority] - weight[a.priority]).slice(0, 10);
  }, [results]);

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {top.map(item => (
            <div key={item.id} className="p-3 bg-background rounded border border-border">
              <div className="flex items-center justify-between">
                <div className="font-medium">{item.title}</div>
                <Badge variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}>
                  {item.priority}
                </Badge>
              </div>
              {item.finding && <p className="text-sm text-muted-foreground mt-1">{item.finding}</p>}
              {item.recommendation && <p className="text-sm mt-1">Rekomendacja: {item.recommendation}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const UXDeepAudit = () => {
  const [aiChat, setAiChat] = useState<ScenarioResult[]>([]);
  const [quiz, setQuiz] = useState<ScenarioResult[]>([]);
  const [materials, setMaterials] = useState<ScenarioResult[]>([]);

  useEffect(() => {
    // SEO basics
    document.title = 'Audyt UX – AIChat, Quiz, Materiały | AI Tutor';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name','description'); document.head.appendChild(meta); }
    meta.setAttribute('content', '100 scenariuszy na moduł: AIChat, Quiz Diagnostyczny, Materiały ucznia. Wnioski i usprawnienia.');
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.setAttribute('rel','canonical'); document.head.appendChild(link); }
    link.setAttribute('href', window.location.origin + '/ux-audit');

    // Generate + simulate
    setAiChat(simulateExecution(generateAIChatScenarios()));
    setQuiz(simulateExecution(generateQuizScenarios()));
    setMaterials(simulateExecution(generateMaterialsScenarios()));
  }, []);

  const exportJSON = () => {
    const blob = new Blob([
      JSON.stringify({ aiChat, quiz, materials }, null, 2)
    ], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ux-deep-audit.json'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Audyt UX/Uczenia – 3 kluczowe moduły</h1>
        <p className="text-muted-foreground mt-2">Automatycznie wygenerowane 100 scenariuszy na moduł + wnioski i priorytety działań</p>
      </header>

      <div className="flex gap-2">
        <Button variant="outline" className="flex items-center gap-2"><Filter className="w-4 h-4"/>Filtry (wkrótce)</Button>
        <Button onClick={exportJSON} className="flex items-center gap-2"><Download className="w-4 h-4"/>Eksport JSON</Button>
      </div>

      <Summary title="AIChat – wyniki" results={aiChat} />
      <ActionList title="AIChat – top 10 ulepszeń" results={aiChat} />

      <Separator className="my-4"/>

      <Summary title="Quiz diagnostyczny – wyniki" results={quiz} />
      <ActionList title="Quiz diagnostyczny – top 10 ulepszeń" results={quiz} />

      <Separator className="my-4"/>

      <Summary title="Materiały ucznia – wyniki" results={materials} />
      <ActionList title="Materiały – top 10 ulepszeń" results={materials} />
    </div>
  );
};
