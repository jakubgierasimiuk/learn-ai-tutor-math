import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Seo } from '@/components/Seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Clock, MessageSquare, Brain, Search, Filter, Shield, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Navigate } from 'react-router-dom';

interface AILog {
  id: string;
  session_id: string;
  sequence_number: number;
  function_name: string;
  endpoint: string;
  full_prompt: string;
  ai_response: string;
  parameters: any;
  user_input?: string;
  processing_time_ms?: number;
  tokens_used?: number;
  model_used?: string;
  timestamp: string;
}

interface SessionGroup {
  sessionId: string;
  logs: AILog[];
  startTime: string;
  totalLogs: number;
  functions: string[];
  activeChatMinutes: number;
  totalTokens: number;
  totalCost: number;
  userId: string;
  hasFormalSession: boolean;
}

const AILogsPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const [logs, setLogs] = useState<AILog[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [functionFilter, setFunctionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const loadLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('ai_conversation_log')
        .select('*')
        .order('timestamp', { ascending: false });

      // Only filter by user_id if not admin or if admin has selected specific user
      if (!isAdmin || userFilter !== "all") {
        const targetUserId = isAdmin && userFilter !== "all" ? userFilter : user.id;
        query = query.eq('user_id', targetUserId);
      }

      // Apply date filter
      if (dateFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('timestamp', today.toISOString());
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('timestamp', weekAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredLogs = data || [];

      // Apply function filter
      if (functionFilter !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.function_name === functionFilter);
      }

      // Apply search filter
      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
          log.full_prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.ai_response.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.user_input && log.user_input.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setLogs(filteredLogs);

      // Check which session IDs correspond to formal sessions
      const sessionIds = [...new Set(filteredLogs.map(log => log.session_id).filter(id => id))];
      let formalSessionIds = new Set<string>();
      
      if (sessionIds.length > 0) {
        // Check study_sessions
        const { data: studySessions } = await supabase
          .from('study_sessions')
          .select('id')
          .in('id', sessionIds);
        
        // Check unified_learning_sessions  
        const { data: unifiedSessions } = await supabase
          .from('unified_learning_sessions')
          .select('id')
          .in('id', sessionIds);
          
        if (studySessions) studySessions.forEach(s => formalSessionIds.add(s.id));
        if (unifiedSessions) unifiedSessions.forEach(s => formalSessionIds.add(s.id));
      }

      // Group by session
      const sessions = new Map<string, AILog[]>();
      filteredLogs.forEach(log => {
        const sessionId = log.session_id || 'no-session';
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, []);
        }
        sessions.get(sessionId)!.push(log);
      });

      const grouped: SessionGroup[] = Array.from(sessions.entries()).map(([sessionId, sessionLogs]) => {
        const sortedLogs = sessionLogs.sort((a, b) => a.sequence_number - b.sequence_number);
        
        // Calculate active chat time (excluding gaps > 10 minutes)
        let activeChatMinutes = 0;
        if (sortedLogs.length > 1) {
          for (let i = 0; i < sortedLogs.length - 1; i++) {
            const current = new Date(sortedLogs[i].timestamp);
            const next = new Date(sortedLogs[i + 1].timestamp);
            const gapMinutes = (next.getTime() - current.getTime()) / (1000 * 60);
            
            // Only add time if gap is less than 10 minutes
            if (gapMinutes <= 10) {
              activeChatMinutes += gapMinutes;
            }
          }
        }
        
        // Sum total tokens for the session
        const totalTokens = sortedLogs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
        
        // Calculate cost based on pricing: $1.25/1M input tokens, $10/1M output tokens
        // Assuming ~70% input, 30% output tokens (typical for educational conversations)
        const inputTokens = totalTokens * 0.7;
        const outputTokens = totalTokens * 0.3;
        const totalCost = (inputTokens * 1.25 / 1000000) + (outputTokens * 10.0 / 1000000);
        
        // Get user ID from any log in the session
        const userId = sortedLogs[0]?.user_input ? sortedLogs.find(log => log.user_input)?.session_id?.substring(0, 8) || 'unknown' : 'system';
        
        return {
          sessionId,
          logs: sortedLogs,
          startTime: sortedLogs[0]?.timestamp || '',
          totalLogs: sortedLogs.length,
          functions: [...new Set(sortedLogs.map(log => log.function_name))],
          activeChatMinutes: Math.round(activeChatMinutes * 10) / 10, // Round to 1 decimal
          totalTokens,
          totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
          userId: sessionId.substring(0, 8) + '...',
          hasFormalSession: formalSessionIds.has(sessionId)
        };
      }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

      setGroupedSessions(grouped);
    } catch (error) {
      console.error('Error loading AI logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [user, searchTerm, functionFilter, dateFilter, userFilter, isAdmin]);

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const formatPrompt = (prompt: string) => {
    return prompt.split('\n\n').map((section, index) => {
      if (section.startsWith('SYSTEM:')) {
        return (
          <div key={index} className="mb-4">
            <Badge variant="secondary" className="mb-2">SYSTEM</Badge>
            <pre className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
              {section.replace('SYSTEM: ', '')}
            </pre>
          </div>
        );
      } else if (section.startsWith('USER:')) {
        return (
          <div key={index} className="mb-4">
            <Badge variant="outline" className="mb-2">USER</Badge>
            <pre className="text-sm whitespace-pre-wrap bg-background p-3 rounded border">
              {section.replace('USER: ', '')}
            </pre>
          </div>
        );
      }
      return (
        <pre key={index} className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded mb-4">
          {section}
        </pre>
      );
    });
  };

  // Redirect non-admin users
  if (!loading && !isAdmin) {
    return <Navigate to="/study" replace />;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Ładowanie logów AI...</div>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title="AI Logs - Rejestr konwersacji z AI"
        description="Przeglądaj szczegółowe logi wszystkich konwersacji z AI, analizuj prompty i odpowiedzi"
      />
      
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isAdmin ? <Shield className="h-8 w-8" /> : <User className="h-8 w-8" />}
            <h1 className="text-4xl font-bold">Rejestr konwersacji AI</h1>
            {isAdmin && (
              <Badge variant="secondary" className="ml-2">
                Administrator
              </Badge>
            )}
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isAdmin 
              ? "Przeglądaj szczegółowe logi wszystkich interakcji z AI ze wszystkich kont - prompty, odpowiedzi i parametry wywołań"
              : "Przeglądaj szczegółowe logi wszystkich interakcji z AI - prompty, odpowiedzi i parametry wywołań"
            }
          </p>
          
          {isAdmin && (
            <Alert className="mt-4 max-w-2xl mx-auto">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Jako administrator masz dostęp do wszystkich logów AI ze wszystkich kont użytkowników.
                {userFilter === "all" ? " Obecnie wyświetlasz logi ze wszystkich kont." : ` Obecnie wyświetlasz logi dla wybranego użytkownika.`}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj w promptach i odpowiedziach..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={functionFilter} onValueChange={setFunctionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Funkcja AI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie funkcje</SelectItem>
                  <SelectItem value="skill-recognition">Rozpoznawanie umiejętności</SelectItem>
                  <SelectItem value="study-tutor">Korepetytor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Okres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="today">Dzisiaj</SelectItem>
                  <SelectItem value="week">Ostatni tydzień</SelectItem>
                </SelectContent>
              </Select>

              {isAdmin && (
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Użytkownik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszyscy użytkownicy</SelectItem>
                    <SelectItem value={user?.id || ""}>Tylko moje logi</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button onClick={loadLogs} variant="outline">
                Odśwież
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{groupedSessions.length}</div>
              <p className="text-sm text-muted-foreground">Sesji</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-sm text-muted-foreground">Wywołań AI</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Tokenów użytych</p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {groupedSessions.map((session) => (
            <Card key={session.sessionId}>
              <Collapsible 
                open={expandedSessions.has(session.sessionId)}
                onOpenChange={() => toggleSession(session.sessionId)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Sesja: {session.sessionId === 'no-session' ? 'Brak sesji' : session.sessionId.slice(0, 8)}...
                          {session.hasFormalSession ? (
                            <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-800">
                              Formalna sesja
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-2 text-xs text-orange-600 border-orange-300">
                              Tylko AI
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(session.startTime), 'dd.MM.yyyy HH:mm')}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {session.totalLogs} wywołań
                          </div>
                          <div className="flex items-center gap-1">
                            <Brain className="h-4 w-4" />
                            {session.functions.join(', ')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {session.activeChatMinutes} min aktywnego czatu
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">🪙</span>
                            {session.totalTokens} tokenów
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">💰</span>
                            ${session.totalCost.toFixed(2)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {session.userId}
                          </div>
                        </div>
                      </div>
                      {expandedSessions.has(session.sessionId) ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <Separator className="mb-6" />
                    <div className="space-y-6">
                      {session.logs.map((log) => (
                        <div key={log.id} className="border rounded-lg p-4 space-y-4">
                           <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {log.function_name}
                              </Badge>
                              {log.endpoint && (
                                <Badge variant="secondary">
                                  {log.endpoint}
                                </Badge>
                              )}
                              {isAdmin && (
                                <Badge variant="outline" className="text-xs">
                                  User: {session.sessionId.substring(0, 8)}...
                                </Badge>
                              )}
                              <span className="text-sm text-muted-foreground">
                                #{log.sequence_number}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {log.processing_time_ms && (
                                <span>{log.processing_time_ms}ms</span>
                              )}
                              {log.tokens_used && (
                                <span>{log.tokens_used} tokenów</span>
                              )}
                              {log.model_used && (
                                <span>{log.model_used}</span>
                              )}
                            </div>
                          </div>

                          {log.user_input && (
                            <div>
                              <Badge className="mb-2">INPUT UŻYTKOWNIKA</Badge>
                              <div className="bg-blue-50 p-3 rounded text-sm">
                                {log.user_input}
                              </div>
                            </div>
                          )}

                          <div>
                            <Badge className="mb-2">PROMPT DO AI</Badge>
                            <ScrollArea className="max-h-64 border rounded">
                              <div className="p-3">
                                {formatPrompt(log.full_prompt)}
                              </div>
                            </ScrollArea>
                          </div>

                          <div>
                            <Badge className="mb-2">ODPOWIEDŹ AI</Badge>
                            <ScrollArea className="max-h-64 border rounded">
                              <pre className="text-sm whitespace-pre-wrap p-3">
                                {log.ai_response}
                              </pre>
                            </ScrollArea>
                          </div>

                          {Object.keys(log.parameters || {}).length > 0 && (
                            <div>
                              <Badge variant="outline" className="mb-2">PARAMETRY</Badge>
                              <ScrollArea className="max-h-32 border rounded">
                                <pre className="text-xs p-3 text-muted-foreground">
                                  {JSON.stringify(log.parameters, null, 2)}
                                </pre>
                              </ScrollArea>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {groupedSessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Brak logów</h3>
              <p className="text-muted-foreground">
                {searchTerm || functionFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Nie znaleziono logów pasujących do filtrów.'
                  : 'Rozpocznij konwersację z AI, aby zobaczyć logi tutaj.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default AILogsPage;