export type ProfileBadge = {
  id: string;
  name: string;
  image: number;
  description: string | null;
  unlockDescription: string | null;
  userPercentage: number;
  earnedAt: string | null;
  reward: string | null;
};

export type ProfileStat = {
  id: string;
  value: string;
  label: string;
  icon: 'scale' | 'recycle' | 'calendar' | 'award' | 'package';
};


export const FEATURED_BADGE_SLUG_FALLBACK = [
  'primer-paso', 'semana-verde', 'decena', 'explorador', 'amigo-reciclador',
];
