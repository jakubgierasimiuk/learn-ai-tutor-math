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
    let isMounted = true;
    let profileTimeout: NodeJS.Timeout;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // If arriving from password recovery link, force redirect to the reset form
        if (event === "PASSWORD_RECOVERY") {
          if (typeof window !== 'undefined') {
            window.location.replace("/auth?type=recovery");
          }
          return;
        }

        // Defer Supabase calls to avoid deadlocks in auth callback
        if (session?.user && isMounted) {
          profileTimeout = setTimeout(async () => {
            if (!isMounted) return;
            
            try {
              // Ensure user profile exists
              const { data: existingProfile, error: profileErr } = await supabase
                .from('profiles')
                .select('user_id')
                .eq('user_id', session.user.id)
                .maybeSingle();

              if (profileErr) {
                console.error('Profile check error:', profileErr);
                return;
              }

              if (!existingProfile && isMounted) {
                const { error: insertErr } = await supabase.from('profiles').insert({
                  user_id: session.user.id,
                  email: session.user.email ?? '',
                  name: session.user.user_metadata?.name || '',
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
          }, 100);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(profileTimeout);
      subscription.unsubscribe();
    };
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