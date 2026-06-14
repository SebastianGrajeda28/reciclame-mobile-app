import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

type AppBadgeProps = {
  count: number;
  /** Max value shown before "9+" label */
  max?: number;
};

export function AppBadge({ count, max = 9 }: AppBadgeProps) {
  if (count <= 0) return null;

  const label = count > max ? `${max}+` : String(count);
  const wide = count > max || count > 9;

  return (
    <View style={[styles.badge, wide ? styles.wide : null]}>
      <AppText style={styles.text}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  wide: {
    minWidth: 24,
  },
  text: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.textInverse,
  },
});
