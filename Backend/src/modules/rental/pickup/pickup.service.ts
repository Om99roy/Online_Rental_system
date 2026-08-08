import prisma from "../../../config/prisma.ts";
import { AppError } from "../../../utils/error.ts";

interface CreatePickupData {
  rentalId: string;
  scheduledAt?: string | Date;
  notes?: string;
}

interface UpdatePickupData {
  scheduledAt?: string | Date;
  notes?: string;
  status?:
    | "SCHEDULED"
    | "READY"
    | "PICKED_UP"
    | "COMPLETED"
    | "CANCELLED";
}

/**
 * Creates or schedules a pickup for a rental.
 */
export const createPickupService = async (
  data: CreatePickupData,
) => {
  const rental = await prisma.rental.findUnique({
    where: {
      id: data.rentalId,
    },
  });

  if (!rental) {
    throw new AppError("Rental not found.", 404);
  }

  if (
    rental.status === "CANCELLED" ||
    rental.status === "COMPLETED" ||
    rental.status === "RETURNED"
  ) {
    throw new AppError(
      "Pickup cannot be created for this rental.",
      400,
    );
  }

  const existingPickup =
    await prisma.pickup.findUnique({
      where: {
        rentalId: data.rentalId,
      },
    });

  if (existingPickup) {
    throw new AppError(
      "A pickup already exists for this rental.",
      409,
    );
  }

  return prisma.pickup.create({
    data: {
      rentalId: data.rentalId,
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt)
        : undefined,
      notes: data.notes,
    },
  });
};

/**
 * Gets pickup belonging to a rental.
 */
export const getPickupByRentalService = async (
  rentalId: string,
) => {
  const pickup =
    await prisma.pickup.findUnique({
      where: {
        rentalId,
      },
      include: {
        rental: true,
      },
    });

  if (!pickup) {
    throw new AppError(
      "Pickup not found for this rental.",
      404,
    );
  }

  return pickup;
};

/**
 * Gets a pickup by ID.
 */
export const getPickupService = async (
  id: string,
) => {
  const pickup =
    await prisma.pickup.findUnique({
      where: {
        id,
      },
      include: {
        rental: true,
      },
    });

  if (!pickup) {
    throw new AppError(
      "Pickup not found.",
      404,
    );
  }

  return pickup;
};

/**
 * Updates pickup details.
 */
export const updatePickupService = async (
  id: string,
  data: UpdatePickupData,
) => {
  const pickup =
    await prisma.pickup.findUnique({
      where: {
        id,
      },
    });

  if (!pickup) {
    throw new AppError(
      "Pickup not found.",
      404,
    );
  }

  if (
    pickup.status === "COMPLETED" ||
    pickup.status === "CANCELLED"
  ) {
    throw new AppError(
      "This pickup can no longer be modified.",
      400,
    );
  }

  return prisma.pickup.update({
    where: {
      id,
    },
    data: {
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt)
        : undefined,

      notes: data.notes,

      status: data.status,
    },
  });
};

/**
 * Completes a pickup and activates the rental.
 */
export const completePickupService = async (
  id: string,
) => {
  const pickup =
    await prisma.pickup.findUnique({
      where: {
        id,
      },
      include: {
        rental: true,
      },
    });

  if (!pickup) {
    throw new AppError(
      "Pickup not found.",
      404,
    );
  }

  if (
    pickup.status === "COMPLETED"
  ) {
    throw new AppError(
      "Pickup has already been completed.",
      400,
    );
  }

  if (
    pickup.status === "CANCELLED"
  ) {
    throw new AppError(
      "Cancelled pickup cannot be completed.",
      400,
    );
  }

  if (
    pickup.rental.status === "CANCELLED" ||
    pickup.rental.status === "COMPLETED"
  ) {
    throw new AppError(
      "The rental cannot be picked up.",
      400,
    );
  }

  const now = new Date();

  return prisma.$transaction(
    async (tx) => {
      const updatedPickup =
        await tx.pickup.update({
          where: {
            id,
          },
          data: {
            status: "COMPLETED",
            confirmedAt: now,
          },
        });

      await tx.rental.update({
        where: {
          id: pickup.rentalId,
        },
        data: {
          status: "ACTIVE",
          actualPickupAt: now,
        },
      });

      return updatedPickup;
    },
  );
};

/**
 * Cancels a pickup.
 */
export const cancelPickupService = async (
  id: string,
) => {
  const pickup =
    await prisma.pickup.findUnique({
      where: {
        id,
      },
    });

  if (!pickup) {
    throw new AppError(
      "Pickup not found.",
      404,
    );
  }

  if (pickup.status === "COMPLETED") {
    throw new AppError(
      "Completed pickup cannot be cancelled.",
      400,
    );
  }

  return prisma.pickup.update({
    where: {
      id,
    },
    data: {
      status: "CANCELLED",
    },
  });
};
