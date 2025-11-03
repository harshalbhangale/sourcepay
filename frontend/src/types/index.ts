export interface Project {
  id: string;
  name: string;
  description: string;
  repoUrl?: string;
  ipfsHash?: string;
  totalBounty: string;
  escrowAddress?: string;
  status: ProjectStatus;
  ownerId: string;
  owner: User;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  bountyAmount: string;
  status: TaskStatus;
  difficulty?: string;
  githubIssueUrl?: string;
  ipfsHash?: string;
  projectId: string;
  project?: Project;
  assigneeId?: string;
  assignee?: User;
  contributions: Contribution[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  username?: string;
  githubId?: string;
  reputation: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contribution {
  id: string;
  prUrl: string;
  score: number;
  status: ContributionStatus;
  feedback?: string;
  ipfsHash?: string;
  taskId: string;
  task?: Task;
  contributorId: string;
  contributor?: User;
  payouts: Payout[];
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  amount: string;
  txHash: string;
  status: PayoutStatus;
  contributionId: string;
  contribution?: Contribution;
  createdAt: string;
}

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum TaskStatus {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  COMPLETED = "COMPLETED",
  DISPUTED = "DISPUTED",
}

export enum ContributionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DISPUTED = "DISPUTED",
}

export enum PayoutStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
