import { prisma } from "../../../prisma/client";

interface CreateRentalInput {
  organizationId: string;
  customerId: string;
  startDate: Date;
  endDate: Date;
  pickupMethod: "DELIVERY" | "STORE_PICKUP";
  deliveryAddressId?: string;
  notes?: string;

  items: {
    productId: string;
    quantity: number;
  }[];
}

export const createRental = async (data: CreateRentalInput) => {
  const rentalNumber = `RNT-${Date.now()}`;

  let subtotal = 0;

  const rentalItems = [];

  for (const item of data.items) {
    const product = await prisma.product.findUnique({
      where: {
        id: item.productId,
      },
    });

    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    const priceList = await prisma.priceList.findFirst({
      where: {
        organizationId: data.organizationId,
        isDefault: true,
        active: true,
      },
    });

    if (!priceList) {
      throw new Error("Default price list not found");
    }

    const priceListItem =
      await prisma.priceListItem.findFirst({
        where: {
          priceListId: priceList.id,
          productId: item.productId,
        },
      });

    if (!priceListItem) {
      throw new Error(
        `Price not configured for ${product.name}`
      );
    }

    const itemSubtotal =
      Number(priceListItem.price) * item.quantity;

    subtotal += itemSubtotal;

    rentalItems.push({
      productId: item.productId,
      quantity: item.quantity,
      pricePerUnit: priceListItem.price,
      subtotal: itemSubtotal,
    });
  }

  const securityDeposit = data.items.reduce(
    async (totalPromise, item) => {
      const total = await totalPromise;

      const product = await prisma.product.findUnique({
        where: {
          id: item.productId,
        },
      });

      return total + Number(product?.securityDeposit ?? 0) * item.quantity;
    },
    Promise.resolve(0)
  );

  const deposit = await securityDeposit;

  const totalAmount = subtotal;

  return prisma.rental.create({
    data: {
      rentalNumber,

      organizationId: data.organizationId,
      customerId: data.customerId,

      startDate: data.startDate,
      endDate: data.endDate,

      pickupMethod: data.pickupMethod,

      deliveryAddressId: data.deliveryAddressId,

      subtotal,
      totalAmount,

      securityDeposit: deposit,

      notes: data.notes,

      items: {
        create: rentalItems,
      },

      deposit: {
        create: {
          amount: deposit,
        },
      },

      pickup: {
        create: {
          status: "SCHEDULED",
        },
      },
    },

    include: {
      items: true,
      deposit: true,
      pickup: true,
    },
  });
};