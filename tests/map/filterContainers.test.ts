import {
  filterWasteTypesByCategory,
  getNearbyCompatibleContainers,
} from '../../src/features/recycling/services/filterContainers';
import { containers } from '../../src/features/recycling/services/containers.mock';
import { wasteTypes } from '../../src/features/recycling/services/waste-types.mock';
import type { RecyclingContainer, WasteType } from '../../src/features/recycling/types/recycling.types';

const PUCP = { latitude: -12.0695, longitude: -77.0793 };
const FAR_AWAY = { latitude: -13.0, longitude: -77.0793 };

const idByCategory = (category: string): string => {
  const match = wasteTypes.find((wt) => wt.categoryId === category);
  if (!match) throw new Error(`No waste type found for category ${category}`);
  return match.id;
};

describe('filterWasteTypesByCategory', () => {
  it('returns all waste types when category is "all"', () => {
    const result = filterWasteTypesByCategory(wasteTypes, 'all');
    expect(result).toHaveLength(wasteTypes.length);
    expect(result).toEqual(wasteTypes);
  });

  it('returns only matching waste types for a specific category', () => {
    const result = filterWasteTypesByCategory(wasteTypes, 'plastic_bottle');
    expect(result.length).toBeGreaterThan(0);
    result.forEach((wt) => expect(wt.categoryId).toBe('plastic_bottle'));
  });

  it('returns empty array for unknown category', () => {
    const result = filterWasteTypesByCategory(wasteTypes, 'unknown_category');
    expect(result).toHaveLength(0);
  });

  it('returns empty array when input is empty', () => {
    const result = filterWasteTypesByCategory([], 'plastic_bottle');
    expect(result).toHaveLength(0);
  });
});

describe('getNearbyCompatibleContainers', () => {
  it('returns containers within 3km sorted by distance ascending', () => {
    const result = getNearbyCompatibleContainers(PUCP, containers, wasteTypes);
    expect(result.length).toBeGreaterThan(0);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].distanceKm).toBeGreaterThanOrEqual(result[i - 1].distanceKm);
    }
  });

  it('excludes containers beyond maxDistanceKm', () => {
    const result = getNearbyCompatibleContainers(FAR_AWAY, containers, wasteTypes);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when wasteTypes is empty', () => {
    const result = getNearbyCompatibleContainers(PUCP, containers, []);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when containers is empty', () => {
    const result = getNearbyCompatibleContainers(PUCP, [], wasteTypes);
    expect(result).toHaveLength(0);
  });

  it('excludes containers incompatible with given waste types', () => {
    const onlyBattery = wasteTypes.filter((wt) => wt.categoryId === 'battery');
    const batteryId = idByCategory('battery');
    const result = getNearbyCompatibleContainers(PUCP, containers, onlyBattery);
    result.forEach((c) =>
      expect(c.acceptedWasteTypeIds.some((id) => id === batteryId)).toBe(true),
    );
  });

  it('includes container exactly at boundary distance', () => {
    const containerAtBoundary: RecyclingContainer = {
      id: 'boundary',
      name: 'Boundary container',
      latitude: PUCP.latitude,
      longitude: PUCP.longitude,
      acceptedWasteTypeIds: [idByCategory('plastic_bottle')],
      instructionsByWasteTypeId: {},
    };
    const result = getNearbyCompatibleContainers(PUCP, [containerAtBoundary], wasteTypes, 3);
    expect(result).toHaveLength(1);
  });

  it('attaches distanceKm to each result', () => {
    const result = getNearbyCompatibleContainers(PUCP, containers, wasteTypes);
    result.forEach((c) => {
      expect(typeof c.distanceKm).toBe('number');
      expect(c.distanceKm).toBeGreaterThanOrEqual(0);
    });
  });
});
