import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";

describe("Card", () => {
  it("renders all card subcomponents together", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description text</CardDescription>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description text")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("merges a custom className onto the card", () => {
    render(<Card data-testid="card" className="custom-card" />);
    expect(screen.getByTestId("card")).toHaveClass("custom-card");
    expect(screen.getByTestId("card")).toHaveClass("rounded-lg");
  });

  it("merges a custom className onto CardContent", () => {
    render(<CardContent data-testid="content" className="extra" />);
    expect(screen.getByTestId("content")).toHaveClass("extra");
    expect(screen.getByTestId("content")).toHaveClass("p-6");
  });
});
