import type { Request, Response, NextFunction } from "express";
import * as addressService from "./address.service.ts";
import { AppError } from "../../utils/error.ts";

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);
    const addresses = await addressService.listAddresses(req.user.id);
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

export const postAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);
    const address = await addressService.createAddress(req.user.id, req.body);
    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);
    await addressService.deleteAddress(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "Address removed." });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);
    await addressService.setDefaultAddress(req.user.id, req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Default address updated." });
  } catch (error) {
    next(error);
  }
};
