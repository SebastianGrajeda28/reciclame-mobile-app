import { supabase } from '@/src/services/supabase/client';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export async function signInWithGoogle(): Promise<void> {
  try {
    const redirectTo = makeRedirectUri({
      scheme: 'reciclamemobileapp',
      path: 'oauth',
    });

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
      return;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('Supabase no retornó una URL válida');

    // On Android, openAuthSessionAsync can fail with "activity no longer available"
    // when the Activity transitions during startup. We try it first; if it errors
    // or returns dismiss/cancel, fall back to Linking.openURL so the OS handles
    // the deep link return via the intent filter on the activity.
    let callbackUrl: string | null = null;

    try {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'success' && result.url) {
        callbackUrl = result.url;
      } else if (result.type === 'cancel') {
        throw new Error('OAuth cancelado por el usuario.');
      }
      // 'dismiss' means the user closed — treat as cancel
      else if (result.type === 'dismiss') {
        throw new Error('OAuth cancelado por el usuario.');
      }
    } catch (browserErr: unknown) {
      const msg = browserErr instanceof Error ? browserErr.message : String(browserErr);
      // Activity destroyed or Chrome Custom Tab unavailable — open in external browser.
      // The deep link intent filter will route reciclamemobileapp://oauth back to the app.
      if (msg.includes('no longer available') || msg.includes('rejected')) {
        await Linking.openURL(data.url);
        // Session will be picked up by the Supabase onAuthStateChange listener
        // when the deep link returns. Nothing more to do here.
        return;
      }
      throw browserErr;
    }

    if (!callbackUrl) return;

    const parsedUrl = new URL(callbackUrl);
    const queryString = parsedUrl.hash
      ? parsedUrl.hash.replace(/^#/, '')
      : parsedUrl.search.replace(/^\?/, '');

    if (!queryString) throw new Error('La URL de retorno no contiene parámetros.');

    const params: Record<string, string> = queryString.split('&').reduce(
      (acc, current) => {
        const [key, value] = current.split('=');
        if (key && value) acc[key] = decodeURIComponent(value);
        return acc;
      },
      {} as Record<string, string>
    );

    const code = params['code'];
    const accessToken = params['access_token'];
    const refreshToken = params['refresh_token'];

    if (code) {
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      if (sessionError) throw sessionError;
    } else if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) throw sessionError;
    } else {
      throw new Error('No se encontraron credenciales en la URL de retorno.');
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[auth] Error en signInWithGoogle:', err.message);
    }
    throw err;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
