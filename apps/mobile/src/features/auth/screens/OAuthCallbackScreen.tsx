import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { supabase } from '@/src/services/supabase/client';

export function OAuthCallbackHandler() {
  const params = useLocalSearchParams<{ code?: string }>();

  useEffect(() => {
    const code = params.code;
    if (code) {
      supabase.auth.exchangeCodeForSession(code).finally(() => {
        router.replace('/(tabs)');
      });
    } else {
      router.replace('/(tabs)');
    }
  }, [params.code]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
