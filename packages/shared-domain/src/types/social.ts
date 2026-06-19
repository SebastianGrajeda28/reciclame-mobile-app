export type Friendship = {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  respondedAt: string | null;
};

export type FriendSummary = {
  id: string;
  name: string;
  currentStreak: number;
  avatarUrl?: string | null;
  avatarConfig?: Record<string, unknown> | null;
  lastActivityAt?: string | null;
  featuredMedals: FriendMedal[];
};

export type FriendMedal = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
};
