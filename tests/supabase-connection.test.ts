import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const hasEnvVars = !!supabaseUrl && !!supabaseAnonKey;

describe('Conexión a Supabase', () => {
  (hasEnvVars ? test : test.skip)('Debería conectarse y leer la tabla health_check', async () => {
    console.log('URL:', JSON.stringify(supabaseUrl));
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { error } = await supabase.from('health_check').select('id').limit(1);
    expect(error).toBeNull();
  });
});
