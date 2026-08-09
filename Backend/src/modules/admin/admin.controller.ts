import { type Request, type Response, type NextFunction } from "express";
import { AdminService } from "./admin.service.ts";
import type { Role, AccountStatus } from "@prisma/client";
import * as authService from "../auth/auth.service.ts";
import { AppError } from "../../utils/error.ts";


const adminService = new AdminService();

export const adminRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({
            success: true,
            message: user.emailVerified
                ? "Admin account created successfully"
                : "Registration successful. Please check your email for the OTP.",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// Setup admin login Logic
export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(200).json({ success: true, message: "Login successful", data: result });
    } catch (error) {
        next(error);
    }
};

// Refresh Tokens
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;
        const accessToken = await authService.refreshAccessToken(token);
        res.status(200).json({ success: true, data: { accessToken } });
    } catch (error) {
        next(error);
    }
};

// forgot-password handler 
export const forgotPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await authService.forgotPassword(email);
        res.status(200).json({ success: true, message: "If an account exists, a reset email has been sent" });
    } catch (error) {
        next(error);
    }
};

// Profile section
export const adminProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) throw new AppError("Unauthorized", 401);
        const user = await authService.getProfile(userId);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};


// Profile-logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        await authService.logoutUser(refreshToken);
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/admin/dashboard
 */
export const getDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await adminService.getDashboard();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/admin/users
 */
export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { page, limit, search, role, status } = req.query;

        const data = await adminService.getUsers({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            search: search as string | undefined,
            role: role as Role | undefined,
            status: status as AccountStatus | undefined,
        });

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/v1/admin/users/:id
 */
export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = await adminService.getUserById(req.params.id as string);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/admin/users/:id/status
 */
export const updateUserStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = await adminService.updateUserStatus(
            req.params.id as string,
            req.body.status as AccountStatus,
        );

        return res.status(200).json({
            success: true,
            message: "User status updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/v1/admin/users/:id/role
 */
export const updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = await adminService.updateUserRole(
            req.params.id as string,
            req.body.role as Role,
        );

        return res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/v1/admin/users/:id
 */
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = await adminService.deleteUser(req.params.id as string);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};
