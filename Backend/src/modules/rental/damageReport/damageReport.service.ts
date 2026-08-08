import { prisma } from "../../../../prisma/client";

export const createDamageReport = async (data: {
  returnId: string;
  productId: string;

  type:
    | "DAMAGE"
    | "MISSING_ACCESSORY"
    | "LOSS"
    | "REPAIR";

  description?: string;

  repairCost: number;
}) => {
  return prisma.damageReport.create({
    data: {
      returnId: data.returnId,
      productId: data.productId,

      type: data.type,

      description: data.description,

      repairCost: data.repairCost,
    },
  });
};