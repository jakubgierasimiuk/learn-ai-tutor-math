import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Mic, MicOff, Loader2, FileAudio } from "lucide-react";
import { toast } from "sonner";

interface VoiceToTextProps {
  onTranscriptionComplete?: (text: string) => void;
  autoStart?: boolean;
}

export default function VoiceToText({ onTranscriptionComplete, autoStart = false }: VoiceToTextProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = processRecording;

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Nagrywanie rozpoczęte");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Błąd dostępu do mikrofonu");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const processRecording = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: base64Audio }
          });

          if (error) {
            throw error;
          }

          if (data?.text) {
            setTranscription(data.text);
            onTranscriptionComplete?.(data.text);
            toast.success("Transkrypcja ukończona!");
          } else {
            toast.error("Nie rozpoznano mowy");
          }
        } catch (apiError) {
          console.error('Error transcribing audio:', apiError);
          toast.error("Błąd podczas transkrypcji");
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error("Błąd podczas przetwarzania nagrania");
      setIsProcessing(false);
    }
  }, [onTranscriptionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-6 w-6" />
          Voice-to-Text AI
        </CardTitle>
        <CardDescription>
          Nagrywaj i przekształcaj mowę w tekst przy użyciu OpenAI Whisper
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Button
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
            
            {isRecording && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <Badge variant="destructive" className="animate-pulse">
                  {formatTime(recordingTime)}
                </Badge>
              </div>
            )}
          </div>

          <div className="text-center">
            {isProcessing ? (
              <p className="text-sm text-muted-foreground">Przetwarzanie nagrania...</p>
            ) : isRecording ? (
              <p className="text-sm font-medium">Nagrywanie... Kliknij ponownie aby zatrzymać</p>
            ) : (
              <p className="text-sm text-muted-foreground">Kliknij aby rozpocząć nagrywanie</p>
            )}
          </div>
        </div>

        {transcription && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Transkrypcja:</label>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm leading-relaxed">{transcription}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(transcription);
                toast.success("Skopiowano do schowka");
              }}
            >
              Kopiuj tekst
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Maksymalny czas nagrania: 10 minut</p>
          <p>• Obsługiwane formaty: audio/webm, MP3, WAV</p>
          <p>• Rozpoznawane języki: polski, angielski i inne</p>
        </div>
      </CardContent>
    </Card>
  );
}