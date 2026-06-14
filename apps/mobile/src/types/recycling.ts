export type {
  RecyclingLogInput,
  RecyclingLogListItem,
  RecyclingPoint,
  RecyclingPointBin,
  RecyclingRecord,
} from "@reciclame/shared-domain";

export type RecyclingLog = {
  id: string;
  userId: string;
  wasteTypeId: string;
  binTypeId: string;
  recyclingPointId: string;
  detectionType?: string;
  confidenceScore?: number;
  createdAt: string;
};
