export type UserRole = 'user' | 'admin' | 'sysadmin';

export type User = {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  createdAt?: string;
  role: UserRole;
};

export type UserProfile = {
  id: string;
  userId: string;
  alias?: string;
  avatarId?: string;
  universityId?: string;
  campusId?: string;
  createdAt: Date;
  updatedAt?: Date;
};

export type UserProgress = {
  id: string;
  userId: string;
  points: number;
  streakDays: number;
  heat?: number;
  level: number;
  lastRecyclingDate?: Date;
  updatedAt?: Date;
};

export type UserSetting = {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  skipRecyclingInstructions: boolean;
  profileVisibility?: string;
  language?: string;
  updatedAt?: Date;
};
