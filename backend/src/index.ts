import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

// Import routes (will create these next)
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import contributionRoutes from "./routes/contributionRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "SourcePay API is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/users", userRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
