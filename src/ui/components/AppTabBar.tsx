import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, theme.spacing.s2);
  const containerHeight = theme.components.navbarHeight + theme.spacing.s2 + bottomInset;

  const visibleRoutes = state.routes.filter((route) => {
    const options = descriptors[route.key]?.options as { href?: unknown } | undefined;
    return options?.href !== null && route.name !== 'index';
  });

  return (
    <View
      style={[
        styles.outer,
        {
          height: containerHeight,
          paddingBottom: bottomInset,
        },
      ]}
    >
      <View style={styles.inner}>
        {visibleRoutes.map((route) => {
          const routeIndex = state.routes.findIndex((candidate) => candidate.key === route.key);
          const focused = state.index === routeIndex;
          const { options } = descriptors[route.key];
          const tintColor = focused ? theme.recycle.tabActive : theme.recycle.tabInactive;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const icon =
            typeof options.tabBarIcon === 'function'
              ? options.tabBarIcon({
                  focused,
                  color: tintColor,
                  size: theme.iconSizes.lg,
                })
              : null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.item}
            >
              <View style={styles.iconWrap}>{icon}</View>
              <AppText variant="caption" style={[styles.label, { color: tintColor }]}>
                {label}
              </AppText>
              <View style={[styles.indicator, focused ? styles.indicatorActive : null]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.components.screenPaddingHorizontal,
    paddingTop: theme.spacing.s2,
    justifyContent: 'flex-end',
  },
  inner: {
    height: theme.components.navbarHeight,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.s3,
    ...theme.shadows.card,
  },
  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.s3,
    paddingBottom: theme.spacing.s2,
  },
  iconWrap: {
    height: theme.iconSizes.lg,
    justifyContent: 'center',
  },
  label: {
    lineHeight: 16,
  },
  indicator: {
    width: 18,
    height: 3,
    borderRadius: theme.radius.full,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: theme.recycle.tabActive,
  },
});
