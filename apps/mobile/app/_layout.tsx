import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppGate } from '@/src/features/auth/components/AppGate';
import { AvatarConfigProvider } from '@/src/features/profile/hooks/useAvatarConfig';
import { RecycleFlowProvider } from '@/src/features/recycling/hooks/useRecycleFlow';
import { AuthProvider } from '@/src/hooks/useAuth';
import { UserSettingsProvider } from '@/src/hooks/useUserSettings';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <UserSettingsProvider>
          <AvatarConfigProvider>
            <RecycleFlowProvider>
              <AppGate>
                <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
                  <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
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
                    options={{ title: 'Reciclaje registrado', headerLeft: () => null }}
                  />
                  <Stack.Screen name="recycle/history" options={{ title: 'Historial' }} />
                </Stack>
              </AppGate>
            </RecycleFlowProvider>
          </AvatarConfigProvider>
        </UserSettingsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
