import { AppGate } from '@/src/features/auth/components/AppGate';
import { AvatarConfigProvider } from '@/src/features/profile/hooks/useAvatarConfig';
import { RecycleFlowProvider } from '@/src/features/recycling/hooks/useRecycleFlow';
import { AuthProvider } from '@/src/hooks/useAuth';
import { UserSettingsProvider } from '@/src/hooks/useUserSettings';
import { AppIcon } from '@/src/ui';
import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const router = useRouter();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <UserSettingsProvider>
          <AvatarConfigProvider>
            <RecycleFlowProvider>
              <AppGate>
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
                    options={{ title: 'Reciclaje registrado', headerLeft: () => null }}
                  />
                  <Stack.Screen name="recycle/history" 
                  options={{ title: 'Historial',
                    headerLeft: () => (<Pressable 
                      onPress={() => router.replace('/(tabs)')}
                      hitSlop={12}
                      accessibilityRole="button"
                      accessibilityLabel="Volver al inicio"
                      >
                        <AppIcon name="arrowBack" size={24} color="#111" />
                      </Pressable>
                    ),
                   }} />
                </Stack>
              </AppGate>
            </RecycleFlowProvider>
          </AvatarConfigProvider>
        </UserSettingsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
