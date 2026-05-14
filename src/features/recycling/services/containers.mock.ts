import { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';

export const containers: RecyclingContainer[] = [
  {
    id: 'container-1',
    name: 'Contenedor Biblioteca Central',
    latitude: -12.0692,
    longitude: -77.0794,
    acceptedWasteTypeIds: ['paper_cardboard_bin', 'plastic_pet_bin'],
    instructionsByWasteTypeId: {
      paper_cardboard_bin: [
        'Deposita solo papel y carton limpios y secos.',
        'Retira grapas grandes o plasticos adheridos.',
        'Dobla cajas para reducir volumen.',
      ],
      plastic_pet_bin: [
        'Enjuaga bien la botella de plastico.',
        'Retira la tapa y la etiqueta.',
        'Compacta la botella antes de depositarla.',
      ],
    },
  },
  {
    id: 'container-2',
    name: 'Contenedor Estudios Generales',
    latitude: -12.0701,
    longitude: -77.0806,
    acceptedWasteTypeIds: ['glass_bin', 'non_recoverable_bin'],
    instructionsByWasteTypeId: {
      glass_bin: [
        'Deposita envases de vidrio limpios.',
        'No mezcles con ceramica ni focos.',
        'Evita arrojar vidrio roto sin envolver.',
      ],
      non_recoverable_bin: [
        'Deposita residuos no reciclables.',
        'No mezclar con papel, plastico PET, vidrio, pilas o RAEE.',
        'Cierra bien bolsas de descarte antes de botar.',
      ],
    },
  },
  {
    id: 'container-3',
    name: 'Punto Verde Complejo MacGregor',
    latitude: -12.0683,
    longitude: -77.0784,
    acceptedWasteTypeIds: ['battery_bin', 'electronic_waste_bin'],
    instructionsByWasteTypeId: {
      battery_bin: [
        'Aisla polos con cinta para evitar cortocircuitos.',
        'No mezcles pilas con residuos comunes.',
        'Deposita solo pilas en este contenedor.',
      ],
      electronic_waste_bin: [
        'Deposita solo aparatos electricos o electronicos pequenos.',
        'Retira baterias removibles cuando sea posible.',
        'No mezcles RAEE con residuos comunes.',
      ],
    },
  },
];
