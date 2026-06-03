import { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';

// IDs alineados con la migración 20260528000000_seed_recycling_data.sql.
const PAPER_CARDBOARD = '11111111-1111-1111-1111-000000000001';
const PLASTIC_PET = '11111111-1111-1111-1111-000000000002';
const NON_RECOVERABLE = '11111111-1111-1111-1111-000000000003';
const GLASS = '11111111-1111-1111-1111-000000000004';
const BATTERY = '11111111-1111-1111-1111-000000000005';
const ELECTRONIC_WASTE = '11111111-1111-1111-1111-000000000006';

export const containers: RecyclingContainer[] = [
  {
    id: '22222222-2222-2222-2222-000000000001',
    name: 'Contenedor Biblioteca Central',
    latitude: -12.0692,
    longitude: -77.0794,
    acceptedWasteTypeIds: [PAPER_CARDBOARD, PLASTIC_PET],
    instructionsByWasteTypeId: {
      [PAPER_CARDBOARD]: [
        'Deposita solo papel y carton limpios y secos.',
        'Retira grapas grandes o plasticos adheridos.',
        'Dobla cajas para reducir volumen.',
      ],
      [PLASTIC_PET]: [
        'Enjuaga bien la botella de plastico.',
        'Retira la tapa y la etiqueta.',
        'Compacta la botella antes de depositarla.',
      ],
    },
  },
  {
    id: '22222222-2222-2222-2222-000000000002',
    name: 'Contenedor Estudios Generales',
    latitude: -12.0701,
    longitude: -77.0806,
    acceptedWasteTypeIds: [GLASS, NON_RECOVERABLE],
    instructionsByWasteTypeId: {
      [GLASS]: [
        'Deposita envases de vidrio limpios.',
        'No mezcles con ceramica ni focos.',
        'Evita arrojar vidrio roto sin envolver.',
      ],
      [NON_RECOVERABLE]: [
        'Deposita residuos no reciclables.',
        'No mezclar con papel, plastico PET, vidrio, pilas o RAEE.',
        'Cierra bien bolsas de descarte antes de botar.',
      ],
    },
  },
  {
    id: '22222222-2222-2222-2222-000000000003',
    name: 'Punto Verde Complejo MacGregor',
    latitude: -12.0683,
    longitude: -77.0784,
    acceptedWasteTypeIds: [BATTERY, ELECTRONIC_WASTE],
    instructionsByWasteTypeId: {
      [BATTERY]: [
        'Aisla polos con cinta para evitar cortocircuitos.',
        'No mezcles pilas con residuos comunes.',
        'Deposita solo pilas en este contenedor.',
      ],
      [ELECTRONIC_WASTE]: [
        'Deposita solo aparatos electricos o electronicos pequenos.',
        'Retira baterias removibles cuando sea posible.',
        'No mezcles RAEE con residuos comunes.',
      ],
    },
  },
];
