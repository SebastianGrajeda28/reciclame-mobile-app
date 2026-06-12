import { supabase } from '@/src/services/supabase/client';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Solo es necesario para Android/iOS
WebBrowser.maybeCompleteAuthSession();

/**
 * Procesa la URL de retorno (deep link) y crea la sesión en Supabase.
 */
async function handleAuthRedirectUrl(urlString: string): Promise<void> {
  const queryString = urlString.includes('#')
    ? urlString.split('#')[1]
    : urlString.split('?')[1];

  if (!queryString) {
    throw new Error('La URL de retorno no contiene parámetros.');
  }

  const params: Record<string, string> = queryString.split('&').reduce((acc, current) => {
    const [key, value] = current.split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);

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
}

export async function signInWithGoogle(): Promise<void> {
  try {
    const redirectTo = makeRedirectUri({
      scheme: 'reciclamemobileapp',
    });
    console.log('🔥 Pega esta URL exacta en Supabase Redirect URLs:', redirectTo);

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      return;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account', // ← fuerza elegir cuenta
        },
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('Supabase no retornó una URL válida');

    console.log('🔥 SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('🔥 OAuth URL:', data.url);

    // En lugar de depender de openAuthSessionAsync (que en builds release
    // a veces resuelve "dismiss" instantáneamente por el launchMode
    // singleTask), abrimos un navegador normal y escuchamos el deep link
    // de retorno con Linking.
    await new Promise<void>((resolve, reject) => {
      let settled = false;

      const finish = async (urlString: string) => {
        if (settled) return;
        settled = true;
        subscription.remove();

        try {
          await WebBrowser.dismissBrowser();
        } catch {
          // ignorar si ya se cerró
        }

        try {
          console.log('🔥 REDIRECT URL RECIBIDA:', urlString);
          await handleAuthRedirectUrl(urlString);
          resolve();
        } catch (e) {
          reject(e);
        }
      };

      const subscription = Linking.addEventListener('url', (event) => {
        if (event.url?.startsWith(redirectTo)) {
          finish(event.url);
        }
      });

      WebBrowser.openBrowserAsync(data.url).then((result) => {
        console.log('🔥 BROWSER RESULT:', JSON.stringify(result));
      });
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error en signInWithGoogle:', err.message);
    }
    throw err;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}