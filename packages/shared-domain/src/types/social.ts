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
  slug: string;
  name: string;
  description?: string | null;
};

export type FriendRequest = {
  id: string;
  requesterId: string;
  name: string;
  avatarConfig?: Record<string, unknown> | null;
  featuredMedals: FriendMedal[];
  createdAt: string;
};
