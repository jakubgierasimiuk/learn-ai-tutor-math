import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Play, Square, Volume2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Voice {
  id: string;
  name: string;
  description: string;
}

const voices: Voice[] = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Ekspresyjna i naturalna" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Ciepła i przyjazna" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", description: "Profesjonalna i czytelna" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Młodzieżowa i energiczna" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", description: "Dojrzała i spokojną" },
];

interface TextToSpeechProps {
  initialText?: string;
  onAudioGenerated?: (audioUrl: string) => void;
}

export default function TextToSpeech({ initialText = "", onAudioGenerated }: TextToSpeechProps) {
  const [text, setText] = useState(initialText);
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast.error("Wprowadź tekst do odczytania");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text.trim(),
          voiceId: selectedVoice
        }
      });

      if (error) {
        throw error;
      }

      if (data?.audioContent) {
        // Convert base64 to blob URL
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        
        setAudioUrl(url);
        onAudioGenerated?.(url);
        toast.success("Audio zostało wygenerowane!");
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      toast.error("Błąd podczas generowania audio");
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      toast.error("Błąd podczas odtwarzania audio");
    };

    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast.error("Nie można odtworzyć audio");
    });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-6 w-6" />
          Text-to-Speech AI
        </CardTitle>
        <CardDescription>
          Przekształć tekst w naturalne mowy przy użyciu ElevenLabs AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tekst do odczytania</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Wprowadź tekst, który chcesz przekształcić w mowę..."
            className="min-h-[120px] resize-none"
            maxLength={5000}
          />
          <div className="text-right text-sm text-muted-foreground">
            {text.length}/5000 znaków
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Wybierz głos</label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz głos AI" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-sm text-muted-foreground">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={generateSpeech} 
            disabled={!text.trim() || isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generowanie...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Generuj audio
              </>
            )}
          </Button>

          {audioUrl && (
            <>
              <Button 
                onClick={playAudio} 
                disabled={isPlaying}
                variant="outline"
              >
                <Play className="w-4 h-4" />
              </Button>

              <Button 
                onClick={stopAudio} 
                disabled={!isPlaying}
                variant="outline"
              >
                <Square className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {audioUrl && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="w-4 h-4" />
              Audio zostało wygenerowane i jest gotowe do odtworzenia
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}