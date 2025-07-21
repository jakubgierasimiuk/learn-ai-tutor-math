import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TextToSpeech from "@/components/TextToSpeech";
import VoiceToText from "@/components/VoiceToText";
import { Brain, Mic, Volume2, Sparkles, Zap, MessageSquare } from "lucide-react";

export default function AIFeaturesPage() {
  const [transcribedText, setTranscribedText] = useState("");

  const handleTranscription = (text: string) => {
    setTranscribedText(text);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          Zaawansowane AI Features
        </h1>
        <p className="text-muted-foreground">
          Wykorzystaj moc sztucznej inteligencji do nauki matematyki
        </p>
      </div>

      {/* AI Features Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Volume2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold">Text-to-Speech</div>
                <div className="text-sm text-muted-foreground">ElevenLabs AI</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mic className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold">Voice-to-Text</div>
                <div className="text-sm text-muted-foreground">OpenAI Whisper</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold">AI Chat</div>
                <div className="text-sm text-muted-foreground">GPT-4 Powered</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="text-to-speech" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text-to-speech" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Text-to-Speech
          </TabsTrigger>
          <TabsTrigger value="voice-to-text" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice-to-Text
          </TabsTrigger>
          <TabsTrigger value="combined" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Kombinowane
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text-to-speech" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Przekształć tekst w mowę
              </CardTitle>
              <CardDescription>
                Wykorzystaj technologię ElevenLabs do generowania naturalnego głosu z tekstu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TextToSpeech 
                initialText="Witaj w AI Tutor! Jestem tutaj, żeby pomóc Ci w nauce matematyki."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Przykładowe zastosowania</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Badge variant="outline">Lekcje audio</Badge>
                  <p className="text-sm text-muted-foreground">
                    Każda lekcja może być odczytana na głos dla lepszego zrozumienia
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline">Objaśnienia</Badge>
                  <p className="text-sm text-muted-foreground">
                    AI może objaśniać rozwiązania zadań w formie audio
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline">Dostępność</Badge>
                  <p className="text-sm text-muted-foreground">
                    Wsparcie dla osób z dysleksją i innymi trudnościami w czytaniu
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline">Nauka mobilna</Badge>
                  <p className="text-sm text-muted-foreground">
                    Słuchaj lekcji podczas innych aktywności
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice-to-text" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Przekształć mowę w tekst
              </CardTitle>
              <CardDescription>
                Używaj OpenAI Whisper do rozpoznawania mowy w czasie rzeczywistym
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceToText onTranscriptionComplete={handleTranscription} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Możliwości rozpoznawania mowy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">Rozpoznawanie w czasie rzeczywistym</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Obsługa języka polskiego i angielskiego</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Filtrowanie szumów i echo cancellation</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Wysoką dokładność nawet z akcentem</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combined" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Kombinowane AI Features
              </CardTitle>
              <CardDescription>
                Połącz możliwości rozpoznawania i syntezy mowy dla kompletnego doświadczenia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <VoiceToText onTranscriptionComplete={handleTranscription} />
                <TextToSpeech initialText={transcribedText} />
              </div>
              
              {transcribedText && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Przepływ AI:</h4>
                        <p className="text-sm text-blue-800">
                          Twoja mowa została przekształcona w tekst i jest gotowa do ponownego odtworzenia jako audio!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Przyszłe możliwości</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Real-time Conversation</h4>
                  <p className="text-sm text-muted-foreground">
                    Rozmowa z AI w czasie rzeczywistym bez opóźnień
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Emotion Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Rozpoznawanie emocji w głosie dla lepszej personalizacji
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Voice Cloning</h4>
                  <p className="text-sm text-muted-foreground">
                    Klonowanie własnego głosu do personalizacji nauki
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}