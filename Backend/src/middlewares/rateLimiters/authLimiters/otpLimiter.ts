import rateLimit from "express-rate-limit";
import { emailAndIpKeyGenerator } from "../../../utils/rateLimitKeyGenerator";
export const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,

    message: {
        success: false,
        message: "Too many otp attempts. Please try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: emailAndIpKeyGenerator,
});
