import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '@/src/services/supabase/client';

WebBrowser.maybeCompleteAuthSession();

const OAUTH_CALLBACK_PATH = 'auth/callback';

/**
 * Resolves the OAuth redirect URL for the current runtime.
 * - Expo Go (tunnel): exp://gc4g2yq-wolgan-8081.exp.direct/--/auth/callback
 * - Production AAB:   reciclamemobileapp://auth/callback
 */
export function getGoogleOAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'reciclamemobileapp',
    path: OAUTH_CALLBACK_PATH,
  });
}

export function isOAuthRedirectUrl(url: string): boolean {
  const redirectBase = getGoogleOAuthRedirectUri().split('?')[0];
  if (url.startsWith(redirectBase)) return true;
  // Expo Go may deliver the callback with query params on a slightly different base.
  return url.includes(`/${OAUTH_CALLBACK_PATH}`) || url.includes(`${OAUTH_CALLBACK_PATH}?`);
}

function parseAuthParams(url: string): Record<string, string> {
  const fragment = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
  if (!fragment) {
    throw new Error('La URL de retorno no contiene parámetros.');
  }

  return fragment.split('&').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
}

/** Exchange OAuth redirect URL for a Supabase session (PKCE code or implicit tokens). */
export async function createSessionFromUrl(url: string): Promise<void> {
  const params = parseAuthParams(url);
  const code = params.code;
  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return;
  }

  throw new Error('No se encontraron credenciales en la URL de retorno.');
}

function listenForOAuthRedirect(redirectTo: string): {
  promise: Promise<string>;
  cancel: () => void;
} {
  let resolve!: (url: string) => void;

  const promise = new Promise<string>((res) => {
    resolve = res;
  });

  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (isOAuthRedirectUrl(url)) {
      subscription.remove();
      resolve(url);
    }
  });

  return {
    promise,
    cancel: () => subscription.remove(),
  };
}

async function waitForOAuthRedirectUrl(oauthUrl: string, redirectTo: string): Promise<string> {
  const { promise: deepLinkPromise, cancel } = listenForOAuthRedirect(redirectTo);

  try {
    const browserPromise = WebBrowser.openAuthSessionAsync(oauthUrl, redirectTo, {
      showInRecents: true,
    })
      .then((result) => {
        if (result.type === 'success' && result.url) {
          return result.url;
        }
        if (result.type === 'cancel' || result.type === 'dismiss') {
          throw new Error('OAuth cancelado por el usuario.');
        }
        // Otros estados ('opened', etc.): esperamos el deep link de retorno.
        return deepLinkPromise;
      })
      .catch((browserErr: unknown) => {
        const msg = browserErr instanceof Error ? browserErr.message : String(browserErr);

        // Android: openAuthSessionAsync puede fallar con "activity no longer available"
        // cuando la Activity se destruye al lanzar el Chrome Custom Tab, o si el Custom
        // Tab no está disponible ("rejected"). En ese caso abrimos la URL en el navegador
        // externo; el intent-filter del deep link enrutará reciclamemobileapp://auth/callback
        // de vuelta a la app y el listener (deepLinkPromise) resolverá con la URL de retorno.
        if (msg.includes('no longer available') || msg.includes('rejected')) {
          return Linking.openURL(oauthUrl).then(() => deepLinkPromise);
        }

        throw browserErr;
      });

    return await Promise.race([browserPromise, deepLinkPromise]);
  } finally {
    cancel();
  }
}

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = getGoogleOAuthRedirectUri();

  if (__DEV__) {
    console.log('[OAuth] Add this EXACT URL to Supabase → Redirect URLs:', redirectTo);
  }

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

  const redirectUrl = await waitForOAuthRedirectUrl(data.url, redirectTo);
  await createSessionFromUrl(redirectUrl);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}