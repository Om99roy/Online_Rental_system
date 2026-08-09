import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import "dotenv/config";
import authRoutes from "./modules/auth/auth.routes";
import { adminRouter } from "./admin/admin.router";
import productsRouter from "./modules/products/products.routes";
import addressRouter from "./modules/addresses/address.routes";
import morgan from "morgan";
import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import { globalLimiter } from "./middlewares/rateLimiters/globalLimiter";
import path from "path";
import paymentRouter from "./modules/payments/payment.routes";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(compression());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timeStamp: new Date().toISOString(),
  });
});
app.get("/api/health", (_, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use("/api/v1/auth", globalLimiter, authRoutes);
app.use("/api/v1/admin", globalLimiter, adminRouter);
app.use("/api/v1/products", globalLimiter, productsRouter);
app.use("/api/v1/addresses", globalLimiter, addressRouter);
app.use("/api/v1/payments", globalLimiter, paymentRouter);
app.use("/{*any}", (_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorMiddleware);

export default app;
