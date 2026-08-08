import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, type DeepMockProxy } from "jest-mock-extended";
import prisma from "../config/prisma.ts";

jest.mock("../config/prisma.ts", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
