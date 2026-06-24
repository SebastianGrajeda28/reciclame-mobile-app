import { StyleSheet, View } from 'react-native';

import { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { AppText, BadgeFrame, theme } from '@/src/ui';

type BadgeSize = 'sm' | 'md';

type ProfileBadgeItemProps = {
  badge: ProfileBadge;
  size?: BadgeSize;
  showName?: boolean;
};

const SIZE_MAP: Record<BadgeSize, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'md',
};

export function ProfileBadgeItem({
  badge,
  size = 'md',
  showName = false,
}: Readonly<ProfileBadgeItemProps>) {
  const locked = !badge.earnedAt;

  return (
    <View style={[styles.wrapper, showName && styles.wrapperWithLabel]}>
      <BadgeFrame image={badge.image} size={SIZE_MAP[size]} locked={locked} userPercentage={badge.userPercentage} />
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
  label: {
    textAlign: 'center',
  },
});
