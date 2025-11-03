import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../config/database";

const router = Router();

// GET /api/projects - Get all projects
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            reputation: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id - Get project by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            walletAddress: true,
            username: true,
            reputation: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                walletAddress: true,
                username: true,
              },
            },
            contributions: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects - Create new project (no auth required for now)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, repositoryUrl, totalBounty, ownerWallet } =
      req.body;

    // Validate required fields
    if (!name || !description || !totalBounty || !ownerWallet) {
      return res.status(400).json({
        success: false,
        message: "Name, description, totalBounty, and ownerWallet are required",
      });
    }

    // Find or create the user by wallet address
    let user = await prisma.user.findUnique({
      where: { walletAddress: ownerWallet.toLowerCase() },
    });

    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          walletAddress: ownerWallet.toLowerCase(),
        },
      });
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        repoUrl: repositoryUrl || null,
        totalBounty: parseFloat(totalBounty),
        ownerId: user.id,
        status: "ACTIVE",
      },
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
    });

    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully",
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/projects/:id - Update project (protected)
router.put(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, description, repositoryUrl, totalBounty, status } =
        req.body;

      // Check if project exists
      const existingProject = await prisma.project.findUnique({
        where: { id },
      });

      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      // Update the project
      const project = await prisma.project.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(repositoryUrl !== undefined && { repoUrl: repositoryUrl }),
          ...(totalBounty && { totalBounty: parseFloat(totalBounty) }),
          ...(status && { status }),
        },
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
      });

      res.json({
        success: true,
        data: project,
        message: "Project updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
