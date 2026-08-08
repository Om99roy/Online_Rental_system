import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Navbar from "../../components/Navbar";
import {
  NavbarContext,
  NavbarColorContext,
} from "../../store/NavContext";

// Mock the logo import
vi.mock("../../assets/orBIS.png", () => ({
  default: "mock-logo.png",
}));

afterEach(() => {
  cleanup();
});

describe("Navbar Component", () => {
  function renderNavbar() {

    render(
      <NavbarContext.Provider value={[false, vi.fn()]}>
        <NavbarColorContext.Provider value={["white", vi.fn()]}>
          <Navbar />
        </NavbarColorContext.Provider>
      </NavbarContext.Provider>
    );

  }

  it("renders the logo", () => {
    renderNavbar();

    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

});