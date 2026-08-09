import { Router } from "express";
import * as damageReportController from "./damageReport.controler.ts";
import { authenticate } from "../../../middlewares/authenticate.middleware.ts";

const router = Router();

router.post(
  "/",
  authenticate,
  damageReportController.createDamageReport,
);

router.get(
  "/return/:returnId",
  authenticate,
  damageReportController.getDamageReportsByReturn,
);

router.get(
  "/:id",
  authenticate,
  damageReportController.getDamageReport,
);

router.patch(
  "/:id",
  authenticate,
  damageReportController.updateDamageReport,
);

router.post(
  "/:id/resolve",
  authenticate,
  damageReportController.resolveDamageReport,
);

router.delete(
  "/:id",
  authenticate,
  damageReportController.deleteDamageReport,
);

export default router;