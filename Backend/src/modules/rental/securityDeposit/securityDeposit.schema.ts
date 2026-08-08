import { z } from "zod";

export const settleDepositSchema = z.object({
  deductedAmount: z.number().min(0),
  notes: z.string().optional(),
});