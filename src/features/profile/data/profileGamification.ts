export type ProfileBadge = {
  id: string;
  name: string;
  imageUrl: string;
  hint: string; // Vague hint on how to unlock — intentionally ambiguous
  userPercentage: number; // 0–100: % of users who have this badge
  earnedAt?: string; // ISO date — undefined means locked
};


export type ProfileStat = {
  id: string;
  value: string;
  label: string;
  icon: 'scale' | 'recycle' | 'calendar' | 'award';
};

// TODO(profile): replace this snapshot with a real profile achievements/stats query
// once the backend exposes streak, totals, and badge inventory for the signed-in user.
export const profileGamificationSnapshot = {
  currentStreakDays: 7,
  nextStreakMilestoneDays: 10,
  // TODO(profile): replace placeholder imageUrl with real CDN URLs from backend
  allBadges: [
    { id: 'badge-1', name: 'Primer reciclaje', hint: 'Todo gran camino empieza con un pequeño paso.', userPercentage: 89, imageUrl: 'https://placehold.co/64x64/4CAF50/fff?text=1', earnedAt: '2024-01-15' },
    { id: 'badge-2', name: 'Semana verde', hint: 'La constancia transforma hábitos en estilo de vida.', userPercentage: 54, imageUrl: 'https://placehold.co/64x64/2D9CDB/fff?text=2', earnedAt: '2024-02-03' },
    { id: 'badge-3', name: 'Coleccionista', hint: 'Algunos reciclan. Otros coleccionan el mérito.', userPercentage: 31, imageUrl: 'https://placehold.co/64x64/F2C94C/fff?text=3', earnedAt: '2024-03-10' },
    { id: 'badge-4', name: 'Maestro del vidrio', hint: 'El vidrio nunca miente sobre quién lo separó bien.', userPercentage: 18, imageUrl: 'https://placehold.co/64x64/9B51E0/fff?text=4', earnedAt: '2024-04-20' },
    { id: 'badge-5', name: 'Héroe plástico', hint: 'Hay un tipo de plástico que muy pocos dominan.', userPercentage: 22, imageUrl: 'https://placehold.co/64x64/EB5757/fff?text=5', earnedAt: '2024-05-01' },
    { id: 'badge-6', name: 'Reciclador serial', hint: 'Cuando el volumen habla, las palabras sobran.', userPercentage: 14, imageUrl: 'https://placehold.co/64x64/56CCF2/fff?text=6', earnedAt: '2024-05-15' },
    { id: 'badge-7', name: 'Eco guerrero', hint: 'No todos los guerreros pelean con armas.', userPercentage: 9, imageUrl: 'https://placehold.co/64x64/F2994A/fff?text=7', earnedAt: '2024-06-01' },
    { id: 'badge-8', name: 'Pionero', hint: 'Estabas aquí antes que casi todos los demás.', userPercentage: 3, imageUrl: 'https://placehold.co/64x64/BB6BD9/fff?text=8', earnedAt: '2024-06-20' },
    { id: 'badge-9', name: 'Leyenda urbana', hint: 'Solo los que van más allá conocen este camino.', userPercentage: 7, imageUrl: '' },
    { id: 'badge-10', name: 'El silencioso', hint: 'No hace falta anunciarlo. Los números lo dicen.', userPercentage: 5, imageUrl: '' },
    { id: 'badge-11', name: 'Tierra firme', hint: 'Hay materiales que requieren conocimiento especial.', userPercentage: 11, imageUrl: '' },
    { id: 'badge-12', name: 'Sin huella', hint: 'Dejar menos rastro es el mayor logro posible.', userPercentage: 2, imageUrl: '' },
  ] satisfies ProfileBadge[],
  featuredBadgeIds: ['badge-1', 'badge-2', 'badge-3', 'badge-4', 'badge-5'],
  // TODO(profile): replace these totals with user-specific aggregates from the recycling history.
  stats: [
    { id: 'weight', value: '15.2 kg', label: 'Peso total', icon: 'scale' },
    { id: 'items', value: '124', label: 'Articulos reciclados', icon: 'recycle' },
    { id: 'active-since', value: '6 meses', label: 'Activo desde', icon: 'calendar' },
    { id: 'badges', value: '8', label: 'Insignias ganadas', icon: 'award' },
  ] satisfies ProfileStat[],
} as const;
