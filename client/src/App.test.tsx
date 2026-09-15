import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

import App from "@/App";

vi.mock("@/hooks/useAnalytics", () => ({ useAnalytics: () => undefined }));

describe("App legacy redirects and fallback routes", () => {
  afterEach(() => window.history.replaceState({}, "", "/"));

  it.each([
    "/texeon/jared-hazleton",
    "/texeon/jared-hazleton/",
    "/texecon/jaredhazleton",
    "/texecon/jaredhazleton/",
  ])("shows a redirect message and replaces the URL for legacy memorial path %s", async (path) => {
    window.history.replaceState({}, "", path);

    const replaceSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, replace: replaceSpy },
    });

    render(<App />);

    expect(
      screen.getByText("Redirecting to Dr. Jared Earl Hazleton Memorial...")
    ).toBeInTheDocument();
    await waitFor(() => expect(replaceSpy).toHaveBeenCalled());

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it.each(["/memorial/jared-earl-hazleton/genealogy/", "/memorial/jared-earl-hazleton/genealogy"])(
    "shows a redirect message and replaces the URL for legacy genealogy path %s",
    async (path) => {
      window.history.replaceState({}, "", path);

      const replaceSpy = vi.fn();
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...originalLocation, replace: replaceSpy },
      });

      render(<App />);

      expect(
        screen.getByText("Redirecting to the Hazleton family genealogy...")
      ).toBeInTheDocument();
      await waitFor(() => expect(replaceSpy).toHaveBeenCalled());

      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
  );
});
