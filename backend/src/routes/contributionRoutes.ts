import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../config/database";
import { scoreContribution } from "../services/sourceAgent";

const router = Router();

// GET /api/contributions - Get all contributions with optional filters
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, taskId, contributorId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (taskId) {
      where.taskId = taskId;
    }

    if (contributorId) {
      where.contributorId = contributorId;
    }

    const contributions = await prisma.contribution.findMany({
      where,
      include: {
        task: {
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
        payouts: {
          select: {
            id: true,
            amount: true,
            txHash: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/contributions/:id - Get contribution by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        task: {
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
          },
        },
        contributor: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            reputation: true,
            createdAt: true,
          },
        },
        payouts: {
          select: {
            id: true,
            amount: true,
            txHash: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!contribution) {
      return res.status(404).json({
        success: false,
        message: "Contribution not found",
      });
    }

    res.json({
      success: true,
      data: contribution,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/contributions - Submit contribution (protected)
router.post("/", authenticate, (_req, res) => {
  res.json({
    success: true,
    message: "Submit contribution - to be implemented",
  });
});

// PUT /api/contributions/:id/score - Score contribution (protected)
router.put(
  "/:id/score",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { score, feedback } = req.body;

      if (score === undefined || score === null) {
        return res.status(400).json({
          success: false,
          message: "Score is required",
        });
      }

      // Validate score range
      if (score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          message: "Score must be between 0 and 100",
        });
      }

      // Get contribution with task details
      const contribution = await prisma.contribution.findUnique({
        where: { id },
        include: {
          task: {
            include: {
              project: true,
            },
          },
          contributor: true,
          payouts: true,
        },
      });

      if (!contribution) {
        return res.status(404).json({
          success: false,
          message: "Contribution not found",
        });
      }

      // Check if already scored
      if (contribution.score > 0) {
        return res.status(400).json({
          success: false,
          message: "Contribution has already been scored",
        });
      }

      // Calculate payout amount based on score
      const bountyAmount = parseFloat(
        contribution.task.bountyAmount.toString()
      );
      const payoutAmount = (bountyAmount * score) / 100;

      // Determine status based on score
      let contributionStatus: "APPROVED" | "REJECTED";
      let taskStatus: "COMPLETED" | "DISPUTED";

      if (score >= 60) {
        contributionStatus = "APPROVED";
        taskStatus = "COMPLETED";
      } else {
        contributionStatus = "REJECTED";
        taskStatus = "DISPUTED";
      }

      // Update contribution with score and feedback
      const updatedContribution = await prisma.contribution.update({
        where: { id },
        data: {
          score,
          feedback: feedback || null,
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
        where: { id: contribution.taskId },
        data: {
          status: taskStatus,
        },
      });

      // Create payout record if approved
      let payout = null;
      if (contributionStatus === "APPROVED" && payoutAmount > 0) {
        payout = await prisma.payout.create({
          data: {
            amount: payoutAmount,
            contributionId: id,
            txHash: `pending_${Date.now()}`, // Will be updated when actual blockchain tx is made
            status: "PENDING",
          },
        });

        // Update contributor reputation
        const reputationGain = Math.floor(score / 10); // 1-10 points based on score
        await prisma.user.update({
          where: { id: contribution.contributorId },
          data: {
            reputation: {
              increment: reputationGain,
            },
          },
        });
      }

      res.json({
        success: true,
        data: {
          contribution: updatedContribution,
          payout,
          message:
            contributionStatus === "APPROVED"
              ? `Contribution approved with score ${score}! Payout of ${payoutAmount} MUSD is being processed.`
              : `Contribution scored ${score}. Score must be 60+ for approval.`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/contributions/:id/analyze - Trigger Source Agent analysis
router.post(
  "/:id/analyze",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Get contribution with task details
      const contribution = await prisma.contribution.findUnique({
        where: { id },
        include: {
          task: {
            include: {
              project: true,
            },
          },
          contributor: true,
        },
      });

      if (!contribution) {
        return res.status(404).json({
          success: false,
          message: "Contribution not found",
        });
      }

      // Check if already scored
      if (contribution.score > 0) {
        return res.status(400).json({
          success: false,
          message: "Contribution has already been scored",
          data: {
            score: contribution.score,
            feedback: contribution.feedback,
          },
        });
      }

      // Analyze contribution using Source Agent
      const vincentResult = await scoreContribution(contribution.prUrl);

      // Calculate payout amount based on score
      const bountyAmount = parseFloat(
        contribution.task.bountyAmount.toString()
      );
      const payoutAmount = (bountyAmount * vincentResult.score) / 100;

      // Determine status based on score
      let contributionStatus: "APPROVED" | "REJECTED";
      let taskStatus: "COMPLETED" | "DISPUTED";

      if (vincentResult.score >= 60) {
        contributionStatus = "APPROVED";
        taskStatus = "COMPLETED";
      } else {
        contributionStatus = "REJECTED";
        taskStatus = "DISPUTED";
      }

      // Update contribution with score and feedback
      const updatedContribution = await prisma.contribution.update({
        where: { id },
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
        where: { id: contribution.taskId },
        data: {
          status: taskStatus,
        },
      });

      // Create payout record if approved
      let payout = null;
      if (contributionStatus === "APPROVED" && payoutAmount > 0) {
        payout = await prisma.payout.create({
          data: {
            amount: payoutAmount,
            contributionId: id,
            txHash: `pending_${Date.now()}`,
            status: "PENDING",
          },
        });

        // Update contributor reputation
        const reputationGain = Math.floor(vincentResult.score / 10);
        await prisma.user.update({
          where: { id: contribution.contributorId },
          data: {
            reputation: {
              increment: reputationGain,
            },
          },
        });
      }

      res.json({
        success: true,
        data: {
          contribution: updatedContribution,
          payout,
          analysis: vincentResult.breakdown,
          message:
            contributionStatus === "APPROVED"
              ? `🎉 Contribution approved with score ${
                  vincentResult.score
                }/100! Payout of ${payoutAmount.toFixed(
                  2
                )} MUSD is being processed.`
              : `❌ Contribution scored ${vincentResult.score}/100. Score must be 60+ for approval. Please improve and resubmit.`,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
