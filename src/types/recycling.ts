export type RecyclingLogInput = {
  userId: string;
  wasteTypeId: string;
  containerId: string;
  timestamp: string;
};

export type RecyclingPoint = {
  id: string;
  campusId: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  isActive: boolean;
  updatedAt?: Date;
};

export type RecyclingPointBin = {
  id: string;
  recyclingPointId: string;
  binTypeId: string;
};

export type RecyclingRecord = {
  id: string;
  userId: string;
  recyclingPointId?: string;
  binTypeId?: string;
  wasteTypeId?: string;
  detectionType?: string;
  confidenceScore?: number;
  estimatedWeight?: number;
  status?: string;
  createdAt: Date;
  syncedAt?: Date;
};