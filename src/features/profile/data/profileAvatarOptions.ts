export const profileCustomizationTabs = ['Piel', 'Pelo', 'Ojos', 'Boca', 'Gorro', 'Ropa'] as const;

export type ProfileCustomizationTab = (typeof profileCustomizationTabs)[number];

export type ProfileAvatarSwatch = {
  id: string;
  color: string;
  locked: boolean;
};

export const profileAvatarSwatches = [
  { id: 'red', color: '#FF3B30', locked: false },
  { id: 'pink', color: '#FF00F5', locked: false },
  { id: 'green', color: '#1EFF00', locked: false },
  { id: 'blue', color: '#1D4ED8', locked: false },
  { id: 'yellow', color: '#FFEF00', locked: false },
  { id: 'cyan', color: '#22D3EE', locked: false },
  { id: 'teal', color: '#0F8B8D', locked: false },
  { id: 'lock-1', color: '#D9DEE2', locked: true },
  { id: 'lock-2', color: '#D9DEE2', locked: true },
  { id: 'lock-3', color: '#D9DEE2', locked: true },
] satisfies readonly ProfileAvatarSwatch[];
