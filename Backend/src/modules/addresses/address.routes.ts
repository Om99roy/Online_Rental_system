import { Router } from "express";
import * as addressController from "./address.controller.ts";
import { authenticate } from "../../middlewares/authenticate.middleware.ts";

const addressRouter = Router();
addressRouter.use(authenticate);

addressRouter.get("/", addressController.getAddresses);
addressRouter.post("/", addressController.postAddress);
addressRouter.delete("/:id", addressController.deleteAddressHandler);
addressRouter.patch("/:id/default", addressController.setDefaultAddressHandler);

export default addressRouter;
