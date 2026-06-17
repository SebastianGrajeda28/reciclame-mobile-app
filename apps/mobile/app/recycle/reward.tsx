import { useLocalSearchParams } from 'expo-router';

import { AchievementRewardScreen } from '@/src/features/profile/screens/AchievementRewardScreen';

export default function RewardScreen() {
  const { badgeId } = useLocalSearchParams<{ badgeId: string }>();
  
  return <AchievementRewardScreen badgeId={badgeId} />;
}
