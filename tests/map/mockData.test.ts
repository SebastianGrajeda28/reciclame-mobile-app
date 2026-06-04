import { containers } from '../../src/features/recycling/services/containers.mock';
import { wasteTypes } from '../../src/features/recycling/services/waste-types.mock';
import {
  binTypes,
  NON_RECOVERABLE_BIN_TYPE_ID,
  RAEE_BIN_TYPE_ID,
} from '../../src/features/recycling/services/bin-types.mock';
import {
  GENERAL_WASTE_TYPE_ID,
  METALS_WASTE_TYPE_ID,
  ORGANIC_WASTE_TYPE_ID,
  PUCP_UNIVERSITY_ID,
  wasteTypeBinTypeMappings,
} from '../../src/features/recycling/services/waste-type-bin-types.mock';
import { wasteCategoryConfig } from '../../src/features/recycling/services/waste-category-config.mock';

describe('containers mock data integrity', () => {
  it('has no duplicate container IDs', () => {
    const ids = containers.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every acceptedWasteTypeId references a valid wasteType', () => {
    const wasteTypeIds = new Set(wasteTypes.map((wt) => wt.id));
    containers.forEach((c) => {
      c.acceptedWasteTypeIds.forEach((id) => {
        expect(wasteTypeIds.has(id)).toBe(true);
      });
    });
  });

  it('every availableBinTypeId references a valid binType', () => {
    const binTypeIds = new Set(binTypes.map((bt) => bt.id));
    containers.forEach((c) => {
      c.availableBinTypeIds.forEach((id) => {
        expect(binTypeIds.has(id)).toBe(true);
      });
    });
  });

  it('every instructionsByWasteTypeId key is in acceptedWasteTypeIds', () => {
    containers.forEach((c) => {
      Object.keys(c.instructionsByWasteTypeId).forEach((key) => {
        expect(c.acceptedWasteTypeIds).toContain(key);
      });
    });
  });

  it('every container has at least one accepted waste type', () => {
    containers.forEach((c) => {
      expect(c.acceptedWasteTypeIds.length).toBeGreaterThan(0);
    });
  });

  it('every container has at least one available bin type', () => {
    containers.forEach((c) => {
      expect(c.availableBinTypeIds.length).toBeGreaterThan(0);
    });
  });
});

describe('wasteTypes mock data integrity', () => {
  it('has no duplicate waste type IDs', () => {
    const ids = wasteTypes.map((wt) => wt.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every categoryId exists in wasteCategoryConfig', () => {
    const configKeys = Object.keys(wasteCategoryConfig);
    wasteTypes.forEach((wt) => {
      expect(configKeys).toContain(wt.categoryId);
    });
  });
});

describe('binTypes mock data integrity', () => {
  it('has no duplicate bin type IDs', () => {
    const ids = binTypes.map((bt) => bt.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('wasteTypeBinTypeMappings mock data integrity', () => {
  it('references existing waste types and bin types', () => {
    const wasteTypeIds = new Set(wasteTypes.map((wt) => wt.id));
    const binTypeIds = new Set(binTypes.map((bt) => bt.id));

    wasteTypeBinTypeMappings.forEach((mapping) => {
      expect(mapping.universityId).toBe(PUCP_UNIVERSITY_ID);
      expect(wasteTypeIds.has(mapping.wasteTypeId)).toBe(true);
      expect(binTypeIds.has(mapping.binTypeId)).toBe(true);
    });
  });

  it('maps every waste type to a bin type for the mock university', () => {
    const mappedWasteTypeIds = new Set(
      wasteTypeBinTypeMappings
        .filter((mapping) => mapping.universityId === PUCP_UNIVERSITY_ID)
        .map((mapping) => mapping.wasteTypeId),
    );

    wasteTypes.forEach((wasteType) => {
      expect(mappedWasteTypeIds.has(wasteType.id)).toBe(true);
    });
  });

  it('supports multiple waste types mapped to the same bin type', () => {
    const countByBinType = wasteTypeBinTypeMappings.reduce<Record<string, number>>(
      (counts, mapping) => ({
        ...counts,
        [mapping.binTypeId]: (counts[mapping.binTypeId] ?? 0) + 1,
      }),
      {},
    );

    expect(Object.values(countByBinType).some((count) => count > 1)).toBe(true);
  });

  it('keeps institutional mappings for metal, organic, and general waste', () => {
    const binTypeByWasteType = new Map(
      wasteTypeBinTypeMappings.map((mapping) => [mapping.wasteTypeId, mapping.binTypeId]),
    );

    expect(binTypeByWasteType.get(METALS_WASTE_TYPE_ID)).toBe(RAEE_BIN_TYPE_ID);
    expect(binTypeByWasteType.get(ORGANIC_WASTE_TYPE_ID)).toBe(NON_RECOVERABLE_BIN_TYPE_ID);
    expect(binTypeByWasteType.get(GENERAL_WASTE_TYPE_ID)).toBe(NON_RECOVERABLE_BIN_TYPE_ID);
  });
});

describe('wasteCategoryConfig integrity', () => {
  it('every entry has a color and iconColor', () => {
    Object.values(wasteCategoryConfig).forEach((cfg) => {
      expect(cfg.color).toBeTruthy();
      expect(cfg.iconColor).toBeTruthy();
    });
  });
});
