import { render, screen } from "@testing-library/react";
import App from "@/App";
import biography from "@/data/jared-biography.json";

vi.mock("@/hooks/useAnalytics", () => ({ useAnalytics: () => undefined }));

describe("Jared's biography route", () => {
  afterEach(() => window.history.replaceState({}, "", "/"));

  it.each([biography.url, biography.url.replace(/\/$/, ""), `${biography.url}index.html`])(
    "renders the full biography on a direct visit to %s",
    (url) => {
      window.history.replaceState({}, "", url);
      render(<App />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Jared Earl Hazleton" })
      ).toBeInTheDocument();
      expect(screen.getByText(biography.introduction)).toBeInTheDocument();
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://texecon.com${biography.url}`
      );
      expect(screen.getByRole("link", { name: "← Return to the tribute" })).toHaveAttribute(
        "href",
        "/"
      );

      const chapters = screen.getByRole("navigation", { name: "Biography chapters" });
      chapters.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        expect(document.getElementById(link.hash.slice(1))).toBeInTheDocument();
      });
      biography.sections.forEach((section) => {
        expect(screen.getByRole("heading", { name: section.title })).toBeInTheDocument();
        section.sources.forEach((id) =>
          expect(document.getElementById(`source-${id}`)).toBeInTheDocument()
        );
      });
    }
  );
});
