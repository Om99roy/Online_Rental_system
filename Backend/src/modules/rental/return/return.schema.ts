import { z } from "zod";

export const processReturnSchema = z.object({
  rentalId: z.string(),

  condition: z.enum([
    "GOOD",
    "DAMAGED",
    "MISSING_ACCESSORIES",
    "REPAIR_REQUIRED",
  ]),

  damageNotes: z.string().optional(),

  missingAccessories: z.string().optional(),

  notes: z.string().optional(),
});