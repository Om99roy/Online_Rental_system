import { Router } from "express";
import { createRental } from "./rental.controler";

const router = Router();

router.post("/", createRental);

export default router;