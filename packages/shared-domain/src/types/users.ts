export type AppUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  isActive: boolean;
};

export type Role = {
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

export type Account = {
  id: string;
  email: string;
  name: string;
  role: string | null;
};
