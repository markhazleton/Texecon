import { act, render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Toaster } from "./toaster";
import { toast } from "@/hooks/use-toast";

describe("Toaster", () => {
  it("renders nothing when there are no toasts", () => {
    render(<Toaster />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders a toast title and description when a toast is added", () => {
    render(<Toaster />);
    let created: ReturnType<typeof toast> | undefined;

    act(() => {
      created = toast({ title: "Saved", description: "Your changes were saved." });
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Your changes were saved.")).toBeInTheDocument();

    act(() => {
      created?.dismiss();
    });
  });
});
