import { supabase } from '@/src/services/supabase/client';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Solo es necesario para Android/iOS
WebBrowser.maybeCompleteAuthSession();

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
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('Supabase no retornó una URL válida');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success' && result.url) {
      // 1. Extraemos todo lo que esté después del '#' o del '?'
      const urlString = result.url;
      const queryString = urlString.includes('#') 
        ? urlString.split('#')[1] 
        : urlString.split('?')[1];

      if (!queryString) {
        throw new Error('La URL de retorno no contiene parámetros.');
      }

      // 2. Convertimos el string de parámetros en un objeto fuertemente tipado
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

      // 3. Ejecutamos la lógica según lo que Supabase haya devuelto
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
    } else if (result.type === 'cancel') {
      throw new Error('OAuth cancelado por el usuario.');
    }
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