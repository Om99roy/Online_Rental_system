import rateLimit from "express-rate-limit";
import { emailAndIpKeyGenerator } from "../../../utils/rateLimitKeyGenerator";
export const sendOtpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,

    message: {
        success: false,
        message: "Too many otp requests. Please try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: emailAndIpKeyGenerator,
});
