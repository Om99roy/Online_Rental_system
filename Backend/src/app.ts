import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import "dotenv/config";
import authRoutes from "./modules/auth/auth.routes.ts";
import { adminRouter } from "./modules/admin/admin.router.ts";
import morgan from "morgan";
import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.ts";
import { globalLimiter } from "./middlewares/rateLimiters/globalLimiter.ts";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ??
      "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(compression());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timeStamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Authentication
app.use(
  "/api/v1/auth",
  globalLimiter,
  authRoutes,
);

// Admin
app.use(
  "/api/v1/admin",
  globalLimiter,
  adminRouter,
);

app.use((_, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use(errorMiddleware);

export default app;