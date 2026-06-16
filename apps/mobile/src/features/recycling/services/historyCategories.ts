import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';

// Categorías del historial (RF-040): agrupan uno o más tipos de residuo.
export type HistoryCategory = { id: string; label: string; wasteTypeIds: string[] };

const CATEGORY_LABELS: Record<string, string> = {
  plastic_pet: 'Plásticos',
  paper_cardboard: 'Papel y cartón',
  glass: 'Vidrio',
  non_recoverable: 'No aprovechables',
  battery: 'Pilas',
  electronic_waste: 'RAEE',
};

const CATEGORY_ORDER = [
  'plastic_pet',
  'paper_cardboard',
  'glass',
  'non_recoverable',
  'battery',
  'electronic_waste',
];

export const HISTORY_CATEGORIES: HistoryCategory[] = (() => {
  const idsByCategory = new Map<string, string[]>();
  for (const wt of wasteTypes) {
    const ids = idsByCategory.get(wt.categoryId) ?? [];
    ids.push(wt.id);
    idsByCategory.set(wt.categoryId, ids);
  }
  return CATEGORY_ORDER.filter((categoryId) => idsByCategory.has(categoryId)).map((categoryId) => ({
    id: categoryId,
    label: CATEGORY_LABELS[categoryId] ?? categoryId,
    wasteTypeIds: idsByCategory.get(categoryId) ?? [],
  }));
})();
