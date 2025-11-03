// API Base URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// Contract Addresses
export const CONTRACTS = {
  PROJECT_REGISTRY: process.env.NEXT_PUBLIC_CONTRACT_PROJECT_REGISTRY || "",
  PROJECT_ESCROW: process.env.NEXT_PUBLIC_CONTRACT_PROJECT_ESCROW || "",
  FEATURE_TASK: process.env.NEXT_PUBLIC_CONTRACT_FEATURE_TASK || "",
  PAYOUT_DISTRIBUTOR: process.env.NEXT_PUBLIC_CONTRACT_PAYOUT_DISTRIBUTOR || "",
  MUSD_TOKEN: process.env.NEXT_PUBLIC_MUSD_CONTRACT_ADDRESS || "",
} as const;

// Network Configuration
export const NETWORK_ID = parseInt(
  process.env.NEXT_PUBLIC_NETWORK_ID || "11155111"
); // Sepolia by default

// Supported Chain IDs
export const SUPPORTED_CHAINS = {
  SEPOLIA: 11155111,
  MAINNET: 1,
  LOCALHOST: 1337,
} as const;

// Project Status
export const PROJECT_STATUS = {
  ACTIVE: 0,
  PAUSED: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const;

// Task Status
export const TASK_STATUS = {
  OPEN: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2,
  SUBMITTED: 3,
  COMPLETED: 4,
  DISPUTED: 5,
} as const;

// Contribution Status
export const CONTRIBUTION_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  DISPUTED: 3,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
