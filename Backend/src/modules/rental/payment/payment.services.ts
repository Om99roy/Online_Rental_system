import { prisma } from "../../../../prisma/client";

export const createPayment = async (data: {
  rentalId: string;
  amount: number;
  method:
    | "CASH"
    | "CARD"
    | "UPI"
    | "BANK_TRANSFER"
    | "ONLINE";
  transactionId?: string;
}) => {
  const rental = await prisma.rental.findUnique({
    where: {
      id: data.rentalId,
    },
  });

  if (!rental) {
    throw new Error("Rental not found");
  }

  return prisma.payment.create({
    data: {
      rentalId: data.rentalId,
      amount: data.amount,
      method: data.method,
      transactionId: data.transactionId,

      status: "PAID",
      paidAt: new Date(),
    },
  });
};