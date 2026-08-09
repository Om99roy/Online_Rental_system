import bcrypt from "bcrypt";
import prisma from "../../config/prisma.ts";
import { generateOtp, generateToken, hashToken } from "../../utils/token.ts";
import type { RegisterInput, LoginInput } from "../auth/auth.validation.ts";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.ts";
import { queueEmail } from "../email/email.producer.ts";
import { AppError } from "../../utils/error.ts";

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_IN_MINUTES ?? 10);
const RESET_EXPIRY_MINUTES = Number(process.env.OTP_RESET_IN_MINUTES ?? 15);

export const registerUser = async (data: RegisterInput) => {
  const usernameExists = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (usernameExists) {
    throw new AppError("Username already exists.", 409);
  }

  const emailExists = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (emailExists) {
    throw new AppError("Email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      profileImageUrl: true,
      role: true,
      status: true,
      organizationId: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: {
      token: hashToken(otp),
      userId: user.id,
      expiresAt,
    },
  });

  await queueEmail({
	  type: "VERIFY_EMAIL",email: user.email, otp
  });

  return user;
};

export const verifyEmail = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid verification request.", 404);
  }
  if (user.emailVerified) {
    throw new AppError("Email is already verified.", 400);
  }

  const hashedOtp = hashToken(otp);

  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: user.id,
      token: hashedOtp,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new AppError("Invalid or expired OTP.", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true },
  });

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  });
};

export const resendVerificationEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("No account found with this email.", 404);
  }
  if (user.emailVerified) {
    throw new AppError("Email is already verified.", 400);
  }
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: {
      token: hashToken(otp),
      userId: user.id,
      expiresAt,
    },
  });

  await queueEmail({
    type: "VERIFY_EMAIL",
    email: user.email,
    otp,
   }); 
};

export const loginUser = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user) {
    throw new AppError("Invalid credentials.", 401);
  }

  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword) {
    throw new AppError("Invalid credentials.", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("This account is not active. Contact support.", 403);
  }

  if (!user.emailVerified) {
    throw new AppError("Please verify your email before logging in.", 403);
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const payload = {
    id: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    organizationId: updatedUser.organizationId
  };

  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: updatedUser.id,
      expiresAt,
    },
  });

  const safeUser = {
    id: updatedUser.id,
    username: updatedUser.username,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    phone: updatedUser.phone,
    profileImageUrl: updatedUser.profileImageUrl,
    role: updatedUser.role,
    status: updatedUser.status,
    organizationId: updatedUser.organizationId,
    emailVerified: updatedUser.emailVerified,
    lastLoginAt: updatedUser.lastLoginAt,
    createdAt: updatedUser.createdAt,
  };

  return { user: safeUser, accessToken, refreshToken };
};

export const refreshAccessToken = async (token: string) => {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const payload = { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId };
  const accessToken = await generateAccessToken(payload);

  return accessToken;
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      token: hashToken(token),
      userId: user.id,
      expiresAt,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  await queueEmail({
  type: "RESET_PASSWORD",
  email: user.email,
  resetUrl,
  });
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedIncoming = hashToken(token);

  const record = await prisma.passwordResetToken.findFirst({
    where: {
      token: hashedIncoming,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    throw new AppError("Invalid or expired reset token.", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: record.userId },
    data: { password: hashedPassword },
  });

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { used: true },
  });

  await prisma.refreshToken.deleteMany({ where: { userId: record.userId } });
};

export const getProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      profileImageUrl: true,
      role: true,
      status: true,
      organizationId: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
};

export const logoutUser = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

export const updateProfile = async (
  userId: string,
  data: { firstName?: string; lastName?: string; username?: string; phone?: string }
) => {
  if (data.username) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing && existing.id !== userId) {
      throw new AppError("Username already taken.", 409);
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      profileImageUrl: true,
      role: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
};

export const updateAvatar = async (userId: string, imageUrl: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { profileImageUrl: imageUrl },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      profileImageUrl: true,
      role: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
};

