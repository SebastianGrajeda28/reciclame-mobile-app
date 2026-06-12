import { mockBinTypeResolution } from '../../src/features/recycling/services/binTypeResolution/mocks/mock-bin-type-resolution';
import { supabaseBinTypeResolution } from '../../src/features/recycling/services/binTypeResolution/providers/supabase-bin-type-resolution';
import {
  GENERAL_WASTE_TYPE_ID,
  METALS_WASTE_TYPE_ID,
  ORGANIC_WASTE_TYPE_ID,
  OTHER_PLASTICS_WASTE_TYPE_ID,
  PLASTICS_PET_WASTE_TYPE_ID,
  PUCP_UNIVERSITY_ID,
} from '../../src/features/recycling/services/waste-type-bin-types.mock';
import {
  NON_RECOVERABLE_BIN_TYPE_ID,
  PLASTICS_BIN_TYPE_ID,
  RAEE_BIN_TYPE_ID,
} from '../../src/features/recycling/services/bin-types.mock';
import { supabase } from '../../src/services/supabase/client';

jest.mock('../../src/services/supabase/client', () => {
  return {
    supabase: {
      from: jest.fn(),
    },
  };
});

const mockedFrom = supabase.from as jest.Mock;

describe('mockBinTypeResolution', () => {
  it('resolves PET plastics to plastics bin type', async () => {
    const result = await mockBinTypeResolution.getBinTypeByWasteTypeId(
      PLASTICS_PET_WASTE_TYPE_ID,
      PUCP_UNIVERSITY_ID,
    );

    expect(result?.id).toBe(PLASTICS_BIN_TYPE_ID);
  });

  it('resolves other plastics to plastics bin type', async () => {
    const result = await mockBinTypeResolution.getBinTypeByWasteTypeId(
      OTHER_PLASTICS_WASTE_TYPE_ID,
      PUCP_UNIVERSITY_ID,
    );

    expect(result?.id).toBe(PLASTICS_BIN_TYPE_ID);
  });

  it('resolves metals to RAEE bin type', async () => {
    const result = await mockBinTypeResolution.getBinTypeByWasteTypeId(
      METALS_WASTE_TYPE_ID,
      PUCP_UNIVERSITY_ID,
    );

    expect(result?.id).toBe(RAEE_BIN_TYPE_ID);
  });

  it('resolves organic and general waste to non-recoverable bin type', async () => {
    const organic = await mockBinTypeResolution.getBinTypeByWasteTypeId(
      ORGANIC_WASTE_TYPE_ID,
      PUCP_UNIVERSITY_ID,
    );
    const general = await mockBinTypeResolution.getBinTypeByWasteTypeId(
      GENERAL_WASTE_TYPE_ID,
      PUCP_UNIVERSITY_ID,
    );

    expect(organic?.id).toBe(NON_RECOVERABLE_BIN_TYPE_ID);
    expect(general?.id).toBe(NON_RECOVERABLE_BIN_TYPE_ID);
  });

  it('returns null when waste type has no mapping', async () => {
    const result = await mockBinTypeResolution.getBinTypeByWasteTypeId(
      'missing-waste-type',
      PUCP_UNIVERSITY_ID,
    );

    expect(result).toBeNull();
  });

  it('returns null when university does not match', async () => {
    const result = await mockBinTypeResolution.getBinTypeByWasteTypeId(
      PLASTICS_PET_WASTE_TYPE_ID,
      'other-university',
    );

    expect(result).toBeNull();
  });
});

describe('supabaseBinTypeResolution', () => {
  afterEach(() => {
    mockedFrom.mockReset();
  });

  it('fetches and maps the related bin type for a waste type', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        bin_types: {
          id: PLASTICS_BIN_TYPE_ID,
          name: 'Contenedor de plasticos',
          description: 'Para plasticos PET y otros plasticos reciclables.',
          is_active: true,
        },
      },
      error: null,
    });
    const eqIsActive = jest.fn(() => ({ maybeSingle }));
    const eqUniversity = jest.fn(() => ({ eq: eqIsActive }));
    const eqWasteType = jest.fn(() => ({ eq: eqUniversity }));
    const select = jest.fn(() => ({ eq: eqWasteType }));

    mockedFrom.mockReturnValue({ select });

    const result = await supabaseBinTypeResolution.getBinTypeByWasteTypeId(
      PLASTICS_PET_WASTE_TYPE_ID,
      PUCP_UNIVERSITY_ID,
    );

    expect(mockedFrom).toHaveBeenCalledWith('map_waste_type_bin_types');
    expect(select).toHaveBeenCalledWith('bin_types(id,name,description,is_active)');
    expect(eqWasteType).toHaveBeenCalledWith('waste_type_id', PLASTICS_PET_WASTE_TYPE_ID);
    expect(eqUniversity).toHaveBeenCalledWith('university_id', PUCP_UNIVERSITY_ID);
    expect(eqIsActive).toHaveBeenCalledWith('is_active', true);
    expect(maybeSingle).toHaveBeenCalled();
    expect(result).toEqual({
      id: PLASTICS_BIN_TYPE_ID,
      name: 'Contenedor de plasticos',
      description: 'Para plasticos PET y otros plasticos reciclables.',
    });
  });

  it('returns null when the mapping is missing', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const eqIsActive = jest.fn(() => ({ maybeSingle }));
    const eqUniversity = jest.fn(() => ({ eq: eqIsActive }));
    const eqWasteType = jest.fn(() => ({ eq: eqUniversity }));
    const select = jest.fn(() => ({ eq: eqWasteType }));

    mockedFrom.mockReturnValue({ select });

    const result = await supabaseBinTypeResolution.getBinTypeByWasteTypeId(
      'missing-waste-type',
      PUCP_UNIVERSITY_ID,
    );

    expect(result).toBeNull();
  });

  it('returns null when the related bin type is inactive', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        bin_types: {
          id: PLASTICS_BIN_TYPE_ID,
          name: 'Contenedor de plasticos',
          description: null,
          is_active: false,
        },
      },
      error: null,
    });
    const eqIsActive = jest.fn(() => ({ maybeSingle }));
    const eqUniversity = jest.fn(() => ({ eq: eqIsActive }));
    const eqWasteType = jest.fn(() => ({ eq: eqUniversity }));
    const select = jest.fn(() => ({ eq: eqWasteType }));

    mockedFrom.mockReturnValue({ select });

    const result = await supabaseBinTypeResolution.getBinTypeByWasteTypeId(
      PLASTICS_PET_WASTE_TYPE_ID,
      PUCP_UNIVERSITY_ID,
    );

    expect(result).toBeNull();
  });

  it('throws when Supabase returns an error', async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Error SQL' },
    });
    const eqIsActive = jest.fn(() => ({ maybeSingle }));
    const eqUniversity = jest.fn(() => ({ eq: eqIsActive }));
    const eqWasteType = jest.fn(() => ({ eq: eqUniversity }));
    const select = jest.fn(() => ({ eq: eqWasteType }));

    mockedFrom.mockReturnValue({ select });

    await expect(
      supabaseBinTypeResolution.getBinTypeByWasteTypeId(
        PLASTICS_PET_WASTE_TYPE_ID,
        PUCP_UNIVERSITY_ID,
      ),
    ).rejects.toThrow('Error SQL');
  });
});
