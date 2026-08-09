import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { AppError } from "../../utils/error.ts";

// TODO(real integration): replace with actual Razorpay Orders API call:
// const razorpay = new Razorpay({ key_id, key_secret });
// const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR", receipt });
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);
    const { amount, receipt } = req.body;
    if (!amount || amount <= 0) throw new AppError("Invalid amount.", 400);

    const order = {
      orderId: `order_mock_${crypto.randomUUID().slice(0, 12)}`,
      amount,
      currency: "INR",
      receipt: receipt ?? `receipt_${Date.now()}`,
    };

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
