import type { Request, Response, NextFunction } from "express";

import {
  createReturnService,
  getReturnByRentalService,
  getReturnService,
  updateReturnService,
  completeReturnService,
} from "./return.service.ts";

export const createReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const returnRecord =
      await createReturnService(req.body);

    res.status(201).json({
      success: true,
      message: "Return created successfully.",
      data: returnRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getReturnByRental = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const returnRecord =
      await getReturnByRentalService(
        req.params.rentalId as string,
      );

    res.status(200).json({
      success: true,
      data: returnRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const returnRecord =
      await getReturnService(
        req.params.id as string,
      );

    res.status(200).json({
      success: true,
      data: returnRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const returnRecord =
      await updateReturnService(
        req.params.id as string,
        req.body,
      );

    res.status(200).json({
      success: true,
      message: "Return updated successfully.",
      data: returnRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const completeReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const returnRecord =
      await completeReturnService(
        req.params.id as string,
        req.body,
      );

    res.status(200).json({
      success: true,
      message: "Return completed successfully.",
      data: returnRecord,
    });
  } catch (error) {
    next(error);
  }
};