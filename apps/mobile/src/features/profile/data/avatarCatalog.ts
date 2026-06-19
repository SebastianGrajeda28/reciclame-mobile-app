import { avatarAssets } from './avatarAssets';

export type AvatarRace = 'human' | 'elf' | 'dwarf' | 'orc' | 'goblin' | 'halfling';

export type AvatarConfig = {
  race: AvatarRace;
  skin: string;
  bg: string;
  ears: string;
  nose: string;
  mouth: string;
  eyeColor: string;
  eyeStyle: string;
  brows: string;
  hair: string | null;
  hat: string | null;
  clothes: string | null;
  beard: string | null;
  moustache: string | null;
};

export const RACES: AvatarRace[] = ['human', 'elf', 'dwarf', 'orc', 'goblin', 'halfling'];

export const RACE_LABELS: Record<AvatarRace, string> = {
  human: 'Humano',
  elf: 'Elfo',
  dwarf: 'Enano',
  orc: 'Orco',
  goblin: 'Goblin',
  halfling: 'Halfling',
};

export const RACE_SKINS: Record<AvatarRace, string[]> = {
  human: ['black', 'brown', 'pale', 'white'],
  elf: ['albino', 'purple', 'soft', 'tourmaline'],
  dwarf: ['bronzed', 'obsidian', 'rosacea', 'stone'],
  orc: ['dark', 'emerald', 'green', 'olive'],
  goblin: ['desert', 'grassland', 'swamp', 'tundra'],
  halfling: ['apple', 'blueberry', 'chestnut', 'wheat'],
};

export const EYE_COLORS: Record<AvatarRace, string[]> = RACE_SKINS;

export const EYE_STYLES = [
  'angry',
  'happy',
  'mini',
  'narrow',
  'pissed',
  'round',
  'sad',
  'small',
  'suspicious',
  'tall',
];

export const EAR_STYLES = [
  'big',
  'bitten',
  'mini',
  'monk',
  'monkey',
  'normal',
  'pressed',
  'protruding',
  'small',
  'tall',
];

export const NOSE_STYLES = [
  'ball',
  'big',
  'fat',
  'flat',
  'mini',
  'oink',
  'pointy',
  'rounded',
  'small',
  'straight',
];

export const MOUTH_STYLES = [
  'confident',
  'frown',
  'grimace',
  'grit',
  'happy',
  'laugh',
  'neutral',
  'pursed',
  'sad',
  'small',
  'smile',
  'surprise',
];

export const HAIR_COLORS = [
  'black',
  'blonde',
  'blue',
  'brown',
  'green',
  'pink',
  'purple',
  'red',
  'turquoise',
  'white',
];

export const HAIR_STYLES = [
  'afro',
  'bald',
  'bobcut',
  'bow',
  'bows',
  'bubbles',
  'dcut',
  'long',
  'mane',
  'middle_part',
  'mohawk',
  'ponytail',
  'short',
  'spikes',
  'tip',
  'toupee',
  'vcut',
];

export const BROW_COLORS = [
  'black',
  'blonde',
  'blue',
  'brown',
  'green',
  'pink',
  'purple',
  'red',
  'turquoise',
  'white',
];
export const BROW_STYLES = [
  'aggressive',
  'angry',
  'confident',
  'disheveled',
  'happy',
  'innocent',
  'nice',
  'normal',
  'pity',
  'sad',
  'thick',
  'unibrow',
  'worry',
  'wrapping',
];

export const HAT_COLORS = [
  'black',
  'black_leather',
  'blue',
  'bronze',
  'brown_leather',
  'gold',
  'green',
  'grey',
  'iron',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'silver',
  'turquoise',
  'white',
  'white_leather',
  'yellow',
];
export const HAT_STYLES = [
  'bandana',
  'beanie',
  'cowboy',
  'engineer',
  'fedora',
  'hood',
  'knight',
  'ranger',
  'soldier',
  'tall',
  'trapper',
  'warrior',
];

export const CLOTHES_COLORS = [
  'black',
  'black_leather',
  'blue',
  'bronze',
  'brown_leather',
  'gold',
  'green',
  'grey',
  'iron',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'silver',
  'turquoise',
  'white',
  'white_leather',
  'yellow',
];
export const CLOTHES_STYLES = ['breastplate', 'brute', 'doublet', 'robe', 'vest'];

export const BEARD_COLORS = [
  'black',
  'blonde',
  'blue',
  'brown',
  'green',
  'pink',
  'purple',
  'red',
  'turquoise',
  'white',
];
export const BEARD_STYLES = [
  'braided',
  'chops',
  'classic',
  'curtain',
  'dutch',
  'egyptian',
  'fork',
  'garibaldi',
  'goatee',
  'long',
  'lumberjack',
  'shaft',
  'shaman',
  'sideburns',
  'viking',
];

export const MOUSTACHE_COLORS = [
  'black',
  'blonde',
  'blue',
  'brown',
  'green',
  'pink',
  'purple',
  'red',
  'turquoise',
  'white',
];
export const MOUSTACHE_STYLES = [
  'bandit',
  'cowboy',
  'dali',
  'dallas',
  'elder',
  'horseshoe',
  'hungarian',
  'moebius',
  'pencil',
  'professor',
  'toothbrush',
  'zorro',
];

export const BG_STYLES = ['normal', 'light'];
export const BG_COLORS = [
  'blue',
  'green',
  'khaki',
  'lime',
  'marine',
  'pink',
  'purple',
  'red',
  'salmon',
  'sky',
  'turquoise',
  'violet',
  'yellow',
];

export const SKIN_COLOR_HEX: Record<string, string> = {
  // human
  black: '#3D2314',
  brown: '#8D5524',
  pale: '#F1C27D',
  white: '#FDDBB4',
  // elf
  albino: '#F5E6D3',
  purple: '#9B6B9B',
  soft: '#C8A882',
  tourmaline: '#7BA99B',
  // dwarf
  bronzed: '#A0522D',
  obsidian: '#2C1810',
  rosacea: '#C47B7B',
  stone: '#8B8680',
  // orc
  dark: '#2D5016',
  emerald: '#4A7C35',
  green: '#6B8E3A',
  olive: '#8FAF5A',
  // goblin
  desert: '#C8A45A',
  grassland: '#7AAF4A',
  swamp: '#5A7A3A',
  tundra: '#8AAFAF',
  // halfling
  apple: '#E8A090',
  blueberry: '#7A6AAF',
  chestnut: '#A0622A',
  wheat: '#D4AA70',
};

export const COSMETIC_COLOR_HEX: Record<string, string> = {
  black: '#1a1a1a',
  black_leather: '#2D1A0E',
  blonde: '#F5D060',
  blue: '#3B82F6',
  bronze: '#CD7F32',
  brown: '#7C4A1E',
  brown_leather: '#5C3310',
  gold: '#FFD700',
  green: '#22C55E',
  grey: '#9CA3AF',
  iron: '#6B7280',
  khaki: '#C8B560',
  lime: '#84CC16',
  marine: '#0F5F7A',
  orange: '#F97316',
  pink: '#EC4899',
  purple: '#A855F7',
  red: '#EF4444',
  salmon: '#FA8072',
  silver: '#C0C0C0',
  sky: '#87CEEB',
  turquoise: '#14B8A6',
  violet: '#7F00FF',
  white: '#F1F5F9',
  white_leather: '#E8D5B0',
  yellow: '#FACC15',
};

export const DEFAULT_CONFIG: AvatarConfig = {
  race: 'human',
  skin: 'brown',
  bg: 'light_blue',
  ears: 'normal',
  nose: 'rounded',
  mouth: 'smile',
  eyeColor: 'brown',
  eyeStyle: 'round',
  brows: 'black_normal',
  hair: 'brown_short',
  hat: null,
  clothes: 'blue_doublet',
  beard: null,
  moustache: null,
};

// Key builders — must match generated avatarAssets keys
export function bgKey(bg: string) {
  return `common__common_bg_${bg}`;
}

export function bgAssetName(style: string, color: string) {
  return style === 'light' ? `light_${color}` : color;
}

export function baseKey(race: AvatarRace, skin: string) {
  return `${race}__${race}_${skin}_base`;
}

export function earsKey(race: AvatarRace, skin: string, style: string) {
  return `${race}__${race}_${skin}_ears_${style}`;
}

export function noseKey(race: AvatarRace, skin: string, style: string) {
  return `${race}__${race}_${skin}_nose_${style}`;
}

export function mouthKey(race: AvatarRace, skin: string, style: string) {
  return `${race}__${race}_${skin}_mouth_${style}`;
}

export function eyeKey(race: AvatarRace, eyeColor: string, style: string, frame: 1 | 2 = 1) {
  return `${race}__${race}_eyes__${race}_eyes_${eyeColor}_${style}_${frame}`;
}

export function browsKey(colorAndStyle: string) {
  return `common__common_brows_${colorAndStyle}`;
}

export function hairKey(colorAndStyle: string) {
  return `common__common_hair_${colorAndStyle}`;
}

export function hatKey(colorAndStyle: string) {
  return `common__common_hat_${colorAndStyle}`;
}

export function clothesKey(colorAndStyle: string) {
  return `common__common_clothes_${colorAndStyle}`;
}

export function beardKey(colorAndStyle: string) {
  return `common__common_beard_${colorAndStyle}`;
}

export function moustacheKey(colorAndStyle: string) {
  return `common__common_moustache_${colorAndStyle}`;
}

export function getAsset(key: string): number | null {
  return (avatarAssets as Record<string, number>)[key] ?? null;
}

export function getLayers(
  config: AvatarConfig,
  eyeFrame: 1 | 2 = 1,
  includeBg = true,
): { key: string; source: number }[] {
  const layers: ({ key: string; source: number | null } | null)[] = [
    includeBg ? { key: 'bg', source: getAsset(bgKey(config.bg)) } : null,
    { key: 'base', source: getAsset(baseKey(config.race, config.skin)) },
    { key: 'ears', source: getAsset(earsKey(config.race, config.skin, config.ears)) },
    config.clothes ? { key: 'clothes', source: getAsset(clothesKey(config.clothes)) } : null,
    { key: 'nose', source: getAsset(noseKey(config.race, config.skin, config.nose)) },
    { key: 'mouth', source: getAsset(mouthKey(config.race, config.skin, config.mouth)) },
    {
      key: 'eyes',
      source: getAsset(eyeKey(config.race, config.eyeColor, config.eyeStyle, eyeFrame)),
    },
    config.brows ? { key: 'brows', source: getAsset(browsKey(config.brows)) } : null,
    config.beard ? { key: 'beard', source: getAsset(beardKey(config.beard)) } : null,
    config.moustache
      ? { key: 'moustache', source: getAsset(moustacheKey(config.moustache)) }
      : null,
    config.hair ? { key: 'hair', source: getAsset(hairKey(config.hair)) } : null,
    config.hat ? { key: 'hat', source: getAsset(hatKey(config.hat)) } : null,
  ];

  return layers.filter(
    (l): l is { key: string; source: number } => l !== null && l.source !== null,
  );
}
