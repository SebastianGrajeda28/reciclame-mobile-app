import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText, theme } from '@/src/ui';

type ProfileSettingsRowProps = {
  label: string;
  value?: string;
  icon?: ReactNode;
  onPress?: () => void;
  trailing?: ReactNode;
};

export function ProfileSettingsRow({
  label,
  value,
  icon,
  onPress,
  trailing,
}: ProfileSettingsRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.rowCard, pressed && onPress ? styles.rowPressed : null]}
    >
      <View style={styles.rowContent}>
        <View style={styles.rowLabelWrap}>
          {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
          <AppText>{label}</AppText>
        </View>
        <View style={styles.rowTrailingWrap}>
          {value ? (
            <AppText muted numberOfLines={1} style={styles.rowValue}>
              {value}
            </AppText>
          ) : null}
          {(trailing ?? onPress)
            ? (trailing ?? (
                <AppIcon
                  name="chevronRight"
                  size={theme.iconSizes.sm}
                  color={theme.colors.textSecondary}
                />
              ))
            : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.s4,
    minHeight: 72,
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  rowPressed: {
    opacity: 0.82,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.s3,
  },
  rowLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    flex: 1,
  },
  rowIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTrailingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    flexShrink: 1,
  },
  rowValue: {
    maxWidth: 132,
  },
});
