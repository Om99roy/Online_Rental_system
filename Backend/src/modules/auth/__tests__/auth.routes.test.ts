import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import request from "supertest";
import { AppError } from "../../../utils/error.ts";

jest.mock("../auth.service", () => ({
  registerUser: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerificationEmail: jest.fn(),
  loginUser: jest.fn(),
  refreshAccessToken: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  getProfile: jest.fn(),
  logoutUser: jest.fn(),
}));

jest.mock(
  "../../../middlewares/rateLimiters/authLimiters/loginLimiter",
  () => ({ loginLimiter: (_req: any, _res: any, next: any) => next() }),
);
jest.mock(
  "../../../middlewares/rateLimiters/authLimiters/registerLimiter",
  () => ({ registerLimiter: (_req: any, _res: any, next: any) => next() }),
);
jest.mock(
  "../../../middlewares/rateLimiters/authLimiters/passwordResetLimiter",
  () => ({
    passwordResetLimiter: (_req: any, _res: any, next: any) => next(),
  }),
);
jest.mock(
  "../../../middlewares/rateLimiters/authLimiters/forgotPasswordLimiter",
  () => ({
    forgotPasswordLimiter: (_req: any, _res: any, next: any) => next(),
  }),
);
jest.mock(
  "../../../middlewares/rateLimiters/authLimiters/verifyEmailLimiter",
  () => ({
    verifyEmailLimiter: (_req: any, _res: any, next: any) => next(),
  }),
);
jest.mock("../../../middlewares/rateLimiters/globalLimiter", () => ({
  globalLimiter: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../../../middlewares/authenticate.middleware", () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: "test-user-1" };
    next();
  }),
}));

jest.mock("../../../admin/admin.router", () => ({
  adminRouter: (_req: any, _res: any, next: any) => next(),
}));

import app from "../../../app";
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
import { authenticate } from "../../../middlewares/authenticate.middleware";

const registerUserMock = jest.mocked(registerUser);
const verifyEmailMock = jest.mocked(verifyEmail);
const resendVerificationEmailMock = jest.mocked(resendVerificationEmail);
const loginUserMock = jest.mocked(loginUser);
const refreshAccessTokenMock = jest.mocked(refreshAccessToken);
const forgotPasswordMock = jest.mocked(forgotPassword);
const resetPasswordMock = jest.mocked(resetPassword);
const getProfileMock = jest.mocked(getProfile);
const logoutUserMock = jest.mocked(logoutUser);
const authenticateMock = jest.mocked(authenticate);

const BASE = "/api/v1/auth";

beforeEach(() => {
  jest.clearAllMocks();

  authenticateMock.mockImplementation(
    async (req: any, _res: any, next: any) => {
      req.user = { id: "test-user-1" };
      next();
      return undefined;
    },
  );
});

it("DIAGNOSTIC: inspect auth router internals", async () => {
  const stack = (app as any)._router?.stack ?? (app as any).router?.stack ?? [];
  const routerLayer = stack.find((l: any) => l.name === "router");

  console.log("MOUNT REGEXP:", routerLayer?.regexp?.toString());
  console.log("MOUNT PATH:", routerLayer?.path);

  const subStack = routerLayer?.handle?.stack ?? [];
  console.log(
    "AUTH ROUTER SUB-LAYERS:",
    subStack.map((l: any) =>
      l.route
        ? `ROUTE: ${Object.keys(l.route.methods)} ${l.route.path}`
        : `MIDDLEWARE: ${l.name}`
    )
  );
  console.log("SUB-LAYER COUNT:", subStack.length);
}); 

describe("POST /register", () => {
  it("returns 201 and the created user on success", async () => {
    const createdUser = {
      id: "1",
      username: "newuser",
      email: "new@example.com",
      role: "USER",
      status: "ACTIVE",
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    registerUserMock.mockResolvedValue(createdUser as any);

    const res = await request(app).post(`${BASE}/register`).send({
      username: "newuser",
      email: "new@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(createdUser);
    expect(registerUserMock).toHaveBeenCalledWith({
      username: "newuser",
      email: "new@example.com",
      password: "Password123!",
    });
  });

  it("passes through the error when registration fails", async () => {
    registerUserMock.mockRejectedValue(new AppError("Username already exists.", 409));

    const res = await request(app).post(`${BASE}/register`).send({
      username: "taken",
      email: "taken@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message: "Username already exists.",
    });
  });
});

describe("POST /login", () => {
  it("returns 200, sets the refresh cookie, and returns user + access token", async () => {
    loginUserMock.mockResolvedValue({
      user: { id: "1", email: "test@example.com" } as any,
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe("access-token");
    expect(res.body.data.user.email).toBe("test@example.com");

    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(String(setCookie)).toContain("refreshToken=refresh-token");
    expect(String(setCookie)).toContain("HttpOnly");
  });

  it("returns an error response on invalid credentials", async () => {
    loginUserMock.mockRejectedValue(new AppError("Invalid credentials.", 401));

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: "test@example.com", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid credentials.",
    });
    expect(res.headers["set-cookie"]).toBeUndefined();
  });
});

describe("POST /verify-email", () => {
  it("returns 200 on successful verification", async () => {
    verifyEmailMock.mockResolvedValue(undefined);

    const res = await request(app)
      .post(`${BASE}/verify-email`)
      .send({ email: "test@example.com", otp: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(verifyEmailMock).toHaveBeenCalledWith("test@example.com", "123456");
  });

  it("passes through errors from an invalid OTP", async () => {
    verifyEmailMock.mockRejectedValue(new AppError("Invalid or expired OTP.", 400));

    const res = await request(app)
      .post(`${BASE}/verify-email`)
      .send({ email: "test@example.com", otp: "000000" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid or expired OTP.",
    });
  });
});

describe("POST /resend-verification", () => {
  it("returns 200 and calls resendVerificationEmail with the email", async () => {
    resendVerificationEmailMock.mockResolvedValue(undefined);

    const res = await request(app)
      .post(`${BASE}/resend-verification`)
      .send({ email: "test@example.com" });

    expect(res.status).toBe(200);
    expect(resendVerificationEmailMock).toHaveBeenCalledWith(
      "test@example.com",
    );
  });
});

describe("POST /refresh", () => {
  it("returns a new access token when a valid refresh cookie is present", async () => {
    refreshAccessTokenMock.mockResolvedValue("new-access-token");

    const res = await request(app)
      .post(`${BASE}/refresh`)
      .set("Cookie", ["refreshToken=some-valid-token"]);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBe("new-access-token");
    expect(refreshAccessTokenMock).toHaveBeenCalledWith("some-valid-token");
  });

  it("errors when no refresh token cookie is present", async () => {
    const res = await request(app).post(`${BASE}/refresh`);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      success: false,
      message: "No refresh token provided.",
    });
    expect(refreshAccessTokenMock).not.toHaveBeenCalled();
  });
});

describe("POST /forgot-password", () => {
  it("always returns 200 with a generic message (anti user-enumeration)", async () => {
    forgotPasswordMock.mockResolvedValue(undefined);

    const res = await request(app)
      .post(`${BASE}/forgot-password`)
      .send({ email: "anyone@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if an account exists/i);
    expect(forgotPasswordMock).toHaveBeenCalledWith("anyone@example.com");
  });
});

describe("POST /reset-password", () => {
  it("returns 200 on a successful reset", async () => {
    resetPasswordMock.mockResolvedValue(undefined);

    const res = await request(app).post(`${BASE}/reset-password`).send({
      token: "raw-reset-token",
      newPassword: "NewPassword123!",
    });

    expect(res.status).toBe(200);
    expect(resetPasswordMock).toHaveBeenCalledWith(
      "raw-reset-token",
      "NewPassword123!",
    );
  });

  it("errors on an invalid or expired token", async () => {
    resetPasswordMock.mockRejectedValue(
      new AppError("Invalid or expired reset token.", 400),
    );

    const res = await request(app).post(`${BASE}/reset-password`).send({
      token: "bad-token",
      newPassword: "NewPassword123!",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Invalid or expired reset token.",
    });
  });
});

describe("GET /profile", () => {
  it("returns the authenticated user's profile", async () => {
    const profile = {
      id: "test-user-1",
      username: "user123",
      email: "test@example.com",
    };
    getProfileMock.mockResolvedValue(profile as any);

    const res = await request(app).get(`${BASE}/profile`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(profile);
    expect(getProfileMock).toHaveBeenCalledWith("test-user-1");
  });

  it("rejects the request when authenticate middleware denies access", async () => {
    authenticateMock.mockImplementation(async (_req: any, res: any) => {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    });

    const res = await request(app).get(`${BASE}/profile`);

    expect(res.status).toBe(401);
    expect(getProfileMock).not.toHaveBeenCalled();
  });
});

describe("POST /logout", () => {
  it("clears the cookie and revokes the refresh token when one is present", async () => {
    logoutUserMock.mockResolvedValue(undefined);

    const res = await request(app)
      .post(`${BASE}/logout`)
      .set("Cookie", ["refreshToken=some-token"]);

    expect(res.status).toBe(200);
    expect(logoutUserMock).toHaveBeenCalledWith("some-token");

    const setCookie = String(res.headers["set-cookie"]);
    expect(setCookie).toContain("refreshToken=;");
  });

  it("still returns 200 when no refresh token cookie is present, without calling logoutUser", async () => {
    const res = await request(app).post(`${BASE}/logout`);

    expect(res.status).toBe(200);
    expect(logoutUserMock).not.toHaveBeenCalled();
  });
});
