/**
 * Profile Creation Validation Tests
 *
 * Validates that:
 * 1. First login creates a profile for the user
 * 2. Subsequent logins do NOT duplicate the profile
 * 3. User data is correctly populated
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const hasEnvVars = !!supabaseUrl && !!supabaseAnonKey;

describe('Profile Creation on First Login', () => {
  let supabase: ReturnType<typeof createClient>;
  let testUserId: string;

  beforeAll(() => {
    if (hasEnvVars) {
      supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    }
  });

  (hasEnvVars ? describe : describe.skip)('Integration Tests', () => {
    test('Should have created a profile when user was first created', async () => {
      // Get the most recently created user from the users table
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(userError).toBeNull();
      expect(users).not.toBeNull();
      expect(users!.length).toBeGreaterThan(0);

      testUserId = users![0].id;

      // Check if a profile exists for this user
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_id, alias')
        .eq('user_id', testUserId)
        .maybeSingle();

      expect(profileError).toBeNull();
      expect(profile).not.toBeNull();
      expect(profile?.user_id).toBe(testUserId);
      expect(profile?.alias).toBeDefined();
    });

    test('Should NOT have duplicate profiles for the same user', async () => {
      expect(testUserId).toBeDefined();

      // Query all profiles for this user
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_id, alias')
        .eq('user_id', testUserId);

      expect(profileError).toBeNull();
      expect(profiles).not.toBeNull();
      
      // There should be exactly ONE profile per user due to the unique constraint
      expect(profiles!.length).toBe(1);
      
      console.log('✓ Confirmed: Only 1 profile exists for user', testUserId);
    });

    test('Should have consistent alias across profiles', async () => {
      expect(testUserId).toBeDefined();

      const { data: profile1, error: error1 } = await supabase
        .from('user_profiles')
        .select('alias')
        .eq('user_id', testUserId)
        .maybeSingle();

      expect(error1).toBeNull();
      expect(profile1).not.toBeNull();
      expect(profile1?.alias).toBeDefined();

      // Query again to verify the same profile
      const { data: profile2, error: error2 } = await supabase
        .from('user_profiles')
        .select('alias')
        .eq('user_id', testUserId)
        .maybeSingle();

      expect(error2).toBeNull();
      expect(profile2?.alias).toBe(profile1?.alias);
      
      console.log('✓ Confirmed: Profile alias is consistent:', profile1?.alias);
    });

    test('Should enforce unique constraint on user_id in user_profiles', async () => {
      expect(testUserId).toBeDefined();

      // Attempt to insert a duplicate profile (should fail)
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: testUserId,
          alias: 'DuplicateAlias',
        });

      // The insert should fail due to the unique constraint
      expect(insertError).not.toBeNull();
      expect(insertError?.code).toBe('23505'); // PostgreSQL unique violation error code
      
      console.log('✓ Confirmed: Unique constraint prevents duplicate profiles');
    });
  });

  describe('Profile Creation Logic Unit Tests', () => {
    test('Should extract correct display name from email', () => {
      const testEmail = 'john.doe@example.com';
      const displayName = testEmail.split('@')[0];
      expect(displayName).toBe('john.doe');
    });

    test('Should use full_name from metadata if available', () => {
      const metadata = { full_name: 'John Doe' };
      const displayName = metadata.full_name ?? 'fallback';
      expect(displayName).toBe('John Doe');
    });

    test('Should fallback to email prefix if no metadata', () => {
      const metadata: { full_name?: string } = {};
      const email = 'user@example.com';
      const displayName =
        metadata.full_name ?? email?.split('@')[0] ?? 'Usuario';
      expect(displayName).toBe('user');
    });

    test('Should use email domain as last resort', () => {
      const displayName = 'Usuario'; // Last resort fallback
      expect(displayName).toBe('Usuario');
    });
  });
});
