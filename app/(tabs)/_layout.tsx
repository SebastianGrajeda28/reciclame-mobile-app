import { Tabs } from 'expo-router';

import { AppIcon, AppTabBar } from '@/src/ui';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Reciclaje',
          tabBarIcon: ({ color, size }) => <AppIcon name="recycle" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="amigos"
        options={{
          title: 'Amigos',
          tabBarIcon: ({ color, size }) => <AppIcon name="users" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="yo"
        options={{
          title: 'Yo',
          tabBarIcon: ({ color, size }) => <AppIcon name="user" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
