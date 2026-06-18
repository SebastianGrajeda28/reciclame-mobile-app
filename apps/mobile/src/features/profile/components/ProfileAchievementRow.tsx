import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { AppIcon, AppText, theme } from '@/src/ui';

type ProfileAchievementRowProps = {
  badge: Readonly<ProfileBadge>;
  onPress?: () => void;
};

export function ProfileAchievementRow({ badge, onPress }: Readonly<ProfileAchievementRowProps>) {
  const earned = !!badge.earnedAt;

  return (
    <Pressable 
      style={[styles.row, !earned && styles.rowLocked]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.imageWrap}>
        {earned ? (
          <Image
            source={badge.image}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <AppIcon name="lock" size={theme.iconSizes.md} color={theme.colors.textSecondary} />
        )}
      </View>

      <View style={styles.body}>
        <AppText variant="bodyS" style={[styles.name, !earned && styles.textMuted]}>
          {earned ? badge.name : '???'}
        </AppText>
        <AppText variant="caption" muted style={styles.hint}>
          {badge.hint}
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
  rowLocked: {
    opacity: 0.55,
  },
  imageWrap: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexShrink: 0,
  },
  image: {
    width: 38,
    height: 38,
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
