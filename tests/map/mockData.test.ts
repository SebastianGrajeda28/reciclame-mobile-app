import { containers } from '../../src/features/recycling/services/containers.mock';
import { wasteTypes } from '../../src/features/recycling/services/waste-types.mock';
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

describe('wasteCategoryConfig integrity', () => {
  it('every entry has a color and iconColor', () => {
    Object.values(wasteCategoryConfig).forEach((cfg) => {
      expect(cfg.color).toBeTruthy();
      expect(cfg.iconColor).toBeTruthy();
    });
  });
});
