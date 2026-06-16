import { router, useLocalSearchParams } from 'expo-router';

import { AchievementRewardScreen } from '@/src/features/profile/components/AchievementRewardScreen';
import { profileGamificationSnapshot } from '@/src/features/profile/data/profileGamification';

export default function RewardScreen() {
  const { badgeId } = useLocalSearchParams<{ badgeId: string }>();
  
  const badge = profileGamificationSnapshot.allBadges.find(b => b.id === badgeId);
  
  if (!badge) {
    // If no badge found, redirect to success screen
    router.replace('/recycle/success');
    return null;
  }
  
  return <AchievementRewardScreen badge={badge} />;
}
