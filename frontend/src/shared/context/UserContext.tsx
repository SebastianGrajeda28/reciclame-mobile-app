import { createContext, useContext, useEffect, useState } from "react";

export interface Account {
  id: string;
  email: string;
  name: string;
  role: string | null;
}

interface UserContextValue {
  account: Account | null;
  loading: boolean;
  setAccount: (account: Account | null) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: reemplazar con llamada real al endpoint de sesión
    setLoading(false);
  }, []);

  return (
    <UserContext.Provider value={{ account, loading, setAccount }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}