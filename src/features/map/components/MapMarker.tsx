import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

type Props = {
  number: number;
  selected?: boolean;
};

export function MapMarker({ number, selected }: Props) {
  return (
    <View style={[styles.outer, selected && styles.outerSelected]}>
      <View style={[styles.inner, selected && styles.innerSelected]}>
        <AppText style={[styles.label, selected && styles.labelSelected]}>{number}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.palette.green[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerSelected: {
    backgroundColor: theme.palette.green[200],
  },
  inner: {
    width: 26,
    height: 26,
    borderRadius: theme.radius.full,
    backgroundColor: theme.palette.green[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerSelected: {
    backgroundColor: theme.palette.green[700],
  },
  label: {
    color: theme.colors.textInverse,
    fontSize: 12,
    fontWeight: theme.fontWeights.bold,
    lineHeight: 14,
  },
  labelSelected: {},
});
