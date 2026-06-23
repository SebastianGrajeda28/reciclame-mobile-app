import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Fallback values allow the app to run without .env (auth calls will fail silently).
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://localhost';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // importante en RN/Expo, no hay window.location
  },
});