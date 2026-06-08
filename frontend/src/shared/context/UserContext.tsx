import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export interface Account {
  id: string;
  email: string;
  name: string;
  role: string | null;
}

interface UserContextValue {
  account: Account | null;
  session: Session | null;
  loading: boolean;
  setAccount: (account: Account | null) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

async function fetchMe(accessToken: string): Promise<Account | null> {
  console.log("[UserContext] Llamando /api/me con access_token:", accessToken.slice(0, 20) + "...");
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log("[UserContext] /api/me status:", res.status);
    if (!res.ok) {
      console.error("[UserContext] /api/me falló con status:", res.status);
      return null;
    }
    const data = await res.json();
    console.log("[UserContext] /api/me respuesta:", data);
    return data;
  } catch (err) {
    console.error("[UserContext] Error al llamar /api/me:", err);
    return null;
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const me = await fetchMe(session.access_token);
        setAccount(me);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const me = await fetchMe(session.access_token);
        setAccount(me);
      } else {
        setAccount(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ account, session, loading, setAccount }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}
