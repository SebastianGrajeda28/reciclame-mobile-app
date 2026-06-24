import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/src/services/supabase/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerPushToken(userId: string): Promise<void> {
  if (!Device.isDevice) return;

  // expo-notifications type mismatch: NotificationPermissionsStatus extends PermissionResponse
  // from 'expo', but expo doesn't export that type — so TS can't resolve the fields.
  // Cast to any to access the runtime .granted value.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let perms: any = await Notifications.getPermissionsAsync();

  if (!perms.granted) {
    perms = await Notifications.requestPermissionsAsync();
  }

  if (!perms.granted) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  const token = tokenData.data;
  const platform = Platform.OS as 'ios' | 'android' | 'web';

  await supabase.from('push_tokens').upsert(
    { user_id: userId, token, platform, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,token', ignoreDuplicates: false },
  );
}

export async function scheduleLocalNotification(title: string, body: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null,
  });
}

type NotificationData = {
  type?: 'streak_reminder' | 'streak_dropped' | 'friend_achievement' | 'inactive_48h';
};

function handleNotificationTap(response: Notifications.NotificationResponse): void {
  const data = response.notification.request.content.data as NotificationData;

  switch (data?.type) {
    case 'streak_reminder':
    case 'streak_dropped':
    case 'inactive_48h':
      router.push('/(tabs)/yo');
      break;
    case 'friend_achievement':
      router.push('/(tabs)/amigos');
      break;
    default:
      break;
  }
}

export function setupNotificationListeners(): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener(handleNotificationTap);
  return () => sub.remove();
}
