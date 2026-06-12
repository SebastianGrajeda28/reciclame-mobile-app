import { StyleSheet, View } from 'react-native';

import { ProfileAvatarSwatch } from '@/src/features/profile/data/profileAvatarOptions';
import { AppIcon, theme } from '@/src/ui';

type ProfileAvatarSwatchGridProps = {
  swatches: readonly ProfileAvatarSwatch[];
};

export function ProfileAvatarSwatchGrid({ swatches }: ProfileAvatarSwatchGridProps) {
  return (
    <View style={styles.swatchGrid}>
      {swatches.map((swatch) => (
        <View key={swatch.id} style={styles.swatchCell}>
          {swatch.locked ? (
            <View style={styles.lockedSwatch}>
              <AppIcon name="lock" size={theme.iconSizes.sm} color={theme.colors.textPrimary} />
            </View>
          ) : (
            <View style={[styles.swatchColor, { backgroundColor: swatch.color }]} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s2,
  },
  swatchCell: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  swatchColor: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
  },
  lockedSwatch: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.disabled,
  },
});
