import { WasteType } from '@/src/features/recycling/types/recycling.types';

export const wasteTypes: WasteType[] = [
  {
    id: 'paper_cardboard_bin',
    categoryId: 'paper_cardboard',
    categoryLabel: 'Papel y Carton',
    label: 'Contenedor de papel y carton',
  },
  {
    id: 'plastic_pet_bin',
    categoryId: 'plastic_pet',
    categoryLabel: 'Plastico (PET)',
    label: 'Contenedor de plastico (PET)',
  },
  {
    id: 'non_recoverable_bin',
    categoryId: 'non_recoverable',
    categoryLabel: 'No aprovechables',
    label: 'Contenedor de no aprovechables',
  },
  { id: 'glass_bin', categoryId: 'glass', categoryLabel: 'Vidrio', label: 'Contenedor de vidrio' },
  {
    id: 'battery_bin',
    categoryId: 'battery',
    categoryLabel: 'Pilas',
    label: 'Contenedor de pilas',
  },
  {
    id: 'electronic_waste_bin',
    categoryId: 'electronic_waste',
    categoryLabel: 'RAEE',
    label: 'Contenedor de residuos electricos y electronicos',
  },
];
