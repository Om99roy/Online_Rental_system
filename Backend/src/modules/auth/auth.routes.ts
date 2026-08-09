import { Router } from "express";
import * as authController from "./auth.controller.ts";
import { authenticate } from "../../middlewares/authenticate.middleware.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { loginSchema, registerSchema } from "./auth.validation.ts";
import { loginLimiter } from "../../middlewares/rateLimiters/authLimiters/loginLimiter.ts";
import { registerLimiter } from "../../middlewares/rateLimiters/authLimiters/registerLimiter.ts";
import { passwordResetLimiter } from "../../middlewares/rateLimiters/authLimiters/passwordResetLimiter.ts";
import { forgotPasswordLimiter } from "../../middlewares/rateLimiters/authLimiters/forgotPasswordLimiter.ts";
import { verifyEmailLimiter } from "../../middlewares/rateLimiters/authLimiters/verifyEmailLimiter.ts";

const authRouter = Router();

authRouter.post("/register", registerLimiter, validate(registerSchema), authController.register);
authRouter.post("/login", loginLimiter, validate(loginSchema), authController.login);
authRouter.post(
  "/verify-email",
  verifyEmailLimiter,
  authController.verifyEmailHandler,
);
authRouter.post("/resend-verification", authController.resendVerification);
authRouter.post("/refresh", authController.refresh);
authRouter.post(
  "/forgot-password",
  forgotPasswordLimiter,
  authController.forgotPasswordHandler,
);
authRouter.post(
  "/reset-password",
  passwordResetLimiter,
  authController.resetPasswordHandler,
);
authRouter.get("/profile", authenticate, authController.profile);
authRouter.post("/logout", authController.logout);

export default authRouter;

