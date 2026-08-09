import type { Request, Response, NextFunction } from "express";

import {
  createPickupService,
  getPickupByRentalService,
  getPickupService,
  updatePickupService,
  completePickupService,
  cancelPickupService,
} from "./pickup.service.ts";

export const createPickup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pickup = await createPickupService(req.body);

    res.status(201).json({
      success: true,
      message: "Pickup scheduled successfully.",
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

export const getPickupByRental = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pickup =
      await getPickupByRentalService(
        req.params.rentalId as string,
      );

    res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

export const getPickup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pickup = await getPickupService(
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePickup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pickup = await updatePickupService(
      req.params.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Pickup updated successfully.",
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

export const completePickup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pickup =
      await completePickupService(
        req.params.id as string,
      );

    res.status(200).json({
      success: true,
      message: "Pickup completed successfully.",
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelPickup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const pickup =
      await cancelPickupService(
        req.params.id as string,
      );

    res.status(200).json({
      success: true,
      message: "Pickup cancelled successfully.",
      data: pickup,
    });
  } catch (error) {
    next(error);
  }
};