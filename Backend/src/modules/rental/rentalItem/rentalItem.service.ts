
import prisma from "../../../config/prisma.ts";
import { AppError } from "../../../utils/error.ts";

interface CreateRentalItemData {
  rentalId: string;
  productId: string;
  quantity?: number;
}

interface UpdateRentalItemData {
  quantity?: number;
}

/**
 * Recalculates the subtotal and total amount of a rental
 * based on all of its rental items.
 */
const recalculateRentalTotal = async (rentalId: string) => {
  const items = await prisma.rentalItem.findMany({
    where: {
      rentalId,
    },
  });

  const subtotal = items.reduce(
    (total, item) =>
      total + Number(item.subtotal),
    0,
  );

  const rental = await prisma.rental.findUnique({
    where: {
      id: rentalId,
    },
  });

  if (!rental) {
    throw new AppError("Rental not found.", 404);
  }

  const discount = Number(rental.discount);
  const tax = Number(rental.tax);

  const totalAmount =
    subtotal - discount + tax;

  await prisma.rental.update({
    where: {
      id: rentalId,
    },
    data: {
      subtotal,
      totalAmount,
    },
  });
};

/**
 * Creates a rental item.
 */
export const createRentalItemService = async (
  data: CreateRentalItemData,
) => {
  if (!data.rentalId || !data.productId) {
    throw new AppError(
      "Rental ID and product ID are required.",
      400,
    );
  }

  const quantity = data.quantity ?? 1;

  if (quantity <= 0) {
    throw new AppError(
      "Quantity must be greater than zero.",
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
    rental.status === "CANCELLED" ||
    rental.status === "COMPLETED" ||
    rental.status === "RETURNED"
  ) {
    throw new AppError(
      "Items cannot be added to this rental.",
      400,
    );
  }

  const product = await prisma.product.findUnique({
    where: {
      id: data.productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  if (product.organizationId !== rental.organizationId) {
    throw new AppError(
      "Product does not belong to this organization.",
      403,
    );
  }

  if (product.status !== "ACTIVE") {
    throw new AppError(
      "Product is not available for rental.",
      400,
    );
  }

  if (product.stock < quantity) {
    throw new AppError(
      `Only ${product.stock} unit(s) of this product are available.`,
      400,
    );
  }

  /*
   * Use the organization's default active price list.
   *
   * We prefer a price list item without a rentalPeriodId
   * because Rental currently does not store rentalPeriodId.
   */
  const priceListItem =
    await prisma.priceListItem.findFirst({
      where: {
        productId: data.productId,
        rentalPeriodId: null,
        priceList: {
          organizationId: rental.organizationId,
          isDefault: true,
          active: true,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (!priceListItem) {
    throw new AppError(
      "No default rental price is configured for this product.",
      400,
    );
  }

  const pricePerUnit =
    Number(priceListItem.price);

  const subtotal =
    pricePerUnit * quantity;

  const rentalItem =
    await prisma.rentalItem.create({
      data: {
        rentalId: data.rentalId,
        productId: data.productId,
        quantity,
        pricePerUnit,
        subtotal,
      },
      include: {
        product: true,
      },
    });

  await recalculateRentalTotal(
    data.rentalId,
  );

  return rentalItem;
};

/**
 * Gets all items belonging to a rental.
 */
export const getRentalItemsService = async (
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

  return prisma.rentalItem.findMany({
    where: {
      rentalId,
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

/**
 * Gets a single rental item.
 */
export const getRentalItemService = async (
  id: string,
) => {
  const rentalItem =
    await prisma.rentalItem.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
        rental: true,
      },
    });

  if (!rentalItem) {
    throw new AppError(
      "Rental item not found.",
      404,
    );
  }

  return rentalItem;
};

/**
 * Updates rental item quantity and recalculates subtotal.
 */
export const updateRentalItemService = async (
  id: string,
  data: UpdateRentalItemData,
) => {
  if (
    data.quantity === undefined ||
    data.quantity <= 0
  ) {
    throw new AppError(
      "Quantity must be greater than zero.",
      400,
    );
  }

  const rentalItem =
    await prisma.rentalItem.findUnique({
      where: {
        id,
      },
      include: {
        rental: true,
      },
    });

  if (!rentalItem) {
    throw new AppError(
      "Rental item not found.",
      404,
    );
  }

  if (
    rentalItem.rental.status === "CANCELLED" ||
    rentalItem.rental.status === "COMPLETED" ||
    rentalItem.rental.status === "RETURNED"
  ) {
    throw new AppError(
      "This rental can no longer be modified.",
      400,
    );
  }

  const product = await prisma.product.findUnique({
    where: {
      id: rentalItem.productId,
    },
  });

  if (!product) {
    throw new AppError("Product not found.", 404);
  }

  if (product.stock < data.quantity) {
    throw new AppError(
      `Only ${product.stock} unit(s) are available.`,
      400,
    );
  }

  const subtotal =
    Number(rentalItem.pricePerUnit) *
    data.quantity;

  const updatedItem =
    await prisma.rentalItem.update({
      where: {
        id,
      },
      data: {
        quantity: data.quantity,
        subtotal,
      },
      include: {
        product: true,
      },
    });

  await recalculateRentalTotal(
    rentalItem.rentalId,
  );

  return updatedItem;
};

/**
 * Deletes a rental item and recalculates the rental.
 */
export const deleteRentalItemService = async (
  id: string,
) => {
  const rentalItem =
    await prisma.rentalItem.findUnique({
      where: {
        id,
      },
    });

  if (!rentalItem) {
    throw new AppError(
      "Rental item not found.",
      404,
    );
  }

  const rental = await prisma.rental.findUnique({
    where: {
      id: rentalItem.rentalId,
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
      "This rental can no longer be modified.",
      400,
    );
  }

  await prisma.rentalItem.delete({
    where: {
      id,
    },
  });

  await recalculateRentalTotal(
    rentalItem.rentalId,
  );
};
