import { z } from "zod";

export const addRentalItemSchema = z.object({
  rentalId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
});