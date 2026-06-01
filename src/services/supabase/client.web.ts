import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://localhost';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    transport: ws as unknown as typeof WebSocket,
  },
});
