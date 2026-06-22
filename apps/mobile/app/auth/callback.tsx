import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { createSessionFromUrl, isOAuthRedirectUrl } from '@/src/features/auth/services/googleAuth';
import { useAuth } from '@/src/hooks/useAuth';
import { theme } from '@/src/ui';

/**
 * OAuth redirect landing route. Supabase/Google return here after sign-in.
 * Without this file, expo-router shows "Unmatched Route" for the callback URL.
 */
export default function AuthCallbackScreen() {
  const { session, loading } = useAuth();

  useEffect(() => {
    void (async () => {
      const url = await Linking.getInitialURL();
      if (url && isOAuthRedirectUrl(url)) {
        try {
          await createSessionFromUrl(url);
        } catch (error) {
          console.error('Auth callback error:', error);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (!loading && session) {
      router.replace('/(tabs)/map');
    }
  }, [loading, session]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
});
