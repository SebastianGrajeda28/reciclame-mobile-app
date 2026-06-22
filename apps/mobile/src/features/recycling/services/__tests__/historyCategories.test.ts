import {
  HISTORY_CATEGORIES,
  categoryIconForWasteTypeId,
  categoryStyleForWasteTypeId,
  wasteTypeIdsForCategories,
} from '@/src/features/recycling/services/historyCategories';

describe('wasteTypeIdsForCategories', () => {
  test('Debería devolver una lista vacía cuando no hay categorías', () => {
    expect(wasteTypeIdsForCategories([])).toEqual([]);
  });

  test('Debería devolver los wasteTypeIds de una sola categoría', () => {
    const glass = HISTORY_CATEGORIES.find((c) => c.id === 'glass')!;
    expect(wasteTypeIdsForCategories(['glass']).sort()).toEqual([...glass.wasteTypeIds].sort());
  });

  test('Debería unir sin duplicados los wasteTypeIds de varias categorías', () => {
    const plastic = HISTORY_CATEGORIES.find((c) => c.id === 'plastic_pet')!;
    const glass = HISTORY_CATEGORIES.find((c) => c.id === 'glass')!;
    const result = wasteTypeIdsForCategories(['plastic_pet', 'glass']);
    const expected = [...new Set([...plastic.wasteTypeIds, ...glass.wasteTypeIds])];

    expect(result.sort()).toEqual(expected.sort());
    expect(new Set(result).size).toBe(result.length);
  });

  test('Debería ignorar ids de categoría inexistentes', () => {
    expect(wasteTypeIdsForCategories(['no_existe'])).toEqual([]);
  });
});

describe('categoryIconForWasteTypeId', () => {
  test('Debería devolver el ícono propio de la categoría del residuo', () => {
    expect(categoryIconForWasteTypeId('11111111-1111-1111-1111-000000000002')).toBe('bottle'); // plástico
    expect(categoryIconForWasteTypeId('11111111-1111-1111-1111-000000000005')).toBe('battery'); // pilas
  });

  test('Debería devolver el ícono por defecto para un residuo desconocido', () => {
    expect(categoryIconForWasteTypeId('no-existe')).toBe('recycle');
  });
});

describe('categoryStyleForWasteTypeId', () => {
  test('Debería devolver el estilo de color de la categoría del residuo', () => {
    // 0005 = pilas (battery)
    expect(categoryStyleForWasteTypeId('11111111-1111-1111-1111-000000000005')).toEqual({
      bg: '#FEE2E2',
      fg: '#DC2626',
    });
  });

  test('Debería devolver el estilo por defecto para un residuo desconocido o sin id', () => {
    const def = { bg: '#A6F4C5', fg: '#027A48' };
    expect(categoryStyleForWasteTypeId('no-existe')).toEqual(def);
    expect(categoryStyleForWasteTypeId(undefined)).toEqual(def);
  });
});
