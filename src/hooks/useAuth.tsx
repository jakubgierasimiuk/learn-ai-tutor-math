import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // If arriving from password recovery link, force redirect to the reset form
        if (event === "PASSWORD_RECOVERY") {
          window.location.replace("/auth?type=recovery");
          return;
        }

        // Defer Supabase calls to avoid deadlocks in auth callback
        if (session?.user) {
          setTimeout(async () => {
            try {
              // Ensure user profile exists
              const { data: existingProfile, error: profileErr } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('user_id', session.user!.id)
                .maybeSingle();

              if (profileErr) {
                console.error('Profile check error:', profileErr);
              }

              if (!existingProfile) {
                const { error: insertErr } = await supabase.from('profiles').insert({
                  user_id: session.user!.id,
                  email: session.user!.email ?? '',
                  name: (session.user!.user_metadata as any)?.name || '',
                  level: 1,
                  total_points: 0,
                  diagnosis_completed: false,
                });
                if (insertErr) {
                  console.error('Profile auto-provision failed:', insertErr);
                }
              }
            } catch (e) {
              console.error('Error ensuring profile exists:', e);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};