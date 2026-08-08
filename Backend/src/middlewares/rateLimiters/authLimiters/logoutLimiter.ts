import rateLimit from "express-rate-limit";
import { emailAndIpKeyGenerator } from "../../../utils/rateLimitKeyGenerator";
export const logoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,

    message: {
        success: false,
        message: "Too many logout attempts Please try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: emailAndIpKeyGenerator,
});
