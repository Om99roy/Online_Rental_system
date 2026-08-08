import { z } from "zod";

export const addressSchema = z.object({
  name: z.string().trim().min(1, "Label is required").max(50),
  addressLine1: z.string().trim().min(1, "Address is required").max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  postalCode: z.string().trim().min(4, "Enter a valid postal code").max(10),
  country: z.string().trim().min(1).default("India"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
});

export type AddressInput = z.infer<typeof addressSchema>;
