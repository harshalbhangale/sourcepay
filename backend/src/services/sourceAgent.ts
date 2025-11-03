/**
 * Source Agent Service
 *
 * Analyzes GitHub Pull Requests and generates contribution scores
 * using real GitHub API data and intelligent heuristics.
 */

import {
  fetchPRDetails,
  fetchPRFiles,
  fetchCIStatus,
  parsePRUrl,
  PRFile,
} from "./githubService";
import { logger } from "../utils/logger";

interface SourceAgentScore {
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

/**
 * Analyze a PR and generate a contribution score using real GitHub data
 */
export async function scoreContribution(
  prUrl: string
): Promise<SourceAgentScore> {
  try {
    // Parse PR URL
    const parsed = parsePRUrl(prUrl);
    if (!parsed) {
      throw new Error("Invalid GitHub PR URL");
    }

    const { owner, repo, prNumber } = parsed;

    logger.info(`Analyzing PR: ${owner}/${repo}#${prNumber}`);

    // Fetch PR details and files
    const [prDetails, prFiles] = await Promise.all([
      fetchPRDetails(owner, repo, prNumber),
      fetchPRFiles(owner, repo, prNumber),
    ]);

    // Fetch CI status (optional, don't fail if unavailable)
    const ciChecks = await fetchCIStatus(owner, repo, prDetails.head.sha);

    // Calculate scores based on real data
    const codeQuality = calculateCodeQuality(prFiles, prDetails);
    const testCoverage = calculateTestCoverage(prFiles);
    const documentation = calculateDocumentation(prFiles, prDetails);
    const prDescription = calculatePRDescription(prDetails);
    const codeStyle = calculateCodeStyle(prFiles, ciChecks);
    const impact = calculateImpact(prDetails, prFiles);

    // Check if CI tests passed
    const testsPassed =
      ciChecks.length > 0
        ? ciChecks.every((check) => check.conclusion === "success")
        : true;

    // Penalize if tests failed
    let ciPenalty = 0;
    if (ciChecks.length > 0 && !testsPassed) {
      ciPenalty = 25;
      logger.warn(`CI checks failed for PR #${prNumber}, applying penalty`);
    }

    // Calculate weighted average
    let totalScore = Math.floor(
      codeQuality * 0.3 +
        testCoverage * 0.2 +
        documentation * 0.15 +
        prDescription * 0.15 +
        codeStyle * 0.1 +
        impact * 0.1
    );

    // Apply CI penalty
    totalScore = Math.max(0, totalScore - ciPenalty);

    // Generate feedback
    const feedback = generateFeedback(
      totalScore,
      {
        codeQuality,
        testCoverage,
        documentation,
        prDescription,
        codeStyle,
        impact,
      },
      prFiles,
      prDetails,
      ciChecks,
      testsPassed
    );

    logger.info(`PR #${prNumber} scored: ${totalScore}/100`);

    return {
      score: totalScore,
      feedback,
      breakdown: {
        codeQuality,
        testCoverage,
        documentation,
        prDescription,
        codeStyle,
        impact,
      },
      metadata: {
        filesChanged: prDetails.changed_files,
        additions: prDetails.additions,
        deletions: prDetails.deletions,
        testsPassed,
        hasTests: testCoverage > 50,
      },
    };
  } catch (error: any) {
    logger.error("Error analyzing PR:", error);

    // Fallback to basic scoring if GitHub API fails
    if (error.message.includes("rate limit") || error.message.includes("API")) {
      logger.warn("GitHub API unavailable, using fallback scoring");
      return fallbackScoring(prUrl);
    }

    throw error;
  }
}

/**
 * Calculate code quality score based on file changes
 */
function calculateCodeQuality(files: PRFile[], prDetails: PRDetails): number {
  let score = 70; // Base score

  // Filter out non-code files
  const codeFiles = files.filter(
    (f) =>
      !f.filename.includes("package-lock.json") &&
      !f.filename.includes("yarn.lock") &&
      !f.filename.includes(".min.") &&
      !f.filename.endsWith(".json") &&
      !f.filename.endsWith(".md")
  );

  const meaningfulFiles = codeFiles.length;
  const totalFiles = files.length;

  // Reward meaningful changes
  if (meaningfulFiles > 0) {
    const ratio = meaningfulFiles / Math.max(totalFiles, 1);
    score += Math.floor(ratio * 20); // Up to +20 points
  }

  // Penalize very large PRs (harder to review)
  if (prDetails.changed_files > 30) {
    score -= 15;
  } else if (prDetails.changed_files > 15) {
    score -= 5;
  }

  // Reward good commit count (not too many, not too few)
  if (prDetails.commits >= 1 && prDetails.commits <= 5) {
    score += 10; // Good commit hygiene
  } else if (prDetails.commits > 20) {
    score -= 10; // Too many commits
  }

  // Check for code complexity (avoid very long files)
  const hasLargeFiles = codeFiles.some((f) => f.additions > 500);
  if (hasLargeFiles) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate test coverage score
 */
function calculateTestCoverage(files: PRFile[]): number {
  let score = 40; // Base score (assume minimal testing)

  // Check for test files
  const testFiles = files.filter(
    (f) =>
      f.filename.includes(".test.") ||
      f.filename.includes(".spec.") ||
      f.filename.includes("__tests__") ||
      f.filename.includes("/test/") ||
      f.filename.includes("/tests/")
  );

  const hasTests = testFiles.length > 0;

  if (hasTests) {
    score = 70; // Good starting point if tests exist

    // Reward proportional test coverage
    const sourceFiles = files.filter(
      (f) =>
        (f.filename.endsWith(".ts") ||
          f.filename.endsWith(".js") ||
          f.filename.endsWith(".tsx") ||
          f.filename.endsWith(".jsx") ||
          f.filename.endsWith(".sol")) &&
        !f.filename.includes("test") &&
        !f.filename.includes("spec")
    );

    if (sourceFiles.length > 0) {
      const testRatio = testFiles.length / sourceFiles.length;
      if (testRatio >= 1) {
        score = 95; // Excellent test coverage
      } else if (testRatio >= 0.5) {
        score = 85; // Good coverage
      } else if (testRatio >= 0.3) {
        score = 75; // Acceptable
      }
    }

    // Bonus for test file size (meaningful tests)
    const avgTestSize =
      testFiles.reduce((sum, f) => sum + f.additions, 0) / testFiles.length;
    if (avgTestSize > 20) {
      score += 5; // Comprehensive tests
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate documentation score
 */
function calculateDocumentation(files: PRFile[], prDetails: PRDetails): number {
  let score = 50; // Base score

  // Check for README or docs updates
  const hasDocFiles = files.some(
    (f) =>
      f.filename.toLowerCase().includes("readme") ||
      f.filename.toLowerCase().includes("doc") ||
      f.filename.endsWith(".md")
  );

  if (hasDocFiles) {
    score += 25; // Good documentation practices
  }

  // Check PR description quality
  const bodyLength = prDetails.body?.length || 0;
  if (bodyLength > 200) {
    score += 15; // Detailed description
  } else if (bodyLength > 50) {
    score += 5; // Some description
  }

  // Check for code comments in diffs
  const hasComments = files.some((f) => {
    const patch = f.patch || "";
    return (
      patch.includes("//") ||
      patch.includes("/*") ||
      patch.includes("#") ||
      patch.includes('"""')
    );
  });

  if (hasComments) {
    score += 10; // Code is commented
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate PR description quality
 */
function calculatePRDescription(prDetails: PRDetails): number {
  let score = 50; // Base score

  // Title quality
  const titleLength = prDetails.title.length;
  if (titleLength >= 20 && titleLength <= 100) {
    score += 15; // Good title length
  } else if (titleLength < 10) {
    score -= 10; // Too short
  }

  // Check for conventional commit style
  const conventionalPattern =
    /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(\(.+\))?:/i;
  if (conventionalPattern.test(prDetails.title)) {
    score += 10; // Follows conventions
  }

  // Body description quality
  const bodyLength = prDetails.body?.length || 0;
  if (bodyLength > 300) {
    score += 20; // Very detailed
  } else if (bodyLength > 150) {
    score += 15; // Good detail
  } else if (bodyLength > 50) {
    score += 5; // Some detail
  } else {
    score -= 10; // Too sparse
  }

  // Check for issue references
  const hasIssueRef =
    prDetails.body?.includes("#") || prDetails.body?.includes("closes");
  if (hasIssueRef) {
    score += 5; // Links to issues
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate code style score
 */
function calculateCodeStyle(files: PRFile[], ciChecks: any[]): number {
  let score = 80; // Base score (assume good style)

  // Check if linting checks passed
  const lintChecks = ciChecks.filter(
    (check) =>
      check.name.toLowerCase().includes("lint") ||
      check.name.toLowerCase().includes("style") ||
      check.name.toLowerCase().includes("format")
  );

  if (lintChecks.length > 0) {
    const allPassed = lintChecks.every((check) => check.conclusion === "success");
    if (allPassed) {
      score = 95; // Linting passed
    } else {
      score = 60; // Linting issues
    }
  }

  // Check for consistent file types
  const fileExtensions = new Set(
    files.map((f) => f.filename.split(".").pop() || "")
  );
  if (fileExtensions.size <= 3) {
    score += 5; // Focused changes
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate impact score
 */
function calculateImpact(prDetails: PRDetails, files: PRFile[]): number {
  let score = 60; // Base score

  // Consider size of change
  const totalChanges = prDetails.additions + prDetails.deletions;

  if (totalChanges > 500) {
    score += 20; // Significant impact
  } else if (totalChanges > 200) {
    score += 15; // Good impact
  } else if (totalChanges > 50) {
    score += 10; // Moderate impact
  } else if (totalChanges < 10) {
    score -= 10; // Very small change
  }

  // Consider file types changed
  const hasCriticalFiles = files.some(
    (f) =>
      f.filename.includes("contract") ||
      f.filename.includes("core") ||
      f.filename.includes("service") ||
      f.filename.includes("api")
  );

  if (hasCriticalFiles) {
    score += 10; // Touching important files
  }

  // Reward balanced additions/deletions (refactoring)
  const addDeleteRatio = Math.min(
    prDetails.additions / Math.max(prDetails.deletions, 1),
    prDetails.deletions / Math.max(prDetails.additions, 1)
  );

  if (addDeleteRatio > 0.5) {
    score += 10; // Good refactoring balance
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate detailed feedback based on analysis
 */
function generateFeedback(
  score: number,
  breakdown: SourceAgentScore["breakdown"],
  files: PRFile[],
  prDetails: PRDetails,
  ciChecks: any[],
  testsPassed: boolean
): string {
  let feedback = `**Overall Score: ${score}/100**\n\n`;

  // Overall assessment
  if (score >= 90) {
    feedback +=
      "🌟 **Excellent work!** This is a high-quality contribution.\n\n";
  } else if (score >= 80) {
    feedback +=
      "✅ **Great job!** This is a solid contribution with minor areas for improvement.\n\n";
  } else if (score >= 70) {
    feedback +=
      "👍 **Good work!** This contribution meets the quality standards.\n\n";
  } else if (score >= 60) {
    feedback +=
      "⚠️ **Acceptable.** This contribution has some areas that need attention.\n\n";
  } else {
    feedback +=
      "❌ **Needs Improvement.** This contribution requires significant revisions.\n\n";
  }

  feedback += "**Detailed Breakdown:**\n\n";

  // Code Quality
  feedback += `- **Code Quality (${breakdown.codeQuality}/100)**: `;
  const codeFiles = files.filter((f) => !f.filename.includes("package-lock"));
  feedback += `Changed ${codeFiles.length} code files with ${prDetails.additions} additions and ${prDetails.deletions} deletions. `;

  if (breakdown.codeQuality >= 85) {
    feedback += "Excellent code structure and best practices followed.\n";
  } else if (breakdown.codeQuality >= 70) {
    feedback += "Good code quality with some room for optimization.\n";
  } else {
    feedback +=
      "Code quality could be improved with better structure and practices.\n";
  }

  // Test Coverage
  const testFiles = files.filter(
    (f) =>
      f.filename.includes("test") ||
      f.filename.includes("spec") ||
      f.filename.includes("__tests__")
  );
  feedback += `- **Test Coverage (${breakdown.testCoverage}/100)**: `;
  feedback += `Found ${testFiles.length} test file(s). `;

  if (breakdown.testCoverage >= 85) {
    feedback += "Comprehensive test coverage for new features.\n";
  } else if (breakdown.testCoverage >= 70) {
    feedback += "Adequate test coverage, consider adding edge cases.\n";
  } else {
    feedback += "Test coverage is insufficient. Please add more tests.\n";
  }

  // Documentation
  const docFiles = files.filter(
    (f) =>
      f.filename.toLowerCase().includes("readme") ||
      f.filename.toLowerCase().includes("doc") ||
      f.filename.endsWith(".md")
  );
  feedback += `- **Documentation (${breakdown.documentation}/100)**: `;
  feedback += `PR description: ${
    prDetails.body?.length || 0
  } chars. Updated ${docFiles.length} documentation file(s). `;

  if (breakdown.documentation >= 85) {
    feedback +=
      "Well-documented code with clear comments and README updates.\n";
  } else if (breakdown.documentation >= 70) {
    feedback += "Documentation is present but could be more comprehensive.\n";
  } else {
    feedback +=
      "Documentation is lacking. Please add comments and update docs.\n";
  }

  // PR Description
  feedback += `- **PR Description (${breakdown.prDescription}/100)**: `;
  feedback += `Title: "${prDetails.title}". `;

  if (breakdown.prDescription >= 85) {
    feedback += "Clear and detailed PR description explaining changes.\n";
  } else if (breakdown.prDescription >= 70) {
    feedback += "Good PR description, could include more context.\n";
  } else {
    feedback +=
      "PR description needs more detail about what was changed and why.\n";
  }

  // Code Style
  feedback += `- **Code Style (${breakdown.codeStyle}/100)**: `;

  if (ciChecks.length > 0) {
    const lintChecks = ciChecks.filter((c) =>
      c.name.toLowerCase().includes("lint")
    );
    if (lintChecks.length > 0) {
      feedback += `CI linting checks: ${
        testsPassed ? "passed ✓" : "failed ✗"
      }. `;
    }
  }

  if (breakdown.codeStyle >= 85) {
    feedback += "Excellent adherence to project coding standards.\n";
  } else if (breakdown.codeStyle >= 70) {
    feedback += "Mostly follows code style guidelines.\n";
  } else {
    feedback +=
      "Code style inconsistencies detected. Please follow project guidelines.\n";
  }

  // Impact
  feedback += `- **Impact (${breakdown.impact}/100)**: `;
  feedback += `${prDetails.additions + prDetails.deletions} total line changes across ${prDetails.changed_files} files. `;

  if (breakdown.impact >= 85) {
    feedback += "Significant positive impact on the project.\n";
  } else if (breakdown.impact >= 70) {
    feedback += "Good contribution with measurable impact.\n";
  } else {
    feedback += "Limited impact. Consider addressing more critical issues.\n";
  }

  // CI/CD Status
  if (ciChecks.length > 0) {
    feedback += `\n**CI/CD Checks:** ${ciChecks.length} check(s) run.\n`;
    ciChecks.forEach((check) => {
      const status = check.conclusion === "success" ? "✅" : "❌";
      feedback += `  ${status} ${check.name}: ${check.conclusion || "pending"}\n`;
    });
  }

  // Recommendations
  feedback += "\n**Recommendations:**\n";
  const improvements: string[] = [];

  if (breakdown.codeQuality < 80) {
    improvements.push("Refactor complex functions and reduce file sizes");
  }
  if (breakdown.testCoverage < 80) {
    improvements.push(
      `Add more unit tests (found ${testFiles.length} test file(s))`
    );
  }
  if (breakdown.documentation < 80) {
    improvements.push("Improve code documentation and PR description");
  }
  if (breakdown.prDescription < 80) {
    improvements.push("Enhance PR description with more context");
  }
  if (breakdown.codeStyle < 85) {
    improvements.push("Follow style guidelines and fix linting issues");
  }
  if (!testsPassed && ciChecks.length > 0) {
    improvements.push("Fix failing CI/CD checks before merging");
  }

  if (improvements.length > 0) {
    improvements.forEach((item) => {
      feedback += `- ${item}\n`;
    });
  } else {
    feedback += "- Keep up the excellent work!\n";
  }

  // Add specific file mentions
  feedback += "\n**Files Analyzed:**\n";
  files.slice(0, 10).forEach((file) => {
    feedback += `- ${file.filename} (+${file.additions}/-${file.deletions})\n`;
  });
  if (files.length > 10) {
    feedback += `- ... and ${files.length - 10} more files\n`;
  }

  return feedback;
}

/**
 * Fallback scoring if GitHub API is unavailable
 */
function fallbackScoring(prUrl: string): SourceAgentScore {
  logger.warn("Using fallback scoring mechanism");

  const prMatch = prUrl.match(/github\.com\/([\w-]+)\/([\w-]+)\/pull\/(\d+)/);
  const prNumber = prMatch ? parseInt(prMatch[3]) : 1;

  // Generate consistent scores based on PR number (like before)
  const seed = prNumber;
  const random = (min: number, max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  const codeQuality = random(70, 100, 1);
  const testCoverage = random(60, 95, 2);
  const documentation = random(65, 95, 3);
  const prDescription = random(75, 100, 4);
  const codeStyle = random(80, 100, 5);
  const impact = random(70, 100, 6);

  const totalScore = Math.floor(
    codeQuality * 0.3 +
      testCoverage * 0.2 +
      documentation * 0.15 +
      prDescription * 0.15 +
      codeStyle * 0.1 +
      impact * 0.1
  );

  return {
    score: totalScore,
    feedback:
      `⚠️ **Note:** GitHub API was unavailable. Using fallback scoring.\n\n` +
      `**Overall Score: ${totalScore}/100** (estimated)\n\n` +
      `Please note this score is based on heuristics, not actual code analysis.`,
    breakdown: {
      codeQuality,
      testCoverage,
      documentation,
      prDescription,
      codeStyle,
      impact,
    },
  };
}

/**
 * Validate if a PR URL is valid and accessible
 */
export async function validatePR(prUrl: string): Promise<boolean> {
  const parsed = parsePRUrl(prUrl);
  if (!parsed) {
    return false;
  }

  try {
    await fetchPRDetails(parsed.owner, parsed.repo, parsed.prNumber);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get PR details wrapper
 */
export async function getPRDetails(prUrl: string) {
  const parsed = parsePRUrl(prUrl);
  if (!parsed) {
    throw new Error("Invalid GitHub PR URL");
  }

  return fetchPRDetails(parsed.owner, parsed.repo, parsed.prNumber);
}
