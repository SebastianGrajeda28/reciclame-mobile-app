import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const hasEnvVars = !!supabaseUrl && !!supabaseAnonKey;

const TABLAS_ESPERADAS = 27;

describe('Migraciones de Supabase', () => {
  (hasEnvVars ? test : test.skip)(
    'Debería tener al menos las tablas esperadas en el schema public',
    async () => {
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      const { data, error } = await supabase.rpc('count_public_tables');

      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const tablas = data!.map((t: { table_name: string }) => t.table_name);
      console.log('Tablas encontradas:', tablas);  
      console.log('Número de tablas encontradas:', tablas.length);  
      expect(tablas.length).toBeGreaterThanOrEqual(TABLAS_ESPERADAS);
    }
  );
});