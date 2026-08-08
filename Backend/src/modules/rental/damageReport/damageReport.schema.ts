import { z } from "zod";

export const createDamageReportSchema = z.object({
  returnId: z.string(),

  productId: z.string(),

  type: z.enum([
    "DAMAGE",
    "MISSING_ACCESSORY",
    "LOSS",
    "REPAIR",
  ]),

  description: z.string().optional(),

  repairCost: z.number().min(0),
});