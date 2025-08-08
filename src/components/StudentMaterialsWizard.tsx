import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, Upload, Trash2, Play, Sparkles, CheckCircle2 } from "lucide-react";

interface AnalysisResult {
  detectedTopics: { topic: string; confidence: number }[];
  difficultySuggestion: 'easy' | 'medium' | 'hard';
  sampleTasks: string[];
  lessonPlan: {
    title: string;
    objectives: string[];
    outline: string[];
    recommendedPrerequisites: string[];
  };
  skillMatches: { id: string; name: string; confidence: number }[];
}

interface StudentMaterialsWizardProps {
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onStartLesson?: (skillId: string) => void;
}

export const StudentMaterialsWizard: React.FC<StudentMaterialsWizardProps> = ({ onAnalysisComplete, onStartLesson }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const remaining = useMemo(() => 5 - files.length, [files.length]);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const allowed = selected.filter(f => f.type.startsWith('image/'));
    const newList = [...files, ...allowed].slice(0, 5);
    setFiles(newList);

    // Generate previews
    Promise.all(newList.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }))).then(setPreviews);
  };

  const removeAt = (i: number) => {
    const copy = [...files];
    copy.splice(i, 1);
    setFiles(copy);
    // Update previews accordingly
    const p = [...previews];
    p.splice(i, 1);
    setPreviews(p);
  };

  // Kompresja do ~1600px szerokości, JPEG 0.85
  const compressToDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();
    reader.onload = () => {
      img.onload = () => {
        const MAX = 1600;
        let w = img.width; let h = img.height;
        const scale = Math.min(1, MAX / Math.max(w, h));
        w = Math.round(w * scale); h = Math.round(h * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(reader.result as string); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const analyze = async () => {
    if (!files.length) {
      toast({ title: 'Brak zdjęć', description: 'Dodaj przynajmniej jedno zdjęcie.' });
      return;
    }

    try {
      setUploading(true);
      setProgress(10);

      // Konwersja + kompresja do Base64
      const imagesBase64 = await Promise.all(files.map((file) => compressToDataURL(file)));
      setProgress(40);

      const { data, error } = await supabase.functions.invoke('analyze-student-materials', {
        body: { imagesBase64 },
      });

      setProgress(85);

      if (error) throw error;
      const res = data as AnalysisResult;
      setResult(res);
      setProgress(100);
      onAnalysisComplete?.(res);
      toast({ title: 'Analiza zakończona', description: 'Znaleziono tematy i przygotowano plan lekcji.' });
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Nie udało się przeanalizować', description: e?.message || 'Spróbuj ponownie.' });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-5">
      <section className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" /> Dodaj materiały ({remaining} pozostało)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onSelect} />
              <Button variant="secondary" onClick={() => inputRef.current?.click()} className="w-full flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Wybierz zdjęcia
              </Button>

              {previews.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-border">
                      <img src={src} alt={`materiał ${i+1}`} className="w-full h-32 object-cover" loading="lazy" />
                      <button className="absolute top-2 right-2 rounded-full bg-background/70 p-1 border border-border" onClick={() => removeAt(i)} aria-label="Usuń">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={analyze} disabled={uploading} className="w-full flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {uploading ? 'Analizuję...' : 'Przeanalizuj materiały'}
              </Button>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">Przetwarzanie obrazów i rozpoznawanie tematów...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Wynik analizy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-muted-foreground">Wynik pojawi się po przesłaniu i analizie materiałów.</p>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold">Wykryte tematy</h3>
                  <ul className="mt-2 space-y-1">
                    {result.detectedTopics?.map((t, i) => (
                      <li key={i} className="text-sm">
                        • {t.topic} <span className="text-muted-foreground">({Math.round(t.confidence*100)}%)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Rekomendowana trudność</h3>
                  <p className="text-sm mt-1 capitalize">{result.difficultySuggestion}</p>
                </div>

                {result.sampleTasks?.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Przykładowe zadania</h3>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      {result.sampleTasks.map((s, i) => (
                        <li key={i} className="text-sm">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold">Plan lekcji</h3>
                  <div className="mt-2 space-y-2">
                    <p className="font-medium">{result.lessonPlan.title}</p>
                    {result.lessonPlan.objectives?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Cele:</p>
                        <ul className="list-disc pl-5 text-sm mt-1">
                          {result.lessonPlan.objectives.map((o, i) => <li key={i}>{o}</li>)}
                        </ul>
                      </div>
                    )}
                    {result.lessonPlan.outline?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Przebieg:</p>
                        <ol className="list-decimal pl-5 text-sm mt-1 space-y-1">
                          {result.lessonPlan.outline.map((o, i) => <li key={i}>{o}</li>)}
                        </ol>
                      </div>
                    )}
                    {result.lessonPlan.recommendedPrerequisites?.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Warto powtórzyć:</p>
                        <ul className="list-disc pl-5 text-sm mt-1">
                          {result.lessonPlan.recommendedPrerequisites.map((o, i) => <li key={i}>{o}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {result.skillMatches?.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Dopasowane umiejętności w systemie</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      {result.skillMatches.map((s, i) => (
                        <li key={i}>• {s.name} <span className="text-muted-foreground">({Math.round(s.confidence*100)}%)</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button variant="default" className="flex items-center gap-2" onClick={() => {
                    if (!result?.skillMatches?.length) {
                      toast({ variant: 'destructive', title: 'Brak dopasowań', description: 'Nie znaleziono pasującej umiejętności.' });
                      return;
                    }
                    const best = [...result.skillMatches].sort((a, b) => b.confidence - a.confidence)[0];
                    onStartLesson?.(best.id);
                  }}>
                    <Play className="w-4 h-4" /> Rozpocznij prowadzoną lekcję
                  </Button>
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Szybki mini‑quiz (3 pytania)
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
