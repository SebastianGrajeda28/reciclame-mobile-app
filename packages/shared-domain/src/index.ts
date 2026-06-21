export const STORAGE_BUCKETS = {
  instructionStepImages: "instruction-step-images",
} as const;

export const ADMIN_EDGE_FUNCTIONS = {
  provisionUser: "admin-provision-user",
} as const;

export const ADMIN_RPCS = {
  currentAccount: "get_current_account",
  dashboard: "get_admin_dashboard",
  usersList: "get_users_list",
  universitiesList: "get_universities_list",
  universityCampuses: "get_university_campuses",
  createUniversity: "create_university",
  createUniversityCampuses: "create_university_campuses",
} as const;

export * from "./types/education";
export * from "./types/gamification";
export * from "./types/geo";
export * from "./types/profile";
export * from "./types/recycling";
export * from "./types/social";
export * from "./types/users";
export * from "./types/waste";

