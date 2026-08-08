import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import bcrypt from "bcrypt";
import prisma from "../../../config/prisma";
import { PrismaClient } from "@prisma/client";
import { mockDeep, type DeepMockProxy } from "jest-mock-extended";
import { type User, Role, AccountStatus } from "@prisma/client";
import {
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  loginUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getProfile,
  logoutUser,
} from "../auth.service";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";
import { generateOtp, generateToken, hashToken } from "../../../utils/token";
import { queueEmail } from "../../email/email.producer";
import { AppError } from "../../../utils/error.ts";

jest.mock("../../../config/prisma", () => {
  const { mockDeep } = require("jest-mock-extended")
  return {
  __esModule: true,
  default: mockDeep(),
  }
});
jest.mock("bcrypt");
jest.mock("../../../utils/jwt", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));
jest.mock("../../../utils/token", () => ({
  generateOtp: jest.fn(),
  generateToken: jest.fn(),
  hashToken: jest.fn(),
}));
jest.mock("../../email/email.producer", () => ({
  queueEmail: jest.fn(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

const hashMock = bcrypt.hash as unknown as jest.Mock<
  (data: string, saltRounds: number) => Promise<string>
>;
const compareMock = bcrypt.compare as unknown as jest.Mock<
  (password: string, hash: string) => Promise<boolean>
>;
const accessTokenMock = generateAccessToken as unknown as jest.Mock<
  (...args: any[]) => string
>;
const refreshTokenMock = generateRefreshToken as unknown as jest.Mock<
  (...args: any[]) => string
>;
const generateOtpMock = generateOtp as unknown as jest.Mock<() => string>;
const generateTokenMock = generateToken as unknown as jest.Mock<() => string>;
const hashTokenMock = hashToken as unknown as jest.Mock<
  (input: string) => string
>;
const queueEmailMock = queueEmail as unknown as jest.Mock<
  (payload: any) => Promise<void>
>;

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: "1",
  username: "user123",
  email: "test@example.com",
  password: "hashed-password",
  role: Role.USER,
  status: AccountStatus.ACTIVE,
  emailVerified: true,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  hashTokenMock.mockImplementation((input: string) => `hashed-${input}`);
  generateOtpMock.mockReturnValue("123456");
  generateTokenMock.mockReturnValue("raw-reset-token");
});

describe("registerUser", () => {
  const registerInput = {
    username: "newuser",
    email: "new@example.com",
    password: "plainPassword123",
  };

  const createdUser = {
    id: "2",
    username: "newuser",
    email: "new@example.com",
    role: Role.USER,
    status: AccountStatus.ACTIVE,
    emailVerified: false,
    createdAt: new Date(),
  };

  it("registers a new user, hashes the password, and queues a verification email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null); 
    prismaMock.user.findUnique.mockResolvedValueOnce(null); 
    prismaMock.user.findUnique.mockResolvedValueOnce(null); 
    hashMock.mockResolvedValue("hashed-plainPassword123");
    prismaMock.user.create.mockResolvedValue(createdUser as User);

    const result = await registerUser(registerInput as any);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: "newuser" },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "new@example.com" },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith("plainPassword123", 12);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "newuser",
          email: "new@example.com",
          password: "hashed-plainPassword123",
        }),
      })
    );
    expect(result).toEqual(createdUser);
  });

  it("throws when the username is already taken", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(buildUser());

    await expect(registerUser(registerInput as any)).rejects.toThrow(
      "Username already exists."
    );

    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it("throws when the email is already taken", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null); 
    prismaMock.user.findUnique.mockResolvedValueOnce(buildUser()); 

    await expect(registerUser(registerInput as any)).rejects.toThrow(
      "Email already exists."
    );

    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it("stores a hashed OTP but emails the plaintext OTP", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    hashMock.mockResolvedValue("hashed-plainPassword123");
    prismaMock.user.create.mockResolvedValue(createdUser as User);
    generateOtpMock.mockReturnValue("999999");

    await registerUser(registerInput as any);

    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: "hashed-999999",
          userId: createdUser.id,
        }),
      })
    );
    expect(queueEmail).toHaveBeenCalledWith({
      type: "VERIFY_EMAIL",
      email: createdUser.email,
      otp: "999999",
    });
  });
});

describe("verifyEmail", () => {
  it("verifies the email when the OTP is valid", async () => {
    const user = buildUser({ emailVerified: false });
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue({
      id: "tok1",
      token: "hashed-123456",
      userId: user.id,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    } as any);

    await verifyEmail("test@example.com", "123456");

    expect(prismaMock.emailVerificationToken.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: user.id,
          token: "hashed-123456",
        }),
      })
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { emailVerified: true },
    });
    expect(prismaMock.emailVerificationToken.deleteMany).toHaveBeenCalledWith(
      { where: { userId: user.id } }
    );
  });

  it("throws when no user matches the email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(verifyEmail("nobody@example.com", "123456")).rejects.toThrow(
      "Invalid verification request."
    );
  });

  it("throws when the email is already verified", async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      buildUser({ emailVerified: true })
    );

    await expect(verifyEmail("test@example.com", "123456")).rejects.toThrow(
      "Email is already verified."
    );
  });

  it("throws when the OTP is invalid or expired", async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      buildUser({ emailVerified: false })
    );
    prismaMock.emailVerificationToken.findFirst.mockResolvedValue(null);

    await expect(verifyEmail("test@example.com", "000000")).rejects.toThrow(
      "Invalid or expired OTP."
    );

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});


describe("resendVerificationEmail", () => {
  it("deletes old tokens, creates a new one, and queues an email", async () => {
    const user = buildUser({ emailVerified: false });
    prismaMock.user.findUnique.mockResolvedValue(user);
    generateOtpMock.mockReturnValue("654321");

    await resendVerificationEmail("test@example.com");

    expect(prismaMock.emailVerificationToken.deleteMany).toHaveBeenCalledWith(
      { where: { userId: user.id } }
    );
    expect(prismaMock.emailVerificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: "hashed-654321",
          userId: user.id,
        }),
      })
    );
    expect(queueEmail).toHaveBeenCalledWith({
      type: "VERIFY_EMAIL",
      email: user.email,
      otp: "654321",
    });
  });

  it("throws when no account matches the email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      resendVerificationEmail("nobody@example.com")
    ).rejects.toThrow("No account found with this email.");
  });

  it("throws when the email is already verified", async () => {
    prismaMock.user.findUnique.mockResolvedValue(
      buildUser({ emailVerified: true })
    );

    await expect(
      resendVerificationEmail("test@example.com")
    ).rejects.toThrow("Email is already verified.");

    expect(prismaMock.emailVerificationToken.deleteMany).not.toHaveBeenCalled();
  });
});

describe("loginUser", () => {
  it("logs in a valid user and returns tokens", async () => {
    const user = buildUser();

    prismaMock.user.findUnique.mockResolvedValue(user);
    compareMock.mockResolvedValue(true);
    prismaMock.user.update.mockResolvedValue({
      ...user,
      lastLoginAt: new Date(),
    });
    accessTokenMock.mockReturnValue("access-token");
    refreshTokenMock.mockReturnValue("refresh-token");

    const result = await loginUser({
      email: "test@example.com",
      password: "password123",
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "password123",
      "hashed-password"
    );
    expect(prismaMock.user.update).toHaveBeenCalled();
    expect(prismaMock.refreshToken.create).toHaveBeenCalled();
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
    expect(result.user.email).toBe("test@example.com");
  });

  it("does not leak the password hash in the returned user object", async () => {
    const user = buildUser();

    prismaMock.user.findUnique.mockResolvedValue(user);
    compareMock.mockResolvedValue(true);
    prismaMock.user.update.mockResolvedValue({
      ...user,
      lastLoginAt: new Date(),
    });
    accessTokenMock.mockReturnValue("access-token");
    refreshTokenMock.mockReturnValue("refresh-token");

    const result = await loginUser({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.user).not.toHaveProperty("password");
  });

  it("throws 'Invalid credentials.' when no user is found for the email", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      loginUser({ email: "nobody@example.com", password: "password123" })
    ).rejects.toMatchObject({message: "Invalid credentials.", status: 401});

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("throws 'Invalid credentials.' when the password does not match", async () => {
    const user = buildUser();
    prismaMock.user.findUnique.mockResolvedValue(user);
    compareMock.mockResolvedValue(false);

    await expect(
      loginUser({ email: "test@example.com", password: "wrong-password" })
    ).rejects.toMatchObject({message: "Invalid credentials.", status: 401});

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it.each([
    AccountStatus.INACTIVE,
    AccountStatus.SUSPENDED,
    AccountStatus.DELETED,
  ])("throws when account status is %s", async (status) => {
    const user = buildUser({ status });
    prismaMock.user.findUnique.mockResolvedValue(user);
    compareMock.mockResolvedValue(true);

    await expect(
      loginUser({ email: "test@example.com", password: "password123" })
    ).rejects.toThrow("This account is not active. Contact support.");

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("throws when the email is not verified", async () => {
    const user = buildUser({ emailVerified: false });
    prismaMock.user.findUnique.mockResolvedValue(user);
    compareMock.mockResolvedValue(true);

    await expect(
      loginUser({ email: "test@example.com", password: "password123" })
    ).rejects.toThrow("Please verify your email before logging in.");

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("checks account status before checking email verification", async () => {
    const user = buildUser({
      status: AccountStatus.SUSPENDED,
      emailVerified: false,
    });
    prismaMock.user.findUnique.mockResolvedValue(user);
    compareMock.mockResolvedValue(true);

    await expect(
      loginUser({ email: "test@example.com", password: "password123" })
    ).rejects.toThrow("This account is not active. Contact support.");
  });

  it("sets refreshToken expiry to 7 days from now", async () => {
    const user = buildUser();
    prismaMock.user.findUnique.mockResolvedValue(user);
    compareMock.mockResolvedValue(true);
    prismaMock.user.update.mockResolvedValue({
      ...user,
      lastLoginAt: new Date(),
    });
    accessTokenMock.mockReturnValue("access-token");
    refreshTokenMock.mockReturnValue("refresh-token");

    const before = new Date();
    await loginUser({ email: "test@example.com", password: "password123" });
    const after = new Date();

    const createCall = prismaMock.refreshToken.create.mock.calls[0]![0];
    const expiresAt = (createCall as any).data.expiresAt as Date;

    const minExpected = new Date(before);
    minExpected.setDate(minExpected.getDate() + 7);
    const maxExpected = new Date(after);
    maxExpected.setDate(maxExpected.getDate() + 7);

    expect(expiresAt.getTime()).toBeGreaterThanOrEqual(minExpected.getTime());
    expect(expiresAt.getTime()).toBeLessThanOrEqual(maxExpected.getTime());
  });
});

describe("refreshAccessToken", () => {
  it("returns a new access token for a valid, unexpired refresh token", async () => {
    const user = buildUser();
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt1",
      token: "valid-refresh-token",
      userId: user.id,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    } as any);
    prismaMock.user.findUnique.mockResolvedValue(user);
    accessTokenMock.mockReturnValue("new-access-token");

    const result = await refreshAccessToken("valid-refresh-token");

    expect(generateAccessToken).toHaveBeenCalledWith({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    expect(result).toBe("new-access-token");
  });

  it("throws when the refresh token does not exist", async () => {
    prismaMock.refreshToken.findUnique.mockResolvedValue(null);

    await expect(refreshAccessToken("nonexistent-token")).rejects.toThrow(
      "Invalid or expired refresh token."
    );
  });

  it("throws when the refresh token is expired", async () => {
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt1",
      token: "expired-token",
      userId: "1",
      expiresAt: new Date(Date.now() - 60_000),
      createdAt: new Date(),
    } as any);

    await expect(refreshAccessToken("expired-token")).rejects.toThrow(
      "Invalid or expired refresh token."
    );
  });

  it("throws when the token is valid but the user no longer exists", async () => {
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      id: "rt1",
      token: "valid-token",
      userId: "deleted-user-id",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
    } as any);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(refreshAccessToken("valid-token")).rejects.toThrow(
      "User not found."
    );
  });
});

describe("forgotPassword", () => {
  const originalFrontendUrl = process.env.FRONTEND_URL;

  beforeEach(() => {
    process.env.FRONTEND_URL = "https://example.com";
  });

  afterAll(() => {
    process.env.FRONTEND_URL = originalFrontendUrl;
  });

  it("creates a reset token and emails a link containing the plaintext token", async () => {
    const user = buildUser();
    prismaMock.user.findUnique.mockResolvedValue(user);
    generateTokenMock.mockReturnValue("plaintext-reset-token");

    await forgotPassword("test@example.com");

    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token: "hashed-plaintext-reset-token",
          userId: user.id,
        }),
      })
    );
    expect(queueEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "RESET_PASSWORD",
        email: user.email,
        resetUrl:
          "https://example.com/reset-password?token=plaintext-reset-token",
      })
    );
  });

  it("silently resolves without creating a token or sending an email when the user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      forgotPassword("nobody@example.com")
    ).resolves.toBeUndefined();

    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    expect(queueEmail).not.toHaveBeenCalled();
  });
});

describe("resetPassword", () => {
  it("resets the password, marks the token used, and revokes existing sessions", async () => {
    const record = {
      id: "prt1",
      token: "hashed-raw-token",
      userId: "1",
      expiresAt: new Date(Date.now() + 60_000),
      used: false,
      createdAt: new Date(),
    };
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(record as any);
    hashMock.mockResolvedValue("hashed-new-password");

    await resetPassword("raw-token", "newPassword123");

    expect(prismaMock.passwordResetToken.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          token: "hashed-raw-token",
          used: false,
        }),
      })
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("newPassword123", 12);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: record.userId },
      data: { password: "hashed-new-password" },
    });
    expect(prismaMock.passwordResetToken.update).toHaveBeenCalledWith({
      where: { id: record.id },
      data: { used: true },
    });
    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: record.userId },
    });
  });

  it("throws when the reset token is invalid, used, or expired", async () => {
    prismaMock.passwordResetToken.findFirst.mockResolvedValue(null);

    await expect(
      resetPassword("bad-token", "newPassword123")
    ).rejects.toThrow("Invalid or expired reset token.");

    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(prismaMock.refreshToken.deleteMany).not.toHaveBeenCalled();
  });
});

describe("getProfile", () => {
  it("returns the user's profile fields", async () => {
    const profile = {
      id: "1",
      username: "user123",
      email: "test@example.com",
      role: Role.USER,
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
    };
    prismaMock.user.findUnique.mockResolvedValue(profile as User);

    const result = await getProfile("1");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "1" } })
    );
    expect(result).toEqual(profile);
  });

  it("returns null without throwing when the user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(getProfile("nonexistent-id")).resolves.toBeNull();
  });
});

describe("logoutUser", () => {
  it("deletes the given refresh token", async () => {
    await logoutUser("some-refresh-token");

    expect(prismaMock.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { token: "some-refresh-token" },
    });
  });

  it("resolves without throwing even if the token does not exist", async () => {
    prismaMock.refreshToken.deleteMany.mockResolvedValue({ count: 0 });

    await expect(logoutUser("nonexistent-token")).resolves.toBeUndefined();
  });
});
