import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type CosmeticsInvalidationContextValue = {
  version: number;
  invalidateCosmetics: () => void;
};

const CosmeticsInvalidationContext = createContext<CosmeticsInvalidationContextValue>({
  version: 0,
  invalidateCosmetics: () => {},
});

export function CosmeticsInvalidationProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const invalidateCosmetics = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo(() => ({ version, invalidateCosmetics }), [version, invalidateCosmetics]);
  return (
    <CosmeticsInvalidationContext.Provider value={value}>
      {children}
    </CosmeticsInvalidationContext.Provider>
  );
}

export function useCosmeticsInvalidation() {
  return useContext(CosmeticsInvalidationContext);
}
