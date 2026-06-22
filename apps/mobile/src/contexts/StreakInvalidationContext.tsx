import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type StreakInvalidationContextValue = {
  version: number;
  invalidateStreak: () => void;
};

const StreakInvalidationContext = createContext<StreakInvalidationContextValue>({
  version: 0,
  invalidateStreak: () => {},
});

export function StreakInvalidationProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const invalidateStreak = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo(() => ({ version, invalidateStreak }), [version, invalidateStreak]);
  return (
    <StreakInvalidationContext.Provider value={value}>
      {children}
    </StreakInvalidationContext.Provider>
  );
}

export function useStreakInvalidation() {
  return useContext(StreakInvalidationContext);
}
