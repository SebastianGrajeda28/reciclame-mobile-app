import { haversineDistanceKm } from './distance';
import type { RecyclingContainer } from '../types/recycling.types';

export type ContainerWithDistance = RecyclingContainer & { distanceKm: number };

export function getNearbyContainers(
  location: { latitude: number; longitude: number },
  containers: RecyclingContainer[],
  maxDistanceKm = 3,
): ContainerWithDistance[] {
  return containers
    .map((container) => ({
      ...container,
      distanceKm: haversineDistanceKm(location, {
        latitude: container.latitude,
        longitude: container.longitude,
      }),
    }))
    .filter((container) => container.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getNearbyCompatibleContainersByBinType(
  location: { latitude: number; longitude: number },
  containers: RecyclingContainer[],
  binTypeId?: string | null,
  maxDistanceKm = 3,
): ContainerWithDistance[] {
  if (!binTypeId) return [];

  return containers
    .map((container) => ({
      ...container,
      distanceKm: haversineDistanceKm(location, {
        latitude: container.latitude,
        longitude: container.longitude,
      }),
    }))
    .filter((container) => container.distanceKm <= maxDistanceKm)
    .filter((container) => container.availableBinTypeIds.includes(binTypeId))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
