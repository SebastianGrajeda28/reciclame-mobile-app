import { calculateDistance } from '@/src/utils/location';
import { containers } from '@/src/features/recycling/services/containers.mock';
import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';

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
