export const STORAGE_BUCKETS = {
  instructionStepImages: "instruction-step-images",
  binTypeImages: "bin-type-images",
} as const;

export const ADMIN_EDGE_FUNCTIONS = {
  provisionUser: "admin-provision-user",
} as const;

export const ADMIN_RPCS = {
  currentAccount: "get_current_account",
  dashboard: "get_manager_dashboard",
  controlPanel: "get_control_panel",
  employeesList: "get_employees_list",
  updateEmployee: "update_employee",
  setEmployeeRole: "set_employee_role",
  revokeEmployeeAccess: "revoke_employee_access",
  restoreEmployeeAccess: "restore_employee_access",
  universitiesList: "get_universities_list",
  createUniversity: "create_university",
  updateUniversity: "update_university",
  setUniversityActive: "set_university_active",
  universityCampuses: "get_university_campuses",
  createUniversityCampuses: "create_university_campuses",
  updateUniversityCampuses: "update_university_campuses",
} as const;

export * from "./types/education";
export * from "./types/gamification";
export * from "./types/geo";
export * from "./types/profile";
export * from "./types/recycling";
export * from "./types/social";
export * from "./types/users";
export * from "./types/waste";

