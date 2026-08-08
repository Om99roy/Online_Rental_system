import { z } from "zod";

export const createRentalSchema = z.object({
  organizationId: z.string(),
  customerId: z.string(),

  startDate: z.coerce.date(),
  endDate: z.coerce.date(),

  pickupMethod: z.enum(["DELIVERY", "STORE_PICKUP"]).default("STORE_PICKUP"),

  deliveryAddressId: z.string().optional(),

  notes: z.string().optional(),

  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive().default(1),
    })
  ).min(1),
});

export const updateRentalSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),

  pickupMethod: z
    .enum(["DELIVERY", "STORE_PICKUP"])
    .optional(),

  deliveryAddressId: z.string().optional(),

  notes: z.string().optional(),
});

export const rentalStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "PENDING",
    "CONFIRMED",
    "READY_FOR_PICKUP",
    "PICKED_UP",
    "ACTIVE",
    "OVERDUE",
    "RETURNED",
    "COMPLETED",
    "CANCELLED",
  ]),
});