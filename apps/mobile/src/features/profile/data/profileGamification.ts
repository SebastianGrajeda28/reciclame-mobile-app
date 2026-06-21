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
};

export const BADGE_STATIC_DATA: Record<string, BadgeStaticData> = {
  'primer-paso':            { image: require('@/assets/images/achievements/ach_Icons_19.png') },
  'semana-verde':           { image: require('@/assets/images/achievements/ach_Icons_30.png') },
  'mes-eco':                { image: require('@/assets/images/achievements/ach_Icons_20.png') },
  'decena':                 { image: require('@/assets/images/achievements/ach_Icons_13.png') },
  'centurion':              { image: require('@/assets/images/achievements/ach_Icons_16.png') },
  'leyenda':                { image: require('@/assets/images/achievements/ach_Icons_18.png') },
  'cazador-pilas':          { image: require('@/assets/images/achievements/desert_Icons_05.png') },
  'especialista-raee':      { image: require('@/assets/images/achievements/ach_Icons_34.png') },
  'vidriero':               { image: require('@/assets/images/achievements/desert_Icons_07.png') },
  'papelero':               { image: require('@/assets/images/achievements/desert_Icons_09.png') },
  'plastico-cero':          { image: require('@/assets/images/achievements/desert_Icons_21.png') },
  'todo-espectro':          { image: require('@/assets/images/achievements/ach_Icons_37.png') },
  'triple-verde':           { image: require('@/assets/images/achievements/ach_Icons_38.png') },
  'el-separador':           { image: require('@/assets/images/achievements/ach_Icons_39.png') },
  'responsable':            { image: require('@/assets/images/achievements/ach_Icons_36.png') },
  'dia-completo':           { image: require('@/assets/images/achievements/ach_Icons_35.png') },
  'explorador':             { image: require('@/assets/images/achievements/ach_Icons_29.png') },
  'nomade-verde':           { image: require('@/assets/images/achievements/ach_Icons_54.png') },
  'bibliofilo':             { image: require('@/assets/images/achievements/desert_Icons_20.png') },
  'racha-perfecta':         { image: require('@/assets/images/achievements/ach_Icons_25.png') },
  'constancia-hierro':      { image: require('@/assets/images/achievements/ach_Icons_28.png') },
  'corrector':              { image: require('@/assets/images/achievements/ach_Icons_31.png') },
  'meticuloso':             { image: require('@/assets/images/achievements/ach_Icons_48.png') },
  'amigo-reciclador':       { image: require('@/assets/images/achievements/ach_Icons_48.png') },
  'red-verde':              { image: require('@/assets/images/achievements/ach_Icons_50.png') },
};

export const FEATURED_BADGE_SLUG_FALLBACK = [
  'primer-paso', 'semana-verde', 'decena', 'explorador', 'amigo-reciclador',
];
