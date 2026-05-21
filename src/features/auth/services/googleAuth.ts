import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/src/services/supabase/client';

WebBrowser.maybeCompleteAuthSession();

/**
 * Opens Google OAuth in an in-app browser and exchanges the result for a Supabase session.
 * On success, `onAuthStateChange` fires automatically — no callback needed.
 *
 * @throws {Error} If the OAuth URL is missing, the browser is cancelled, or the session exchange fails.
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = Linking.createURL('/');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('Supabase did not return an OAuth URL');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success') {
    throw new Error('Google sign-in was cancelled or failed');
  }

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
  if (sessionError) throw sessionError;
}

/** Signs the current user out and invalidates the Supabase session. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
