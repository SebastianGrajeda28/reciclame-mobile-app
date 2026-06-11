export type Friend = {
  id: string;
  name: string;
  avatarUrl?: string;
};

/** Medalla destacada de un amigo, resuelta desde la RPC. */
export type FriendMedal = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

/**
 * Perfil resumido de un amigo con los agregados resueltos en una
 * única consulta (`get_friends_with_profile`).
 */
export type FriendSummary = {
  id: string;
  name: string;
  currentStreak: number;
  avatarUrl?: string;
  lastActivityAt?: Date;
  featuredMedals: FriendMedal[];
};
