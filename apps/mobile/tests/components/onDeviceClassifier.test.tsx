import { buildPredictionFromOutput } from '@/src/features/recycling/services/classification/providers/on-device-postprocess';

const MODEL_LABELS = [
  'Botella plástica',
  'Plástico',
  'Metal',
  'Vidrio',
  'Cartón',
  'Papel',
  'Residuo general',
  'Orgánico',
  'Pilas',
  'RAEE',
];

const PAPER = '11111111-1111-1111-1111-000000000001';
const PLASTIC_BOTTLE = '11111111-1111-1111-1111-000000000002';
const NON_RECOVERABLE = '11111111-1111-1111-1111-000000000003';
const GLASS = '11111111-1111-1111-1111-000000000004';
const BATTERY = '11111111-1111-1111-1111-000000000005';
const ELECTRONIC_WASTE = '11111111-1111-1111-1111-000000000006';
const CARDBOARD = '11111111-1111-1111-1111-000000000007';
const METAL = '11111111-1111-1111-1111-000000000008';
const ORGANIC = '11111111-1111-1111-1111-000000000009';
const PLASTIC = '11111111-1111-1111-1111-000000000010';

function probsWithMaxAt(index: number, maxProb: number) {
  const remaining = (1 - maxProb) / (MODEL_LABELS.length - 1);
  const out = new Float32Array(MODEL_LABELS.length);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = i === index ? maxProb : remaining;
  }
  return out;
}

describe('buildPredictionFromOutput', () => {
  const cases: { index: number; expected: string; name: string }[] = [
    { index: 0, expected: PLASTIC_BOTTLE, name: 'Botella plástica → plastic_bottle' },
    { index: 1, expected: PLASTIC, name: 'Plástico → plastic' },
    { index: 2, expected: METAL, name: 'Metal → metal' },
    { index: 3, expected: GLASS, name: 'Vidrio → glass' },
    { index: 4, expected: CARDBOARD, name: 'Cartón → cardboard' },
    { index: 5, expected: PAPER, name: 'Papel → paper' },
    { index: 6, expected: NON_RECOVERABLE, name: 'Residuo general → non_recoverable' },
    { index: 7, expected: ORGANIC, name: 'Orgánico → organic' },
    { index: 8, expected: BATTERY, name: 'Pilas → battery' },
    { index: 9, expected: ELECTRONIC_WASTE, name: 'RAEE → electronic_waste' },
  ];

  cases.forEach(({ index, expected, name }) => {
    it(`Debería mapear ${name}`, () => {
      const out = probsWithMaxAt(index, 0.9);
      expect(buildPredictionFromOutput(out, MODEL_LABELS).wasteTypeId).toBe(expected);
    });
  });

  it('Debería redondear la confianza a 2 decimales', () => {
    const result = buildPredictionFromOutput(probsWithMaxAt(3, 0.87654), MODEL_LABELS);
    expect(result.confidence).toBe(0.88);
  });

  it('Debería usar non_recoverable si la etiqueta del modelo no está en el mapeo', () => {
    const result = buildPredictionFromOutput(probsWithMaxAt(0, 0.95), ['EtiquetaInexistente']);
    expect(result.wasteTypeId).toBe(NON_RECOVERABLE);
  });
});
