import { Octokit } from "@octokit/rest";
import { logger } from "../utils/logger";

// Initialize Octokit client
// If no token provided, works for public repos (lower rate limit)
const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN || undefined,
  request: {
    timeout: parseInt(process.env.GITHUB_API_TIMEOUT || "10000"),
  },
});

// Log GitHub API status
if (process.env.GITHUB_ACCESS_TOKEN) {
  logger.info("GitHub API initialized with authentication");
} else {
  logger.warn("GitHub API initialized without token - limited to public repos and lower rate limits");
}

export interface PRDetails {
  number: number;
  title: string;
  body: string | null;
  state: string;
  merged: boolean;
  mergeable: boolean | null;
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    id: number;
  };
  head: {
    ref: string;
    sha: string;
  };
}

export interface PRFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface CICheck {
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
}

/**
 * Fetch PR details from GitHub
 */
export async function fetchPRDetails(
  owner: string,
  repo: string,
  prNumber: number
): Promise<PRDetails> {
  try {
    logger.info(`Fetching PR details: ${owner}/${repo}#${prNumber}`);

    const { data } = await octokit.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    return {
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.state,
      merged: data.merged || false,
      mergeable: data.mergeable,
      additions: data.additions,
      deletions: data.deletions,
      changed_files: data.changed_files,
      commits: data.commits,
      created_at: data.created_at,
      updated_at: data.updated_at,
      user: {
        login: data.user?.login || "unknown",
        id: data.user?.id || 0,
      },
      head: {
        ref: data.head.ref,
        sha: data.head.sha,
      },
    };
  } catch (error: any) {
    logger.error("Error fetching PR details:", error);

    // Handle rate limiting
    if (error.status === 403 && error.message.includes("rate limit")) {
      throw new Error("GitHub API rate limit exceeded. Please try again later.");
    }

    // Handle not found
    if (error.status === 404) {
      throw new Error("PR not found. It may be private or deleted.");
    }

    throw new Error(`Failed to fetch PR details: ${error.message}`);
  }
}

/**
 * Fetch files changed in a PR
 */
export async function fetchPRFiles(
  owner: string,
  repo: string,
  prNumber: number
): Promise<PRFile[]> {
  try {
    logger.info(`Fetching PR files: ${owner}/${repo}#${prNumber}`);

    const maxFiles = parseInt(process.env.MAX_FILES_TO_ANALYZE || "50");

    const { data } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
      per_page: maxFiles,
    });

    return data.map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch,
    }));
  } catch (error: any) {
    logger.error("Error fetching PR files:", error);
    throw new Error(`Failed to fetch PR files: ${error.message}`);
  }
}

/**
 * Fetch CI/CD check runs status for a PR
 */
export async function fetchCIStatus(
  owner: string,
  repo: string,
  ref: string
): Promise<CICheck[]> {
  try {
    logger.info(`Fetching CI status: ${owner}/${repo}@${ref}`);

    const { data } = await octokit.checks.listForRef({
      owner,
      repo,
      ref,
    });

    if (!data.check_runs || data.check_runs.length === 0) {
      return [];
    }

    return data.check_runs.map((check) => ({
      name: check.name,
      status: check.status,
      conclusion: check.conclusion,
      started_at: check.started_at,
      completed_at: check.completed_at,
    }));
  } catch (error: any) {
    logger.warn("Could not fetch CI status:", error.message);
    // Don't throw - CI checks are optional
    return [];
  }
}

/**
 * Fetch PR review comments
 */
export async function fetchPRComments(
  owner: string,
  repo: string,
  prNumber: number
): Promise<number> {
  try {
    const { data: reviews } = await octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: prNumber,
    });

    const { data: comments } = await octokit.pulls.listReviewComments({
      owner,
      repo,
      pull_number: prNumber,
    });

    return reviews.length + comments.length;
  } catch (error: any) {
    logger.warn("Could not fetch PR comments:", error.message);
    return 0;
  }
}

/**
 * Check GitHub API rate limit status
 */
export async function checkRateLimit(): Promise<{
  remaining: number;
  limit: number;
  reset: Date;
}> {
  try {
    const { data } = await octokit.rateLimit.get();

    return {
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: new Date(data.rate.reset * 1000),
    };
  } catch (error: any) {
    logger.error("Error checking rate limit:", error);
    return {
      remaining: 0,
      limit: 5000,
      reset: new Date(Date.now() + 3600000), // 1 hour from now
    };
  }
}

/**
 * Parse GitHub PR URL
 */
export function parsePRUrl(prUrl: string): {
  owner: string;
  repo: string;
  prNumber: number;
} | null {
  const prMatch = prUrl.match(/github\.com\/([\w.-]+)\/([\w.-]+)\/pull\/(\d+)/);

  if (!prMatch) {
    return null;
  }

  const [, owner, repo, prNumber] = prMatch;

  return {
    owner,
    repo,
    prNumber: parseInt(prNumber),
  };
}

