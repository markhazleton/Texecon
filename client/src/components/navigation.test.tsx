import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Navigation from "./navigation";
import { getNavigationItems } from "@/lib/menu-utils";

describe("Navigation", () => {
  it("renders the logo and top-level navigation items", () => {
    render(<Navigation />);
    expect(screen.getByTestId("logo-text")).toHaveTextContent("TexEcon");
    const items = getNavigationItems();
    expect(items.length).toBeGreaterThan(0);
  });

  it("calls onMenuItemSelect with null when the logo is clicked", () => {
    const onMenuItemSelect = vi.fn();
    render(<Navigation onMenuItemSelect={onMenuItemSelect} />);
    fireEvent.click(screen.getByTestId("logo-link"));
    expect(onMenuItemSelect).toHaveBeenCalledWith(null);
  });

  it("does not throw when the logo is clicked without a handler", () => {
    render(<Navigation />);
    expect(() => fireEvent.click(screen.getByTestId("logo-link"))).not.toThrow();
  });

  it("toggles the mobile menu open and closed", () => {
    render(<Navigation />);
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();

    const menuButton = screen.getByTestId("mobile-menu-button");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton);
    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(menuButton).toHaveAttribute("aria-label", "Close navigation menu");

    fireEvent.click(menuButton);
    expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    expect(menuButton).toHaveAttribute("aria-label", "Open navigation menu");
  });

  it("selects a top-level menu item without children and closes the mobile menu", () => {
    const onMenuItemSelect = vi.fn();
    render(<Navigation onMenuItemSelect={onMenuItemSelect} />);

    fireEvent.click(screen.getByTestId("mobile-menu-button"));
    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();

    const items = getNavigationItems();
    const leafItem = items.find((item) => item.children.length === 0);

    if (leafItem) {
      const testId = `mobile-nav-${leafItem.argument || leafItem.id}`;
      fireEvent.click(screen.getByTestId(testId));
      expect(onMenuItemSelect).toHaveBeenCalledWith(leafItem);
      expect(screen.queryByTestId("mobile-menu")).not.toBeInTheDocument();
    }
  });
});
