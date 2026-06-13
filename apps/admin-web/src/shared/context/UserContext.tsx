import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getCurrentAccount, type Account } from "@/shared/services/accountService";
import { getCurrentSession, onAuthStateChanged } from "@/shared/services/authService";

interface UserContextValue {
  account: Account | null;
  session: Session | null;
  loading: boolean;
  setAccount: (account: Account | null) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const nextSession = await getCurrentSession();
        if (!mounted) return;
        setSession(nextSession);

        if (nextSession) {
          const nextAccount = await getCurrentAccount();
          if (!mounted) return;
          setAccount(nextAccount);
        }
      } catch (error) {
        console.error("[UserContext] Error inicializando sesión:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    const subscription = onAuthStateChanged(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        try {
          const nextAccount = await getCurrentAccount();
          if (!mounted) return;
          setAccount(nextAccount);
        } catch (error) {
          console.error("[UserContext] Error cargando cuenta actual:", error);
          if (mounted) setAccount(null);
        }
      } else if (mounted) {
        setAccount(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <UserContext.Provider value={{ account, session, loading, setAccount }}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}