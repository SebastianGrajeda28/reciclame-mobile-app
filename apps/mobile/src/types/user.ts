export type { UserProfile, UserProgress, UserSetting } from "@reciclame/shared-domain";

export type UserRole = "user" | "admin" | "sysadmin";

export type User = {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  createdAt?: string;
  role: UserRole;
};
