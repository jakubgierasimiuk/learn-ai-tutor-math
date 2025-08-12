import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, ThumbsUp, ThumbsDown, RotateCcw, User, Bot, BookOpen, Target, Lightbulb, Volume2, Mic, MicOff, Loader2, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { logEvent, logError } from "@/lib/logger";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'assistant_review';
  content: string;
  timestamp: Date;
  insights?: LearningInsights;
}

interface LearningInsights {
  needsHelp: boolean;
  topicMastery: string;
  suggestedActions: string[];
}

interface UserProgress {
  recentTopics: string[];
  averageScore: number;
  weakAreas: string[];
  totalLessons: number;
}

const mockLessonData = {
  topic: "Twierdzenie Pitagorasa",
  description: "Poznaj związek między długościami boków w trójkącie prostokątnym"
};

const initialMessage: Message = {
  id: '1',
  role: 'assistant',
  content: `Cześć! Dziś poznamy **Twierdzenie Pitagorasa** 📐

Twierdzenie Pitagorasa to fundamentalna reguła w geometrii. Mówi ono, że w trójkącie prostokątnym:

**a² + b² = c²**

Gdzie:
- a i b to długości przyprostokątnych
- c to długość przeciwprostokątnej (najdłuższego boku)

Na przykład, jeśli mamy trójkąt prostokątny o bokach 3 i 4, to najdłuższy bok będzie miał długość 5, ponieważ: 3² + 4² = 9 + 16 = 25 = 5²

Czy rozumiesz to wyjaśnienie?`,
  timestamp: new Date()
};

export const AIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUnderstanding, setShowUnderstanding] = useState(false);
  const [currentTopic, setCurrentTopic] = useState("Matematyka");
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const hasSentPromptRef = useRef(false);
  const [slowNetwork, setSlowNetwork] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);
  useEffect(() => {
    if (!user) return;
    try {
      const saved = localStorage.getItem(`ai_chat_state_${user.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sessionId) setCurrentSessionId(parsed.sessionId as number);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setMessages(parsed.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
          return; // Skip fresh init, we restored previous session
        }
      }
    } catch {}
    initializeChat();
  }, [user]);

  // Persist chat session locally to allow resuming after reload/inactivity
  useEffect(() => {
    if (!user) return;
    try {
      const payload = {
        sessionId: currentSessionId,
        messages,
      };
      localStorage.setItem(`ai_chat_state_${user.id}`, JSON.stringify(payload));
    } catch {}
  }, [user, currentSessionId, messages]);

  const initializeChat = async () => {
    if (!user) return;

    let nextProgress: UserProgress | null = null;

    // Fetch user's learning context
    try {
      // Get recent lesson progress
      const { data: recentProgress } = await supabase
        .from("user_lesson_progress")
        .select(`
          score,
          lessons!inner(title, difficulty_level),
          topics!inner(name)
        `)
        .eq("user_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(10);

      if (recentProgress) {
        const topics = [...new Set(recentProgress.map(p => p.topics.name))];
        const avgScore = recentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / recentProgress.length;
        const weakAreas = recentProgress
          .filter(p => (p.score || 0) < 70)
          .map(p => p.topics.name);

        nextProgress = {
          recentTopics: topics,
          averageScore: Math.round(avgScore),
          weakAreas: [...new Set(weakAreas)],
          totalLessons: recentProgress.length
        };
        setUserProgress(nextProgress);

        // Set topic based on most recent lesson
        if (topics.length > 0) {
          setCurrentTopic(topics[0]);
        }
      }

      // Ensure we have a valid topic id for the session
      const { data: firstTopic } = await supabase
        .from('topics')
        .select('id, name')
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      let createdSession: { id: number } | null = null;
      if (firstTopic?.id) {
        const { data: inserted } = await supabase
          .from('lesson_sessions')
          .insert({
            user_id: user.id,
            topic_id: firstTopic.id,
            status: 'in_progress'
          })
          .select()
          .maybeSingle();
        createdSession = inserted as any;
      } else {
        console.warn('No active topics found; skipping session creation');
      }

      if (createdSession) {
        setCurrentSessionId(createdSession.id);
        logEvent('ai_chat_session_started', { session_id: createdSession.id, topic: firstTopic?.name });
      }

      // Generate personalized welcome message
      const welcomeMessage = await generateWelcomeMessage(nextProgress);
      setMessages([welcomeMessage]);
      
    } catch (error) {
      console.error("Error initializing chat:", error);
      // Fallback welcome message
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Cześć! Jestem Twoim AI Learning Coach 🤖\n\nPomogę Ci w nauce matematyki, dostosowując się do Twojego poziomu i stylu uczenia się. Możesz zadawać mi pytania, prosić o wyjaśnienia lub po prostu porozmawiać o matematyce.\n\nO czym chciałbyś dziś porozmawiać?`,
        timestamp: new Date()
      }]);
    }
  };

  const generateWelcomeMessage = async (progress: UserProgress | null): Promise<Message> => {
    const topics = progress?.recentTopics?.filter(Boolean) || [];
    const avg = Number.isFinite(progress?.averageScore as number) ? (progress?.averageScore as number) : undefined;
    const weak = progress?.weakAreas?.filter(Boolean) || [];

    const infoParts: string[] = [];
    if (topics.length > 0) infoParts.push(`Ostatnio pracowałeś nad: ${topics.slice(0, 3).join(', ')}.`);
    if (typeof avg === 'number' && avg >= 1) infoParts.push(`Średnia z ostatnich lekcji: ok. ${avg}%.`);
    if (weak.length > 0) infoParts.push(`Możemy popracować nad: ${weak.slice(0, 3).join(', ')}.`);

    const progressInfo = infoParts.join(' ');

    const base = `Cześć! Jestem Twoim AI Tutor 🧠\n\nPomogę Ci uczyć się matematyki krok po kroku. Zacznij pytaniem albo napisz, jaki temat chcesz poćwiczyć.`;
    const content = progressInfo ? `${base}\n\n${progressInfo}` : base;

    return {
      id: '1',
      role: 'assistant',
      content,
      timestamp: new Date()
    };
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dodatkowy autoscroll podczas pisania AI, aby utrzymać widoczność najnowszej odpowiedzi
  useEffect(() => {
    if (isTyping) scrollToBottom();
  }, [isTyping]);
  useEffect(() => {
    const p = searchParams.get('prompt');
    const topic = searchParams.get('topic');
    const goal = searchParams.get('goal');

    if (!hasSentPromptRef.current && user) {
      let initial = p || '';
      if (!initial && (topic || goal)) {
        const t = topic ? `z ${topic}` : '';
        const g = goal || 'przygotuj mnie do kartkówki';
        initial = `${g} ${t}. Daj krótkie podsumowanie i 3 zadania na rozgrzewkę.`;
      }

      if (initial) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: initial,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        sendMessageToAI(initial);
        hasSentPromptRef.current = true;
        console.log('cta_chat_clicked', { source: searchParams.get('source') || 'deep_link' });
      }
    }
  }, [searchParams, user]);
  
  useEffect(() => {
    let t: any;
    if (isTyping) {
      t = setTimeout(() => setSlowNetwork(true), 4000);
    } else {
      setSlowNetwork(false);
    }
    return () => { if (t) clearTimeout(t); };
  }, [isTyping]);
  
  const sendMessageToAI = async (userInput: string, imageBase64?: string) => {
    if (!user) {
      toast.error("Musisz być zalogowany, aby korzystać z czatu AI");
      return;
    }

    setIsTyping(true);
    
    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userInput,
          topic: currentTopic,
          level: userProgress?.averageScore ? 
            (userProgress.averageScore >= 80 ? 'advanced' : 
             userProgress.averageScore >= 60 ? 'intermediate' : 'beginner') 
            : 'beginner',
          userId: user.id,
          sessionId: currentSessionId,
          userProgress: userProgress,
          weakAreas: userProgress?.weakAreas || [],
          imageBase64: imageBase64 || null
        }
      });

      if (response.error) {
        throw response.error;
      }

      const { response: aiResponse, insights } = response.data;
      
      const newAIMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        insights: insights
      };
      setMessages(prev => [...prev, newAIMessage]);
      // persisted in server-side logs (chat_logs)
      
      // Handle insights and recommendations
      if (insights) {
        if (insights.needsHelp) {
          setShowUnderstanding(true);
        }
        
        if (insights.suggestedActions.includes('Przejdź do praktycznych ćwiczeń')) {
          setShowRecommendations(true);
        }
      }
      
    } catch (error) {
      console.error('Error calling AI chat:', error);
      toast.error("Wystąpił błąd podczas komunikacji z AI");
      
      // Fallback response
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie za chwilę.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const content = newMessage;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(content);
    sendMessageToAI(content);
    // persisted in server-side logs (chat_logs)
    setNewMessage("");
    setShowUnderstanding(false);
    setShowRecommendations(false);
  };

  const handleQuickResponse = (response: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: response,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setLastUserMessage(response);
    sendMessageToAI(response);
    // persisted in server-side logs (chat_logs)
    setShowUnderstanding(false);
    setShowRecommendations(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextToSpeech = async (text: string) => {
    try {
      logEvent('tts_play_clicked', { source: 'ai_chat', length: text?.length || 0 });
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (response.error) throw response.error;

      const audioContent = response.data.audioContent;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      await audio.play();
      logEvent('tts_play_success', { source: 'ai_chat' });
      toast.success("Odtwarzanie audio...");
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      logError(error, 'AIChat.handleTextToSpeech', { source: 'ai_chat' });
      toast.error("Funkcja audio niedostępna. Możesz przeczytać wiadomość powyżej.");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          
          if (base64Audio) {
            try {
              const response = await supabase.functions.invoke('voice-to-text', {
                body: { audio: base64Audio }
              });

              if (response.error) throw response.error;

              const transcribedText = response.data.text;
              setNewMessage(transcribedText);
              toast.success("Tekst został przepisany!");
            } catch (error) {
              console.error('Error with voice-to-text:', error);
              toast.error("Funkcja transkrypcji niedostępna. Wpisz wiadomość ręcznie.");
            }
          }
        };
        
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success("Nagrywanie rozpoczęte...");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Mikrofon niedostępny. Sprawdź uprawnienia lub wpisz wiadomość ręcznie.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      toast.success("Nagrywanie zakończone");
    }
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      const prompt = "Przeanalizuj proszę to zadanie ze zdjęcia i wyjaśnij krok po kroku. Jeśli to możliwe, podaj rozwiązanie i krótkie wskazówki.";
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `${prompt}\n[Załączono obraz zadania]`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setLastUserMessage(prompt);
      sendMessageToAI(prompt, base64);
      toast.success("Obraz wysłany do analizy");
    };
    reader.readAsDataURL(file);
    // reset input so the same file can be re-selected if needed
    e.currentTarget.value = "";
  };

  const renderRecommendations = () => {
    if (!showRecommendations || !userProgress) return null;

    return (
      <div className="p-4 border-t border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Rekomendacje AI</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link to="/lessons">
            <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Przeglądaj lekcje
            </Button>
          </Link>
          <Link to="/quiz">
            <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
              <Target className="w-4 h-4" />
              Sprawdź się w quizie
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5">
      <div className="container mx-auto px-0 md:px-4 py-2 md:py-8">
        <div className="mb-4 hidden md:block">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Learning Coach</h1>
              <p className="text-muted-foreground">Personalny asystent do nauki matematyki</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2 w-fit">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              AI Tutor aktywny
            </Badge>
            {userProgress && (
              <Badge variant="secondary" className="text-xs">
                Średnia: {userProgress.averageScore}% • {userProgress.totalLessons} lekcji
              </Badge>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="flex flex-col shadow-card rounded-none md:rounded-xl border-0 md:border overflow-hidden">
            {/* Messages */}
            <div ref={messagesContainerRef} className="p-3 md:p-6 space-y-6" role="log" aria-live="polite" aria-relevant="additions text">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 group ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role !== 'user' && (
                    <div className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center flex-shrink-0 ${
                      message.role === 'assistant_review' 
                        ? 'bg-warning/10 text-warning' 
                        : 'bg-accent/10 text-accent'
                    }`}>
                      <Bot className="w-5 h-5" />
                    </div>
                  )}
                  
                  <div className={`max-w-full md:max-w-[70%] ${message.role === 'user' ? 'order-2' : ''}`}>
                    <div className={`rounded-2xl p-4 break-words ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : message.role === 'assistant_review'
                        ? 'bg-warning/10 border border-warning/20'
                        : 'bg-muted'
                    }`}>
                      {message.role === 'assistant_review' && (
                        <div className="flex items-center gap-2 mb-2 text-warning text-sm font-medium">
                          <RotateCcw className="w-4 h-4" />
                          Reviewer AI - Uproszczone wyjaśnienie
                        </div>
                      )}
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1 px-2">
                      <div className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('pl-PL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTextToSpeech(message.content)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target"
                          aria-label={`Odtwórz wiadomość: ${message.content.substring(0, 50)}...`}
                        >
                          <Volume2 className="w-3 h-3" />
                          <span className="sr-only">Odtwórz tę wiadomość jako audio</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="hidden md:flex w-10 h-10 bg-primary/10 rounded-full items-center justify-center flex-shrink-0 text-primary">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-4 justify-start" aria-live="polite" aria-label="Asystent pisze odpowiedź">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent" />
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    {slowNetwork && (
                      <p className="text-xs text-muted-foreground mt-2">Łączenie z AI… to może potrwać chwilę.</p>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Recommendations */}
            <div className="hidden md:block">{renderRecommendations()}</div>

            {/* Quick Actions */}
            {showUnderstanding && !isTyping && (
              <div className="hidden md:block">
                <div className="p-4 border-t border-border bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-3">Czy rozumiesz wyjaśnienie?</p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickResponse("Tak, rozumiem")}
                      className="flex items-center gap-2 min-h-[48px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label="Potwierdzam, że rozumiem wyjaśnienie"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Tak, rozumiem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickResponse("Nie rozumiem, wytłumacz ponownie")}
                      className="flex items-center gap-2 min-h-[48px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label="Potrzebuję dodatkowego wyjaśnienia"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Nie rozumiem
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Szybkie podpowiedzi */}
            <div className="px-4 pt-2 hidden md:block">
              <p className="text-xs text-muted-foreground mb-2">Podpowiedzi do szybkiego startu:</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuickResponse("Mam jutro kartkówkę z funkcji liniowych. Przygotuj mnie.")}>Kartkówka: funkcje liniowe</Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickResponse("Wyjaśnij krok po kroku deltę i pokaż przykłady.")}>Wyjaśnij deltę</Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickResponse("Przećwiczmy 3 zadania z trygonometrii (podstawy).")}>3 zadania: trygonometria</Button>
              </div>
            </div>

            {/* Input */}
            <div className="p-2 md:p-4 border-t border-border pb-[env(safe-area-inset-bottom)]">
              <div className="flex gap-2 md:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`hidden md:inline-flex flex-shrink-0 min-h-[48px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isRecording ? 'bg-destructive/10 border-destructive/20 text-destructive' : ''}`}
                  aria-label={isRecording ? 'Zatrzymaj nagrywanie głosowe' : 'Rozpocznij nagrywanie głosowe'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="sr-only">{isRecording ? 'Zakończ nagrywanie' : 'Nagrywaj wiadomość głosową'}</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelected}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="hidden md:inline-flex flex-shrink-0 min-h-[48px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Wyślij zdjęcie zadania do analizy"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                {/* More panel trigger - mobile only */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMoreOpen(true)}
                  className="md:hidden flex-shrink-0 min-h-[48px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Więcej opcji"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRecording ? "Nagrywanie... (kliknij mikrofon ponownie aby zakończyć)" : "Zadaj pytanie lub napisz swoją odpowiedź..."}
                  className="flex-1 h-12 md:h-12 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={isTyping || isRecording}
                  aria-label="Pole tekstowe do wpisywania wiadomości"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isTyping || isRecording}
                  className="shadow-primary min-h-[48px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Wyślij wiadomość do AI Tutora"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
          {isMobile && (
            <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Więcej opcji</DrawerTitle>
                  <DrawerDescription>Dodatkowe skróty i narzędzia</DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`min-h-[44px] ${isRecording ? 'bg-destructive/10 border-destructive/20 text-destructive' : ''}`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                      {isRecording ? 'Zatrzymaj nagrywanie' : 'Nagraj wiadomość'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[44px]"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Wyślij zdjęcie
                    </Button>
                  </div>

                  {showUnderstanding && !isTyping && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Czy rozumiesz wyjaśnienie?</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleQuickResponse("Tak, rozumiem")} className="min-h-[44px]"><ThumbsUp className="w-4 h-4 mr-2" /> Tak, rozumiem</Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickResponse("Nie rozumiem, wytłumacz ponownie")} className="min-h-[44px]"><ThumbsDown className="w-4 h-4 mr-2" /> Nie rozumiem</Button>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Podpowiedzi do szybkiego startu:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleQuickResponse("Mam jutro kartkówkę z funkcji liniowych. Przygotuj mnie.")}>Kartkówka: funkcje liniowe</Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickResponse("Wyjaśnij krok po kroku deltę i pokaż przykłady.")}>Wyjaśnij deltę</Button>
                      <Button variant="outline" size="sm" onClick={() => handleQuickResponse("Przećwiczmy 3 zadania z trygonometrii (podstawy).")}>3 zadania: trygonometria</Button>
                    </div>
                  </div>

                  <div className="mb-4">
                    {renderRecommendations()}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </div>
    </div>
  );
};