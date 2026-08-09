import prisma from "../config/prisma.ts";
import { AppError } from "./error.ts";

export const getDefaultOrganizationId = async (): Promise<string> => {
  const org = await prisma.organization.findFirst({ select: { id: true } });
  if (!org) {
    throw new AppError("No organization configured. Run the seed script.", 500);
  }
  return org.id;
};
