export type WasteCategoryId =
  | 'paper'
  | 'cardboard'
  | 'plastic_bottle'
  | 'plastic'
  | 'metal'
  | 'glass'
  | 'non_recoverable'
  | 'organic'
  | 'battery'
  | 'electronic_waste';

export type WasteType = {
  id: string;
  categoryId: WasteCategoryId;
  categoryLabel: string;
  label: string;
};

export type RecyclingContainer = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  acceptedWasteTypeIds: string[];
  instructionsByWasteTypeId: Record<string, string[]>;
};

export type ClassificationPrediction = {
  wasteTypeId: string;
  confidence: number;
};
