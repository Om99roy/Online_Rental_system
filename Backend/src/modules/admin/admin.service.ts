import prisma from "../../config/prisma.ts";
import type { Role, AccountStatus } from "@prisma/client";

export class AdminService {
    /**
     * GET ADMIN DASHBOARD
     */
    async getDashboard() {
        const [
            totalUsers,
            activeUsers,
            inactiveUsers,
            suspendedUsers,
            deletedUsers,
            adminUsers,
            regularUsers,
        ] = await Promise.all([
            prisma.user.count(),

            prisma.user.count({
                where: {
                    status: "ACTIVE",
                },
            }),

            prisma.user.count({
                where: {
                    status: "INACTIVE",
                },
            }),

            prisma.user.count({
                where: {
                    status: "SUSPENDED",
                },
            }),

            prisma.user.count({
                where: {
                    status: "DELETED",
                },
            }),

            prisma.user.count({
                where: {
                    role: "ADMIN",
                },
            }),

            prisma.user.count({
                where: {
                    role: "CUSTOMER",
                },
            }),
        ]);

        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            suspendedUsers,
            deletedUsers,
            adminUsers,
            regularUsers,
        };
    }

    /* GET USERS DATA WITH FILTERING */
    async getUsers(options: {
        page: number;
        limit: number;
        search?: string;
        role?: Role;
        status?: AccountStatus;
    }) {
        const { page, limit, search, role, status } = options;
        const skip = (page - 1) * limit;

        const where = {
            ...(search
                ? {
                      OR: [
                          {
                              username: {
                                  contains: search,
                              },
                          },
                          {
                              email: {
                                  contains: search,
                              },
                          },
                      ],
                  }
                : {}),

            ...(role ? { role } : {}),

            ...(status ? { status } : {}),
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    status: true,
                    emailVerified: true,
                    lastLoginAt: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),

            prisma.user.count({
                where,
            }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get single user
     */
    async getUserById(userId: string) {
        return prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                status: true,
                emailVerified: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Update user account status
     */
    async updateUserStatus(userId: string, status: AccountStatus) {
        return prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                status,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                status: true,
                emailVerified: true,
            },
        });
    }

    /**
     * Update user role
     */
    async updateUserRole(userId: string, role: Role) {
        return prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                role,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                status: true,
                emailVerified: true,
            },
        });
    }

    /**
     * Soft delete user
     */
    async deleteUser(userId: string) {
        return prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                status: "DELETED",
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                status: true,
            },
        });
    }
}