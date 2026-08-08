import { Router } from "express";
import * as pickupController from "./pickup.controler.ts";
import { authenticate } from "../../../middlewares/authenticate.middleware.ts";

const router = Router();

router.post(
  "/",
  authenticate,
  pickupController.createPickup,
);

router.get(
  "/rental/:rentalId",
  authenticate,
  pickupController.getPickupByRental,
);

router.get(
  "/:id",
  authenticate,
  pickupController.getPickup,
);

router.patch(
  "/:id",
  authenticate,
  pickupController.updatePickup,
);

router.post(
  "/:id/complete",
  authenticate,
  pickupController.completePickup,
);

router.post(
  "/:id/cancel",
  authenticate,
  pickupController.cancelPickup,
);

export default router;