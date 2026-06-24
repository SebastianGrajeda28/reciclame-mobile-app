export type UserProfile = {
  id: string;
  userId: string;
  alias: string | null;
  avatarId: string | null;
  universityId: string | null;
  campusId: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type UserProgress = {
  id: string;
  userId: string;
  points: number;
  streakDays: number;
  heat: number;
  level: number;
  lastRecyclingDate: string | null;
  updatedAt: string | null;
};

export type UserSetting = {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  skipRecyclingInstructions: boolean;
  profileVisibility: string | null;
  language: string | null;
  locationVerificationEnabled: boolean;
  updatedAt: string | null;
};

export type Avatar = {
  id: string;
  userId: string;
  baseStyle: string | null;
  avatarConfig: unknown | null;
  frameRewardId: string | null;
  accessoryRewardId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};
