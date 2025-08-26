import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Clock, 
  Users, 
  MessageSquare, 
  CreditCard,
  ExternalLink,
  Filter,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

interface TokenLimitLog {
  id: string;
  user_id: string;
  session_id: string;
  timestamp: string;
  attempted_tokens: number;
  monthly_limit: number;
  tokens_used_this_month: number;
  subscription_type: string;
  conversation_length: number;
  skill_id: string;
  user_message: string;
  enriched_context_enabled: boolean;
  context_size: number;
}

export const TokenLimitDashboard = () => {
  const [logs, setLogs] = useState<TokenLimitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('token_limit_exceeded_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply subscription filter
      if (filter !== 'all') {
        query = query.eq('subscription_type', filter);
      }

      // Apply time filter
      if (timeFilter !== 'all') {
        const now = new Date();
        let fromDate = new Date();
        
        switch (timeFilter) {
          case '24h':
            fromDate.setHours(now.getHours() - 24);
            break;
          case '7d':
            fromDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            fromDate.setDate(now.getDate() - 30);
            break;
        }
        
        query = query.gte('timestamp', fromDate.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching token limit logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter, timeFilter]);

  const openChatSession = (sessionId: string) => {
    // Open chat page with specific session - you might need to implement session loading
    window.open(`/chat?session=${sessionId}`, '_blank');
  };

  const stats = {
    total: logs.length,
    freeUsers: logs.filter(log => log.subscription_type === 'free').length,
    premiumUsers: logs.filter(log => log.subscription_type === 'premium').length,
    avgConversationLength: logs.length > 0 ? 
      Math.round(logs.reduce((sum, log) => sum + log.conversation_length, 0) / logs.length) : 0,
    withEnrichedContext: logs.filter(log => log.enriched_context_enabled).length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="text-2xl font-bold">Przekroczenia Limitów Tokenów</h2>
        </div>
        <div className="text-center py-8">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="text-2xl font-bold">Przekroczenia Limitów Tokenów</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeFilter === '24h' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('24h')}
          >
            24h
          </Button>
          <Button
            variant={timeFilter === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('7d')}
          >
            7 dni
          </Button>
          <Button
            variant={timeFilter === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('30d')}
          >
            30 dni
          </Button>
          <Button
            variant={timeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeFilter('all')}
          >
            Wszystkie
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Łącznie</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Przekroczeń limitów
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Darmowi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Użytkownicy darmowi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            <p className="text-xs text-muted-foreground">
              Użytkownicy premium
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Śr. długość</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConversationLength}</div>
            <p className="text-xs text-muted-foreground">
              Wiadomości w rozmowie
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Z kontekstem</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withEnrichedContext}</div>
            <p className="text-xs text-muted-foreground">
              Wzbogacony kontekst
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Wszystkie
        </Button>
        <Button
          variant={filter === 'free' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('free')}
        >
          Darmowi
        </Button>
        <Button
          variant={filter === 'premium' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('premium')}
        >
          Premium
        </Button>
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Brak zarejestrowanych przekroczeń limitów tokenów w wybranym okresie.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="border-l-4 border-l-destructive">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={log.subscription_type === 'premium' ? 'default' : 'secondary'}>
                      {log.subscription_type === 'premium' ? 'Premium' : 'Darmowy'}
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(log.timestamp), { 
                        addSuffix: true, 
                        locale: pl 
                      })}
                    </Badge>
                    {log.enriched_context_enabled && (
                      <Badge variant="secondary">
                        Wzbogacony kontekst
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openChatSession(log.session_id)}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Zobacz rozmowę
                  </Button>
                </div>
                <CardDescription>
                  Użytkownik: {log.user_id} • Sesja: {log.session_id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">Użyte tokeny</p>
                    <p className="text-lg font-bold text-destructive">
                      {log.tokens_used_this_month.toLocaleString()} / {log.monthly_limit.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((log.tokens_used_this_month / log.monthly_limit) * 100)}% limitu
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Długość rozmowy</p>
                    <p className="text-lg font-bold">{log.conversation_length}</p>
                    <p className="text-xs text-muted-foreground">wiadomości</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Próbowany limit</p>
                    <p className="text-lg font-bold">{log.attempted_tokens}</p>
                    <p className="text-xs text-muted-foreground">tokenów</p>
                  </div>
                  {log.enriched_context_enabled && (
                    <div>
                      <p className="text-sm font-medium">Rozmiar kontekstu</p>
                      <p className="text-lg font-bold">{Math.round(log.context_size / 1024)}KB</p>
                      <p className="text-xs text-muted-foreground">dane kontekstu</p>
                    </div>
                  )}
                </div>
                
                {log.user_message && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Ostatnia wiadomość użytkownika:</p>
                    <p className="text-sm text-muted-foreground">{log.user_message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};