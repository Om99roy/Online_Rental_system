import { z } from "zod";

export const getRentalInvoiceSchema = z.object({
  rentalId: z
    .string()
    .trim()
    .min(1, "Rental ID is required"),
});

export type GetRentalInvoiceInput = z.infer<
  typeof getRentalInvoiceSchema
>;