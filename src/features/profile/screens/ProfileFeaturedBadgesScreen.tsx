import { useState } from 'react';

import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileBadgeItem } from '@/src/features/profile/components/ProfileBadgeItem';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { profileGamificationSnapshot } from '@/src/features/profile/data/profileGamification';
import { AppButton, AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

const MAX_FEATURED = 5;

export function ProfileFeaturedBadgesScreen() {
  const earned = profileGamificationSnapshot.allBadges.filter((b) => !!b.earnedAt);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(profileGamificationSnapshot.featuredBadgeIds as readonly string[]),
  );

  function toggleBadge(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_FEATURED) {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <ProfileScreenContainer>
      <ProfileSubpageHeader
        title="Personalizar insignias"
        leading={
          <AppIconButton
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
            onPress={() => router.back()}
            variant="outline"
            icon={
              <AppIcon name="close" size={theme.iconSizes.md} color={theme.colors.textPrimary} />
            }
          />
        }
      />

      <AppText muted>
        Seleccioná hasta {MAX_FEATURED} insignias para mostrar en tu perfil.{' '}
        {selected.size}/{MAX_FEATURED} elegidas.
      </AppText>

      <View style={styles.grid}>
        {earned.map((badge) => {
          const isSelected = selected.has(badge.id);
          const isDisabled = !isSelected && selected.size >= MAX_FEATURED;
          return (
            <Pressable
              key={badge.id}
              onPress={() => toggleBadge(badge.id)}
              style={[styles.badgeWrap, isSelected && styles.badgeSelected, isDisabled && styles.badgeDisabled]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected, disabled: isDisabled }}
            >
              <ProfileBadgeItem badge={badge} size="md" />
              {isSelected ? (
                <View style={styles.checkOverlay}>
                  <AppIcon name="check" size={theme.iconSizes.sm} color={theme.colors.textInverse} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <AppButton
        label="Guardar selección"
        onPress={() => router.back()}
      />
    </ProfileScreenContainer>
  );
}

export default ProfileFeaturedBadgesScreen;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s3,
  },
  badgeWrap: {
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  badgeSelected: {
    borderColor: theme.colors.primary,
  },
  badgeDisabled: {
    opacity: 0.4,
  },
  checkOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
