import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ProfileAchievementRow } from '@/src/features/profile/components/ProfileAchievementRow';
import { ProfileScreenContainer } from '@/src/features/profile/components/ProfileScreenContainer';
import { ProfileSubpageHeader } from '@/src/features/profile/components/ProfileSubpageHeader';
import { profileGamificationSnapshot } from '@/src/features/profile/data/profileGamification';
import { AppChip, AppIcon, AppIconButton, AppText, theme } from '@/src/ui';

type AchievementFilter = 'all' | 'unlocked' | 'locked';
type AchievementSort = 'default' | 'alphabetical' | 'date-desc' | 'date-asc';

export function ProfileAchievementsScreen() {
  const { allBadges } = profileGamificationSnapshot;
  const earned = allBadges.filter((b) => !!b.earnedAt);
  const locked = allBadges.filter((b) => !b.earnedAt);
  
  const [filter, setFilter] = useState<AchievementFilter>('all');
  const [sort, setSort] = useState<AchievementSort>('default');

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

  const sortedBadges = (() => {
    const badges = [...filteredBadges];
    switch (sort) {
      case 'alphabetical':
        return badges.sort((a, b) => a.name.localeCompare(b.name));
      case 'date-desc':
        return badges.sort((a, b) => {
          if (!a.earnedAt && !b.earnedAt) return 0;
          if (!a.earnedAt) return 1;
          if (!b.earnedAt) return -1;
          return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
        });
      case 'date-asc':
        return badges.sort((a, b) => {
          if (!a.earnedAt && !b.earnedAt) return 0;
          if (!a.earnedAt) return 1;
          if (!b.earnedAt) return -1;
          return new Date(a.earnedAt).getTime() - new Date(b.earnedAt).getTime();
        });
      default:
        return badges;
    }
  })();

  const filterOptions: readonly AchievementFilter[] = ['all', 'unlocked', 'locked'] as const;
  const sortOptions: readonly AchievementSort[] = ['default', 'alphabetical', 'date-desc', 'date-asc'] as const;

  const getSortLabel = (sortOption: AchievementSort) => {
    switch (sortOption) {
      case 'default':
        return 'Por defecto';
      case 'alphabetical':
        return 'A-Z';
      case 'date-desc':
        return 'Más recientes';
      case 'date-asc':
        return 'Más antiguos';
    }
  };

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

      <View style={styles.sortRow}>
        <AppText variant="caption" muted style={styles.sortLabel}>
          Ordenar por:
        </AppText>
        {sortOptions.map((option) => (
          <AppChip
            key={option}
            label={getSortLabel(option)}
            active={sort === option}
            onPress={() => setSort(option)}
          />
        ))}
      </View>

      {sortedBadges.map((badge) => (
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
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.s2,
    alignItems: 'center',
    marginBottom: theme.spacing.s3,
  },
  sortLabel: {
    marginRight: theme.spacing.s1,
  },
});

export default ProfileAchievementsScreen;
