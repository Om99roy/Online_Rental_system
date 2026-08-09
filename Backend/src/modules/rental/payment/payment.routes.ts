import { Router } from "express";
import * as paymentController from "./payment.controler.ts";
import { authenticate } from "../../../middlewares/authenticate.middleware.ts";

const router = Router();

router.post(
  "/",
  authenticate,
  paymentController.createPayment,
);

router.get(
  "/rental/:rentalId",
  authenticate,
  paymentController.getRentalPayments,
);

router.get(
  "/:id",
  authenticate,
  paymentController.getPayment,
);

router.patch(
  "/:id/status",
  authenticate,
  paymentController.updatePaymentStatus,
);

router.post(
  "/:id/refund",
  authenticate,
  paymentController.refundPayment,
);

export default router;