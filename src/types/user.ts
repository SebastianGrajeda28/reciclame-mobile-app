export type UserRole = 'user' | 'admin' | 'sysadmin';

export type User = {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
};
