// Polyfill browser globals required by @react-native-async-storage and @supabase/auth-js
// when running under Bun's Node-like test environment.
if (typeof localStorage === 'undefined') {
  const store: Record<string, string> = {};
  const localStorageMock = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
  (global as unknown as Record<string, unknown>).localStorage = localStorageMock;
}
if (typeof window === 'undefined') {
  (global as unknown as Record<string, unknown>).window = global;
}
