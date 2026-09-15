import { render, screen } from "@testing-library/react";
import App from "@/App";

vi.mock("@/hooks/useAnalytics", () => ({ useAnalytics: () => undefined }));

describe("Hazleton genealogy route", () => {
  afterEach(() => window.history.replaceState({}, "", "/"));

  it("renders the evidence-aware family groups and local photographs", () => {
    window.history.replaceState({}, "", "/jared-hazleton/genealogy/");
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Hazleton Family Genealogy" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alfred and Myrtle Hazleton" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The Goode and Livingston connections" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(8);
    expect(screen.getByRole("link", { name: /Return to Jared's biography/ })).toHaveAttribute(
      "href",
      "/jared-hazleton/biography/"
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://texecon.com/jared-hazleton/genealogy/"
    );
  });
});
