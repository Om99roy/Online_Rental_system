import { prisma } from "../../../../prisma/client";

export const addRentalItem = async (
  rentalId: string,
  productId: string,
  quantity: number
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const priceItem =
    await prisma.priceListItem.findFirst({
      where: {
        productId,
        priceList: {
          isDefault: true,
        },
      },
    });

  if (!priceItem) {
    throw new Error("Product price not configured");
  }

  const subtotal =
    Number(priceItem.price) * quantity;

  return prisma.rentalItem.create({
    data: {
      rentalId,
      productId,
      quantity,
      pricePerUnit: priceItem.price,
      subtotal,
    },
  });
};