import { Tabs } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { theme } from '@/src/ui';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.recycle.tabActive,
        tabBarInactiveTintColor: theme.recycle.tabInactive,
        tabBarLabelStyle: {
          fontSize: theme.fontSizes.xs,
          marginBottom: theme.spacing.xs,
        },
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
          title: 'Reciclar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sync-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="amigos"
        options={{
          title: 'Amigos',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="groups" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="yo"
        options={{
          title: 'Yo',
          tabBarIcon: ({ color, size }) => <FontAwesome6 name="user" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
