import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/src/services/supabase/client';

WebBrowser.maybeCompleteAuthSession();

/**
 * Initiates Google OAuth sign-in via Supabase.
 *
 * Opens an in-app browser for the Google consent screen. On success,
 * exchanges the authorization code for a Supabase session, which triggers
 * `onAuthStateChange` listeners automatically.
 *
 * @throws {Error} If Supabase fails to generate the OAuth URL.
 * @throws {Error} If the user cancels or the browser session fails.
 * @throws {AuthError} If the code-for-session exchange fails.
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

/**
 * Signs the current user out and invalidates the Supabase session.
 *
 * @throws {AuthError} If the sign-out request fails.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
