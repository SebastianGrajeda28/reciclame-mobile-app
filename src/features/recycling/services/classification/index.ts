import { RECYCLE_CONFIDENCE_THRESHOLD, RECYCLE_USE_MOCKS } from '@/src/features/recycling/services/config';
import { mockWasteClassifier } from '@/src/features/recycling/services/classification/mocks/mock-waste-classifier';
import { remoteWasteClassifier } from '@/src/features/recycling/services/classification/providers/remote-waste-classifier';
import { WasteClassifier } from '@/src/features/recycling/services/classification/types';

function getClassifier(): WasteClassifier {
  return RECYCLE_USE_MOCKS ? mockWasteClassifier : remoteWasteClassifier;
}

export function getConfidenceThreshold() {
  return RECYCLE_CONFIDENCE_THRESHOLD;
}

export async function classifyWaste(imageUri: string) {
  return getClassifier().classify(imageUri);
}

