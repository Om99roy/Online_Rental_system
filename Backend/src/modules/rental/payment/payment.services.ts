import prisma from "../../../config/prisma.ts";
import { AppError } from "../../../utils/error.ts";

interface CreatePaymentData {
  rentalId: string;
  amount: number;
  method:
    | "CASH"
    | "CARD"
    | "UPI"
    | "BANK_TRANSFER"
    | "ONLINE";
  transactionId?: string;
}

/**
 * Creates a payment for a rental.
 */
export const createPaymentService = async (
  data: CreatePaymentData,
) => {
  if (!data.rentalId) {
    throw new AppError(
      "Rental ID is required.",
      400,
    );
  }

  if (!data.amount || data.amount <= 0) {
    throw new AppError(
      "Payment amount must be greater than zero.",
      400,
    );
  }

  const rental = await prisma.rental.findUnique({
    where: {
      id: data.rentalId,
    },
  });

  if (!rental) {
    throw new AppError("Rental not found.", 404);
  }

  if (
    rental.status === "CANCELLED"
  ) {
    throw new AppError(
      "Cannot make a payment for a cancelled rental.",
      400,
    );
  }

  if (
    data.method === "ONLINE"
    &&
    false
  ) {
    throw new AppError(
      "Online payments are disabled.",
      400,
    );
  }

  return prisma.payment.create({
    data: {
      rentalId: data.rentalId,
      amount: data.amount,
      method: data.method,
      status: "PAID",
      transactionId:
        data.transactionId,
      paidAt: new Date(),
    },
  });
};

/**
 * Gets all payments belonging to a rental.
 */
export const getRentalPaymentsService = async (
  rentalId: string,
) => {
  const rental = await prisma.rental.findUnique({
    where: {
      id: rentalId,
    },
  });

  if (!rental) {
    throw new AppError("Rental not found.", 404);
  }

  return prisma.payment.findMany({
    where: {
      rentalId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Gets one payment.
 */
export const getPaymentService = async (
  id: string,
) => {
  const payment =
    await prisma.payment.findUnique({
      where: {
        id,
      },
      include: {
        rental: true,
      },
    });

  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404,
    );
  }

  return payment;
};

/**
 * Updates the payment status.
 */
export const updatePaymentStatusService = async (
  id: string,
  status:
    | "PENDING"
    | "PROCESSING"
    | "PAID"
    | "FAILED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED"
    | "CANCELLED",
) => {
  const payment =
    await prisma.payment.findUnique({
      where: {
        id,
      },
    });

  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404,
    );
  }

  if (
    payment.status === "REFUNDED" &&
    status !== "REFUNDED"
  ) {
    throw new AppError(
      "A refunded payment cannot be moved to another status.",
      400,
    );
  }

  const paidAt =
    status === "PAID"
      ? payment.paidAt ?? new Date()
      : payment.paidAt;

  return prisma.payment.update({
    where: {
      id,
    },
    data: {
      status,
      paidAt,
    },
  });
};

/**
 * Refunds a payment.
 *
 * The current Prisma schema does not contain
 * a refundedAmount column, so the amount is validated
 * but only the payment status is persisted.
 */
export const refundPaymentService = async (
  id: string,
  amount?: number,
) => {
  const payment =
    await prisma.payment.findUnique({
      where: {
        id,
      },
    });

  if (!payment) {
    throw new AppError(
      "Payment not found.",
      404,
    );
  }

  if (payment.status !== "PAID") {
    throw new AppError(
      "Only paid payments can be refunded.",
      400,
    );
  }

  const paymentAmount =
    Number(payment.amount);

  const refundAmount =
    amount ?? paymentAmount;

  if (refundAmount <= 0) {
    throw new AppError(
      "Refund amount must be greater than zero.",
      400,
    );
  }

  if (refundAmount > paymentAmount) {
    throw new AppError(
      "Refund amount cannot exceed payment amount.",
      400,
    );
  }

  const status =
    refundAmount === paymentAmount
      ? "REFUNDED"
      : "PARTIALLY_REFUNDED";

  return prisma.payment.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
};