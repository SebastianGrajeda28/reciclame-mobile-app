import {
  BATTERIES_BIN_TYPE_ID,
  GLASS_BIN_TYPE_ID,
  NON_RECOVERABLE_BIN_TYPE_ID,
  PAPER_CARDBOARD_BIN_TYPE_ID,
  PLASTICS_BIN_TYPE_ID,
  RAEE_BIN_TYPE_ID,
} from '@/src/features/recycling/services/bin-types.mock';
import {
  BATTERIES_WASTE_TYPE_ID,
  CARTON_WASTE_TYPE_ID,
  GENERAL_WASTE_TYPE_ID,
  GLASS_WASTE_TYPE_ID,
  METALS_WASTE_TYPE_ID,
  ORGANIC_WASTE_TYPE_ID,
  OTHER_PLASTICS_WASTE_TYPE_ID,
  PAPER_WASTE_TYPE_ID,
  PLASTICS_PET_WASTE_TYPE_ID,
  RAEE_WASTE_TYPE_ID,
} from '@/src/features/recycling/services/waste-type-bin-types.mock';
import { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';

export const containers: RecyclingContainer[] = [
  {
    id: '22222222-2222-2222-2222-000000000001',
    name: 'Contenedor Biblioteca Central',
    latitude: -12.0692,
    longitude: -77.0794,
    acceptedWasteTypeIds: [
      CARTON_WASTE_TYPE_ID,
      PLASTICS_PET_WASTE_TYPE_ID,
      OTHER_PLASTICS_WASTE_TYPE_ID,
      PAPER_WASTE_TYPE_ID,
    ],
    availableBinTypeIds: [
      PAPER_CARDBOARD_BIN_TYPE_ID,
      PLASTICS_BIN_TYPE_ID,
    ],
    instructionsByWasteTypeId: {
      [CARTON_WASTE_TYPE_ID]: [
        'Deposita solo carton limpio y seco.',
        'Retira plasticos, cintas o restos de comida.',
        'Dobla cajas para reducir volumen.',
      ],
      [PAPER_WASTE_TYPE_ID]: [
        'Deposita solo papel limpio y seco.',
        'Evita servilletas o papeles con grasa.',
        'Retira plasticos, clips grandes o elementos adheridos.',
      ],
      [PLASTICS_PET_WASTE_TYPE_ID]: [
        'Enjuaga bien la botella de plastico.',
        'Retira la tapa y la etiqueta cuando sea posible.',
        'Compacta la botella antes de depositarla.',
      ],
      [OTHER_PLASTICS_WASTE_TYPE_ID]: [
        'Deposita plasticos limpios y secos.',
        'Retira restos de comida o liquidos.',
        'No mezcles plasticos con residuos generales.',
      ],
    },
  },
  {
    id: '22222222-2222-2222-2222-000000000002',
    name: 'Contenedor Estudios Generales',
    latitude: -12.0701,
    longitude: -77.0806,
    acceptedWasteTypeIds: [GLASS_WASTE_TYPE_ID, GENERAL_WASTE_TYPE_ID, ORGANIC_WASTE_TYPE_ID],
    availableBinTypeIds: [GLASS_BIN_TYPE_ID, NON_RECOVERABLE_BIN_TYPE_ID],
    instructionsByWasteTypeId: {
      [GLASS_WASTE_TYPE_ID]: [
        'Deposita envases de vidrio limpios.',
        'No mezcles con ceramica ni focos.',
        'Evita arrojar vidrio roto sin envolver.',
      ],
      [GENERAL_WASTE_TYPE_ID]: [
        'Deposita residuos no reciclables.',
        'No mezclar con papel, plastico PET, vidrio, pilas o RAEE.',
        'Cierra bien bolsas de descarte antes de botar.',
      ],
      [ORGANIC_WASTE_TYPE_ID]: [
        'Deposita solo restos organicos permitidos.',
        'Retira empaques, bolsas o cubiertos descartables.',
        'Evita mezclar organicos con residuos generales.',
      ],
    },
  },
  {
    id: '22222222-2222-2222-2222-000000000003',
    name: 'Punto Verde Complejo MacGregor',
    latitude: -12.0683,
    longitude: -77.0784,
    acceptedWasteTypeIds: [BATTERIES_WASTE_TYPE_ID, RAEE_WASTE_TYPE_ID, METALS_WASTE_TYPE_ID],
    availableBinTypeIds: [BATTERIES_BIN_TYPE_ID, RAEE_BIN_TYPE_ID],
    instructionsByWasteTypeId: {
      [BATTERIES_WASTE_TYPE_ID]: [
        'Aisla polos con cinta para evitar cortocircuitos.',
        'No mezcles pilas con residuos comunes.',
        'Deposita solo pilas en este contenedor.',
      ],
      [RAEE_WASTE_TYPE_ID]: [
        'Deposita solo aparatos electricos o electronicos pequenos.',
        'Retira baterias removibles cuando sea posible.',
        'No mezcles RAEE con residuos comunes.',
      ],
      [METALS_WASTE_TYPE_ID]: [
        'Deposita metales segun la indicacion institucional vigente.',
        'No mezcles metales con residuos generales.',
        'Consulta al personal si el residuo metalico no corresponde al punto RAEE.',
      ],
    },
  },
];
