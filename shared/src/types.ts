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
  createdAt: Date | string;
  updatedAt: Date | string;
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
  assigneeId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  username?: string;
  githubId?: string;
  reputation: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Contribution {
  id: string;
  prUrl: string;
  score: number;
  status: ContributionStatus;
  feedback?: string;
  ipfsHash?: string;
  taskId: string;
  contributorId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Payout {
  id: string;
  amount: string;
  txHash: string;
  status: PayoutStatus;
  contributionId: string;
  createdAt: Date | string;
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
