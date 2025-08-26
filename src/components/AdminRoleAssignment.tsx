import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const AdminRoleAssignment = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const assignAdminRole = async () => {
    if (!email.trim()) {
      toast({
        title: "Błąd",
        description: "Podaj adres email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('assign-admin-role', {
        body: { email: email.trim() }
      });

      if (error) throw error;

      toast({
        title: "Sukces",
        description: data.message || `Przyznano uprawnienia administratora dla ${email}`,
      });
      
      setEmail('');
    } catch (error) {
      console.error('Error assigning admin role:', error);
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się przyznać uprawnień",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Przyznaj uprawnienia administratora</CardTitle>
        <CardDescription>
          Nadaj uprawnienia administratora użytkownikowi na podstawie adresu email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Adres email</Label>
          <Input
            id="admin-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button 
          onClick={assignAdminRole} 
          disabled={loading || !email.trim()}
          className="w-full"
        >
          {loading ? 'Przyznawanie uprawnień...' : 'Przyznaj uprawnienia administratora'}
        </Button>
      </CardContent>
    </Card>
  );
};