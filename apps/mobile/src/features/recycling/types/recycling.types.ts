export type WasteCategoryId =
  | 'paper_cardboard'
  | 'plastic_pet'
  | 'non_recoverable'
  | 'glass'
  | 'battery'
  | 'electronic_waste';

export type WasteType = {
  id: string;
  categoryId: WasteCategoryId;
  categoryLabel: string;
  label: string;
  description?: string;
};

export type BinType = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string | null;
  depositInstruction: string | null;
};

export type WasteTypeBinTypeMapping = {
  universityId: string;
  wasteTypeId: string;
  binTypeId: string;
  isActive?: boolean;
};

export type RecyclingContainer = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  acceptedWasteTypeIds: string[];
  availableBinTypeIds: string[];
  instructionsByWasteTypeId: Record<string, string[]>;
};

export type ClassificationPrediction = {
  wasteTypeId: string;
  confidence: number;
};
