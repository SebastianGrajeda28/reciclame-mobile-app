import { containers } from '@/src/features/recycling/services/containers.mock';
import { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';
import { haversineDistanceKm } from '@/src/features/recycling/services/distance';

export type NearbyContainer = RecyclingContainer & { distanceKm: number };

export function getNearbyContainersMock(
  userLocation: { latitude: number; longitude: number },
  wasteTypeId: string,
  radiusKm = 3
) {
  const compatible: NearbyContainer[] = containers
    .filter((container) => container.acceptedWasteTypeIds.includes(wasteTypeId))
    .map((container) => ({
      ...container,
      distanceKm: haversineDistanceKm(userLocation, {
        latitude: container.latitude,
        longitude: container.longitude,
      }),
    }))
    .filter((container) => container.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return compatible;
}

