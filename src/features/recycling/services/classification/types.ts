import { ClassificationPrediction } from '@/src/features/recycling/types/recycling.types';

export type WasteClassifier = {
  classify: (imageUri: string) => Promise<ClassificationPrediction>;
};

