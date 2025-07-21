import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Users, Crown, Sword, Calendar, UserPlus, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface StudyGroup {
  id: number;
  name: string;
  description: string;
  join_code: string;
  member_count: number;
  is_member: boolean;
  created_by: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  created_by: string;
  challenger_name: string;
  challenged_user: string;
  challenged_name: string;
  topic_name: string;
  difficulty_level: number;
  status: string;
  challenger_score: number;
  challenged_score: number;
  expires_at: string;
  created_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  name: string;
  total_points: number;
  lessons_completed: number;
  challenges_won: number;
  position: number;
}

export default function SocialPage() {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_public: false
  });

  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    challenged_user: '',
    topic_id: '',
    difficulty_level: 1
  });

  useEffect(() => {
    if (user) {
      fetchSocialData();
      fetchTopics();
    }
  }, [user]);

  const fetchTopics = async () => {
    const { data } = await supabase
      .from('topics')
      .select('id, name')
      .eq('is_active', true);
    
    if (data) setTopics(data);
  };

  const fetchSocialData = async () => {
    try {
      setLoading(true);

      // Fetch study groups
      const { data: groupsData } = await supabase
        .from('study_groups')
        .select('*');

      const { data: membersData } = await supabase
        .from('study_group_members')
        .select('group_id, user_id');

      if (groupsData && membersData) {
        const processedGroups = groupsData.map(group => ({
          ...group,
          member_count: membersData.filter(m => m.group_id === group.id).length,
          is_member: membersData.some(m => m.group_id === group.id && m.user_id === user?.id)
        }));
        setStudyGroups(processedGroups);
      }

      // Fetch challenges
      const { data: challengesData } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:profiles!created_by(name),
          challenged:profiles!challenged_user(name),
          topics(name)
        `)
        .or(`created_by.eq.${user?.id},challenged_user.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (challengesData) {
        const processedChallenges = challengesData.map((challenge: any) => ({
          ...challenge,
          challenger_name: challenge.creator?.name || 'Unknown',
          challenged_name: challenge.challenged?.name || 'Unknown',
          topic_name: challenge.topics?.name || 'Unknown'
        }));
        setChallenges(processedChallenges);
      }

      // Fetch leaderboards
      const currentWeek = new Date();
      currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
      
      const currentMonth = new Date();
      currentMonth.setDate(1);

      const { data: weeklyData } = await supabase
        .from('leaderboards')
        .select(`
          *,
          profiles(name)
        `)
        .eq('period_type', 'weekly')
        .gte('period_start', currentWeek.toISOString().split('T')[0])
        .order('total_points', { ascending: false })
        .limit(10);

      const { data: monthlyData } = await supabase
        .from('leaderboards')
        .select(`
          *,
          profiles(name)
        `)
        .eq('period_type', 'monthly')
        .gte('period_start', currentMonth.toISOString().split('T')[0])
        .order('total_points', { ascending: false })
        .limit(10);

      if (weeklyData) {
        const processedWeekly = weeklyData.map((entry: any, index) => ({
          ...entry,
          name: entry.profiles?.name || 'Unknown',
          position: index + 1
        }));
        setWeeklyLeaderboard(processedWeekly);
      }

      if (monthlyData) {
        const processedMonthly = monthlyData.map((entry: any, index) => ({
          ...entry,
          name: entry.profiles?.name || 'Unknown',
          position: index + 1
        }));
        setMonthlyLeaderboard(processedMonthly);
      }

    } catch (error) {
      console.error('Error fetching social data:', error);
      toast.error('Błąd podczas ładowania danych społecznościowych');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return;

    try {
      // Find group by join code
      const { data: group } = await supabase
        .from('study_groups')
        .select('id')
        .eq('join_code', joinCode.toUpperCase())
        .single();

      if (!group) {
        toast.error('Nieprawidłowy kod grupy');
        return;
      }

      // Join group
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: group.id,
          user_id: user?.id
        });

      if (error) {
        toast.error('Błąd podczas dołączania do grupy');
        return;
      }

      toast.success('Dołączono do grupy!');
      setJoinCode('');
      fetchSocialData();
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Błąd podczas dołączania do grupy');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;

    try {
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: group, error } = await supabase
        .from('study_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          join_code: joinCode,
          is_public: newGroup.is_public,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) {
        toast.error('Błąd podczas tworzenia grupy');
        return;
      }

      // Add creator as admin
      await supabase
        .from('study_group_members')
        .insert({
          group_id: group.id,
          user_id: user?.id,
          role: 'admin'
        });

      toast.success(`Grupa utworzona! Kod dołączania: ${joinCode}`);
      setShowCreateGroup(false);
      setNewGroup({ name: '', description: '', is_public: false });
      fetchSocialData();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Błąd podczas tworzenia grupy');
    }
  };

  const searchUsers = async () => {
    if (!searchUser.trim()) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .ilike('name', `%${searchUser}%`)
        .neq('user_id', user?.id)
        .limit(5);

      if (data) setFoundUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleCreateChallenge = async () => {
    if (!newChallenge.title.trim() || !newChallenge.challenged_user || !newChallenge.topic_id) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to complete

      const { error } = await supabase
        .from('challenges')
        .insert({
          title: newChallenge.title,
          description: newChallenge.description,
          created_by: user?.id,
          challenged_user: newChallenge.challenged_user,
          topic_id: parseInt(newChallenge.topic_id),
          difficulty_level: newChallenge.difficulty_level,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        toast.error('Błąd podczas tworzenia wyzwania');
        return;
      }

      toast.success('Wyzwanie wysłane!');
      setShowCreateChallenge(false);
      setNewChallenge({
        title: '',
        description: '',
        challenged_user: '',
        topic_id: '',
        difficulty_level: 1
      });
      setFoundUsers([]);
      setSearchUser('');
      fetchSocialData();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Błąd podczas tworzenia wyzwania');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Społeczność</h1>
        <p className="text-muted-foreground">Ucz się razem z innymi, rywalizuj i osiągaj więcej!</p>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">Rankingi</TabsTrigger>
          <TabsTrigger value="challenges">Wyzwania</TabsTrigger>
          <TabsTrigger value="groups">Grupy Nauki</TabsTrigger>
          <TabsTrigger value="achievements">Osiągnięcia</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Ranking Tygodniowy
                </CardTitle>
                <CardDescription>Top 10 uczniów tego tygodnia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyLeaderboard.map((entry, index) => (
                    <div key={entry.user_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-muted-foreground text-muted'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-sm text-muted-foreground">{entry.lessons_completed} lekcji</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{entry.total_points}</p>
                        <p className="text-xs text-muted-foreground">punktów</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  Ranking Miesięczny
                </CardTitle>
                <CardDescription>Top 10 uczniów tego miesiąca</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyLeaderboard.map((entry, index) => (
                    <div key={entry.user_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-muted-foreground text-muted'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          <p className="text-sm text-muted-foreground">{entry.challenges_won} wygranych</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{entry.total_points}</p>
                        <p className="text-xs text-muted-foreground">punktów</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Twoje Wyzwania</h2>
            <Dialog open={showCreateChallenge} onOpenChange={setShowCreateChallenge}>
              <DialogTrigger asChild>
                <Button>
                  <Sword className="h-4 w-4 mr-2" />
                  Wyślij Wyzwanie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Utwórz Nowe Wyzwanie</DialogTitle>
                  <DialogDescription>
                    Wyślij wyzwanie innemu uczniowi i sprawdź kto lepiej zna materiał!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Tytuł Wyzwania</Label>
                    <Input
                      id="title"
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                      placeholder="Np. Wyzwanie z Algebry"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Opis</Label>
                    <Textarea
                      id="description"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      placeholder="Opisz szczegóły wyzwania..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="search-user">Znajdź Ucznia</Label>
                    <div className="flex gap-2">
                      <Input
                        id="search-user"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        placeholder="Wpisz imię ucznia..."
                      />
                      <Button onClick={searchUsers} variant="outline">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {foundUsers.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {foundUsers.map((user) => (
                          <div
                            key={user.user_id}
                            className="p-2 border rounded cursor-pointer hover:bg-muted"
                            onClick={() => {
                              setNewChallenge({ ...newChallenge, challenged_user: user.user_id });
                              setFoundUsers([]);
                              setSearchUser(user.name);
                            }}
                          >
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="topic">Temat</Label>
                    <Select onValueChange={(value) => setNewChallenge({ ...newChallenge, topic_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz temat" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id.toString()}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Poziom Trudności</Label>
                    <Select onValueChange={(value) => setNewChallenge({ ...newChallenge, difficulty_level: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz poziom" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Łatwy</SelectItem>
                        <SelectItem value="2">Średni</SelectItem>
                        <SelectItem value="3">Trudny</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateChallenge}>Wyślij Wyzwanie</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <Badge variant={
                      challenge.status === 'pending' ? 'secondary' :
                      challenge.status === 'completed' ? 'default' :
                      'destructive'
                    }>
                      {challenge.status === 'pending' ? 'Oczekuje' :
                       challenge.status === 'completed' ? 'Zakończone' :
                       'Wygasłe'}
                    </Badge>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Wyzywający:</span>
                      <span className="font-medium">{challenge.challenger_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Wyzwany:</span>
                      <span className="font-medium">{challenge.challenged_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Temat:</span>
                      <span className="font-medium">{challenge.topic_name}</span>
                    </div>
                    {challenge.status === 'completed' && (
                      <div className="mt-4 p-3 bg-muted rounded">
                        <div className="flex justify-between items-center">
                          <span>{challenge.challenger_name}: {challenge.challenger_score}</span>
                          <span>{challenge.challenged_name}: {challenge.challenged_score}</span>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      Wygasa: {new Date(challenge.expires_at).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Grupy Nauki</h2>
            <div className="flex gap-2">
              <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Utwórz Grupę
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Utwórz Nową Grupę Nauki</DialogTitle>
                    <DialogDescription>
                      Stwórz grupę nauki i zaproś znajomych do wspólnego uczenia się!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nazwa Grupy</Label>
                      <Input
                        id="name"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        placeholder="Nazwa twojej grupy nauki"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Opis</Label>
                      <Textarea
                        id="description"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        placeholder="Opisz cel i zakres grupy..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateGroup}>Utwórz Grupę</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <div className="flex gap-2">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Kod grupy"
                  className="w-32"
                />
                <Button onClick={handleJoinGroup} variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Dołącz
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {group.name}
                    {group.is_member && (
                      <Badge variant="default">Członek</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{group.member_count} członków</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Kod: {group.join_code}
                    </div>
                    {!group.is_member && (
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => setJoinCode(group.join_code)}
                      >
                        Dołącz do grupy
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Osiągnięcia Społecznościowe</h2>
            <p className="text-muted-foreground mb-8">
              Zdobywaj specjalne osiągnięcia za aktywność w społeczności!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '⚔️', name: 'Pierwszy Wyzwanie', desc: 'Wyślij swoje pierwsze wyzwanie' },
                { icon: '🏆', name: 'Mistrz Wyzwań', desc: 'Wygraj 5 wyzwań z innymi uczniami' },
                { icon: '👥', name: 'Społecznik', desc: 'Dołącz do swojej pierwszej grupy' },
                { icon: '🎓', name: 'Mentor', desc: 'Utwórz grupę z 10 członkami' },
                { icon: '🥇', name: 'Top 10', desc: 'Znajdź się w top 10 rankingu' },
                { icon: '🤝', name: 'Współpracownik', desc: 'Weź udział w 5 sesjach grupowych' }
              ].map((achievement, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h3 className="font-bold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}