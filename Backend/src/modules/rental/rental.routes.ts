import { Router } from "express";
import { createRental } from "./rental.controler";

const router = Router();

router.post("makeway", createRental);

export default router;