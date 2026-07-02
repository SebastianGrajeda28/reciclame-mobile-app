import { createClient } from '@supabase/supabase-js';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

// Fallback values allow the app to run without .env (auth calls will fail silently).
function resolveSupabaseUrl(rawUrl: string): string {
  if (Platform.OS !== 'android') return rawUrl;

  try {
    const url = new URL(rawUrl);

    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
      // Android emulators reach the host machine through 10.0.2.2 instead of localhost.
      url.hostname = '10.0.2.2';
      return url.toString();
    }
  } catch {
    return rawUrl;
  }

  return rawUrl;
}

// expo-file-system based storage avoids the AsyncStorage TurboModule registration
// bug in Expo SDK 54 + New Architecture release builds.
const STORAGE_DIR = new Directory(Paths.document, 'supabase-auth');

const FileSystemStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const file = new File(STORAGE_DIR, encodeURIComponent(key));
      if (!file.exists) return null;
      return await file.text();
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (!STORAGE_DIR.exists) STORAGE_DIR.create();
      new File(STORAGE_DIR, encodeURIComponent(key)).write(value);
    } catch {}
  },
  async removeItem(key: string): Promise<void> {
    try {
      const file = new File(STORAGE_DIR, encodeURIComponent(key));
      if (file.exists) file.delete();
    } catch {}
  },
};

const supabaseUrl = resolveSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://localhost');
//console.log(`[SUPABASE] URL: ${supabaseUrl}`);
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';
//console.log(`[SUPABASE] ANON KEY: ${supabaseAnonKey.substring(0, 8)}...`);  
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: FileSystemStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // importante en RN/Expo, no hay window.location
  },
});