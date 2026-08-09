import prisma from "../../../config/prisma.ts";
import { AppError } from "../../../utils/error.ts";

interface CreateReturnData {
  rentalId: string;
  scheduledAt?: string | Date;
  notes?: string;
}

interface UpdateReturnData {
  scheduledAt?: string | Date;
  condition?:
    | "GOOD"
    | "DAMAGED"
    | "MISSING_ACCESSORIES"
    | "REPAIR_REQUIRED";
  damageNotes?: string;
  missingAccessories?: string;
  notes?: string;
}

interface CompleteReturnData {
  condition:
    | "GOOD"
    | "DAMAGED"
    | "MISSING_ACCESSORIES"
    | "REPAIR_REQUIRED";

  damageNotes?: string;
  missingAccessories?: string;
  notes?: string;
}

/**
 * Calculates the number of minutes a rental is late.
 */
const calculateLateMinutes = (
  endDate: Date,
  returnedAt: Date,
) => {
  if (returnedAt <= endDate) {
    return 0;
  }

  return Math.floor(
    (returnedAt.getTime() -
      endDate.getTime()) /
      (1000 * 60),
  );
};

/**
 * Calculates the late fee according to organization settings.
 */
const calculateLateFee = (
  lateMinutes: number,
  settings: {
    lateFeeEnabled: boolean;
    lateFeeType:
      | "HOURLY"
      | "DAILY"
      | "WEEKLY"
      | "MONTHLY";
    lateFeeValue: unknown;
    gracePeriodMinutes: number;
    maximumLateFee: unknown;
  } | null,
) => {
  if (!settings || !settings.lateFeeEnabled) {
    return 0;
  }

  const chargeableMinutes = Math.max(
    0,
    lateMinutes -
      settings.gracePeriodMinutes,
  );

  if (chargeableMinutes <= 0) {
    return 0;
  }

  const feeValue =
    Number(settings.lateFeeValue);

  if (feeValue <= 0) {
    return 0;
  }

  let fee = 0;

  switch (settings.lateFeeType) {
    case "HOURLY":
      fee =
        Math.ceil(
          chargeableMinutes / 60,
        ) * feeValue;
      break;

    case "DAILY":
      fee =
        Math.ceil(
          chargeableMinutes / 1440,
        ) * feeValue;
      break;

    case "WEEKLY":
      fee =
        Math.ceil(
          chargeableMinutes / 10080,
        ) * feeValue;
      break;

    case "MONTHLY":
      fee =
        Math.ceil(
          chargeableMinutes / 43200,
        ) * feeValue;
      break;
  }

  if (settings.maximumLateFee !== null) {
    fee = Math.min(
      fee,
      Number(settings.maximumLateFee),
    );
  }

  return fee;
};

/**
 * Creates a return record.
 */
export const createReturnService = async (
  data: CreateReturnData,
) => {
  const rental = await prisma.rental.findUnique({
    where: {
      id: data.rentalId,
    },
  });

  if (!rental) {
    throw new AppError(
      "Rental not found.",
      404,
    );
  }

  if (
    rental.status !== "ACTIVE" &&
    rental.status !== "OVERDUE" &&
    rental.status !== "PICKED_UP"
  ) {
    throw new AppError(
      "This rental is not currently eligible for return.",
      400,
    );
  }

  const existingReturn =
    await prisma.return.findUnique({
      where: {
        rentalId: data.rentalId,
      },
    });

  if (existingReturn) {
    throw new AppError(
      "A return already exists for this rental.",
      409,
    );
  }

  return prisma.return.create({
    data: {
      rentalId: data.rentalId,
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt)
        : undefined,
      status: "PENDING",
      notes: data.notes,
    },
  });
};

/**
 * Gets return belonging to a rental.
 */
export const getReturnByRentalService = async (
  rentalId: string,
) => {
  const returnRecord =
    await prisma.return.findUnique({
      where: {
        rentalId,
      },
      include: {
        rental: true,
        damageReports: {
          include: {
            product: true,
          },
        },
      },
    });

  if (!returnRecord) {
    throw new AppError(
      "Return not found for this rental.",
      404,
    );
  }

  return returnRecord;
};

/**
 * Gets one return.
 */
export const getReturnService = async (
  id: string,
) => {
  const returnRecord =
    await prisma.return.findUnique({
      where: {
        id,
      },
      include: {
        rental: true,
        damageReports: {
          include: {
            product: true,
          },
        },
      },
    });

  if (!returnRecord) {
    throw new AppError(
      "Return not found.",
      404,
    );
  }

  return returnRecord;
};

/**
 * Updates an inspection/return record.
 */
export const updateReturnService = async (
  id: string,
  data: UpdateReturnData,
) => {
  const returnRecord =
    await prisma.return.findUnique({
      where: {
        id,
      },
    });

  if (!returnRecord) {
    throw new AppError(
      "Return not found.",
      404,
    );
  }

  if (
    returnRecord.status === "COMPLETED" ||
    returnRecord.status === "CANCELLED"
  ) {
    throw new AppError(
      "This return can no longer be modified.",
      400,
    );
  }

  return prisma.return.update({
    where: {
      id,
    },
    data: {
      scheduledAt: data.scheduledAt
        ? new Date(data.scheduledAt)
        : undefined,

      condition: data.condition,

      damageNotes:
        data.damageNotes,

      missingAccessories:
        data.missingAccessories,

      notes: data.notes,
    },
  });
};

/**
 * Completes the return.
 *
 * This:
 * 1. Records returnedAt.
 * 2. Calculates late minutes.
 * 3. Calculates late fee.
 * 4. Updates Return.
 * 5. Updates Rental.
 *
 * Damage reports and deposit settlement are kept separate
 * because the returned item may need inspection first.
 */
export const completeReturnService = async (
  id: string,
  data: CompleteReturnData,
) => {
  const returnRecord =
    await prisma.return.findUnique({
      where: {
        id,
      },
      include: {
        rental: true,
      },
    });

  if (!returnRecord) {
    throw new AppError(
      "Return not found.",
      404,
    );
  }

  if (
    returnRecord.status === "COMPLETED"
  ) {
    throw new AppError(
      "Return has already been completed.",
      400,
    );
  }

  if (
    returnRecord.status === "CANCELLED"
  ) {
    throw new AppError(
      "Cancelled return cannot be completed.",
      400,
    );
  }

  const now = new Date();

  const lateByMinutes =
    calculateLateMinutes(
      returnRecord.rental.endDate,
      now,
    );

  const settings =
    await prisma.organizationSettings.findUnique(
      {
        where: {
          organizationId:
            returnRecord.rental.organizationId,
        },
      },
    );

  const lateFee = calculateLateFee(
    lateByMinutes,
    settings,
  );

  const returnStatus =
    data.condition === "GOOD"
      ? "COMPLETED"
      : "DAMAGED";

  return prisma.$transaction(
    async (tx) => {
      const updatedReturn =
        await tx.return.update({
          where: {
            id,
          },
          data: {
            returnedAt: now,
            status: returnStatus,
            condition: data.condition,

            damageNotes:
              data.damageNotes,

            missingAccessories:
              data.missingAccessories,

            lateByMinutes,
            lateFee,

            notes: data.notes,
          },
        });

      await tx.rental.update({
        where: {
          id: returnRecord.rentalId,
        },
        data: {
          actualReturnAt: now,
          lateFee,
          status: "RETURNED",
        },
      });

      return updatedReturn;
    },
  );
};