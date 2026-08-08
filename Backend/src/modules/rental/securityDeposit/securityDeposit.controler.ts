import type { Request, Response, NextFunction } from "express";

import {
  createDepositService,
  getDepositByRentalService,
  getDepositService,
  collectDepositService,
  settleDepositService,
} from "./securityDeposit.service.ts";

export const createDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deposit =
      await createDepositService(req.body);

    res.status(201).json({
      success: true,
      message: "Security deposit created successfully.",
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepositByRental = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deposit =
      await getDepositByRentalService(
        req.params.rentalId as string,
      );

    res.status(200).json({
      success: true,
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deposit =
      await getDepositService(
        req.params.id as string,
      );

    res.status(200).json({
      success: true,
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
};

export const collectDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deposit =
      await collectDepositService(
        req.params.id as string,
      );

    res.status(200).json({
      success: true,
      message: "Security deposit collected successfully.",
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
};

export const settleDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deposit =
      await settleDepositService(
        req.params.id as string,
        req.body,
      );

    res.status(200).json({
      success: true,
      message: "Security deposit settled successfully.",
      data: deposit,
    });
  } catch (error) {
    next(error);
  }
};