import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = resolveSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://localhost');
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
