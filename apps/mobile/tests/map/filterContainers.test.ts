import {
  getNearbyCompatibleContainersByBinType,
  getNearbyContainers,
} from '../../src/features/recycling/services/filterContainers';
import { containers } from '../../src/features/recycling/services/containers.mock';
import {
  NON_RECOVERABLE_BIN_TYPE_ID,
  PLASTICS_BIN_TYPE_ID,
  RAEE_BIN_TYPE_ID,
} from '../../src/features/recycling/services/bin-types.mock';
import type { RecyclingContainer } from '../../src/features/recycling/types/recycling.types';

const PUCP = { latitude: -12.0695, longitude: -77.0793 };
const FAR_AWAY = { latitude: -13.0, longitude: -77.0793 };

describe('getNearbyContainers', () => {
  it('returns all containers within 3km sorted by distance ascending', () => {
    const result = getNearbyContainers(PUCP, containers);

    expect(result.length).toBe(containers.length);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].distanceKm).toBeGreaterThanOrEqual(result[i - 1].distanceKm);
    }
  });

  it('excludes containers beyond maxDistanceKm', () => {
    const result = getNearbyContainers(FAR_AWAY, containers);

    expect(result).toHaveLength(0);
  });

  it('returns empty array when containers is empty', () => {
    const result = getNearbyContainers(PUCP, []);

    expect(result).toHaveLength(0);
  });

  it('includes container exactly at boundary distance', () => {
    const containerAtBoundary: RecyclingContainer = {
      id: 'boundary',
      name: 'Boundary container',
      latitude: PUCP.latitude,
      longitude: PUCP.longitude,
      acceptedWasteTypeIds: [],
      availableBinTypeIds: [PLASTICS_BIN_TYPE_ID],
      instructionsByWasteTypeId: {},
    };

    const result = getNearbyContainers(PUCP, [containerAtBoundary], 3);

    expect(result).toHaveLength(1);
  });

  it('attaches distanceKm to each result', () => {
    const result = getNearbyContainers(PUCP, containers);

    result.forEach((container) => {
      expect(typeof container.distanceKm).toBe('number');
      expect(container.distanceKm).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('getNearbyCompatibleContainersByBinType', () => {
  it('returns nearby containers that provide the requested bin type', () => {
    const result = getNearbyCompatibleContainersByBinType(PUCP, containers, PLASTICS_BIN_TYPE_ID);

    expect(result.length).toBeGreaterThan(0);
    result.forEach((container) => {
      expect(container.availableBinTypeIds).toContain(PLASTICS_BIN_TYPE_ID);
    });
  });

  it('resolves non-recoverable bin type to Estudios Generales', () => {
    const result = getNearbyCompatibleContainersByBinType(
      PUCP,
      containers,
      NON_RECOVERABLE_BIN_TYPE_ID,
    );

    expect(result.map((container) => container.name)).toContain('Contenedor Estudios Generales');
  });

  it('resolves RAEE bin type to MacGregor', () => {
    const result = getNearbyCompatibleContainersByBinType(PUCP, containers, RAEE_BIN_TYPE_ID);

    expect(result.map((container) => container.name)).toContain('Punto Verde Complejo MacGregor');
  });

  it('returns empty array when bin type is missing', () => {
    const result = getNearbyCompatibleContainersByBinType(PUCP, containers, null);

    expect(result).toHaveLength(0);
  });

  it('returns empty array when bin type is unknown', () => {
    const result = getNearbyCompatibleContainersByBinType(PUCP, containers, 'unknown-bin-type');

    expect(result).toHaveLength(0);
  });

  it('excludes containers beyond maxDistanceKm', () => {
    const result = getNearbyCompatibleContainersByBinType(
      FAR_AWAY,
      containers,
      PLASTICS_BIN_TYPE_ID,
    );

    expect(result).toHaveLength(0);
  });

  it('returns containers sorted by distance ascending', () => {
    const result = getNearbyCompatibleContainersByBinType(PUCP, containers, PLASTICS_BIN_TYPE_ID);

    for (let i = 1; i < result.length; i++) {
      expect(result[i].distanceKm).toBeGreaterThanOrEqual(result[i - 1].distanceKm);
    }
  });

  it('sorts multiple compatible containers by distance ascending', () => {
    const nearContainer: RecyclingContainer = {
      id: 'near-compatible-container',
      name: 'Near compatible container',
      latitude: PUCP.latitude,
      longitude: PUCP.longitude,
      acceptedWasteTypeIds: [],
      availableBinTypeIds: [PLASTICS_BIN_TYPE_ID],
      instructionsByWasteTypeId: {},
    };
    const farContainer: RecyclingContainer = {
      id: 'far-compatible-container',
      name: 'Far compatible container',
      latitude: PUCP.latitude + 0.01,
      longitude: PUCP.longitude,
      acceptedWasteTypeIds: [],
      availableBinTypeIds: [PLASTICS_BIN_TYPE_ID],
      instructionsByWasteTypeId: {},
    };

    const result = getNearbyCompatibleContainersByBinType(
      PUCP,
      [farContainer, nearContainer],
      PLASTICS_BIN_TYPE_ID,
    );

    expect(result.map((container) => container.id)).toEqual([
      'near-compatible-container',
      'far-compatible-container',
    ]);
  });
});
