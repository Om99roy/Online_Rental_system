import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

import ForgotPassword from "../forgotpassword";

vi.mock("axios");

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import toast from "react-hot-toast";

afterEach(() => {
  cleanup();
});

describe("Forgot Password Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders forgot password form", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /reset password/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/enter your email and we'll send you a reset link/i)
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /send reset link/i })
    ).toBeInTheDocument();
  });

  test("submits the entered email", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email/i),
      "invalid-email"
    );

    await user.click(
      screen.getByRole("button", { name: /send reset link/i })
    );

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalled();
      });

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        {
          email: "invalid-email",
        }
      );
  });

  test("submits a valid email", async () => {
    const user = userEvent.setup();

    vi.mocked(axios.post).mockResolvedValue({
      data: {},
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email/i),
      "john@test.com"
    );

    await user.click(
      screen.getByRole("button", { name: /send reset link/i })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      {
        email: "john@test.com",
      }
    );

    expect(
      screen.getByText(
        /if an account exists for that email, a reset link is on its way/i
      )
    ).toBeInTheDocument();
  });

  test("handles API failure", async () => {
    const user = userEvent.setup();

    vi.mocked(axios.post).mockRejectedValue(
      new Error("Request failed")
    );

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.type(
      screen.getByLabelText(/email/i),
      "john@test.com"
    );

    await user.click(
      screen.getByRole("button", { name: /send reset link/i })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Wrong email format"
    );
  });
});