import { WasteType } from '@/src/features/recycling/types/recycling.types';

export const wasteTypes: WasteType[] = [
  {
    id: '11111111-1111-1111-1111-000000000001',
    categoryId: 'paper_cardboard',
    categoryLabel: 'Papel y Carton',
    label: 'Contenedor de papel y carton',
  },
  {
    id: '11111111-1111-1111-1111-000000000002',
    categoryId: 'plastic_pet',
    categoryLabel: 'Plastico (PET)',
    label: 'Contenedor de plastico (PET)',
  },
  {
    id: '11111111-1111-1111-1111-000000000003',
    categoryId: 'non_recoverable',
    categoryLabel: 'No aprovechables',
    label: 'Contenedor de no aprovechables',
  },
  {
    id: '11111111-1111-1111-1111-000000000004',
    categoryId: 'glass',
    categoryLabel: 'Vidrio',
    label: 'Contenedor de vidrio',
  },
  {
    id: '11111111-1111-1111-1111-000000000005',
    categoryId: 'battery',
    categoryLabel: 'Pilas',
    label: 'Contenedor de pilas',
  },
  {
    id: '11111111-1111-1111-1111-000000000006',
    categoryId: 'electronic_waste',
    categoryLabel: 'RAEE',
    label: 'Contenedor de residuos electricos y electronicos',
  },
];
