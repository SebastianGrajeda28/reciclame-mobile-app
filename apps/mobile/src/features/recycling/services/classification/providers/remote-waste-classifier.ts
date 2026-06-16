import { ClassificationPrediction } from '@/src/features/recycling/types/recycling.types';

import { WasteClassifier } from '@/src/features/recycling/services/classification/types';

async function classify(_imageUri: string): Promise<ClassificationPrediction> {
  throw new Error('Remote waste classifier is not implemented yet.');
}

export const remoteWasteClassifier: WasteClassifier = {
  classify,
};
