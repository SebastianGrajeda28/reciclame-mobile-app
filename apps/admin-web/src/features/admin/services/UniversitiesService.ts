import { supabase } from "@/lib/supabase";
import { ADMIN_RPCS } from "@reciclame/shared-domain";

export const MAX_CAMPUSES_PER_UNIVERSITY = 100;

export type AppUniversity = {
  id: string;
  name: string;
  isActive: boolean;
  campusCount: number;
  recyclingPointCount: number;
  lastModifiedAt: string | null;
  createdAt: string;
};

type UniversityListRow = {
  id: string;
  name: string;
  isActive: boolean;
  campusCount: number;
  recyclingPointCount: number;
  lastModifiedAt: string | null;
  createdAt: string;
};

type GetUniversitiesListResponse = {
  total: number;
  items: UniversityListRow[];
};

function mapUniversityRow(row: UniversityListRow): AppUniversity {
  return {
    id: row.id,
    name: row.name,
    isActive: row.isActive,
    campusCount: row.campusCount ?? 0,
    recyclingPointCount: row.recyclingPointCount ?? 0,
    lastModifiedAt: row.lastModifiedAt ?? null,
    createdAt: row.createdAt,
  };
}

export type UniversitySortColumn =
  | "name"
  | "isActive"
  | "campusCount"
  | "recyclingPointCount"
  | "lastModifiedAt"
  | "createdAt";
export type SortDirection = "asc" | "desc";

export type GetAdminUniversitiesParams = {
  limit: number;
  offset: number;
  isActive?: boolean | null;
  search?: string;
  sortBy?: UniversitySortColumn;
  sortDir?: SortDirection;
};

export type GetAdminUniversitiesResult = {
  total: number;
  universities: AppUniversity[];
};

export async function getAdminUniversities({
  limit,
  offset,
  isActive = null,
  search,
  sortBy = "createdAt",
  sortDir = "desc",
}: GetAdminUniversitiesParams): Promise<GetAdminUniversitiesResult> {
  const { data, error } = await supabase.rpc(ADMIN_RPCS.universitiesList, {
    p_limit: limit,
    p_offset: offset,
    p_is_active: isActive,
    p_search: search?.trim() ? search.trim() : null,
    p_sort_by: sortBy,
    p_sort_dir: sortDir,
  });
  if (error) throw new Error(error.message);

  const response = (data as GetUniversitiesListResponse) ?? { total: 0, items: [] };

  return {
    total: response.total ?? 0,
    universities: (response.items ?? []).map(mapUniversityRow),
  };
}

export type AppCampus = {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  recyclingPointCount: number;
  createdAt: string;
};

type CampusListRow = {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  recyclingPointCount: number;
  createdAt: string;
};

type GetUniversityCampusesResponse = {
  total: number;
  items: CampusListRow[];
};

function mapCampusRow(row: CampusListRow): AppCampus {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? null,
    isActive: row.isActive,
    recyclingPointCount: row.recyclingPointCount ?? 0,
    createdAt: row.createdAt,
  };
}

export type CampusSortColumn = "name" | "isActive" | "recyclingPointCount" | "createdAt";

export type GetUniversityCampusesParams = {
  universityId: string;
  limit: number;
  offset: number;
  isActive?: boolean | null;
  search?: string;
  sortBy?: CampusSortColumn;
  sortDir?: SortDirection;
};

export type GetUniversityCampusesResult = {
  total: number;
  campuses: AppCampus[];
};

export async function getUniversityCampuses({
  universityId,
  limit,
  offset,
  isActive = null,
  search,
  sortBy = "name",
  sortDir = "asc",
}: GetUniversityCampusesParams): Promise<GetUniversityCampusesResult> {
  const { data, error } = await supabase.rpc(ADMIN_RPCS.universityCampuses, {
    p_university_id: universityId,
    p_limit: limit,
    p_offset: offset,
    p_is_active: isActive,
    p_search: search?.trim() ? search.trim() : null,
    p_sort_by: sortBy,
    p_sort_dir: sortDir,
  });
  if (error) throw new Error(error.message);

  const response = (data as GetUniversityCampusesResponse) ?? { total: 0, items: [] };

  return {
    total: response.total ?? 0,
    campuses: (response.items ?? []).map(mapCampusRow),
  };
}

export type CreatedUniversity = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

export type CreateUniversityParams = {
  name: string;
};

export async function createUniversity({ name }: CreateUniversityParams): Promise<CreatedUniversity> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("El nombre de la universidad es requerido");
  }

  const { data, error } = await supabase.rpc(ADMIN_RPCS.createUniversity, {
    p_name: trimmedName,
  });
  if (error) throw new Error(error.message);

  return data as CreatedUniversity;
}

export async function updateUniversity(universityId: string, name: string): Promise<void> {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("El nombre de la universidad es requerido");

  const { error } = await supabase.rpc(ADMIN_RPCS.updateUniversity, {
    p_university_id: universityId,
    p_name: trimmedName,
  });
  if (error) throw new Error(error.message);
}

export async function deactivateUniversity(universityId: string): Promise<void> {
  const { error } = await supabase.rpc(ADMIN_RPCS.setUniversityActive, {
    p_university_id: universityId,
    p_is_active: false,
  });
  if (error) throw new Error(error.message);
}

export async function restoreUniversity(universityId: string): Promise<void> {
  const { error } = await supabase.rpc(ADMIN_RPCS.setUniversityActive, {
    p_university_id: universityId,
    p_is_active: true,
  });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Campus upsert — edit existing (name, address, isActive) + insert new ones.
// A single RPC call handles everything; activate/deactivate is just another
// field on the same payload so no separate RPC is needed.
// ---------------------------------------------------------------------------

export type CampusUpsertInput = {
  /** Present for existing campuses; omitted for new ones. */
  id?: string;
  name: string;
  address?: string | null;
  /** Only applied when updating an existing campus (id present). */
  isActive?: boolean;
};

export type UpsertedCampus = {
  id: string;
  name: string;
  address: string | null;
};

type UpdateUniversityCampusesResponse = {
  universityId: string;
  campuses: UpsertedCampus[];
};

export type UpdateUniversityCampusesParams = {
  universityId: string;
  campuses: CampusUpsertInput[];
};

export async function updateUniversityCampuses({
  universityId,
  campuses,
}: UpdateUniversityCampusesParams): Promise<UpsertedCampus[]> {
  if (!universityId) throw new Error("universityId es requerido");
  if (!campuses.length) throw new Error("Se requiere al menos un campus");
  if (campuses.length > MAX_CAMPUSES_PER_UNIVERSITY) {
    throw new Error(`No se pueden procesar más de ${MAX_CAMPUSES_PER_UNIVERSITY} campuses a la vez`);
  }

  const payload = campuses.map((campus) => {
    const trimmedName = campus.name.trim();
    if (!trimmedName) throw new Error("Cada campus requiere un nombre");
    return {
      ...(campus.id ? { id: campus.id } : {}),
      name: trimmedName,
      address: campus.address?.trim() ? campus.address.trim() : null,
      ...(campus.id && campus.isActive !== undefined ? { isActive: campus.isActive } : {}),
    };
  });

  const { data, error } = await supabase.rpc(ADMIN_RPCS.updateUniversityCampuses, {
    p_university_id: universityId,
    p_campuses: payload,
  });
  if (error) throw new Error(error.message);

  const response = (data as UpdateUniversityCampusesResponse) ?? { universityId, campuses: [] };
  return response.campuses ?? [];
}

// ---------------------------------------------------------------------------
// Legacy batch-create (kept for CreateUniversityDialog flow)
// ---------------------------------------------------------------------------

export type CampusInput = {
  name: string;
  address?: string | null;
};

export type CreatedCampus = {
  id: string;
  name: string;
  address: string | null;
};

type CreateUniversityCampusesResponse = {
  universityId: string;
  campuses: CreatedCampus[];
};

export type CreateUniversityCampusesParams = {
  universityId: string;
  campuses: CampusInput[];
};

export async function createUniversityCampuses({
  universityId,
  campuses,
}: CreateUniversityCampusesParams): Promise<CreatedCampus[]> {
  if (!universityId) throw new Error("universityId es requerido");
  if (!campuses.length) throw new Error("Se requiere al menos un campus");
  if (campuses.length > MAX_CAMPUSES_PER_UNIVERSITY) {
    throw new Error(`No se pueden agregar más de ${MAX_CAMPUSES_PER_UNIVERSITY} campuses a la vez`);
  }

  const payload = campuses.map((campus) => {
    const trimmedName = campus.name.trim();
    if (!trimmedName) throw new Error("Cada campus requiere un nombre");
    return {
      name: trimmedName,
      address: campus.address?.trim() ? campus.address.trim() : null,
    };
  });

  const { data, error } = await supabase.rpc(ADMIN_RPCS.createUniversityCampuses, {
    p_university_id: universityId,
    p_campuses: payload,
  });
  if (error) throw new Error(error.message);

  const response = (data as CreateUniversityCampusesResponse) ?? { universityId, campuses: [] };
  return response.campuses ?? [];
}