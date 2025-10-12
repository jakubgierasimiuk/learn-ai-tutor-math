import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, Clock, Gift, AlertCircle, RefreshCw } from "lucide-react";

interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referral_code: string;
  stage: string;
  risk_score: number;
  created_at: string;
  activated_at: string | null;
  converted_at: string | null;
  referrer: { email: string; name: string } | null;
  referred: { email: string; name: string } | null;
}

interface ReferralEvent {
  id: string;
  event_type: string;
  payload: any;
  created_at: string;
}

export const ReferralsDebugPanel = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [filterEmail, setFilterEmail] = useState("");
  const { toast } = useToast();

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch profiles separately to avoid foreign key issues
      if (data && data.length > 0) {
        const referrerIds = [...new Set(data.map(r => r.referrer_id))];
        const referredIds = [...new Set(data.map(r => r.referred_user_id))];
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email, name')
          .in('user_id', [...referrerIds, ...referredIds]);
        
        const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        const enriched = data.map(r => ({
          ...r,
          referrer: profilesMap.get(r.referrer_id) || null,
          referred: profilesMap.get(r.referred_user_id) || null
        }));
        
        if (filterEmail) {
          const filtered = enriched.filter((r: any) => 
            r.referrer?.email?.includes(filterEmail) || 
            r.referred?.email?.includes(filterEmail)
          );
          setReferrals(filtered);
        } else {
          setReferrals(enriched);
        }
      } else {
        setReferrals([]);
      }
    } catch (error: any) {
      console.error('Error fetching referrals:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać poleceń",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (referralId: string) => {
    try {
      const { data, error } = await supabase
        .from('referral_events')
        .select('*')
        .eq('referral_id', referralId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleForceStage = async (referralId: string, newStage: 'activated' | 'converted') => {
    try {
      const action = newStage === 'activated' ? 'check_activation' : 'complete_conversion';
      
      const { data, error } = await supabase.functions.invoke('process-referral-v2', {
        body: {
          referralCode: referrals.find(r => r.id === referralId)?.referral_code,
          action: action
        }
      });

      if (error) throw error;

      toast({
        title: "Sukces",
        description: `Referral przeszedł do etapu: ${newStage}`
      });

      fetchReferrals();
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się zmienić etapu",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const getStageBadge = (stage: string) => {
    const variants: Record<string, any> = {
      invited: { color: "secondary", icon: <Clock className="h-3 w-3" /> },
      activated: { color: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
      converted: { color: "default", icon: <Gift className="h-3 w-3 text-primary" /> }
    };

    const variant = variants[stage] || { color: "secondary", icon: null };

    return (
      <Badge variant={variant.color as any} className="gap-1">
        {variant.icon}
        {stage}
      </Badge>
    );
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return <Badge variant="default" className="bg-green-500">Niskie ({score})</Badge>;
    if (score >= 50) return <Badge variant="secondary">Średnie ({score})</Badge>;
    return <Badge variant="destructive">Wysokie ({score})</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Referrals Debug Panel</CardTitle>
          <CardDescription>
            Zarządzanie i debugowanie systemu poleceń
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Filtruj po emailu..."
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={fetchReferrals} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Odśwież
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Polecający</TableHead>
                  <TableHead>Polecony</TableHead>
                  <TableHead>Kod</TableHead>
                  <TableHead>Etap</TableHead>
                  <TableHead>Ryzyko</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-mono text-xs">
                      {referral.referrer?.email || 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {referral.referred?.email || 'N/A'}
                    </TableCell>
                    <TableCell className="font-mono font-bold">
                      {referral.referral_code}
                    </TableCell>
                    <TableCell>
                      {getStageBadge(referral.stage)}
                    </TableCell>
                    <TableCell>
                      {getRiskBadge(referral.risk_score)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString('pl-PL')}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedReferral(referral);
                              fetchEvents(referral.id);
                            }}
                          >
                            Szczegóły
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Szczegóły Referral</DialogTitle>
                            <DialogDescription>
                              Kod: {selectedReferral?.referral_code}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Polecający:</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedReferral?.referrer?.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Polecony:</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedReferral?.referred?.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Utworzono:</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedReferral && new Date(selectedReferral.created_at).toLocaleString('pl-PL')}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Aktywowano:</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedReferral?.activated_at 
                                    ? new Date(selectedReferral.activated_at).toLocaleString('pl-PL')
                                    : 'Nie'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Konwersja:</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedReferral?.converted_at 
                                    ? new Date(selectedReferral.converted_at).toLocaleString('pl-PL')
                                    : 'Nie'}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm font-medium">Force Actions:</p>
                              <div className="flex gap-2">
                                {selectedReferral?.stage === 'invited' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleForceStage(selectedReferral.id, 'activated')}
                                  >
                                    Force Activate
                                  </Button>
                                )}
                                {selectedReferral?.stage === 'activated' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleForceStage(selectedReferral.id, 'converted')}
                                  >
                                    Force Convert
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-sm font-medium">Historia Eventów:</p>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {events.map((event) => (
                                  <div key={event.id} className="border rounded p-2 text-xs">
                                    <div className="flex justify-between items-center">
                                      <Badge variant="outline">{event.event_type}</Badge>
                                      <span className="text-muted-foreground">
                                        {new Date(event.created_at).toLocaleString('pl-PL')}
                                      </span>
                                    </div>
                                    <pre className="mt-2 text-xs bg-muted p-2 rounded">
                                      {JSON.stringify(event.payload, null, 2)}
                                    </pre>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};