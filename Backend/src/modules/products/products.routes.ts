import { Router } from "express";
import { getProducts } from "./products.controller.ts";

const productsRouter = Router();
productsRouter.get("/", getProducts);

export default productsRouter;
