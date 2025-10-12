import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function AdminDeleteTestUsers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const deleteTestUsers = async () => {
    setLoading(true);
    const userIds = [
      '2a5adc5d-19eb-4185-8236-bf4eabd3f006', // j.gierasimiuk@goodspeed.pl
      '14738b6a-2ca0-45ad-9d20-38e3a8324091'  // jakub.gierasimiuk@o2.pl
    ];

    try {
      for (const userId of userIds) {
        const { data, error } = await supabase.functions.invoke('delete-user-cascade', {
          body: { userId }
        });

        if (error) {
          console.error('Error deleting user:', userId, error);
          toast({
            title: "Błąd",
            description: `Nie udało się usunąć użytkownika ${userId}: ${error.message}`,
            variant: "destructive"
          });
        } else {
          console.log('Deleted user:', userId, data);
        }
      }

      toast({
        title: "Sukces",
        description: "Usunięto użytkowników testowych i wszystkie powiązane dane",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas usuwania użytkowników",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuń użytkowników testowych</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Usuń użytkowników: j.gierasimiuk@goodspeed.pl i jakub.gierasimiuk@o2.pl wraz ze wszystkimi danymi
        </p>
        <Button onClick={deleteTestUsers} disabled={loading} variant="destructive">
          {loading ? "Usuwanie..." : "Usuń użytkowników testowych"}
        </Button>
      </CardContent>
    </Card>
  );
}
