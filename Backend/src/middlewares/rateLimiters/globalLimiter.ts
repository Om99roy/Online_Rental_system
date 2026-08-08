import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },

    handler: (_, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests. Please try again in 15 minutes.",
        });
    },
});
