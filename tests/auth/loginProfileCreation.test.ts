import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const hasEnvVars = !!supabaseUrl && !!supabaseAnonKey;

describe('Login Profile Creation', () => {
  (hasEnvVars ? test : test.skip)(
    'Debería crear un perfil de usuario en el primer login',
    async () => {
      // Preparar
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      // Actuar
      const { data, error } = await supabase.rpc('test_handle_new_user_on_insert');

      // Afirmar
      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const result = data![0];
      expect(result.user_exists).toBe(true);
      expect(result.profile_exists).toBe(true);
      expect(result.last_login_filled).toBe(true);
      console.log('✓ Primer login: Usuario y perfil creados correctamente');
    }
  );

  (hasEnvVars ? test : test.skip)(
    'Debería NO duplicar datos de usuario en logins subsecuentes',
    async () => {
      // Preparar
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      // Actuar
      const { data, error } = await supabase.rpc('test_no_duplicate_on_subsequent_login');

      // Afirmar
      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const result = data![0];
      console.log('Resultado de duplicación:', {
        first_login_created_user: result.first_login_created_user,
        first_login_created_profile: result.first_login_created_profile,
        second_login_users_count: result.second_login_users_count,
        second_login_profiles_count: result.second_login_profiles_count,
        no_duplication: result.no_duplication,
      });

      // Verificar que el primer login creó los registros
      expect(result.first_login_created_user).toBe(true);
      expect(result.first_login_created_profile).toBe(true);

      // Verificar que no se duplicaron los registros en el segundo login
      expect(result.second_login_users_count).toBe(1);
      expect(result.second_login_profiles_count).toBe(1);

      // Verificar la bandera de no duplicación
      expect(result.no_duplication).toBe(true);
      console.log('✓ Logins subsecuentes: Sin duplicación de datos');
    }
  );

  (hasEnvVars ? test : test.skip)(
    'Debería actualizar last_login_at en logins subsecuentes sin duplicar el perfil',
    async () => {
      // Preparar
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      // Actuar
      const { data, error } = await supabase.rpc('test_handle_new_user_on_login');

      // Afirmar
      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const result = data![0];
      expect(result.last_login_updated).toBe(true);
      console.log('✓ Login subsecuente: last_login_at actualizado correctamente');
    }
  );

  (hasEnvVars ? test : test.skip)(
    'Debería preservar last_login_at al editar otros campos del usuario',
    async () => {
      // Preparar
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      // Actuar
      const { data, error } = await supabase.rpc('test_handle_new_user_on_non_login_update');

      // Afirmar
      expect(error).toBeNull();
      expect(data).not.toBeNull();

      const result = data![0];
      expect(result.last_login_unchanged).toBe(true);
      console.log('✓ Edición no-login: last_login_at preservado correctamente');
    }
  );
});
