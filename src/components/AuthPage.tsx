import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Podaj adres email");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast.error("Błąd logowania: " + error.message);
    } else {
      toast.success("Link do logowania został wysłany na Twój email!");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-6">
      <Card className="w-full max-w-md glass-card animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-2xl">🎓</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Tutor
            </CardTitle>
            <CardDescription className="text-base">
              Zaloguj się do swojego konta, aby kontynuować naukę
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Adres email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glow"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full button-glow"
              disabled={loading}
            >
              {loading ? "Wysyłanie..." : "Wyślij link do logowania"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Wyślemy Ci bezpieczny link do logowania na email.
              <br />
              Nie musisz pamiętać hasła!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};