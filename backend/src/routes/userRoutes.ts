import { Router, Request, Response, NextFunction } from "express";
import prisma from "../config/database";

const router = Router();

// GET /api/users/:walletAddress/stats - Get user statistics
router.get(
  "/:walletAddress/stats",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletAddress } = req.params;

      // Find user
      const user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      });

      if (!user) {
        return res.json({
          success: true,
          data: {
            projectsOwned: 0,
            tasksClaimed: 0,
            tasksCompleted: 0,
            totalEarned: "0",
          },
        });
      }

      // Count projects owned
      const projectsOwned = await prisma.project.count({
        where: { ownerId: user.id },
      });

      // Count tasks claimed (ASSIGNED, IN_PROGRESS, SUBMITTED, COMPLETED)
      const tasksClaimed = await prisma.task.count({
        where: {
          assigneeId: user.id,
          status: {
            in: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "COMPLETED"],
          },
        },
      });

      // Count tasks completed
      const tasksCompleted = await prisma.task.count({
        where: {
          assigneeId: user.id,
          status: "COMPLETED",
        },
      });

      // Calculate total earned from approved payouts
      const payouts = await prisma.payout.findMany({
        where: {
          contribution: {
            contributorId: user.id,
          },
          status: {
            in: ["PENDING", "COMPLETED"],
          },
        },
      });

      const totalEarned = payouts
        .reduce(
          (sum: number, payout: any) =>
            sum + parseFloat(payout.amount.toString()),
          0
        )
        .toFixed(2);

      res.json({
        success: true,
        data: {
          projectsOwned,
          tasksClaimed,
          tasksCompleted,
          totalEarned,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:walletAddress/activity - Get user recent activity
router.get(
  "/:walletAddress/activity",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletAddress } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      // Find user
      const user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      });

      if (!user) {
        return res.json({
          success: true,
          data: [],
        });
      }

      // Get recent projects created
      const projects = await prisma.project.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });

      // Get recent tasks claimed
      const tasksClaimed = await prisma.task.findMany({
        where: {
          assigneeId: user.id,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      // Get recent payouts
      const payouts = await prisma.payout.findMany({
        where: {
          contribution: {
            contributorId: user.id,
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          contribution: {
            include: {
              task: {
                select: {
                  title: true,
                  project: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Format activities
      const activities: any[] = [];

      projects.forEach((project: any) => {
        activities.push({
          id: `project_${project.id}`,
          type: "project_created",
          title: `Created project: ${project.name}`,
          timestamp: project.createdAt.toISOString(),
        });
      });

      tasksClaimed.forEach((task: any) => {
        const activityType =
          task.status === "COMPLETED" ? "task_completed" : "task_claimed";
        activities.push({
          id: `task_${task.id}`,
          type: activityType,
          title:
            task.status === "COMPLETED"
              ? `Completed task: ${task.title}`
              : `Claimed task: ${task.title}`,
          timestamp: task.updatedAt.toISOString(),
        });
      });

      payouts.forEach((payout: any) => {
        activities.push({
          id: `payout_${payout.id}`,
          type: "payout_received",
          title: `Received payout for: ${payout.contribution.task.title}`,
          amount: parseFloat(payout.amount.toString()).toFixed(2),
          timestamp: payout.createdAt.toISOString(),
        });
      });

      // Sort by timestamp
      activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      res.json({
        success: true,
        data: activities.slice(0, limit),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
