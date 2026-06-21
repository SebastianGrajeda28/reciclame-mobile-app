import { supabase } from "@/lib/supabase";
import type { Role } from "@reciclame/shared-domain";
import { ADMIN_RPCS } from "@reciclame/shared-domain";
export type { Role };

export type AppUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  isActive: boolean;
  roleId: string | null;
  roleName: string | null;
  userRoleAssignmentId: string | null;
};

export type UserRoleAssignment = {
  id: string;
  userId: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  updatedAt: string | null;
};

type UserListRow = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  isActive: boolean;
  roleId: string | null;
  roleName: string | null;
  userRoleAssignmentId: string | null;
};

type GetUsersListResponse = {
  total: number;
  items: UserListRow[];
};

function mapUserRow(row: UserListRow): AppUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastLoginAt: row.lastLoginAt,
    isActive: row.isActive,
    roleId: row.roleId ?? null,
    roleName: row.roleName ?? null,
    userRoleAssignmentId: row.userRoleAssignmentId ?? null,
  };
}

export type RoleFilter = "all" | "admin" | "manager";
export type SortColumn = "email" | "lastLoginAt" | "updatedAt" | "createdAt";
export type SortDirection = "asc" | "desc";

export type GetAdminUsersParams = {
  limit: number;
  offset: number;
  isActive?: boolean | null;
  roleFilter?: RoleFilter;
  search?: string;
  sortBy?: SortColumn;
  sortDir?: SortDirection;
};

export type GetAdminUsersResult = {
  total: number;
  users: AppUser[];
};

export async function getAdminUsers({
  limit,
  offset,
  isActive = null,
  roleFilter = "all",
  search,
  sortBy = "createdAt",
  sortDir = "desc",
}: GetAdminUsersParams): Promise<GetAdminUsersResult> {
  const { data, error } = await supabase.rpc(ADMIN_RPCS.usersList, {
    p_limit: limit,
    p_offset: offset,
    p_is_active: isActive,
    p_role_filter: roleFilter,
    p_search: search?.trim() ? search.trim() : null,
    p_sort_by: sortBy,
    p_sort_dir: sortDir,
  });
  if (error) throw new Error(error.message);

  const response = (data as GetUsersListResponse) ?? { total: 0, items: [] };

  return {
    total: response.total ?? 0,
    users: (response.items ?? []).map(mapUserRow),
  };
}

export async function getRoles(): Promise<Role[]> {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getUserRoleAssignments(userId?: string): Promise<UserRoleAssignment[]> {
  let query = supabase
    .from("user_roles")
    .select("id, user_id, role_id, is_active, updated_at, roles(name)")
    .eq("is_active", true);

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    roleId: row.role_id,
    roleName: Array.isArray(row.roles) ? row.roles[0]?.name ?? "" : row.roles?.name ?? "",
    isActive: row.is_active,
    updatedAt: row.updated_at ?? null,
  }));
}

export async function assignUserRole(userId: string, roleId: string): Promise<UserRoleAssignment> {
  const { data, error } = await supabase
    .from("user_roles")
    .upsert(
      { user_id: userId, role_id: roleId, is_active: true },
      { onConflict: "user_id,role_id" }
    )
    .select("id, user_id, role_id, is_active, updated_at, roles(name)")
    .single();

  if (error) throw new Error(error.message);
  const row = data as any;
  return {
    id: row.id,
    userId: row.user_id,
    roleId: row.role_id,
    roleName: Array.isArray(row.roles) ? row.roles[0]?.name ?? "" : row.roles?.name ?? "",
    isActive: row.is_active,
    updatedAt: row.updated_at ?? null,
  };
}

export async function deactivateUserRole(assignmentId: string): Promise<void> {
  const { error } = await supabase
    .from("user_roles")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", assignmentId)
    .eq("is_active", true);

  if (error) throw new Error(error.message);
}

export async function deactivateUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function restoreUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}