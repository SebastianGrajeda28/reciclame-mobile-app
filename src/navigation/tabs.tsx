import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';

import { theme } from '@/src/ui';

export function getTabsScreenOptions(): BottomTabNavigationOptions {
  const isIOS = Platform.OS === 'ios';

  return {
    headerShown: false,
    tabBarActiveTintColor: theme.recycle.tabActive,
    tabBarInactiveTintColor: theme.recycle.tabInactive,
    tabBarLabelStyle: styles.label,
    tabBarItemStyle: styles.item,
    tabBarStyle: isIOS ? styles.iosTabBar : styles.androidTabBar,
  };
}

const styles = StyleSheet.create({
  label: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight,
    lineHeight: theme.typography.caption.lineHeight,
  },
  item: {
    paddingTop: theme.spacing.s3,
    paddingBottom: theme.spacing.s2,
  },
  iosTabBar: {
    backgroundColor: theme.colors.surface,
  },
  androidTabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
});
