import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppText } from '@/src/ui/components/AppText';
import { theme } from '@/src/ui/theme';

type Segment<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

type AppSegmentedControlProps<T extends string> = {
  segments: [Segment<T>, Segment<T>];
  value: T;
  onChange: (value: T) => void;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppSegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  dark = false,
  style,
}: AppSegmentedControlProps<T>) {
  return (
    <View style={[styles.track, dark ? styles.trackDark : styles.trackLight, style]}>
      {segments.map((seg) => {
        const isActive = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            onPress={() => onChange(seg.value)}
            style={[
              styles.segment,
              isActive ? (dark ? styles.segmentActiveDark : styles.segmentActiveLight) : null,
            ]}
          >
            <View style={styles.content}>
              {seg.icon ? <View style={styles.icon}>{seg.icon}</View> : null}
              <AppText
                style={[
                  styles.label,
                  isActive
                    ? dark ? styles.labelActiveDark : styles.labelActiveLight
                    : dark ? styles.labelInactiveDark : styles.labelInactiveLight,
                ]}
              >
                {seg.label}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: theme.radius.sm,
    padding: 3,
    height: theme.components.segmentedHeight,
  },
  trackLight: {
    backgroundColor: theme.colors.border,
  },
  trackDark: {
    backgroundColor: theme.colors.secondary,
  },
  segment: {
    flex: 1,
    borderRadius: theme.radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActiveLight: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.xs,
  },
  segmentActiveDark: {
    backgroundColor: theme.colors.secondaryPressed,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...theme.typography.bodyS,
    fontWeight: theme.fontWeights.semibold,
  },
  labelActiveLight: {
    color: theme.colors.textPrimary,
  },
  labelActiveDark: {
    color: theme.colors.textInverse,
  },
  labelInactiveLight: {
    color: theme.colors.textSecondary,
  },
  labelInactiveDark: {
    color: theme.colors.infoBg,
  },
});
