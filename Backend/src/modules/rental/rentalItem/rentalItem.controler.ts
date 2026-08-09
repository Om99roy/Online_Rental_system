import type { Request, Response, NextFunction } from "express";

import {
  createRentalItemService,
  getRentalItemsService,
  getRentalItemService,
  updateRentalItemService,
  deleteRentalItemService,
} from "./rentalItem.service.ts";

export const createRentalItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rentalItem = await createRentalItemService(req.body);

    res.status(201).json({
      success: true,
      message: "Rental item added successfully.",
      data: rentalItem,
    });
  } catch (error) {
    next(error);
  }
};

export const getRentalItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rentalItems = await getRentalItemsService(
      req.params.rentalId as string,
    );

    res.status(200).json({
      success: true,
      data: rentalItems,
    });
  } catch (error) {
    next(error);
  }
};

export const getRentalItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rentalItem = await getRentalItemService(
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      data: rentalItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRentalItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rentalItem = await updateRentalItemService(
      req.params.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Rental item updated successfully.",
      data: rentalItem,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRentalItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteRentalItemService(
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      message: "Rental item deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};