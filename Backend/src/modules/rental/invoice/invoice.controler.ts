import type {
  Request,
  Response,
} from "express";

import {
  getRentalInvoiceService,
} from "./invoice.service";

import {
  getRentalInvoiceSchema,
} from "./invoice.schema.ts";

export const getRentalInvoice = async (
  req: Request,
  res: Response,
) => {
  const { rentalId } =
    getRentalInvoiceSchema.parse(
      req.params,
    );

  const invoice =
    await getRentalInvoiceService(
      rentalId,
    );

  res.status(200).json({
    success: true,

    message:
      "Rental invoice retrieved successfully.",

    data: invoice,
  });
};