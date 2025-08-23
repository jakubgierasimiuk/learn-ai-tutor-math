import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Seo } from '@/components/Seo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Clock, MessageSquare, Brain, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

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
}

const AILogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AILog[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<SessionGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [functionFilter, setFunctionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const loadLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('ai_conversation_log')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

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
        return {
          sessionId,
          logs: sortedLogs,
          startTime: sortedLogs[0]?.timestamp || '',
          totalLogs: sortedLogs.length,
          functions: [...new Set(sortedLogs.map(log => log.function_name))]
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
  }, [user, searchTerm, functionFilter, dateFilter]);

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
          <h1 className="text-4xl font-bold mb-4">Rejestr konwersacji AI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Przeglądaj szczegółowe logi wszystkich interakcji z AI - prompty, odpowiedzi i parametry wywołań
          </p>
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