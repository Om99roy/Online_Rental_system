import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../utils/error.ts";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    if (!user || user.role !== "ADMIN") {
        return next(new AppError("Admin access required", 403));
    }
    next();
}