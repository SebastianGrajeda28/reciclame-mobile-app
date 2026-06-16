import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ProfileAchievementRow } from '@/src/features/profile/components/ProfileAchievementRow';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { profileGamificationSnapshot } from '@/src/features/profile/data/profileGamification';
import { AppChip, AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

type AchievementFilter = 'all' | 'unlocked' | 'locked';

export function ProfileAchievementsScreen() {
  const { allBadges } = profileGamificationSnapshot;
  const earned = allBadges.filter((b) => !!b.earnedAt);
  const locked = allBadges.filter((b) => !b.earnedAt);
  
  const [filter, setFilter] = useState<AchievementFilter>('all');

  const filteredBadges = (() => {
    switch (filter) {
      case 'unlocked':
        return earned;
      case 'locked':
        return locked;
      default:
        return [...earned, ...locked];
    }
  })();

  const filterOptions: readonly AchievementFilter[] = ['all', 'unlocked', 'locked'] as const;

  return (
    <ProfileScreenContainer>
      <ProfileSubpageHeader
        title="Logros"
        leading={
          <AppIconButton
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            variant="outline"
            icon={
              <AppIcon name="arrowLeft" size={theme.iconSizes.md} color={theme.colors.textPrimary} />
            }
          />
        }
      />

      <AppText muted>
        {earned.length} de {allBadges.length} obtenidos
      </AppText>

      <View style={styles.filterRow}>
        {filterOptions.map((option) => (
          <AppChip
            key={option}
            label={option === 'all' ? 'Todos' : option === 'unlocked' ? 'Desbloqueados' : 'Por desbloquear'}
            active={filter === option}
            onPress={() => setFilter(option)}
          />
        ))}
      </View>

      {filteredBadges.map((badge) => (
        <ProfileAchievementRow key={badge.id} badge={badge} />
      ))}
    </ProfileScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s2,
    marginVertical: theme.spacing.s3,
  },
});

export default ProfileAchievementsScreen;
