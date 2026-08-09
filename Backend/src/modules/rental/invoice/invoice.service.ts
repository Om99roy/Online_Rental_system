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
          username: true,
          email: true,
          firstName: true,
          lastName: true,
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

      // IMPORTANT:
      // Your Prisma relation is called "deposit"
      deposit: true,

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

      // Your schema already contains Invoice
      invoice: true,

      organization: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          logoUrl: true,
          currency: true,
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

  // ============================================================
  // RENTAL ITEMS
  // ============================================================

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

  // ============================================================
  // RENTAL CHARGES
  // ============================================================

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

  // ============================================================
  // SECURITY DEPOSIT
  // ============================================================

  const securityDeposit =
    rental.deposit
      ? {
          id: rental.deposit.id,

          amount: Number(
            rental.deposit.amount,
          ),

          deductedAmount: Number(
            rental.deposit.deductedAmount,
          ),

          refundedAmount: Number(
            rental.deposit.refundedAmount,
          ),

          status:
            rental.deposit.status,

          collectedAt:
            rental.deposit.collectedAt,

          settledAt:
            rental.deposit.settledAt,

          notes:
            rental.deposit.notes,

        }
      : null;

  // ============================================================
  // PAYMENTS
  // ============================================================

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

  // ============================================================
  // DAMAGE REPORTS
  // ============================================================

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

        updatedAt:
          report.updatedAt,
      }),
    ) ?? [];

  const damageCharges =
    damageReports.reduce(
      (total, report) =>
        total + report.repairCost,
      0,
    );

  // ============================================================
  // PICKUP
  // ============================================================

  const pickup = rental.pickup
    ? {
        id: rental.pickup.id,

        scheduledAt:
          rental.pickup.scheduledAt,

        status:
          rental.pickup.status,

        confirmedAt:
          rental.pickup.confirmedAt,

        notes:
          rental.pickup.notes,

        createdAt:
          rental.pickup.createdAt,
      }
    : null;

  // ============================================================
  // RETURN
  // ============================================================

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

        lateFee: Number(
          rental.return.lateFee,
        ),

        notes:
          rental.return.notes,

        createdAt:
          rental.return.createdAt,

        updatedAt:
          rental.return.updatedAt,
      }
    : null;

  // ============================================================
  // INVOICE
  // ============================================================

  const invoice = rental.invoice
    ? {
        id: rental.invoice.id,

        invoiceNumber:
          rental.invoice.invoiceNumber,

        subtotal: Number(
          rental.invoice.subtotal,
        ),

        tax: Number(
          rental.invoice.tax,
        ),

        discount: Number(
          rental.invoice.discount,
        ),

        total: Number(
          rental.invoice.total,
        ),

        status:
          rental.invoice.status,

        issuedAt:
          rental.invoice.issuedAt,

        dueAt:
          rental.invoice.dueAt,

        createdAt:
          rental.invoice.createdAt,

        updatedAt:
          rental.invoice.updatedAt,
      }
    : null;

  // ============================================================
  // FINAL INVOICE RESPONSE
  // ============================================================

  return {
    invoice,

    organization:
      rental.organization,

    customer:
      rental.customer,

    rental: {
      id: rental.id,

      rentalNumber:
        rental.rentalNumber,

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

      notes:
        rental.notes,
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

      deductedDeposit:
        securityDeposit
          ?.deductedAmount ?? 0,

      refundedDeposit:
        securityDeposit
          ?.refundedAmount ?? 0,

      totalPaid,

      balanceDue,

      refundAmount:
        Number(
          rental.refundAmount,
        ),
    },
  };
};