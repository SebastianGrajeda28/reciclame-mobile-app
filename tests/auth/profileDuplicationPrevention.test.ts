import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const hasEnvVars = !!supabaseUrl && !!supabaseAnonKey;

describe('Profile Duplication Prevention - RPC Tests', () => {
  (hasEnvVars ? test : test.skip)(
    'Debería verificar que last_login_at es actualizado correctamente sin afectar el perfil',
    async () => {
      // Preparar
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      // Actuar
      const { data, error } = await supabase.rpc('test_handle_new_user_on_login');

      // Afirmar
      expect(error).toBeNull();
      expect(data).not.toBeNull();

      if (data && data[0]) {
        const { last_login_updated } = data[0];
        expect(last_login_updated).toBe(true);
        console.log('✓ last_login_at actualizado en login subsecuente sin duplicar perfil');
      }
    }
  );

  (hasEnvVars ? test : test.skip)(
    'Debería completar el ciclo: crear usuario, verificar perfil, simular segundo login',
    async () => {
      // Preparar
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      // Actuar: Ejecutar test completo
      const { data, error } = await supabase.rpc('test_no_duplicate_on_subsequent_login');

      // Afirmar
      expect(error).toBeNull();
      expect(data).not.toBeNull();

      if (data && data[0]) {
        const result = data[0];

        // Verificar primer login
        expect(result.first_login_created_user).toBe(true);
        expect(result.first_login_created_profile).toBe(true);

        // Verificar que no hay duplicados después del segundo login
        expect(result.second_login_users_count).toBe(1);
        expect(result.second_login_profiles_count).toBe(1);
        expect(result.no_duplication).toBe(true);

        console.log('✓ Ciclo completo validado:');
        console.log('  - Primer login: usuario y perfil creados');
        console.log('  - Segundo login: sin duplicación');
      }
    }
  );

  (hasEnvVars ? test : test.skip)(
    'Debería preservar campos del perfil entre logins subsecuentes',
    async () => {
      // Preparar
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      // Actuar
      const { data, error } = await supabase.rpc('test_handle_new_user_on_non_login_update');

      // Afirmar
      expect(error).toBeNull();
      expect(data).not.toBeNull();

      if (data && data[0]) {
        const { last_login_unchanged } = data[0];
        expect(last_login_unchanged).toBe(true);
        console.log(
          '✓ Campos del perfil preservados correctamente en actualizaciones no-login'
        );
      }
    }
  );
});
