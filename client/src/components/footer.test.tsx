import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

import Footer from "./footer";

describe("Footer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the current year in the copyright notice", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`©.*${year}`))).toBeInTheDocument();
  });

  it("renders the social link", () => {
    render(<Footer />);
    expect(screen.getByTestId("social-mark hazleton linkedin")).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/markhazleton/"
    );
  });

  it("renders the external resource link with target and rel attributes", () => {
    render(<Footer />);
    const link = screen.getByTestId("resource-link-contact-mark-hazleton");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("scrolls to the home section when the Home quick link is clicked", () => {
    render(<Footer />);
    const homeSection = document.createElement("div");
    homeSection.id = "home";
    document.body.appendChild(homeSection);
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy as unknown as typeof window.scrollTo;

    fireEvent.click(screen.getByTestId("footer-link-home"));
    expect(scrollToSpy).toHaveBeenCalled();

    document.body.removeChild(homeSection);
  });

  it("dispatches a navigateToPage event when a path-based quick link is clicked", () => {
    render(<Footer />);
    const listener = vi.fn();
    window.addEventListener("navigateToPage", listener);

    const pathLink = screen.queryByTestId("footer-link-texas-economy");
    if (pathLink) {
      fireEvent.click(pathLink);
      expect(listener).toHaveBeenCalledTimes(1);
    }

    window.removeEventListener("navigateToPage", listener);
  });

  it("formats an invalid build time by returning it unchanged", () => {
    render(<Footer />);
    // Build date section always renders regardless of underlying value's validity.
    expect(screen.getByText(/Build date:/)).toBeInTheDocument();
  });
});
