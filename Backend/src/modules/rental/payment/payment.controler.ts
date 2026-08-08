import type { Request, Response, NextFunction } from "express";

import {
  createPaymentService,
  getRentalPaymentsService,
  getPaymentService,
  updatePaymentStatusService,
  refundPaymentService,
} from "./payment.services.ts";

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payment = await createPaymentService(req.body);

    res.status(201).json({
      success: true,
      message: "Payment created successfully.",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getRentalPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payments = await getRentalPaymentsService(
      req.params.rentalId as string,
    );

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payment = await getPaymentService(
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payment =
      await updatePaymentStatusService(
        req.params.id as string,
        req.body.status,
      );

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully.",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payment = await refundPaymentService(
      req.params.id as string,
      req.body.amount,
    );

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully.",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};