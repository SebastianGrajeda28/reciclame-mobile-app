import { StyleSheet, View } from 'react-native';

import { ProfileAvatarDisplay } from '@/src/features/profile/components/ProfileAvatarDisplay';
import { AppButton, AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

type ProfileHeroCardProps = {
  displayName: string;
  email?: string;
  avatarUrl?: string;
  memberSinceLabel?: string;
  onCustomizePress: () => void;
  onSettingsPress: () => void;
};

export function ProfileHeroCard({
  displayName,
  email,
  avatarUrl,
  memberSinceLabel,
  onCustomizePress,
  onSettingsPress,
}: ProfileHeroCardProps) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroIdentity}>
        <AppIconButton
          accessibilityRole="button"
          accessibilityLabel="Abrir configuracion"
          onPress={onSettingsPress}
          variant="outline"
          style={styles.settingsButton}
          icon={
            <AppIcon name="settings" size={theme.iconSizes.md} color={theme.colors.textPrimary} />
          }
        />
        <ProfileAvatarDisplay avatarUrl={avatarUrl} displayName={displayName} size="lg" />
        <View style={styles.heroTextWrap}>
          <AppText variant="h1" style={styles.heroName}>
            {displayName}
          </AppText>
          {memberSinceLabel ? (
            <AppText muted style={styles.heroMeta}>
              {memberSinceLabel}
            </AppText>
          ) : null}
        </View>
      </View>

      <View style={styles.heroBottomRow}>
        {email ? (
          <View style={styles.infoBanner}>
            <AppIcon name="mail" size={theme.iconSizes.sm} color={theme.colors.primary} />
            <View style={styles.infoBannerText}>
              <AppText variant="bodyS">{email}</AppText>
            </View>
          </View>
        ) : null}
        <AppButton label="Personalizar" size="sm" onPress={onCustomizePress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: theme.spacing.s4,
  },
  heroIdentity: {
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  settingsButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  heroTextWrap: {
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  heroName: {
    textAlign: 'center',
  },
  heroMeta: {
    textAlign: 'center',
  },
  heroBottomRow: {
    gap: theme.spacing.s3,
    width: '100%',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.s3,
  },
  infoBannerText: {
    flex: 1,
  },
});
