import { z } from "zod";

export const checkoutSchema = z.object({
  pickupMethod: z.enum(["DELIVERY", "STORE_PICKUP"]),
  addressId: z.string().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "ONLINE"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
