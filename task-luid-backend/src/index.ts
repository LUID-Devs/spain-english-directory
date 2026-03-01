import dotenv from "dotenv";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import advancedFilterRoutes from "./routes/advancedFilterRoutes";
import aiFilterRoutes from "./routes/aiFilterRoutes";
import gitReviewRoutes from "./routes/gitReviewRoutes";
import semanticSearchRoutes from "./routes/semanticSearchRoutes";

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(",") || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api", advancedFilterRoutes);
app.use("/api", aiFilterRoutes);
app.use("/api", gitReviewRoutes);
app.use("/api", semanticSearchRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

app.listen(PORT, () => {
  console.log(`TaskLuid Advanced Filter API Server running on port ${PORT}`);
});

export default app;