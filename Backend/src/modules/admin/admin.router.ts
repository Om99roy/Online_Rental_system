import { Router } from "express";

import {
    getDashboard,
    getUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
    deleteUser,
} from "./admin.controller";

import {
    getUsersSchema,
    getUserByIdSchema,
    updateUserStatusSchema,
    updateUserRoleSchema,
    deleteUserSchema,
} from "./admin.schema";

/* Validate middleware */
import { validate } from "../../middlewares/validate.middleware.ts";

/* Authenticate middleware */
import { authenticate } from "../../middlewares/authenticate.middleware.ts";

/* Admin middleware */
import { requireAdminOnly } from "../../middlewares/admin.middleware.ts";

/* set up the router() method */

const router = Router();

/* ADMIN DASHBOARD */

router.get("/dashboard",
    authenticate,
    requireAdminOnly,
    getDashboard
);

/* GET USERS DATA WITH FILTERING */
router.get("/users",
    validate(getUsersSchema),
    authenticate,
    requireAdminOnly,
    getUsers
);

/* GET SINGLE USER */
router.get("/users/:id",
    validate(getUserByIdSchema),
    authenticate,
    requireAdminOnly,
    getUserById
);

/* UPDATE USER STATUS */
router.patch("/users/:id/status",
    validate(updateUserStatusSchema),
    authenticate,
    requireAdminOnly,
    updateUserStatus
);

/* UPDATE USER ROLE */
router.patch("/users/:id/role",
    validate(updateUserRoleSchema),
    authenticate,
    requireAdminOnly,
    updateUserRole
);

/* DELETE USER */
router.delete("/users/:id",
    validate(deleteUserSchema),
    authenticate,
    requireAdminOnly,
    deleteUser
);

export { router as adminRouter };

