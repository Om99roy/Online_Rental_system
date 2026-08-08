import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

import Register from "../Register";

const mockNavigate = vi.fn();

vi.mock("axios");

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe("Register Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders registration form", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /create account/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /register/i })
    ).toBeInTheDocument();
  });

  test("does not submit invalid email", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/username/i), "john");

    await user.type(screen.getByLabelText(/email/i), "invalid-email");

    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(axios.post).not.toHaveBeenCalled();
  });

  test("does not submit when password is empty", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/username/i), "john");

    await user.type(screen.getByLabelText(/email/i), "john@test.com");

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(axios.post).not.toHaveBeenCalled();
  });

  test("submits valid registration", async () => {
    const user = userEvent.setup();

    vi.mocked(axios.post).mockResolvedValue({
      data: {},
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/username/i), "john");

    await user.type(screen.getByLabelText(/email/i), "john@test.com");

    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      {
        username: "john",
        email: "john@test.com",
        password: "password123",
      }
    );

    expect(toast.success).toHaveBeenCalledWith(
      "Registration successful"
    );

    expect(mockNavigate).toHaveBeenCalledWith("/verify-email");
  });

  test("handles registration failure", async () => {
    const user = userEvent.setup();

    vi.mocked(axios.post).mockRejectedValue(
      new Error("Registration failed")
    );

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/username/i), "john");

    await user.type(screen.getByLabelText(/email/i), "john@test.com");

    await user.type(screen.getByLabelText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Registration unsuccessful"
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});