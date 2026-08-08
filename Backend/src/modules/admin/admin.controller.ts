import { type Request, type Response, type NextFunction } from "express";
import { AdminService } from "./admin.service.ts";
import type { Role, AccountStatus } from "@prisma/client";

const adminService = new AdminService();

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
