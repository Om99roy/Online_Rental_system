import rateLimit from "express-rate-limit";
import { emailAndIpKeyGenerator } from "../../../utils/rateLimitKeyGenerator";
export const verifyEmailLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,

    message: {
        success: false,
        message: "Too many email sending attempts. Please try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: emailAndIpKeyGenerator,
});
