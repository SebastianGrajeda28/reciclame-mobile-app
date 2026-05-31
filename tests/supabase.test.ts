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

describe('handle_new_user', () => {
  (hasEnvVars ? test : test.skip)(
    'Debería crear el registro en users y user_profiles al insertar en auth.users',
    async () => {
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      const { data, error } = await supabase.rpc('test_handle_new_user_on_insert');

      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const result = data![0];
      console.log('Resultado insert:', result);
      expect(result.user_exists).toBe(true);
      expect(result.profile_exists).toBe(true);
      expect(result.last_login_filled).toBe(true);
    }
  );

  (hasEnvVars ? test : test.skip)(
    'Debería actualizar last_login_at al hacer login en auth.users',
    async () => {
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      const { data, error } = await supabase.rpc('test_handle_new_user_on_login');

      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const result = data![0];
      console.log('Resultado login:', result);
      expect(result.last_login_updated).toBe(true);
    }
  );

  (hasEnvVars ? test : test.skip)(
    'Debería no actualizar last_login_at al editar otro campo en auth.users',
    async () => {
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      const { data, error } = await supabase.rpc('test_handle_new_user_on_non_login_update');

      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const result = data![0];
      console.log('Resultado non-login update:', result);
      expect(result.last_login_unchanged).toBe(true);
    }
  );
});