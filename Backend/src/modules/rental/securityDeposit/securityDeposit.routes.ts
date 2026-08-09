import { Router } from "express";
import * as securityDepositController from "./securityDeposit.controler.ts";
import { authenticate } from "../../../middlewares/authenticate.middleware.ts";

const router = Router();

router.post(
  "/",
  authenticate,
  securityDepositController.createDeposit,
);

router.get(
  "/rental/:rentalId",
  authenticate,
  securityDepositController.getDepositByRental,
);

router.get(
  "/:id",
  authenticate,
  securityDepositController.getDeposit,
);

router.post(
  "/:id/collect",
  authenticate,
  securityDepositController.collectDeposit,
);

router.post(
  "/:id/settle",
  authenticate,
  securityDepositController.settleDeposit,
);

export default router;