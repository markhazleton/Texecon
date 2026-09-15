import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders default variant and size classes", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("h-10");
  });

  it("applies the destructive variant classes", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass("bg-destructive");
  });

  it("applies the outline variant classes", () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button", { name: "Outline" })).toHaveClass("border-input");
  });

  it("applies the ghost variant and icon size classes", () => {
    render(
      <Button variant="ghost" size="icon" aria-label="icon-button">
        X
      </Button>
    );
    const button = screen.getByRole("button", { name: "icon-button" });
    expect(button).toHaveClass("hover:bg-accent");
    expect(button).toHaveClass("w-10");
  });

  it("applies the link variant and small size classes", () => {
    render(
      <Button variant="link" size="sm">
        Link style
      </Button>
    );
    const button = screen.getByRole("button", { name: "Link style" });
    expect(button).toHaveClass("underline-offset-4");
    expect(button).toHaveClass("h-9");
  });

  it("renders as a child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/somewhere">Go</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("href", "/somewhere");
    expect(link).toHaveClass("bg-primary");
  });

  it("disables the button when the disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });
});
