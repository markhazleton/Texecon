import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders the default variant classes", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toHaveClass("bg-primary");
  });

  it("renders the secondary variant classes", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toHaveClass("bg-secondary");
  });

  it("renders the destructive variant classes", () => {
    render(<Badge variant="destructive">Danger</Badge>);
    expect(screen.getByText("Danger")).toHaveClass("bg-destructive");
  });

  it("renders the outline variant classes", () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toHaveClass("text-foreground");
  });

  it("merges a custom className", () => {
    render(<Badge className="custom">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("custom");
  });
});
