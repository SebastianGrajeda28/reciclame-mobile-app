import { View, StyleSheet } from 'react-native';

import { theme } from '@/src/ui/theme';

type Props = {
  selected?: boolean;
};

export function MapMarker({ selected }: Props) {
  const color = selected ? theme.palette.green[700] : theme.palette.green[600];
  return (
    <View style={styles.root}>
      <View style={[styles.head, { backgroundColor: color }]} />
      <View style={[styles.tail, { borderTopColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  head: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
