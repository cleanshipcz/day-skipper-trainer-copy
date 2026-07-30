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
  const authGenerationRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      authGenerationRef.current += 1;
      const nextOwner = session?.user.id ?? null;
      if (ownerRef.current && ownerRef.current !== nextOwner) clearOwnerPersistence(ownerRef.current);
      ownerRef.current = nextOwner;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    const requestGeneration = authGenerationRef.current;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (requestGeneration !== authGenerationRef.current) return;
      ownerRef.current = session?.user.id ?? null;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return;
    if (ownerRef.current) clearOwnerPersistence(ownerRef.current);
    navigate("/auth");
  }, [navigate]);

  const authContextValue = useMemo(
    () => ({ user, session, loading, signOut }),
    [user, session, loading, signOut]
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};
