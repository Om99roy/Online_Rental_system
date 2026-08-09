import type { Request, Response, NextFunction } from "express";
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
} from "./auth.service.ts";
import { updateProfile, updateAvatar } from "./auth.service.ts";
import { AppError } from "../../utils/error.ts";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const updateProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);
    const user = await updateProfile(req.user.id, req.body);
    res
      .status(200)
      .json({ success: true, message: "Profile updated.", data: user });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatarHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);
    if (!req.file) throw new AppError("No image file provided.", 400);
    const imageUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await updateAvatar(req.user.id, imageUrl);
    res
      .status(200)
      .json({ success: true, message: "Avatar updated.", data: user });
  } catch (error) {
    next(error);
  }
};
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message:
        "Registration successful. Check your email for a verification code.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;
    await verifyEmail(email, otp);
    res
      .status(200)
      .json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    await resendVerificationEmail(email);
    res
      .status(200)
      .json({ success: true, message: "Verification code resent." });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: { user, accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      throw new AppError("No refresh token provided.", 401);
    }
    const accessToken = await refreshAccessToken(token);
    res.status(200).json({ success: true, data: { accessToken } });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    await forgotPassword(email);
    res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);
    res
      .status(200)
      .json({ success: true, message: "Password reset successful." });
  } catch (error) {
    next(error);
  }
};

export const profile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);
    const userId = req.user.id;
    const user = await getProfile(userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await logoutUser(token);
    }
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
