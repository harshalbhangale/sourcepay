import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { scoreContribution } from "../services/sourceAgent";

const router = Router();

// GET /api/tasks - Get all tasks with optional filters
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, projectId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            owner: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            reputation: true,
          },
        },
        contributions: {
          select: {
            id: true,
            status: true,
            score: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - Get task by ID with full details
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
                reputation: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            reputation: true,
          },
        },
        contributions: {
          include: {
            contributor: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
              },
            },
            payouts: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create new task (project owner only)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      bountyAmount,
      difficulty,
      githubIssueUrl,
      projectId,
      ownerWallet, // Add this to verify ownership
    } = req.body;

    // Validate required fields
    if (!title || !description || !bountyAmount || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Title, description, bountyAmount, and projectId are required",
      });
    }

    // Verify project exists and user is the owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if the wallet address matches the project owner
    if (
      ownerWallet &&
      project.owner.walletAddress.toLowerCase() !== ownerWallet.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can create tasks",
      });
    }

    // Validate bounty amount doesn't exceed project total
    const existingTasks = await prisma.task.findMany({
      where: { projectId },
    });

    const totalAllocated = existingTasks.reduce(
      (sum, task) => sum + parseFloat(task.bountyAmount.toString()),
      0
    );

    const newTotal = totalAllocated + parseFloat(bountyAmount);

    if (newTotal > parseFloat(project.totalBounty.toString())) {
      return res.status(400).json({
        success: false,
        message: `Bounty amount exceeds project budget. Available: ${
          parseFloat(project.totalBounty.toString()) - totalAllocated
        } MUSD`,
      });
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        bountyAmount: parseFloat(bountyAmount),
        difficulty: difficulty || null,
        githubIssueUrl: githubIssueUrl || null,
        projectId,
        status: "OPEN",
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully",
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - Update task (project owner only)
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      bountyAmount,
      difficulty,
      githubIssueUrl,
      status,
      ownerWallet,
    } = req.body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if the wallet address matches the project owner
    if (
      ownerWallet &&
      existingTask.project.owner.walletAddress.toLowerCase() !==
        ownerWallet.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can update tasks",
      });
    }

    // Update the task
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(bountyAmount && { bountyAmount: parseFloat(bountyAmount) }),
        ...(difficulty !== undefined && { difficulty }),
        ...(githubIssueUrl !== undefined && { githubIssueUrl }),
        ...(status && { status }),
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: task,
      message: "Task updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks/:id/claim - Claim a task (any authenticated user)
router.post(
  "/:id/claim",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: "Wallet address is required",
        });
      }

      // Get task with project details
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          project: {
            include: {
              owner: true,
            },
          },
          assignee: true,
        },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Check if task is open
      if (task.status !== "OPEN") {
        return res.status(400).json({
          success: false,
          message: `Task is not available. Current status: ${task.status}`,
        });
      }

      // Check if user is not the project owner
      if (
        task.project.owner.walletAddress.toLowerCase() ===
        walletAddress.toLowerCase()
      ) {
        return res.status(400).json({
          success: false,
          message: "Project owner cannot claim their own tasks",
        });
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            walletAddress: walletAddress.toLowerCase(),
          },
        });
      }

      // Claim the task
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          status: "ASSIGNED",
          assigneeId: user.id,
        },
        include: {
          project: {
            include: {
              owner: {
                select: {
                  id: true,
                  walletAddress: true,
                  username: true,
                },
              },
            },
          },
          assignee: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              reputation: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: updatedTask,
        message: "Task claimed successfully! You can now start working on it.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/tasks/:id/submit - Submit work for a task (assignee only)
router.post(
  "/:id/submit",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { prUrl, walletAddress } = req.body;

      if (!prUrl || !walletAddress) {
        return res.status(400).json({
          success: false,
          message: "PR URL and wallet address are required",
        });
      }

      // Validate PR URL format (allow dots and other chars in repo names)
      const githubPrRegex =
        /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/;
      if (!githubPrRegex.test(prUrl)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123",
        });
      }

      // Get task with assignee
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          assignee: true,
          project: true,
        },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      // Check if task is assigned
      if (task.status !== "ASSIGNED" && task.status !== "IN_PROGRESS") {
        return res.status(400).json({
          success: false,
          message: `Cannot submit work for task with status: ${task.status}`,
        });
      }

      // Check if user is the assignee
      if (
        !task.assignee ||
        task.assignee.walletAddress.toLowerCase() !==
          walletAddress.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "Only the assigned user can submit work for this task",
        });
      }

      // Check if PR URL already exists for this task
      const existingContribution = await prisma.contribution.findFirst({
        where: {
          taskId: id,
          prUrl: prUrl,
        },
      });

      if (existingContribution) {
        return res.status(400).json({
          success: false,
          message: "This PR has already been submitted for this task",
        });
      }

      // Update task status to SUBMITTED
      await prisma.task.update({
        where: { id },
        data: {
          status: "SUBMITTED",
        },
      });

      // Create contribution record
      const contribution = await prisma.contribution.create({
        data: {
          prUrl,
          taskId: id,
          contributorId: task.assignee.id,
          status: "PENDING",
          score: 0,
        },
        include: {
          task: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          contributor: {
            select: {
              id: true,
              walletAddress: true,
              username: true,
              reputation: true,
            },
          },
        },
      });

      // Auto-trigger Source Agent analysis
      try {
        const vincentResult = await scoreContribution(prUrl);
        const bountyAmount = parseFloat(task.bountyAmount.toString());
        const payoutAmount = (bountyAmount * vincentResult.score) / 100;

        const contributionStatus: "APPROVED" | "REJECTED" =
          vincentResult.score >= 60 ? "APPROVED" : "REJECTED";
        const taskStatus: "COMPLETED" | "DISPUTED" =
          vincentResult.score >= 60 ? "COMPLETED" : "DISPUTED";

        // Update contribution with score
        const scoredContribution = await prisma.contribution.update({
          where: { id: contribution.id },
          data: {
            score: vincentResult.score,
            feedback: vincentResult.feedback,
            status: contributionStatus,
          },
          include: {
            task: {
              include: {
                project: true,
              },
            },
            contributor: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
                reputation: true,
              },
            },
          },
        });

        // Update task status
        await prisma.task.update({
          where: { id },
          data: { status: taskStatus },
        });

        // Create payout if approved
        let payout = null;
        if (contributionStatus === "APPROVED" && payoutAmount > 0) {
          payout = await prisma.payout.create({
            data: {
              amount: payoutAmount,
              contributionId: contribution.id,
              txHash: `pending_${Date.now()}`,
              status: "PENDING",
            },
          });

          // Update reputation
          await prisma.user.update({
            where: { id: task.assignee.id },
            data: {
              reputation: {
                increment: Math.floor(vincentResult.score / 10),
              },
            },
          });
        }

        res.status(201).json({
          success: true,
          data: {
            contribution: scoredContribution,
            payout,
            analysis: {
              score: vincentResult.score,
              breakdown: vincentResult.breakdown,
              metadata: vincentResult.metadata,
            },
          },
          message:
            contributionStatus === "APPROVED"
              ? `🎉 Work submitted and approved! Score: ${
                  vincentResult.score
                }/100. Payout of ${payoutAmount.toFixed(2)} MUSD is pending.`
              : `⚠️ Work submitted but needs improvement. Score: ${vincentResult.score}/100 (minimum 60 required). Check feedback for details.`,
        });
      } catch (analysisError) {
        // If Source Agent fails, still return success for submission
        console.error("Source Agent analysis failed:", analysisError);
        res.status(201).json({
          success: true,
          data: {
            contribution,
          },
          message: "Work submitted successfully! Analysis is pending.",
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
