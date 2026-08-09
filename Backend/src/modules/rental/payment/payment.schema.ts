import { z } from "zod";

export const createPaymentSchema = z.object({
  rentalId: z.string(),

  amount: z.number().positive(),

  method: z.enum([
    "CASH",
    "CARD",
    "UPI",
    "BANK_TRANSFER",
    "ONLINE",
  ]),

  transactionId: z.string().optional(),
});