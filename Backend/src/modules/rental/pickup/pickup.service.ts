import { prisma } from "../../../../prisma/client";

export const schedulePickup = async (
  rentalId: string,
  scheduledAt: Date
) => {
  return prisma.pickup.upsert({
    where: {
      rentalId,
    },

    update: {
      scheduledAt,
      status: "SCHEDULED",
    },

    create: {
      rentalId,
      scheduledAt,
      status: "SCHEDULED",
    },
  });
};

export const completePickup = async (
  rentalId: string
) => {
  return prisma.$transaction(async (tx) => {
    const pickup = await tx.pickup.update({
      where: {
        rentalId,
      },

      data: {
        status: "COMPLETED",
        confirmedAt: new Date(),
      },
    });

    await tx.rental.update({
      where: {
        id: rentalId,
      },

      data: {
        actualPickupAt: new Date(),
        status: "ACTIVE",
      },
    });

    return pickup;
  });
};