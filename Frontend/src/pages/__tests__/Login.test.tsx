import { describe, expect, test, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

import Login from "../login";

vi.mock("axios");

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
});

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("renders the login form", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /welcome back/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /login/i })
    ).toBeInTheDocument();
  });

  test("does not submit an invalid email", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email/i),
      "invalid-email"
    );

    await user.type(
      screen.getByLabelText(/password/i),
      "password"
    );

    await user.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(axios.post).not.toHaveBeenCalled();
  });

  test("does not submit when password is empty", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email/i),
      "test@example.com"
    );

    await user.click(
      screen.getByRole("button", { name: /login/i })
    );

    expect(axios.post).not.toHaveBeenCalled();
  });

  test("submits valid login credentials", async () => {
    const user = userEvent.setup();

    vi.mocked(axios.post).mockResolvedValue({
      data: {
        data: {
          user: {
            id: "1",
            username: "testuser",
            email: "test@example.com",
            role: "USER",
            status: "ACTIVE",
            emailVerified: true,
            lastLoginAt: null,
            createdAt: "",
            updatedAt: "",
          },
          accessToken: "test-access-token",
        },
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email/i),
      "test@example.com"
    );

    await user.type(
      screen.getByLabelText(/password/i),
      "password123"
    );

    await user.click(
      screen.getByRole("button", { name: /login/i })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      {
        email: "test@example.com",
        password: "password123",
      },
      {
        withCredentials: true,
      }
    );

    expect(localStorage.getItem("accessToken")).toBe(
      "test-access-token"
    );
  });

  test("handles login API failure", async () => {
    const user = userEvent.setup();

    vi.mocked(axios.post).mockRejectedValue(
      new Error("Invalid credentials")
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email/i),
      "test@example.com"
    );

    await user.type(
      screen.getByLabelText(/password/i),
      "wrong-password"
    );

    await user.click(
      screen.getByRole("button", { name: /login/i })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});