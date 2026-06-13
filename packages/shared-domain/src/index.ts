export const STORAGE_BUCKETS = {
  instructionStepImages: "instruction-step-images",
} as const;

export const ADMIN_EDGE_FUNCTIONS = {
  provisionUser: "admin-provision-user",
} as const;

export const ADMIN_RPCS = {
  currentAccount: "get_current_account",
  dashboard: "get_admin_dashboard",
} as const;
