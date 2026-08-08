import rateLimit from "express-rate-limit";
import { emailAndIpKeyGenerator } from "../../../utils/rateLimitKeyGenerator";
export const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,

    message: {
        success: false,
        message: "Too many password reset attempts. Please try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: emailAndIpKeyGenerator,
});
