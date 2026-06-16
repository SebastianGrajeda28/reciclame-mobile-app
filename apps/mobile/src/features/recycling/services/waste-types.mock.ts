import { WasteType } from '@/src/features/recycling/types/recycling.types';

export const wasteTypes: WasteType[] = [
  {
    id: '11111111-1111-1111-1111-000000000001',
    categoryId: 'paper_cardboard',
    categoryLabel: 'Papel y carton',
    label: 'Carton',
  },
  {
    id: '11111111-1111-1111-1111-000000000002',
    categoryId: 'plastic_pet',
    categoryLabel: 'Plasticos',
    label: 'Plasticos PET',
    description: 'Botellas',
  },
  {
    id: '11111111-1111-1111-1111-000000000003',
    categoryId: 'non_recoverable',
    categoryLabel: 'No aprovechables',
    label: 'Residuos generales',
    description:
      'Resto de comida: huesos, servilletas sucias, papeles sucias, residuos con grasa, empaques de golosinas.',
  },
  {
    id: '11111111-1111-1111-1111-000000000004',
    categoryId: 'glass',
    categoryLabel: 'Vidrio',
    label: 'Vidrio',
    description:
      'Frascos de vidrio, botellas de diferente tonalidad: verde transparente, oscura, vidrio roto, etc.',
  },
  {
    id: '11111111-1111-1111-1111-000000000005',
    categoryId: 'battery',
    categoryLabel: 'Pilas',
    label: 'Pilas',
  },
  {
    id: '11111111-1111-1111-1111-000000000006',
    categoryId: 'electronic_waste',
    categoryLabel: 'RAEE',
    label: 'RAEE',
    description:
      'Residuos de Aparatos Electricos y Electronicos: baterias, cables, cargadores, celulares, pantallas, etc.',
  },
  {
    id: '11111111-1111-1111-1111-000000000007',
    categoryId: 'plastic_pet',
    categoryLabel: 'Plasticos',
    label: 'Otros Plasticos',
  },
  {
    id: '11111111-1111-1111-1111-000000000008',
    categoryId: 'electronic_waste',
    categoryLabel: 'RAEE',
    label: 'Metales',
    description: 'Latas',
  },
  {
    id: '11111111-1111-1111-1111-000000000009',
    categoryId: 'paper_cardboard',
    categoryLabel: 'Papel y carton',
    label: 'Papel',
    description: 'Hojas de papel, fotocopias, periodicos, revistas, folletos.',
  },
  {
    id: '11111111-1111-1111-1111-000000000010',
    categoryId: 'non_recoverable',
    categoryLabel: 'No aprovechables',
    label: 'Residuos organicos',
    description: 'Cascaras de frutas o verduras.',
  },
];
