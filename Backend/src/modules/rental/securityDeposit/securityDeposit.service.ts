import prisma from "../../../config/prisma.ts";
import { AppError } from "../../../utils/error.ts";

interface CreateDepositData {
  rentalId: string;
  amount: number;
  notes?: string;
}

interface SettleDepositData {
  deductedAmount: number;
  notes?: string;
}

/**
 * Creates a security deposit record.
 */
export const createDepositService = async (
  data: CreateDepositData,
) => {
  if (!data.rentalId) {
    throw new AppError(
      "Rental ID is required.",
      400,
    );
  }

  if (data.amount < 0) {
    throw new AppError(
      "Deposit amount cannot be negative.",
      400,
    );
  }

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

  const existingDeposit =
    await prisma.securityDeposit.findUnique({
      where: {
        rentalId: data.rentalId,
      },
    });

  if (existingDeposit) {
    throw new AppError(
      "A security deposit already exists for this rental.",
      409,
    );
  }

  return prisma.securityDeposit.create({
    data: {
      rentalId: data.rentalId,
      amount: data.amount,
      notes: data.notes,
    },
  });
};

/**
 * Gets deposit belonging to a rental.
 */
export const getDepositByRentalService = async (
  rentalId: string,
) => {
  const deposit =
    await prisma.securityDeposit.findUnique({
      where: {
        rentalId,
      },
      include: {
        rental: true,
      },
    });

  if (!deposit) {
    throw new AppError(
      "Security deposit not found for this rental.",
      404,
    );
  }

  return deposit;
};

/**
 * Gets one security deposit.
 */
export const getDepositService = async (
  id: string,
) => {
  const deposit =
    await prisma.securityDeposit.findUnique({
      where: {
        id,
      },
      include: {
        rental: true,
      },
    });

  if (!deposit) {
    throw new AppError(
      "Security deposit not found.",
      404,
    );
  }

  return deposit;
};

/**
 * Marks a security deposit as collected/held.
 */
export const collectDepositService = async (
  id: string,
) => {
  const deposit =
    await prisma.securityDeposit.findUnique({
      where: {
        id,
      },
    });

  if (!deposit) {
    throw new AppError(
      "Security deposit not found.",
      404,
    );
  }

  if (deposit.status === "HELD") {
    throw new AppError(
      "Security deposit has already been collected.",
      400,
    );
  }

  if (
    deposit.status === "REFUNDED" ||
    deposit.status === "PARTIALLY_REFUNDED" ||
    deposit.status === "FORFEITED"
  ) {
    throw new AppError(
      "This security deposit has already been settled.",
      400,
    );
  }

  return prisma.securityDeposit.update({
    where: {
      id,
    },
    data: {
      status: "HELD",
      collectedAt:
        deposit.collectedAt ?? new Date(),
    },
  });
};

/**
 * Settles the security deposit after return/inspection.
 */
export const settleDepositService = async (
  id: string,
  data: SettleDepositData,
) => {
  if (
    data.deductedAmount < 0
  ) {
    throw new AppError(
      "Deducted amount cannot be negative.",
      400,
    );
  }

  const deposit =
    await prisma.securityDeposit.findUnique({
      where: {
        id,
      },
      include: {
        rental: true,
      },
    });

  if (!deposit) {
    throw new AppError(
      "Security deposit not found.",
      404,
    );
  }

  if (
    deposit.status !== "HELD" &&
    deposit.status !== "PENDING"
  ) {
    throw new AppError(
      "This security deposit has already been settled.",
      400,
    );
  }

  const originalAmount =
    Number(deposit.amount);

  if (
    data.deductedAmount >
    originalAmount
  ) {
    throw new AppError(
      "Deduction cannot exceed the security deposit.",
      400,
    );
  }

  const refundedAmount =
    originalAmount -
    data.deductedAmount;

  let status:
    | "REFUNDED"
    | "PARTIALLY_REFUNDED"
    | "FORFEITED";

  if (data.deductedAmount === 0) {
    status = "REFUNDED";
  } else if (
    data.deductedAmount === originalAmount
  ) {
    status = "FORFEITED";
  } else {
    status = "PARTIALLY_REFUNDED";
  }

  return prisma.$transaction(
    async (tx) => {
      const updatedDeposit =
        await tx.securityDeposit.update({
          where: {
            id,
          },
          data: {
            deductedAmount:
              data.deductedAmount,

            refundedAmount,

            status,

            settledAt: new Date(),

            notes: data.notes,
          },
        });

      await tx.rental.update({
        where: {
          id: deposit.rentalId,
        },
        data: {
          refundAmount:
            refundedAmount,
        },
      });

      return updatedDeposit;
    },
  );
};