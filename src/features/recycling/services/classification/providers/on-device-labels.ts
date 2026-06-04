// UUIDs alineados con waste-type-bin-types.mock.ts de develop
const CARTON = '11111111-1111-1111-1111-000000000001';
const PLASTIC_BOTTLE = '11111111-1111-1111-1111-000000000002';
const NON_RECOVERABLE = '11111111-1111-1111-1111-000000000003';
const GLASS = '11111111-1111-1111-1111-000000000004';
const BATTERY = '11111111-1111-1111-1111-000000000005';
const ELECTRONIC_WASTE = '11111111-1111-1111-1111-000000000006';
const OTHER_PLASTICS = '11111111-1111-1111-1111-000000000007';
const METAL = '11111111-1111-1111-1111-000000000008';
const PAPER = '11111111-1111-1111-1111-000000000009';
const ORGANIC = '11111111-1111-1111-1111-000000000010';

// Mapeo 1:1 con assets/model/labels.json — el orden del array no se toca.
export const MODEL_LABEL_TO_WASTE_TYPE_ID: Readonly<Record<string, string>> = Object.freeze({
  'Botella plástica': PLASTIC_BOTTLE,
  Plástico: OTHER_PLASTICS,
  Metal: METAL,
  Vidrio: GLASS,
  Cartón: CARTON,
  Papel: PAPER,
  'Residuo general': NON_RECOVERABLE,
  Orgánico: ORGANIC,
  Pilas: BATTERY,
  RAEE: ELECTRONIC_WASTE,
});

/**
 * Resuelve el wasteTypeId de la app a partir de una etiqueta del modelo TFLite.
 * @param modelLabel - Etiqueta devuelta por el modelo (ej. "Botella plástica").
 * @returns El UUID del waste type correspondiente, o null si no existe mapeo.
 */
export function resolveWasteTypeId(modelLabel: string): string | null {
  return MODEL_LABEL_TO_WASTE_TYPE_ID[modelLabel] ?? null;
}
