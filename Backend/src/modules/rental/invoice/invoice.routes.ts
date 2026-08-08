import { Router } from "express";

import {
  getRentalInvoice,
} from "./invoice.controler.ts";

import {
  authenticate,
} from "../../../middlewares/authenticate.middleware.ts";

const router = Router();

router.get(
  "/:rentalId/invoice",
  authenticate,
  getRentalInvoice,
);

export default router;