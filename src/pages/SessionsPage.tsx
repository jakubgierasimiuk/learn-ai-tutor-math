import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  BookOpen, 
  Clock, 
  Calendar, 
  Play, 
  CheckCircle,
  User,
  Bot,
  Filter,
  Search
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Seo } from '@/components/Seo';

interface SessionData {
  id: string;
  session_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  skill_id: string | null;
  summary_compact: string | null;
  summary_state?: any;
  next_session_recommendations?: any;
  total_interactions?: number;
  duration_minutes?: number;
  skill_name?: string;
  department?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      loadSessions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [sessions, searchTerm, statusFilter, typeFilter]);

  const loadSessions = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load chat sessions
      const { data: chatSessions, error: chatError } = await supabase
        .from('study_sessions')
        .select(`
          id,
          session_type,
          status,
          started_at,
          completed_at,
          skill_id,
          summary_compact,
          summary_state,
          total_steps,
          completed_steps
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (chatError) throw chatError;

      // Load unified learning sessions
      const { data: unifiedSessions, error: unifiedError } = await supabase
        .from('unified_learning_sessions')
        .select(`
          id,
          session_type,
          started_at,
          completed_at,
          skill_focus,
          next_session_recommendations,
          tasks_completed,
          correct_answers,
          department
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (unifiedError) throw unifiedError;

      // Get skill names for sessions that have skill IDs
      const skillIds = [
        ...chatSessions?.filter(s => s.skill_id).map(s => s.skill_id) || [],
        ...unifiedSessions?.filter(s => s.skill_focus).map(s => s.skill_focus) || []
      ];

      let skillsMap = {};
      if (skillIds.length > 0) {
        const { data: skills, error: skillsError } = await supabase
          .from('skills')
          .select('id, name, department')
          .in('id', skillIds);

        if (!skillsError && skills) {
          skillsMap = skills.reduce((acc, skill) => {
            acc[skill.id] = skill;
            return acc;
          }, {});
        }
      }

      // Combine and format sessions
      const allSessions: SessionData[] = [
        ...(chatSessions || []).map(session => ({
          ...session,
          session_type: session.session_type || 'chat',
          skill_name: session.skill_id ? skillsMap[session.skill_id]?.name : null,
          department: session.skill_id ? skillsMap[session.skill_id]?.department : null,
          total_interactions: session.total_steps,
          duration_minutes: session.completed_at 
            ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000)
            : null
        })),
        ...(unifiedSessions || []).map(session => ({
          ...session,
          id: session.id,
          session_type: 'study_learn',
          status: session.completed_at ? 'completed' : 'in_progress',
          skill_id: session.skill_focus,
          skill_name: session.skill_focus ? skillsMap[session.skill_focus]?.name : null,
          summary_compact: (session.next_session_recommendations as any)?.ai_summary?.substring(0, 200) + '...' || null,
          summary_state: session.next_session_recommendations,
          total_interactions: session.tasks_completed,
          duration_minutes: session.completed_at 
            ? Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000)
            : null
        }))
      ];

      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować sesji",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = sessions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.skill_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.session_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(session => session.session_type === typeFilter);
    }

    setFilteredSessions(filtered);
  };

  const loadSessionHistory = async (session: SessionData) => {
    try {
      const { data: interactions, error } = await supabase
        .from('learning_interactions')
        .select('user_input, ai_response, interaction_timestamp, sequence_number')
        .eq('session_id', session.id)
        .eq('user_id', user?.id)
        .order('sequence_number', { ascending: true });

      if (error) throw error;

      const history: Message[] = [];
      interactions?.forEach(interaction => {
        if (interaction.user_input) {
          history.push({
            role: 'user',
            content: interaction.user_input,
            timestamp: interaction.interaction_timestamp
          });
        }
        if (interaction.ai_response) {
          history.push({
            role: 'assistant',
            content: interaction.ai_response,
            timestamp: interaction.interaction_timestamp
          });
        }
      });

      setSessionHistory(history);
    } catch (error) {
      console.error('Error loading session history:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować historii sesji",
        variant: "destructive"
      });
    }
  };

  const resumeSession = async (session: SessionData) => {
    if (!user?.id) return;

    try {
      // Reactivate session by setting completed_at to null
      const table = session.session_type === 'chat' ? 'study_sessions' : 'unified_learning_sessions';
      
      const { error } = await supabase
        .from(table)
        .update({ 
          completed_at: null,
          status: 'in_progress'
        })
        .eq('id', session.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Sesja wznowiona",
        description: "Sesja została pomyślnie wznowiona",
      });

      // Navigate to appropriate page
      if (session.session_type === 'chat') {
        navigate('/chat');
      } else if (session.skill_id) {
        navigate(`/study-lesson/${session.skill_id}`);
      } else {
        navigate('/real-learning');
      }
    } catch (error) {
      console.error('Error resuming session:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wznowić sesji",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'chat': return 'AI Chat';
      case 'lesson': return 'Lekcja';
      case 'study_learn': return 'Study & Learn';
      default: return type;
    }
  };

  return (
    <>
      <Seo 
        title="Sesje Nauki - AI Korepetytor"
        description="Przeglądaj historię swoich sesji nauki z AI korepetytorem. Wznów poprzednie sesje i śledź swój postęp."
      />
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Historia Sesji</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Przeglądaj i wznawiaj swoje sesje nauki z AI korepetytorem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sessions List */}
            <div className="lg:col-span-1 space-y-4">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Szukaj sesji..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="in_progress">W trakcie</SelectItem>
                      <SelectItem value="completed">Zakończone</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ sesji" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie typy</SelectItem>
                      <SelectItem value="chat">AI Chat</SelectItem>
                      <SelectItem value="lesson">Lekcja</SelectItem>
                      <SelectItem value="study_learn">Study & Learn</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Sessions List */}
              <Card>
                <CardHeader>
                  <CardTitle>Sesje ({filteredSessions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Ładowanie sesji...
                        </div>
                      ) : filteredSessions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Brak sesji do wyświetlenia
                        </div>
                      ) : (
                        filteredSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedSession?.id === session.id
                                ? 'border-primary bg-primary/10'
                                : 'border-muted hover:border-primary/50'
                            }`}
                            onClick={() => {
                              setSelectedSession(session);
                              loadSessionHistory(session);
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {session.session_type === 'chat' ? (
                                  <MessageCircle className="w-4 h-4" />
                                ) : (
                                  <BookOpen className="w-4 h-4" />
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {getSessionTypeLabel(session.session_type)}
                                </Badge>
                              </div>
                              <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                                {session.status === 'completed' ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {session.status === 'completed' ? 'Zakończona' : 'W trakcie'}
                              </Badge>
                            </div>
                            
                            <h4 className="font-medium text-sm mb-1">
                              {session.skill_name || 'Ogólna sesja'}
                            </h4>
                            
                            <p className="text-xs text-muted-foreground mb-2">
                              {session.summary_compact || 'Brak podsumowania'}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(session.started_at)}
                              </span>
                              {session.duration_minutes && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {session.duration_minutes} min
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Session Details */}
            <div className="lg:col-span-2">
              {selectedSession ? (
                <div className="space-y-6">
                  {/* Session Header */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {selectedSession.session_type === 'chat' ? (
                              <MessageCircle className="w-5 h-5" />
                            ) : (
                              <BookOpen className="w-5 h-5" />
                            )}
                            {selectedSession.skill_name || 'Ogólna sesja'}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getSessionTypeLabel(selectedSession.session_type)} • {formatDate(selectedSession.started_at)}
                          </p>
                        </div>
                        {selectedSession.status === 'completed' && (
                          <Button onClick={() => resumeSession(selectedSession)}>
                            <Play className="w-4 h-4 mr-2" />
                            Wznów sesję
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {selectedSession.total_interactions || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Interakcje</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {selectedSession.duration_minutes || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Minuty</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {selectedSession.department || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">Dział</div>
                        </div>
                        <div className="text-center">
                          <Badge variant={selectedSession.status === 'completed' ? 'default' : 'secondary'}>
                            {selectedSession.status === 'completed' ? 'Zakończona' : 'W trakcie'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Summary */}
                  {(selectedSession.summary_state?.ai_summary || selectedSession.next_session_recommendations?.ai_summary) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Podsumowanie AI</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap">
                            {(selectedSession.summary_state as any)?.ai_summary || 
                             (selectedSession.next_session_recommendations as any)?.ai_summary ||
                             'Brak dostępnego podsumowania'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Chat History */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Historia rozmowy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {sessionHistory.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              Brak historii rozmowy dla tej sesji
                            </div>
                          ) : (
                            sessionHistory.map((message, index) => (
                              <div
                                key={index}
                                className={`flex gap-3 ${
                                  message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`flex gap-2 max-w-[80%] ${
                                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                  }`}
                                >
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    {message.role === 'user' ? (
                                      <User className="w-4 h-4" />
                                    ) : (
                                      <Bot className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div
                                    className={`rounded-lg px-3 py-2 ${
                                      message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                      {new Date(message.timestamp).toLocaleTimeString('pl-PL', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Wybierz sesję</h3>
                    <p className="text-muted-foreground">
                      Kliknij na sesję z listy, aby zobaczyć szczegóły i historię rozmowy
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SessionsPage;