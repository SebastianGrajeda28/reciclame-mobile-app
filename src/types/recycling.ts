export type RecyclingLogInput = {
  userId: string;
  wasteTypeId: string;
  recyclingPointId: string;
  detectionType?: 'auto' | 'manual';
  confidenceScore?: number;
};

export type RecyclingLog = RecyclingLogInput & {
  id: string;
  createdAt: string;
};
