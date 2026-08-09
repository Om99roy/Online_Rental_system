import { z } from "zod";

export const schedulePickupSchema = z.object({
  rentalId: z.string(),

  scheduledAt: z.coerce.date(),
});