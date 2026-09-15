import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Alert, AlertTitle, AlertDescription } from "./alert";

describe("Alert", () => {
  it("renders the default variant with title and description", () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something to know</AlertDescription>
      </Alert>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-background");
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something to know")).toBeInTheDocument();
  });

  it("renders the destructive variant classes", () => {
    render(<Alert variant="destructive">Danger</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("text-destructive");
  });
});
