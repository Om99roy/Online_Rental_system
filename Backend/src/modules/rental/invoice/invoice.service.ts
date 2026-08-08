import prisma from "../../../config/prisma.ts";
import { AppError } from "../../../utils/error.ts";

export const getRentalInvoiceService = async (
  rentalId: string,
) => {
  const rental = await prisma.rental.findUnique({
    where: {
      id: rentalId,
    },

    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },

        orderBy: {
          createdAt: "asc",
        },
      },

      payments: {
        orderBy: {
          createdAt: "asc",
        },
      },

      securityDeposit: true,

      pickup: true,

      return: {
        include: {
          damageReports: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!rental) {
    throw new AppError(
      "Rental not found.",
      404,
    );
  }

  /*
   * ============================
   * RENTAL ITEMS
   * ============================
   */

  const items = rental.items.map((item) => ({
    id: item.id,

    productId: item.productId,

    productName: item.product.name,

    sku: item.product.sku,

    quantity: item.quantity,

    pricePerUnit: Number(
      item.pricePerUnit,
    ),

    subtotal: Number(
      item.subtotal,
    ),
  }));

  /*
   * ============================
   * RENTAL CHARGES
   * ============================
   */

  const subtotal = Number(
    rental.subtotal,
  );

  const discount = Number(
    rental.discount,
  );

  const tax = Number(
    rental.tax,
  );

  const lateFee = Number(
    rental.lateFee,
  );

  const totalAmount = Number(
    rental.totalAmount,
  );

  /*
   * ============================
   * SECURITY DEPOSIT
   * ============================
   */

  const securityDeposit =
    rental.securityDeposit
      ? {
          id: rental.securityDeposit.id,

          amount: Number(
            rental.securityDeposit.amount,
          ),

          deductedAmount: Number(
            rental.securityDeposit
              .deductedAmount,
          ),

          refundedAmount: Number(
            rental.securityDeposit
              .refundedAmount,
          ),

          status:
            rental.securityDeposit.status,

          collectedAt:
            rental.securityDeposit
              .collectedAt,

          settledAt:
            rental.securityDeposit
              .settledAt,

          notes:
            rental.securityDeposit.notes,
        }
      : null;

  /*
   * ============================
   * PAYMENTS
   * ============================
   */

  const payments = rental.payments.map(
    (payment) => ({
      id: payment.id,

      amount: Number(
        payment.amount,
      ),

      method: payment.method,

      status: payment.status,

      transactionId:
        payment.transactionId,

      paidAt: payment.paidAt,

      createdAt:
        payment.createdAt,
    }),
  );

  /*
   * Only successfully paid
   * transactions count toward
   * the amount paid.
   */

  const totalPaid = payments
    .filter(
      (payment) =>
        payment.status === "PAID",
    )
    .reduce(
      (total, payment) =>
        total + payment.amount,
      0,
    );

  const balanceDue = Math.max(
    0,
    totalAmount - totalPaid,
  );

  /*
   * ============================
   * DAMAGE REPORTS
   * ============================
   */

  const damageReports =
    rental.return?.damageReports.map(
      (report) => ({
        id: report.id,

        productId:
          report.productId,

        productName:
          report.product.name,

        sku:
          report.product.sku,

        type:
          report.type,

        description:
          report.description,

        repairCost:
          Number(
            report.repairCost,
          ),

        resolved:
          report.resolved,

        createdAt:
          report.createdAt,
      }),
    ) ?? [];

  const damageCharges =
    damageReports.reduce(
      (total, report) =>
        total + report.repairCost,
      0,
    );

  /*
   * ============================
   * PICKUP
   * ============================
   */

  const pickup = rental.pickup
    ? {
        id: rental.pickup.id,

        scheduledAt:
          rental.pickup.scheduledAt,

        confirmedAt:
          rental.pickup.confirmedAt,

        status:
          rental.pickup.status,

        notes:
          rental.pickup.notes,
      }
    : null;

  /*
   * ============================
   * RETURN
   * ============================
   */

  const returnData = rental.return
    ? {
        id: rental.return.id,

        scheduledAt:
          rental.return.scheduledAt,

        returnedAt:
          rental.return.returnedAt,

        status:
          rental.return.status,

        condition:
          rental.return.condition,

        damageNotes:
          rental.return.damageNotes,

        missingAccessories:
          rental.return
            .missingAccessories,

        lateByMinutes:
          rental.return
            .lateByMinutes,

        lateFee:
          Number(
            rental.return.lateFee,
          ),

        notes:
          rental.return.notes,
      }
    : null;

  /*
   * ============================
   * INVOICE NUMBER
   * ============================
   *
   * This is generated from the
   * rental ID because your current
   * Prisma schema does not have
   * an Invoice model.
   */

  const invoiceNumber =
    `INV-${rental.id
      .slice(0, 8)
      .toUpperCase()}`;

  /*
   * ============================
   * FINAL INVOICE
   * ============================
   */

  return {
    invoice: {
      rentalId: rental.id,

      invoiceNumber,

      issuedAt: new Date(),

      status: rental.status,
    },

    customer: rental.customer,

    rental: {
      id: rental.id,

      startDate:
        rental.startDate,

      endDate:
        rental.endDate,

      actualPickupAt:
        rental.actualPickupAt,

      actualReturnAt:
        rental.actualReturnAt,

      status:
        rental.status,
    },

    items,

    charges: {
      subtotal,

      discount,

      tax,

      lateFee,

      damageCharges,

      totalAmount,
    },

    securityDeposit,

    payments: {
      transactions:
        payments,

      totalPaid,

      balanceDue,
    },

    pickup,

    return: returnData,

    damageReports,

    summary: {
      subtotal,

      discount,

      tax,

      lateFee,

      damageCharges,

      totalAmount,

      securityDeposit:
        securityDeposit?.amount ?? 0,

      totalPaid,

      balanceDue,

      refundAmount:
        Number(
          rental.refundAmount,
        ),
    },
  };
};