import { ClassificationPrediction } from '@/src/features/recycling/types/recycling.types';

import { resolveWasteTypeId } from '@/src/features/recycling/services/classification/providers/on-device-labels';

// #195: el modelo (assets/model/labels.json) tiene 10 clases fijas y NO incluye una
// categoría "No soportado". Una etiqueta sin mapeo cae a "Residuos generales", que es
// una categoría válida, no una señal de "no reconocido". Por eso la app trata la
// confianza por debajo de RECYCLE_CONFIDENCE_THRESHOLD como "No identificado" en la UI
// (ver ProcessingScreen) en lugar de depender de una clase del modelo que no existe.
const UNKNOWN_WASTE_TYPE_ID = '11111111-1111-1111-1111-000000000003';

function pickArgmax(output: ArrayLike<number>): { index: number; confidence: number } {
  let maxIdx = 0;
  let maxVal = output[0];
  for (let i = 1; i < output.length; i += 1) {
    if (output[i] > maxVal) {
      maxVal = output[i];
      maxIdx = i;
    }
  }
  return { index: maxIdx, confidence: Number(maxVal) };
}

/**
 * Convierte el vector de probabilidades softmax del modelo en una predicción de residuo.
 * Aplica argmax sobre el output, mapea la etiqueta ganadora a wasteTypeId y redondea la confianza.
 * @param output - Float32Array con N probabilidades softmax (una por clase del modelo).
 * @param modelLabels - Array de etiquetas en el mismo orden que las clases del modelo.
 * @returns Predicción con wasteTypeId y confianza redondeada a 2 decimales.
 */
export function buildPredictionFromOutput(
  output: ArrayLike<number>,
  modelLabels: readonly string[],
): ClassificationPrediction {
  const { index, confidence } = pickArgmax(output);
  const modelLabel = modelLabels[index];
  const wasteTypeId = modelLabel ? resolveWasteTypeId(modelLabel) : null;

  return {
    wasteTypeId: wasteTypeId ?? UNKNOWN_WASTE_TYPE_ID,
    confidence: Number(confidence.toFixed(2)),
  };
}
