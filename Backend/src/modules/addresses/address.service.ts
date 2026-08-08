import prisma from "../../config/prisma.ts";
import { AppError } from "../../utils/error.ts";
import type { AddressInput } from "./address.validation.ts";

export const listAddresses = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const createAddress = async (userId: string, data: AddressInput) => {
  const existingCount = await prisma.address.count({ where: { userId } });
  return prisma.address.create({
    data: { ...data, userId, isDefault: existingCount === 0 },
  });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new AppError("Address not found.", 404);
  await prisma.address.delete({ where: { id: addressId } });
};

export const setDefaultAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!address) throw new AppError("Address not found.", 404);

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    }),
  ]);
};
