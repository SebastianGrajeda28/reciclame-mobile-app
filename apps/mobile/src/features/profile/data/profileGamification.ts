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
  icon: 'scale' | 'recycle' | 'calendar' | 'award';
};

type BadgeStaticData = {
  image: number;
  userPercentage: number;
};

export const BADGE_STATIC_DATA: Record<string, BadgeStaticData> = {
  'primer-paso':           { image: require('@/assets/images/achievements/ach_Icons_19.png'),   userPercentage: 89 },
  'semana-verde':          { image: require('@/assets/images/achievements/ach_Icons_30.png'),   userPercentage: 54 },
  'mes-eco':               { image: require('@/assets/images/achievements/ach_Icons_20.png'),   userPercentage: 12 },
  'decena':                { image: require('@/assets/images/achievements/ach_Icons_13.png'),   userPercentage: 67 },
  'centurion':             { image: require('@/assets/images/achievements/ach_Icons_16.png'),   userPercentage: 14 },
  'leyenda':               { image: require('@/assets/images/achievements/ach_Icons_18.png'),   userPercentage: 3  },
  'cazador-pilas':         { image: require('@/assets/images/achievements/desert_Icons_05.png'), userPercentage: 28 },
  'especialista-raee':     { image: require('@/assets/images/achievements/ach_Icons_34.png'),   userPercentage: 19 },
  'vidriero':              { image: require('@/assets/images/achievements/desert_Icons_07.png'), userPercentage: 33 },
  'papelero':              { image: require('@/assets/images/achievements/desert_Icons_20.png'), userPercentage: 41 },
  'plastico-cero':         { image: require('@/assets/images/achievements/desert_Icons_21.png'), userPercentage: 22 },
  'todo-espectro':         { image: require('@/assets/images/achievements/ach_Icons_37.png'),   userPercentage: 17 },
  'polimero-pro':          { image: require('@/assets/images/achievements/ach_Icons_38.png'),   userPercentage: 25 },
  'el-separador':          { image: require('@/assets/images/achievements/ach_Icons_39.png'),   userPercentage: 15 },
  'residuos-peligrosos':   { image: require('@/assets/images/achievements/desert_Icons_40.png'), userPercentage: 36 },
  'ingeniero-electronico': { image: require('@/assets/images/achievements/ach_Icons_36.png'),   userPercentage: 11 },
  'explorador':            { image: require('@/assets/images/achievements/ach_Icons_29.png'),   userPercentage: 44 },
  'nomade-verde':          { image: require('@/assets/images/achievements/ach_Icons_54.png'),   userPercentage: 21 },
  'bibliofilo':            { image: require('@/assets/images/achievements/desert_Icons_09.png'), userPercentage: 38 },
  'racha-perfecta':        { image: require('@/assets/images/achievements/ach_Icons_25.png'),   userPercentage: 48 },
  'constancia-hierro':     { image: require('@/assets/images/achievements/ach_Icons_28.png'),   userPercentage: 9  },
  'corrector':             { image: require('@/assets/images/achievements/ach_Icons_31.png'),   userPercentage: 31 },
  'meticuloso':            { image: require('@/assets/images/achievements/ach_Icons_35.png'),   userPercentage: 16 },
  'amigo-reciclador':      { image: require('@/assets/images/achievements/ach_Icons_48.png'),   userPercentage: 52 },
  'red-verde':             { image: require('@/assets/images/achievements/ach_Icons_50.png'),   userPercentage: 23 },
};

export const FEATURED_BADGE_SLUG_FALLBACK = [
  'primer-paso', 'semana-verde', 'decena', 'explorador', 'amigo-reciclador',
];
