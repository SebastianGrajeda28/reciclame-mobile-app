export type RecyclingPoint = {
  id: string;
  campusId: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string | null;
  isActive: boolean;
  updatedAt: string | null;
};

export type RecyclingPointBin = {
  id: string;
  recyclingPointId: string;
  binTypeId: string;
};

export type RecyclingRecord = {
  id: string;
  userId: string;
  recyclingPointId: string;
  binTypeId: string;
  wasteTypeId: string;
  detectionType: string | null;
  confidenceScore: number | null;
  estimatedWeight: number | null;
  status: string | null;
  createdAt: string;
  syncedAt: string | null;
};

export type RecyclingLogInput = {
  userId: string;
  wasteTypeId: string;
  binTypeId: string;
  recyclingPointId: string;
  detectionType?: string;
  confidenceScore?: number;
};

export type RecyclingLogListItem = {
  id: string;
  createdAt: string;
  wasteTypeName: string;
  recyclingPointName: string;
  detectionType?: string;
  confidenceScore?: number;
  status?: string;
};
