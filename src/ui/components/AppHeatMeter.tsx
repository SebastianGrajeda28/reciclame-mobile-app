import { StyleSheet, View } from 'react-native';

import { AppBarChart } from '@/src/ui/components/AppBarChart';
import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

type AppHeatMeterProps = {
  value: number;
  maxValue: number;
  label?: string;
  color?: string;
};

const TRACK_HEIGHT = 24;

export function AppHeatMeter({ value, maxValue, label, color }: AppHeatMeterProps) {
  return (
    <View style={styles.track}>
      <AppBarChart
        data={[
          {
            value,
            frontColor: color ?? theme.colors.warning,
          },
        ]}
        maxValue={maxValue}
        horizontal
        height={TRACK_HEIGHT}
        barWidth={TRACK_HEIGHT}
        spacing={0}
        chartProps={{
          backgroundColor: 'transparent',
        }}
      />
      {label ? (
        <View pointerEvents="none" style={styles.labelWrap}>
          <AppText variant="caption" style={styles.label}>
            {label}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: TRACK_HEIGHT,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.s3,
  },
  label: {
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeights.medium,
    textAlign: 'center',
  },
});
