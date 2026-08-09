import { Router } from "express";
import * as adminController from "./admin.controller.ts";
import { authenticate } from "../../middlewares/authenticate.middleware.ts";
import { requireAdmin } from "../../middlewares/requireadmin.middleware.ts";

const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.get("/dashboard", adminController.getDashboard);
adminRouter.get("/users", adminController.getUsers);
adminRouter.get("/users/:id", adminController.getUserById);
adminRouter.patch("/users/:id/status", adminController.updateUserStatus);
adminRouter.patch("/users/:id/role", adminController.updateUserRole);
adminRouter.delete("/users/:id", adminController.deleteUser);

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
    getUsers,
);

/* GET SINGLE USER */
router.get("/users/:id",
    validate(getUserByIdSchema),
    authenticate,
    requireAdminOnly,
    getUserById,
);

/* UPDATE USER STATUS */
router.patch("/users/:id/status",
    validate(updateUserStatusSchema),
    authenticate,
    requireAdminOnly,
    updateUserStatus,
);

/* UPDATE USER ROLE */
router.patch("/users/:id/role",
    validate(updateUserRoleSchema),
    authenticate,
    requireAdminOnly,
    updateUserRole,
);

/* DELETE USER */
router.delete("/users/:id",
    validate(deleteUserSchema),
    authenticate,
    requireAdminOnly,
    deleteUser,
);

//export { router as adminRouter };
export default adminRouter;

