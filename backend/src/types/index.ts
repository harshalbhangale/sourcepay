export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
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

export interface JWTPayload {
  userId: string;
  walletAddress: string;
}

export interface CreateProjectDTO {
  name: string;
  description: string;
  repoUrl?: string;
  totalBounty: string;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  bountyAmount: string;
  difficulty?: string;
  githubIssueUrl?: string;
  projectId: string;
}

export interface CreateContributionDTO {
  taskId: string;
  prUrl: string;
}

export interface UpdateContributionDTO {
  score?: number;
  status?: string;
  feedback?: string;
}

export interface GitHubPRData {
  owner: string;
  repo: string;
  prNumber: number;
  title: string;
  body: string | null;
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  merged: boolean;
  state: string;
}

export interface SourceAgentAnalysis {
  score: number;
  feedback: string;
  breakdown: {
    codeQuality: number;
    testCoverage: number;
    documentation: number;
    prDescription: number;
    codeStyle: number;
    impact: number;
  };
  metadata?: {
    filesChanged: number;
    additions: number;
    deletions: number;
    testsPassed: boolean;
    hasTests: boolean;
  };
}
