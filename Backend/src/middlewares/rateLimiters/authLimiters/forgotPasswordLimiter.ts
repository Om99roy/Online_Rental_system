import rateLimit from "express-rate-limit";
import { emailAndIpKeyGenerator } from "../../../utils/rateLimitKeyGenerator";
export const forgotPasswordLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 3,

    message: {
        success: false,
        message: "Too many email request attempts. Please try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: emailAndIpKeyGenerator,
});

