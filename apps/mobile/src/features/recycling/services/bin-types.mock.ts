import { BinType } from '@/src/features/recycling/types/recycling.types';

export const PLASTICS_BIN_TYPE_ID = '33333333-3333-3333-3333-000000000001';
export const NON_RECOVERABLE_BIN_TYPE_ID = '33333333-3333-3333-3333-000000000002';
export const GLASS_BIN_TYPE_ID = '33333333-3333-3333-3333-000000000003';
export const PAPER_CARDBOARD_BIN_TYPE_ID = '33333333-3333-3333-3333-000000000004';
export const BATTERIES_BIN_TYPE_ID = '33333333-3333-3333-3333-000000000005';
export const RAEE_BIN_TYPE_ID = '33333333-3333-3333-3333-000000000006';

export const binTypes: BinType[] = [
  { id: PLASTICS_BIN_TYPE_ID, name: 'Contenedor de plasticos', imageUrl: null, depositInstruction: null },
  { id: NON_RECOVERABLE_BIN_TYPE_ID, name: 'Contenedor de no aprovechables', imageUrl: null, depositInstruction: null },
  { id: GLASS_BIN_TYPE_ID, name: 'Contenedor de vidrio', imageUrl: null, depositInstruction: null },
  { id: PAPER_CARDBOARD_BIN_TYPE_ID, name: 'Contenedor de papel y carton', imageUrl: null, depositInstruction: null },
  { id: BATTERIES_BIN_TYPE_ID, name: 'Contenedor de pilas', imageUrl: null, depositInstruction: null },
  { id: RAEE_BIN_TYPE_ID, name: 'Contenedor RAEE', imageUrl: null, depositInstruction: null },
];
