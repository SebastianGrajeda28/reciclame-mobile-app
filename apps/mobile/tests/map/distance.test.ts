import { haversineDistanceKm } from '../../src/features/recycling/services/distance';

const PUCP = { latitude: -12.0695, longitude: -77.0793 };
const PLAZA_MAYOR = { latitude: -12.0464, longitude: -77.0428 };

describe('haversineDistanceKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistanceKm(PUCP, PUCP)).toBe(0);
  });

  it('returns positive distance between two different points', () => {
    const dist = haversineDistanceKm(PUCP, PLAZA_MAYOR);
    expect(dist).toBeGreaterThan(0);
  });

  it('PUCP to Plaza Mayor is approximately 4.5 km', () => {
    const dist = haversineDistanceKm(PUCP, PLAZA_MAYOR);
    expect(dist).toBeGreaterThan(4);
    expect(dist).toBeLessThan(5);
  });

  it('is symmetric — A→B equals B→A', () => {
    const ab = haversineDistanceKm(PUCP, PLAZA_MAYOR);
    const ba = haversineDistanceKm(PLAZA_MAYOR, PUCP);
    expect(Math.abs(ab - ba)).toBeLessThan(0.0001);
  });

  it('returns small but nonzero distance for nearby points (~50m apart)', () => {
    const nearby = { latitude: -12.0695, longitude: -77.0797 };
    const dist = haversineDistanceKm(PUCP, nearby);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(0.1);
  });

  it('handles coordinates across the equator', () => {
    const north = { latitude: 1, longitude: 0 };
    const south = { latitude: -1, longitude: 0 };
    const dist = haversineDistanceKm(north, south);
    expect(dist).toBeGreaterThan(200);
    expect(dist).toBeLessThan(230);
  });
});
