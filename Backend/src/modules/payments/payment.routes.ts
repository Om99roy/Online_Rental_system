import { Router } from "express";
import { createOrder } from "./payment.controller.ts";
import { authenticate } from "../../middlewares/authenticate.middleware.ts";

const paymentRouter = Router();
paymentRouter.post("/create-order", authenticate, createOrder);

export default paymentRouter;
