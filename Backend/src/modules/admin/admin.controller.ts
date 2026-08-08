import { type Request, type Response, type NextFunction } from "express";
import { AdminService } from ".admin.service";

//const AdminService = new AdminService();

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
        const {
            page,
            limit,
            search,
            role,
            status,
        } = req.query;

        const data = await adminService.getUsers({
            page: Number(page),
            limit: Number(limit),
            search: search as string | undefined,
            role: role as "USER" | "ADMIN" | undefined,
            status: status as
                | "ACTIVE"
                | "INACTIVE"
                | "SUSPENDED"
                | "DELETED"
                | undefined,
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
        const user = await adminService.getUserById(
            req.params.id,
        );

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
        const user =
            await adminService.updateUserStatus(
                req.params.id,
                req.body.status,
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
        const user =
            await adminService.updateUserRole(
                req.params.id,
                req.body.role,
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
        const user =
            await adminService.deleteUser(
                req.params.id,
            );

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};
