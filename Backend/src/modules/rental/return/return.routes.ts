import { Router } from "express";
import * as returnController from "./return.controler.ts";
import { authenticate } from "../../../middlewares/authenticate.middleware.ts";

const router = Router();

router.post(
  "/",
  authenticate,
  returnController.createReturn,
);

router.get(
  "/rental/:rentalId",
  authenticate,
  returnController.getReturnByRental,
);

router.get(
  "/:id",
  authenticate,
  returnController.getReturn,
);

router.patch(
  "/:id",
  authenticate,
  returnController.updateReturn,
);

router.post(
  "/:id/complete",
  authenticate,
  returnController.completeReturn,
);

export default router;