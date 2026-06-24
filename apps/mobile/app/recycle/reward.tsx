import { useLocalSearchParams } from 'expo-router';

import { AchievementRewardScreen } from '@/src/features/profile/screens/AchievementRewardScreen';

export default function RewardScreen() {
  const { badgeId, badgeName, badgeReward, badgeDescription, streakDays, leveledUp, level, streakExtendedToday, queue } =
    useLocalSearchParams<{
      badgeId?: string;
      badgeName?: string;
      badgeReward?: string;
      badgeDescription?: string;
      streakDays?: string;
      leveledUp?: string;
      level?: string;
      streakExtendedToday?: string;
      queue?: string;
    }>();

  return (
    <AchievementRewardScreen
      badgeId={badgeId}
      badgeName={badgeName}
      badgeReward={badgeReward}
      badgeDescription={badgeDescription}
      streakDays={streakDays}
      leveledUp={leveledUp}
      level={level}
      streakExtendedToday={streakExtendedToday}
      queue={queue}
    />
  );
}
