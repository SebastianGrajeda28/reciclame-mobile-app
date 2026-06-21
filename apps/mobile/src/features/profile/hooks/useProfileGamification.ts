import { useCallback, useEffect, useState } from 'react';

import {
    getFeaturedAchievementIds,
    getProfileStats,
    getUserAchievements,
} from '@/src/features/profile/api/achievements';
import {
    BADGE_STATIC_DATA,
    FEATURED_BADGE_SLUG_FALLBACK,
    type ProfileBadge,
    type ProfileStat,
} from '@/src/features/profile/data/profileGamification';
import { useAuth } from '@/src/hooks/useAuth';

type ProfileGamification = {
  allBadges: ProfileBadge[];
  featuredBadges: ProfileBadge[];
  featuredSlugs: string[];
  slugToAchievementId: Map<string, string>;
  stats: ProfileStat[];
  lastUnlockedBadges: ProfileBadge[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

function formatActiveSince(isoDate: string | null): string {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return '—';
  const months = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
  if (months < 1) return 'Este mes';
  if (months === 1) return '1 mes';
  return `${months} meses`;
}

export function useProfileGamification(): ProfileGamification {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [allBadges, setAllBadges] = useState<ProfileBadge[]>([]);
  const [featuredSlugs, setFeaturedSlugs] = useState<string[]>([]);
  const [slugToAchievementId, setSlugToAchievementId] = useState<Map<string, string>>(new Map());
  const [stats, setStats] = useState<ProfileStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [achievements, profileStats, featuredIds] = await Promise.all([
        getUserAchievements(userId),
        getProfileStats(userId),
        getFeaturedAchievementIds(userId),
      ]);

      const badges: ProfileBadge[] = achievements.map((a) => {
        const staticData = BADGE_STATIC_DATA[a.slug];
        return {
          id: a.slug,
          name: a.name,
          image: staticData?.image ?? require('@/assets/images/achievements/ach_Icons_19.png'),
          description: a.description,
          unlockDescription: a.unlockDescription,
          userPercentage: staticData?.userPercentage ?? 0,
          earnedAt: a.earnedAt,
          reward: a.rewardName,
        };
      });

      // featuredIds from DB are achievement UUIDs — map to slugs
      const achievementIdToSlug = new Map(achievements.map((a) => [a.achievementId, a.slug]));
      const slugToId = new Map(achievements.map((a) => [a.slug, a.achievementId]));
      const resolvedFeaturedSlugs = featuredIds.length > 0
        ? featuredIds.map((id) => achievementIdToSlug.get(id)).filter(Boolean) as string[]
        : FEATURED_BADGE_SLUG_FALLBACK;

      const computedStats: ProfileStat[] = [
        {
          id: 'weight',
          value: `${profileStats.totalWeightKg} kg`,
          label: 'Peso total',
          icon: 'scale',
        },
        {
          id: 'items',
          value: String(profileStats.totalItems),
          label: 'Artículos reciclados',
          icon: 'recycle',
        },
        {
          id: 'active-since',
          value: formatActiveSince(profileStats.activeSinceIso),
          label: 'Activo desde',
          icon: 'calendar',
        },
        {
          id: 'badges',
          value: String(profileStats.badgesEarned),
          label: 'Insignias ganadas',
          icon: 'award',
        },
      ];

      setAllBadges(badges);
      setFeaturedSlugs(resolvedFeaturedSlugs);
      setSlugToAchievementId(slugToId);
      setStats(computedStats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando logros');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const featuredBadges = allBadges.filter((b) => featuredSlugs.includes(b.id));

  // Compute last 5 unlocked achievements (most recent first)
  const lastUnlockedBadges = allBadges
    .filter((b) => b.earnedAt)
    .sort((a, b) => {
      const dateA = new Date(a.earnedAt!).getTime();
      const dateB = new Date(b.earnedAt!).getTime();
      return dateB - dateA; // Most recent first
    })
    .slice(0, 5);

  return { allBadges, featuredBadges, featuredSlugs, slugToAchievementId, stats, loading, error, refetch: load, lastUnlockedBadges };
}
