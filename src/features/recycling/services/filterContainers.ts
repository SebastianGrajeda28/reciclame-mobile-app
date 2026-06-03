import { haversineDistanceKm } from './distance';
import type { RecyclingContainer, WasteType } from '../types/recycling.types';

export type ContainerWithDistance = RecyclingContainer & { distanceKm: number };

export function filterWasteTypesByCategory(
  wasteTypes: WasteType[],
  categoryId: string,
): WasteType[] {
  if (categoryId === 'all') return wasteTypes;
  return wasteTypes.filter((wt) => wt.categoryId === categoryId);
}

export function getNearbyCompatibleContainers(
  location: { latitude: number; longitude: number },
  containers: RecyclingContainer[],
  wasteTypes: WasteType[],
  maxDistanceKm = 3,
): ContainerWithDistance[] {
  if (!wasteTypes.length) return [];
  const ids = new Set(wasteTypes.map((wt) => wt.id));
  return containers
    .map((c) => ({
      ...c,
      distanceKm: haversineDistanceKm(location, { latitude: c.latitude, longitude: c.longitude }),
    }))
    .filter((c) => c.distanceKm <= maxDistanceKm)
    .filter((c) => c.acceptedWasteTypeIds.some((id) => ids.has(id)))
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
