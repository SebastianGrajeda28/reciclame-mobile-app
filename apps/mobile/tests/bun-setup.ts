import { mock } from 'bun:test';

// Polyfill __DEV__ required by Expo modules (expo-sqlite, expo/async-require, etc.)
(global as unknown as Record<string, unknown>).__DEV__ = false;

// Stub react-native and AsyncStorage before any test file imports them.
// react-native/index.js uses Flow's `import typeof` syntax which Bun can't parse.
mock.module('react-native', () => ({
  Platform: { OS: 'ios' },
  TurboModuleRegistry: { get: () => null, getEnforcing: () => ({}) },
  NativeModules: {},
}));

mock.module('expo-sqlite', () => ({
  openDatabaseSync: () => ({
    execSync: () => {},
    runSync: () => {},
    getFirstSync: () => null,
    getAllSync: () => [],
    withTransactionSync: (fn: () => void) => fn(),
  }),
}));

mock.module('expo-file-system', () => {
  const store: Record<string, string> = {};
  class Dir {
    exists = true;
    create() {}
  }
  class Fil {
    private key: string;
    constructor(_dir: unknown, key: string) { this.key = key; }
    get exists() { return this.key in store; }
    async text() { return store[this.key] ?? null; }
    write(v: string) { store[this.key] = v; }
    delete() { delete store[this.key]; }
  }
  return { Directory: Dir, File: Fil, Paths: { document: '/tmp' } };
});

mock.module('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
    clear: () => Promise.resolve(),
  },
}));

// Polyfill browser globals required by @supabase/auth-js
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
