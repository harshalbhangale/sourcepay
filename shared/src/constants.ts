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

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 0,
  PAUSED: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const;

export const TASK_STATUS = {
  OPEN: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2,
  SUBMITTED: 3,
  COMPLETED: 4,
  DISPUTED: 5,
} as const;

export const CONTRIBUTION_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  DISPUTED: 3,
} as const;

export const PAYOUT_STATUS = {
  PENDING: 0,
  PROCESSING: 1,
  COMPLETED: 2,
  FAILED: 3,
} as const;
