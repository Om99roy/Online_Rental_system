import prisma from "../../../config/prisma.ts";
import { AppError } from "../../../utils/error.ts";

interface CreateDamageReportData {
  returnId: string;
  productId: string;
  type:
    | "DAMAGE"
    | "MISSING_ACCESSORY"
    | "LOSS"
    | "REPAIR";
  description?: string;
  repairCost?: number;
}

interface UpdateDamageReportData {
  type?:
    | "DAMAGE"
    | "MISSING_ACCESSORY"
    | "LOSS"
    | "REPAIR";
  description?: string;
  repairCost?: number;
  resolved?: boolean;
}

/**
 * Creates a damage report.
 */
export const createDamageReportService = async (
  data: CreateDamageReportData,
) => {
  if (!data.returnId) {
    throw new AppError(
      "Return ID is required.",
      400,
    );
  }

  if (!data.productId) {
    throw new AppError(
      "Product ID is required.",
      400,
    );
  }

  const repairCost =
    data.repairCost ?? 0;

  if (repairCost < 0) {
    throw new AppError(
      "Repair cost cannot be negative.",
      400,
    );
  }

  const returnRecord =
    await prisma.return.findUnique({
      where: {
        id: data.returnId,
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
    returnRecord.status === "CANCELLED"
  ) {
    throw new AppError(
      "Cannot create a damage report for a cancelled return.",
      400,
    );
  }

  const product = await prisma.product.findUnique({
    where: {
      id: data.productId,
    },
  });

  if (!product) {
    throw new AppError(
      "Product not found.",
      404,
    );
  }

  if (
    product.organizationId !==
    returnRecord.rental.organizationId
  ) {
    throw new AppError(
      "Product does not belong to this organization.",
      403,
    );
  }

  /*
   * Make sure the product was actually rented
   * in this rental.
   */
  const rentalItem =
    await prisma.rentalItem.findFirst({
      where: {
        rentalId:
          returnRecord.rentalId,
        productId: data.productId,
      },
    });

  if (!rentalItem) {
    throw new AppError(
      "This product does not belong to the rental.",
      400,
    );
  }

  return prisma.damageReport.create({
    data: {
      returnId: data.returnId,
      productId: data.productId,
      type: data.type,
      description:
        data.description,
      repairCost,
      resolved: false,
    },
    include: {
      product: true,
      return: true,
    },
  });
};

/**
 * Gets all damage reports for a return.
 */
export const getDamageReportsByReturnService =
  async (
    returnId: string,
  ) => {
    const returnRecord =
      await prisma.return.findUnique({
        where: {
          id: returnId,
        },
      });

    if (!returnRecord) {
      throw new AppError(
        "Return not found.",
        404,
      );
    }

    return prisma.damageReport.findMany({
      where: {
        returnId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  };

/**
 * Gets a single damage report.
 */
export const getDamageReportService = async (
  id: string,
) => {
  const report =
    await prisma.damageReport.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
        return: {
          include: {
            rental: true,
          },
        },
      },
    });

  if (!report) {
    throw new AppError(
      "Damage report not found.",
      404,
    );
  }

  return report;
};

/**
 * Updates a damage report.
 */
export const updateDamageReportService =
  async (
    id: string,
    data: UpdateDamageReportData,
  ) => {
    const report =
      await prisma.damageReport.findUnique({
        where: {
          id,
        },
      });

    if (!report) {
      throw new AppError(
        "Damage report not found.",
        404,
      );
    }

    if (
      report.resolved &&
      data.resolved !== false
    ) {
      throw new AppError(
        "A resolved damage report cannot be modified.",
        400,
      );
    }

    if (
      data.repairCost !== undefined &&
      data.repairCost < 0
    ) {
      throw new AppError(
        "Repair cost cannot be negative.",
        400,
      );
    }

    return prisma.damageReport.update({
      where: {
        id,
      },
      data: {
        type: data.type,
        description:
          data.description,
        repairCost:
          data.repairCost,
        resolved:
          data.resolved,
      },
      include: {
        product: true,
      },
    });
  };

/**
 * Marks a damage report as resolved.
 */
export const resolveDamageReportService =
  async (
    id: string,
  ) => {
    const report =
      await prisma.damageReport.findUnique({
        where: {
          id,
        },
      });

    if (!report) {
      throw new AppError(
        "Damage report not found.",
        404,
      );
    }

    if (report.resolved) {
      throw new AppError(
        "Damage report is already resolved.",
        400,
      );
    }

    return prisma.damageReport.update({
      where: {
        id,
      },
      data: {
        resolved: true,
      },
      include: {
        product: true,
      },
    });
  };

/**
 * Deletes a damage report.
 */
export const deleteDamageReportService =
  async (
    id: string,
  ) => {
    const report =
      await prisma.damageReport.findUnique({
        where: {
          id,
        },
      });

    if (!report) {
      throw new AppError(
        "Damage report not found.",
        404,
      );
    }

    if (report.resolved) {
      throw new AppError(
        "A resolved damage report cannot be deleted.",
        400,
      );
    }

    await prisma.damageReport.delete({
      where: {
        id,
      },
    });
  };