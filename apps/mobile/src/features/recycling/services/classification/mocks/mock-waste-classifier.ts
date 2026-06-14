import { wasteTypes } from '@/src/features/recycling/services/waste-types.mock';
import { ClassificationPrediction } from '@/src/features/recycling/types/recycling.types';

import { WasteClassifier } from '@/src/features/recycling/services/classification/types';

function pseudoRandom(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 1000;
}

async function classify(imageUri: string): Promise<ClassificationPrediction> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const seed = pseudoRandom(imageUri || 'fallback');
  const wasteType = wasteTypes[Math.floor(seed * wasteTypes.length)] ?? wasteTypes[0];
  const confidence = Math.max(0.55, Math.min(0.96, seed));

  return {
    wasteTypeId: wasteType.id,
    confidence: Number(confidence.toFixed(2)),
  };
}

export const mockWasteClassifier: WasteClassifier = {
  classify,
};
