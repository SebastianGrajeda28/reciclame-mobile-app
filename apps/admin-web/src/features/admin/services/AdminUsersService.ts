import { supabase } from "@/lib/supabase";
import type { Role } from "@reciclame/shared-domain";
import { ADMIN_RPCS } from "@reciclame/shared-domain";
export type { Role };

export type AppEmployee = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
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
};

type EmployeeListRow = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
  roleId: string | null;
  roleName: string | null;
  userRoleAssignmentId: string | null;
};

type GetEmployeesListResponse = {
  total: number;
  items: EmployeeListRow[];
};

type UpdateEmployeeRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

function mapEmployeeRow(row: EmployeeListRow): AppEmployee {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
    lastLoginAt: row.lastLoginAt,
    isActive: row.isActive,
    roleId: row.roleId ?? null,
    roleName: row.roleName ?? null,
    userRoleAssignmentId: row.userRoleAssignmentId ?? null,
  };
}

export type RoleFilter = "all" | "admin" | "manager";
export type SortColumn = "email" | "lastLoginAt" | "createdAt";
export type SortDirection = "asc" | "desc";

export type GetAdminEmployeesParams = {
  limit: number;
  offset: number;
  isActive?: boolean | null;
  roleFilter?: RoleFilter;
  search?: string;
  sortBy?: SortColumn;
  sortDir?: SortDirection;
};

export type GetAdminEmployeesResult = {
  total: number;
  employees: AppEmployee[];
};

export type UpdateEmployeePayload = {
  name: string;
  email?: string;
};

export async function getAdminEmployees({
  limit,
  offset,
  isActive = null,
  roleFilter = "all",
  search,
  sortBy = "createdAt",
  sortDir = "desc",
}: GetAdminEmployeesParams): Promise<GetAdminEmployeesResult> {
  const { data, error } = await supabase.rpc(ADMIN_RPCS.employeesList, {
    p_limit: limit,
    p_offset: offset,
    p_is_active: isActive,
    p_role_filter: roleFilter,
    p_search: search?.trim() ? search.trim() : null,
    p_sort_by: sortBy,
    p_sort_dir: sortDir,
  });
  if (error) throw new Error(error.message);

  const response = (data as GetEmployeesListResponse) ?? { total: 0, items: [] };

  return {
    total: response.total ?? 0,
    employees: (response.items ?? []).map(mapEmployeeRow),
  };
}

export async function updateEmployee(
  employeeId: string,
  payload: UpdateEmployeePayload
): Promise<AppEmployee> {
  const { data, error } = await supabase.rpc(ADMIN_RPCS.updateEmployee, {
    p_user_id: employeeId,
    p_name: payload.name.trim(),
    ...(payload.email?.trim() ? { p_email: payload.email.trim() } : {}),
  });

  if (error) throw new Error(error.message);

  const row = data as UpdateEmployeeRow;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: "",
    lastLoginAt: null,
    isActive: row.isActive,
    roleId: null,
    roleName: null,
    userRoleAssignmentId: null,
  };
}

export async function setEmployeeRole(userId: string, roleId: string): Promise<void> {
  const { error } = await supabase.rpc(ADMIN_RPCS.setEmployeeRole, {
    p_user_id: userId,
    p_role_id: roleId,
  });
  if (error) throw new Error(error.message);
}

export async function revokeUserAccess(userId: string): Promise<void> {
  const { error } = await supabase.rpc(ADMIN_RPCS.revokeEmployeeAccess, {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
}

export async function restoreUserAccess(userId: string): Promise<void> {
  const { error } = await supabase.rpc(ADMIN_RPCS.restoreEmployeeAccess, {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
}

export async function deactivateEmployee(employeeId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", employeeId);
  if (error) throw new Error(error.message);
}

export async function restoreEmployee(employeeId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", employeeId);

  if (error) throw new Error(error.message);
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