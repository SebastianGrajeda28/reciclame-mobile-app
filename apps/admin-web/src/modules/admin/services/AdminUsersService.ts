import { supabase } from "@/lib/supabase";

export type AppUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  isActive: boolean;
};

export type RoleRow = {
  id: string;
  name: string;
};

export type UserRoleAssignment = {
  id: string;
  userId: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
};

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
  is_active: boolean;
};

type UserRoleRow = {
  id: string;
  user_id: string;
  role_id: string;
  is_active: boolean;
  roles: { name: string } | { name: string }[] | null;
};

function mapUser(row: UserRow): AppUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
    isActive: row.is_active,
  };
}

function mapAssignment(row: UserRoleRow): UserRoleAssignment {
  const roleName = Array.isArray(row.roles) ? row.roles[0]?.name ?? "" : row.roles?.name ?? "";
  return {
    id: row.id,
    userId: row.user_id,
    roleId: row.role_id,
    roleName,
    isActive: row.is_active,
  };
}

export async function getAdminUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, created_at, updated_at, last_login_at, is_active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapUser);
}

export async function getRoles(): Promise<RoleRow[]> {
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
    .select("id, user_id, role_id, is_active, roles(name)")
    .eq("is_active", true);

  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as UserRoleRow[]).map(mapAssignment);
}

export async function assignUserRole(userId: string, roleId: string): Promise<UserRoleAssignment> {
  const { data, error } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role_id: roleId })
    .select("id, user_id, role_id, is_active, roles(name)")
    .single();

  if (error) throw new Error(error.message);
  return mapAssignment(data as UserRoleRow);
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
