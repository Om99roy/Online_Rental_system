import { Router } from "express";
import * as rentalItemController from "./rentalItem.controler.ts";
import { authenticate } from "../../../middlewares/authenticate.middleware.ts";

const router = Router();

// Add item to a rental
router.post(
  "/",
  authenticate,
  rentalItemController.createRentalItem,
);

// Get all items belonging to a rental
router.get(
  "/rental/:rentalId",
  authenticate,
  rentalItemController.getRentalItems,
);

// Get one rental item
router.get(
  "/:id",
  authenticate,
  rentalItemController.getRentalItem,
);

// Update quantity
router.patch(
  "/:id",
  authenticate,
  rentalItemController.updateRentalItem,
);

// Delete rental item
router.delete(
  "/:id",
  authenticate,
  rentalItemController.deleteRentalItem,
);

export default router;