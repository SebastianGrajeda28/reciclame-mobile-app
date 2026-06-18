import { Image, StyleSheet, View } from 'react-native';

import { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { AppIcon, AppText, theme } from '@/src/ui';

type BadgeSize = 'sm' | 'md';

type ProfileBadgeItemProps = {
  badge: ProfileBadge;
  size?: BadgeSize;
  showName?: boolean;
};

const SIZES: Record<BadgeSize, { cell: number; image: number }> = {
  sm: { cell: 44, image: 36 },
  md: { cell: 64, image: 52 },
};

export function ProfileBadgeItem({
  badge,
  size = 'md',
  showName = false,
}: Readonly<ProfileBadgeItemProps>) {
  const locked = !badge.earnedAt;
  const dim = SIZES[size];

  return (
    <View style={[styles.wrapper, showName && styles.wrapperWithLabel]}>
      <View style={[styles.cell, { width: dim.cell, height: dim.cell }]}>
        {locked ? (
          <View style={[styles.lockedOverlay, { width: dim.image, height: dim.image }]}>
            <AppIcon name="lock" size={theme.iconSizes.sm} color={theme.colors.textSecondary} />
          </View>
        ) : (
          <Image
            source={badge.image}
            style={{ width: dim.image, height: dim.image }}
            resizeMode="contain"
          />
        )}
      </View>
      {showName && !locked ? (
        <AppText variant="caption" muted style={styles.label} numberOfLines={1}>
          {badge.name}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  wrapperWithLabel: {
    gap: theme.spacing.s1,
    width: 72,
  },
  cell: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lockedOverlay: {
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.disabled,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
