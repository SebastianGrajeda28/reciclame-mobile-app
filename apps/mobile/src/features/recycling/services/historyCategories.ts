import type { AppIconName } from '@/src/ui/components/AppIcon';
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

const CATEGORY_STYLE: Record<string, { bg: string; fg: string }> = {
  plastic_pet: { bg: '#DBEAFE', fg: '#2563EB' },
  paper_cardboard: { bg: '#FEF9C3', fg: '#CA8A04' },
  glass: { bg: '#DCFCE7', fg: '#16A34A' },
  non_recoverable: { bg: '#E2E8F0', fg: '#475569' },
  battery: { bg: '#FEE2E2', fg: '#DC2626' },
  electronic_waste: { bg: '#F3E8FF', fg: '#9333EA' },
};

const CATEGORY_BY_WASTE_TYPE: Record<string, string> = Object.fromEntries(
  wasteTypes.map((wt) => [wt.id, wt.categoryId]),
);

const DEFAULT_STYLE = { bg: '#A6F4C5', fg: '#027A48' };

/** Color del ícono según la categoría del tipo de residuo. */
export function categoryStyleForWasteTypeId(wasteTypeId?: string): { bg: string; fg: string } {
  const categoryId = wasteTypeId ? CATEGORY_BY_WASTE_TYPE[wasteTypeId] : undefined;
  return (categoryId && CATEGORY_STYLE[categoryId]) || DEFAULT_STYLE;
}

/** Color por id de categoría (para el punto del filtro). */
export function categoryStyleForCategoryId(categoryId?: string): { bg: string; fg: string } {
  return (categoryId && CATEGORY_STYLE[categoryId]) || DEFAULT_STYLE;
}

/** Une (sin duplicados) los wasteTypeIds de varias categorías, para el filtro multi-categoría. */
export function wasteTypeIdsForCategories(categoryIds: string[]): string[] {
  const ids = new Set<string>();
  for (const categoryId of categoryIds) {
    const category = HISTORY_CATEGORIES.find((c) => c.id === categoryId);
    category?.wasteTypeIds.forEach((id) => ids.add(id));
  }
  return [...ids];
}

// Ícono propio por categoría.
const CATEGORY_ICON: Record<string, AppIconName> = {
  plastic_pet: 'bottle',
  paper_cardboard: 'fileDocument',
  glass: 'flask',
  non_recoverable: 'trash',
  battery: 'battery',
  electronic_waste: 'laptop',
};

const DEFAULT_ICON: AppIconName = 'recycle';

/** Ícono según la categoría del tipo de residuo (para la fila del historial). */
export function categoryIconForWasteTypeId(wasteTypeId?: string): AppIconName {
  const categoryId = wasteTypeId ? CATEGORY_BY_WASTE_TYPE[wasteTypeId] : undefined;
  return (categoryId && CATEGORY_ICON[categoryId]) || DEFAULT_ICON;
}
