import { prisma } from "../../../../prisma/client";

export const settleDeposit = async (
  rentalId: string,
  deductedAmount: number,
  notes?: string
) => {
  const deposit =
    await prisma.securityDeposit.findUnique({
      where: {
        rentalId,
      },
    });

  if (!deposit) {
    throw new Error("Security deposit not found");
  }

  const amount = Number(deposit.amount);

  if (deductedAmount > amount) {
    throw new Error(
      "Deduction cannot exceed deposit"
    );
  }

  const refundedAmount =
    amount - deductedAmount;

  let status:
    | "REFUNDED"
    | "PARTIALLY_REFUNDED"
    | "FORFEITED";

  if (deductedAmount === 0) {
    status = "REFUNDED";
  } else if (deductedAmount >= amount) {
    status = "FORFEITED";
  } else {
    status = "PARTIALLY_REFUNDED";
  }

  return prisma.securityDeposit.update({
    where: {
      rentalId,
    },

    data: {
      deductedAmount,
      refundedAmount,
      status,
      settledAt: new Date(),
      notes,
    },
  });
};