import { Request, Response } from "express";
import * as rentalService from "./rental.service";

export const createRental = async (
  req: Request,
  res: Response
) => {
  try {
    const rental =
      await rentalService.createRental(req.body);

    res.status(201).json({
      success: true,
      data: rental,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create rental",
    });
  }
};