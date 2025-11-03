import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import { verifyMessage } from "ethers";

const router = Router();

// POST /api/auth/nonce - Get nonce for wallet
router.post(
  "/nonce",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: "Wallet address is required",
        });
      }

      // Generate a simple nonce (in production, store this temporarily)
      const nonce = `Sign this message to authenticate with SourcePay: ${Date.now()}`;

      res.json({
        success: true,
        data: { nonce, walletAddress },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login - Authenticate with wallet signature
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { walletAddress, signature, message } = req.body;

      if (!walletAddress || !signature || !message) {
        return res.status(400).json({
          success: false,
          message: "Wallet address, signature, and message are required",
        });
      }

      // Verify the signature
      try {
        const recoveredAddress = verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(401).json({
            success: false,
            message: "Invalid signature",
          });
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Invalid signature",
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

      // Generate JWT token
      const secret = process.env.JWT_SECRET || "default-secret";
      const token = jwt.sign(
        {
          userId: user.id,
          walletAddress: user.walletAddress,
        },
        secret,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            username: user.username,
            reputation: user.reputation,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/verify - Verify JWT token
router.post("/verify", (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const secret = process.env.JWT_SECRET || "default-secret";
    const decoded = jwt.verify(token, secret);

    res.json({
      success: true,
      data: { valid: true, payload: decoded },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

export default router;
