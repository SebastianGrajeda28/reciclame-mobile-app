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
import { Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
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
                        <Stack.Screen
                          name="profile/achievements"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen name="profile/avatar" options={{ headerShown: false }} />
                        <Stack.Screen name="profile/settings" options={{ headerShown: false }} />
                        <Stack.Screen name="profile/streak" options={{ headerShown: false }} />
                        <Stack.Screen name="recycle/camera" options={{ title: 'Escanear' }} />
                        <Stack.Screen
                          name="recycle/processing"
                          options={{ title: 'Procesar residuo' }}
                        />
                        <Stack.Screen
                          name="recycle/manual"
                          options={{ title: 'Selección manual' }}
                        />
                        <Stack.Screen
                          name="recycle/instructions"
                          options={{ title: 'Instrucciones' }}
                        />
                        <Stack.Screen
                          name="recycle/success"
                          options={{ title: 'Reciclaje registrado', headerLeft: () => null }}
                        />
                        <Stack.Screen name="recycle/history" options={{ title: 'Historial' }} />
                        <Stack.Screen name="oauth" options={{ headerShown: false }} />
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
