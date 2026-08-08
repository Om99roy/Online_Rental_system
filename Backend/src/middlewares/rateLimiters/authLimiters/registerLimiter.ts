import rateLimit from "express-rate-limit";

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,

    message: {
        success: false,
        message: "Too many registration attempts. Please try again later.",
    },

    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});
