import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "../../components/Button";

describe("Button Component", () => {

    it("renders the text passed as prop", () => {
        render(<Button text="Login" />);

        expect(
            screen.getByText("Login")
        ).toBeInTheDocument();
    });

    it("renders any text passed to it", () => {
        render(<Button text="Register" />);

        expect(
            screen.getByText("Register")
        ).toBeInTheDocument();
    });

    it("renders a span element", () => {
        const { container } = render(
            <Button text="Login" />
        );

        const span = container.querySelector("span");

        expect(span).toBeInTheDocument();
    });

});