import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import "dotenv/config";
import authRoutes from "./modules/auth/auth.routes";
import { adminRouter } from "./admin/admin.router";
import morgan from "morgan";
import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware";
import { globalLimiter } from "./middlewares/rateLimiters/globalLimiter";
import rentalItemRoutes from "./modules/rental/rentalItem/rentalItem.routes";
import paymentRoutes from "./modules/rental/payment/payment.routes";
import pickupRoutes from "./modules/rental/pickup/pickup.routes";
import returnRoutes from "./modules/rental/return/return.routes";
import securityDepositRoutes from "./modules/rental/securityDeposit/securityDeposit.routes";
import damageReportRoutes from "./modules/rental/damageReport/damageReportt.routes";
import invoiceRoutes from "./modules/rental/invoice/invoice.routes";

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

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timeStamp: new Date().toISOString(),
  });
});
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use("/api/v1/auth", globalLimiter, authRoutes);
app.use("/api/v1/admin", globalLimiter, adminRouter);

app.use("/{*any}", (_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(
  "/api/v1/rental-items",
  globalLimiter,
  rentalItemRoutes,
);

app.use(
  "/api/v1/payments",
  globalLimiter,
  paymentRoutes,
);

app.use(
  "/api/v1/pickups",
  globalLimiter,
  pickupRoutes,
);

app.use(
  "/api/v1/returns",
  globalLimiter,
  returnRoutes,
);

app.use(
  "/api/v1/security-deposits",
  globalLimiter,
  securityDepositRoutes,
);

app.use(
  "/api/v1/damage-reports",
  globalLimiter,
  damageReportRoutes,
);

app.use(
  "/api/v1/rentals",
  globalLimiter,
  invoiceRoutes,
);

app.use(errorMiddleware);

export default app;
