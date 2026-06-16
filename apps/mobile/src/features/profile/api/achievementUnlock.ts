import type { ProfileBadge } from '@/src/features/profile/data/profileGamification';
import { profileGamificationSnapshot } from '@/src/features/profile/data/profileGamification';

/**
 * Simulates checking for newly unlocked achievements after a recycling action.
 * In a real implementation, this would query the backend to check achievement criteria.
 * 
 * For now, this is a mock implementation that simulates unlocking achievements
 * based on a simple counter pattern.
 */
let recyclingCount = 0;

export function checkUnlockedAchievements(): ProfileBadge | null {
  recyclingCount++;
  
  // Mock logic: unlock achievements based on recycling count
  // This simulates the backend checking achievement criteria
  const allBadges = profileGamificationSnapshot.allBadges;
  
  // Simulate unlocking "Primer reciclaje" on first recycle
  if (recyclingCount === 1) {
    return allBadges.find(b => b.id === 'badge-1') ?? null;
  }
  
  // Simulate unlocking "Semana verde" on 7th recycle (simulating 7 days streak)
  if (recyclingCount === 7) {
    return allBadges.find(b => b.id === 'badge-2') ?? null;
  }
  
  // Simulate unlocking "Coleccionista" on 10th recycle
  if (recyclingCount === 10) {
    return allBadges.find(b => b.id === 'badge-3') ?? null;
  }
  
  // No achievement unlocked
  return null;
}

/**
 * Resets the recycling counter for testing purposes.
 * In production, this would not exist.
 */
export function resetRecyclingCounter() {
  recyclingCount = 0;
}
