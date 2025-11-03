export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden access",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
  WALLET_NOT_CONNECTED: "Wallet not connected",
  INVALID_SIGNATURE: "Invalid signature",
  PROJECT_NOT_FOUND: "Project not found",
  TASK_NOT_FOUND: "Task not found",
  CONTRIBUTION_NOT_FOUND: "Contribution not found",
} as const;

export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: "Project created successfully",
  TASK_CREATED: "Task created successfully",
  CONTRIBUTION_SUBMITTED: "Contribution submitted successfully",
  PAYOUT_PROCESSED: "Payout processed successfully",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
