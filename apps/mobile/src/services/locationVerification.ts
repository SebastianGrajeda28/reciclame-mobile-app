import type { RecyclingContainer } from '@/src/features/recycling/types/recycling.types';
import { isWithinDistance } from '@/src/utils/location';

/**
 * Maximum distance in meters that a user can be from a recycling point
 * to still be able to register a recycling action with verified location.
 */
const MAX_DISTANCE_METERS = 250; // 50 meters

/**
 * Verifies if the user's current location is within the allowed distance
 * of the selected recycling point.
 * 
 * @param currentLat - Current latitude of the user
 * @param currentLon - Current longitude of the user
 * @param container - The selected recycling container
 * @returns true if within distance, false otherwise
 */
export function verifyLocationProximity(
  currentLat: number,
  currentLon: number,
  container: RecyclingContainer,
): boolean {
  return isWithinDistance(
    currentLat,
    currentLon,
    container.latitude,
    container.longitude,
    MAX_DISTANCE_METERS,
  );
}
