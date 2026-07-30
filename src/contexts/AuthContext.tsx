import { useCallback, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthHooks";
import { clearOwnerPersistence } from "@/features/persistence/browserStorage";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const ownerRef = useRef<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const nextOwner = session?.user.id ?? null;
      if (ownerRef.current && ownerRef.current !== nextOwner) clearOwnerPersistence(ownerRef.current);
      ownerRef.current = nextOwner;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      ownerRef.current = session?.user.id ?? null;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    if (ownerRef.current) clearOwnerPersistence(ownerRef.current);
    navigate("/auth");
  }, [navigate]);

  const authContextValue = useMemo(
    () => ({ user, session, loading, signOut }),
    [user, session, loading, signOut]
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
