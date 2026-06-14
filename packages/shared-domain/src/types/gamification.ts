export type Achievement = {
  id: string;
  name: string;
  description: string | null;
  conditionType: string | null;
  conditionValue: number | null;
  rewardId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type Reward = {
  id: string;
  name: string;
  description: string | null;
  rewardType: string;
  assetUrl: string | null;
};
