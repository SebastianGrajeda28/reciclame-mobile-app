import { containers } from '@/src/features/recycling/services/containers.mock';
import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';
import { calculateDistance } from '@/src/utils/location';

/**
 * Finds the closest recycling point that accepts a specific waste type.
 * 
 * @param currentLat - Current latitude of the user
 * @param currentLon - Current longitude of the user
 * @param wasteTypeId - The waste type ID to filter containers by
 * @returns The closest container that accepts the waste type, or null if none found
 */
export function findClosestRecyclingPoint(
  currentLat: number,
  currentLon: number,
  wasteTypeId: string,
): RecyclingContainer | null {
  // Filter containers that accept the waste type
  const eligibleContainers = containers.filter((container) =>
    container.acceptedWasteTypeIds.includes(wasteTypeId),
  );

  if (eligibleContainers.length === 0) {
    return null;
  }

  // Find the closest container
  let closestContainer: RecyclingContainer | null = null;
  let minDistance = Infinity;

  for (const container of eligibleContainers) {
    const distance = calculateDistance(
      currentLat,
      currentLon,
      container.latitude,
      container.longitude,
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestContainer = container;
    }
  }

  return closestContainer;
}

/**
 * Finds the closest recycling point that has a specific bin type available.
 * 
 * @param currentLat - Current latitude of the user
 * @param currentLon - Current longitude of the user
 * @param binTypeId - The bin type ID to filter containers by
 * @param excludeContainerId - Optional container ID to exclude from results
 * @returns The closest container that has the bin type, or null if none found
 */
export function findClosestContainerWithBinType(
  currentLat: number,
  currentLon: number,
  binTypeId: string,
  excludeContainerId?: string,
): RecyclingContainer | null {
  // Filter containers that have the bin type available
  const eligibleContainers = containers.filter((container) =>
    container.availableBinTypeIds.includes(binTypeId) &&
    (excludeContainerId ? container.id !== excludeContainerId : true),
  );

  if (eligibleContainers.length === 0) {
    return null;
  }

  // Find the closest container
  let closestContainer: RecyclingContainer | null = null;
  let minDistance = Infinity;

  for (const container of eligibleContainers) {
    const distance = calculateDistance(
      currentLat,
      currentLon,
      container.latitude,
      container.longitude,
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestContainer = container;
    }
  }

  return closestContainer;
}
