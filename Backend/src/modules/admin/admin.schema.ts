import { z } from "zod";

/**
 * ============================================================
 * Common Enums
 * ============================================================
 */

const roleSchema = z.enum([
    "CUSTOMER",
    "ADMIN",
]);

const accountStatusSchema = z.enum([
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
    "DELETED",
]);


/**
 * ============================================================
 * GET /api/v1/admin/users
 *
 * Query parameters:
 *
 * ?page=1
 * &limit=10
 * &search=john
 * &role=USER
 * &status=ACTIVE
 * ============================================================
 */

export const getUsersSchema = z.object({
    query: z.object({
        page: z
            .string()
            .optional()
            .refine(
                (value) =>
                    value === undefined ||
                    (!Number.isNaN(Number(value)) &&
                        Number(value) >= 1 &&
                        Number.isInteger(Number(value))),
                {
                    message: "Page must be a positive integer",
                },
            ),

        limit: z
            .string()
            .optional()
            .refine(
                (value) =>
                    value === undefined ||
                    (!Number.isNaN(Number(value)) &&
                        Number(value) >= 1 &&
                        Number(value) <= 100 &&
                        Number.isInteger(Number(value))),
                {
                    message: "Limit must be an integer between 1 and 100",
                },
            ),

        search: z
            .string()
            .trim()
            .max(100, "Search cannot exceed 100 characters")
            .optional(),

        role: roleSchema.optional(),

        status: accountStatusSchema.optional(),
    }),
});


/**
 * ============================================================
 * GET /api/v1/admin/users/:id
 * ============================================================
 */

export const getUserByIdSchema = z.object({
    params: z.object({
        id: z
            .string()
            .trim()
            .min(1, "User ID is required"),
    }),
});


/**
 * ============================================================
 * PATCH /api/v1/admin/users/:id/status
 *
 * Body:
 * {
 *   "status": "ACTIVE"
 * }
 * ============================================================
 */

export const updateUserStatusSchema = z.object({
    params: z.object({
        id: z
            .string()
            .trim()
            .min(1, "User ID is required"),
    }),

    body: z.object({
        status: accountStatusSchema,
    }),
});


/**
 * ============================================================
 * PATCH /api/v1/admin/users/:id/role
 *
 * Body:
 * {
 *   "role": "ADMIN"
 * }
 * ============================================================
 */

export const updateUserRoleSchema = z.object({
    params: z.object({
        id: z
            .string()
            .trim()
            .min(1, "User ID is required"),
    }),

    body: z.object({
        role: roleSchema,
    }),
});


/**
 * ============================================================
 * DELETE /api/v1/admin/users/:id
 * ============================================================
 */

export const deleteUserSchema = z.object({
    params: z.object({
        id: z
            .string()
            .trim()
            .min(1, "User ID is required"),
    }),
});


/**
 * ============================================================
 * Export inferred types
 * ============================================================
 */

export type GetUsersQuery = z.infer<
    typeof getUsersSchema
>;

export type GetUserByIdParams = z.infer<
    typeof getUserByIdSchema
>;

export type UpdateUserStatusInput = z.infer<
    typeof updateUserStatusSchema
>;

export type UpdateUserRoleInput = z.infer<
    typeof updateUserRoleSchema
>;

export type DeleteUserParams = z.infer<
    typeof deleteUserSchema
>;