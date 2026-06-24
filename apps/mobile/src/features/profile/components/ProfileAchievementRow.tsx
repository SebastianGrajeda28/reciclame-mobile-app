import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { AppIcon, AppText, BadgeFrame, theme } from '@/src/ui';

type ProfileAchievementRowProps = {
  badge: Readonly<ProfileBadge>;
  onPress?: () => void;
};

export function ProfileAchievementRow({ badge, onPress }: Readonly<ProfileAchievementRowProps>) {
  const earned = !!badge.earnedAt;

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
    >
      <BadgeFrame image={badge.image} size="sm" locked={!earned} userPercentage={badge.userPercentage} />

      <View style={styles.body}>
        <AppText variant="bodyS" style={[styles.name, !earned && styles.textMuted]}>
          {earned ? badge.name : '???'}
        </AppText>
        <AppText variant="caption" muted style={styles.hint}>
          {badge.description}
        </AppText>
      </View>

      <View style={styles.meta}>
        <AppText variant="caption" muted style={styles.percentage}>
          {badge.userPercentage}%
        </AppText>
        {earned ? (
          <AppIcon name="checkCircle" size={theme.iconSizes.sm} color={theme.colors.success} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
    paddingVertical: theme.spacing.s3,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  body: {
    flex: 1,
    gap: theme.spacing.s1,
  },
  name: {
    fontWeight: '600',
  },
  textMuted: {
    color: theme.colors.textSecondary,
  },
  hint: {
    lineHeight: 16,
  },
  meta: {
    alignItems: 'center',
    gap: theme.spacing.s1,
    flexShrink: 0,
    width: 36,
  },
  percentage: {
    textAlign: 'center',
  },
});
