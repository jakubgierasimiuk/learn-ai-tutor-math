import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Redirect if already authenticated, except during password recovery
  useEffect(() => {
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    const isRecovery = recoveryMode || hash.includes("type=recovery") || search.includes("type=recovery");
    if (user && !isRecovery) {
      navigate("/");
    }
  }, [user, navigate, recoveryMode]);

  // Enable password recovery mode when user opens recovery link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        toast({ title: "Ustal nowe hasło", description: "Wpisz nowe hasło do konta." });
      }
    });

    // Fallback: detect via URL params/hash
    const hash = window.location.hash || "";
    const search = window.location.search || "";
    if (hash.includes("type=recovery") || search.includes("type=recovery")) {
      setRecoveryMode(true);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Błąd logowania",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Zalogowano pomyślnie",
          description: "Witaj z powrotem!",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        toast({
          title: "Błąd rejestracji",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Konto utworzone",
          description: "Sprawdź swoją skrzynkę email aby potwierdzić konto",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Błąd",
        description: "Wprowadź adres email",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`
      });

      if (error) {
        toast({
          title: "Błąd",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email wysłany",
          description: "Sprawdź swoją skrzynkę email z linkiem do zresetowania hasła",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił nieoczekiwany błąd",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast({
        title: "Zbyt słabe hasło",
        description: "Min. 8 znaków oraz kombinacja liter i cyfr",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Hasła się nie zgadzają",
        description: "Wpisz identyczne hasła",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: "Błąd", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Hasło zaktualizowane", description: "Zalogowano na nowe hasło" });
        setRecoveryMode(false);
        setNewPassword("");
        setConfirmPassword("");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Study & Learn</CardTitle>
          <CardDescription>
            Zaloguj się lub utwórz konto aby kontynuować
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recoveryMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Nowe hasło"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Powtórz nowe hasło"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleUpdatePassword}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Aktualizowanie..." : "Ustaw nowe hasło"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setRecoveryMode(false)}
              >
                Anuluj
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Logowanie</TabsTrigger>
                <TabsTrigger value="signup">Rejestracja</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSignIn} 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Logowanie..." : "Zaloguj się"}
                </Button>
                <Button 
                  onClick={handleForgotPassword} 
                  variant="outline" 
                  className="w-full" 
                  disabled={loading}
                >
                  Przypomnij hasło
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleSignUp} 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Tworzenie konta..." : "Utwórz konto"}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}