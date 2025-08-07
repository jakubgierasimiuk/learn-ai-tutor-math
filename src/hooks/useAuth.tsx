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
  // TEMPORARY: Mock user for testing without authentication
  const mockUser: User = {
    id: "test-user-id-123",
    email: "test@example.com",
    user_metadata: {},
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;

  const mockSession: Session = {
    access_token: "mock-token",
    refresh_token: "mock-refresh",
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: "bearer",
    user: mockUser,
  } as Session;

  // For testing purposes, always return the mock user
  const [user] = useState<User | null>(mockUser);
  const [session] = useState<Session | null>(mockSession);
  const [loading] = useState(false);

  const signOut = async () => {
    // Mock sign out - do nothing for now
    console.log("Mock sign out");
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