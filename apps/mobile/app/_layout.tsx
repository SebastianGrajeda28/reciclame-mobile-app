import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CosmeticsInvalidationProvider } from '@/src/contexts/CosmeticsInvalidationContext';
import { RewardOverlayProvider } from '@/src/contexts/RewardOverlayContext';
import { StreakInvalidationProvider } from '@/src/contexts/StreakInvalidationContext';
import { DevPanel } from '@/src/dev/DevPanel';
import { AppGate } from '@/src/features/auth/components/AppGate';
import { AvatarConfigProvider } from '@/src/features/profile/hooks/useAvatarConfig';
import { RecycleRewardOverlay } from '@/src/features/recycling/components/RecycleRewardOverlay';
import { RecycleFlowProvider } from '@/src/features/recycling/hooks/useRecycleFlow';
import { AuthProvider } from '@/src/hooks/useAuth';
import { UserSettingsProvider } from '@/src/hooks/useUserSettings';
import { setupNotificationListeners } from '@/src/services/pushNotifications';
import { AppIcon } from '@/src/ui';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => setupNotificationListeners(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <UserSettingsProvider>
          <CosmeticsInvalidationProvider>
            <StreakInvalidationProvider>
              <RewardOverlayProvider>
                <AvatarConfigProvider>
                  <RecycleFlowProvider>
                    <AppGate>
                      {__DEV__ ? <DevPanel /> : null}
                      <RecycleRewardOverlay />
                      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="profile/achievements" options={{ headerShown: false }} />
                        <Stack.Screen name="profile/avatar" options={{ headerShown: false }} />
                        <Stack.Screen name="profile/settings" options={{ headerShown: false }} />
                        <Stack.Screen name="profile/streak" options={{ headerShown: false }} />
                        <Stack.Screen name="recycle/camera" options={{ title: 'Escanear' }} />
                        <Stack.Screen name="recycle/processing" options={{ title: 'Procesar residuo' }} />
                        <Stack.Screen name="recycle/manual" options={{ title: 'Seleccionar residuo' }} />
                        <Stack.Screen name="recycle/instructions" options={{ title: 'Instrucciones' }} />
                        <Stack.Screen
                          name="recycle/success"
                          options={{
                            title: 'Reciclaje registrado',
                            headerLeft: () => (
                              <Pressable
                                onPress={() => {
                                  console.log('[NAV] SuccessScreen — botón retroceder (header) presionado');
                                  router.replace('/(tabs)');
                                }}
                                hitSlop={12}
                                accessibilityRole="button"
                                accessibilityLabel="Volver al inicio"
                              >
                                <AppIcon name="arrowBack" size={24} color="#111" />
                              </Pressable>
                            ),
                          }}
                        />
                        <Stack.Screen
                          name="recycle/history"
                          options={{
                            title: 'Historial',
                            headerLeft: () => (
                              <Pressable
                                onPress={() => router.back()}
                                hitSlop={12}
                                accessibilityRole="button"
                                accessibilityLabel="Volver"
                              >
                                <AppIcon name="arrowBack" size={24} color="#111" />
                              </Pressable>
                            ),
                          }}
                        />
                      </Stack>
                    </AppGate>
                  </RecycleFlowProvider>
                </AvatarConfigProvider>
              </RewardOverlayProvider>
            </StreakInvalidationProvider>
          </CosmeticsInvalidationProvider>
        </UserSettingsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}