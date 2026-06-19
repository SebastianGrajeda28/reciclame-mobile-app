import { useLocalSearchParams } from 'expo-router';

import { AchievementRewardScreen } from '@/src/features/profile/screens/AchievementRewardScreen';

export default function RewardScreen() {
  const { badgeId, badgeName, badgeReward, badgeDescription } =
    useLocalSearchParams<{
      badgeId: string;
      badgeName?: string;
      badgeReward?: string;
      badgeDescription?: string;
    }>();

  return (
    <AchievementRewardScreen
      badgeId={badgeId}
      badgeName={badgeName}
      badgeReward={badgeReward}
      badgeDescription={badgeDescription}
    />
  );
}
