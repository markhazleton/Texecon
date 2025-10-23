import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import SEOHead from "./seo-head";

describe("SEOHead", () => {
  beforeEach(() => {
    // Clear all meta tags before each test
    document.head.innerHTML = "";
  });

  it("sets document title", () => {
    render(<SEOHead title="Test Title" />);
    expect(document.title).toBe("Test Title");
  });

  it("creates meta description tag", () => {
    const description = "Test Description";
    render(<SEOHead description={description} />);

    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute("content")).toBe(description);
  });

  it("creates meta keywords tag", () => {
    const keywords = ["keyword1", "keyword2", "keyword3"];
    render(<SEOHead keywords={keywords} />);

    const meta = document.querySelector('meta[name="keywords"]');
    expect(meta?.getAttribute("content")).toBe("keyword1, keyword2, keyword3");
  });

  it("creates Open Graph meta tags", () => {
    const title = "OG Test Title";
    const description = "OG Test Description";
    const image = "https://example.com/image.jpg";
    const url = "https://example.com";

    render(<SEOHead title={title} description={description} image={image} url={url} />);

    expect(document.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe(
      title
    );
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute("content")).toBe(
      description
    );
    expect(document.querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe(
      image
    );
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(url);
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute("content")).toBe(
      "website"
    );
  });

  it("creates Twitter Card meta tags", () => {
    const title = "Twitter Test Title";
    const description = "Twitter Test Description";
    const image = "https://example.com/twitter-image.jpg";

    render(<SEOHead title={title} description={description} image={image} />);

    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute("content")).toBe(
      "summary_large_image"
    );
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute("content")).toBe(
      title
    );
    expect(
      document.querySelector('meta[name="twitter:description"]')?.getAttribute("content")
    ).toBe(description);
    expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute("content")).toBe(
      image
    );
  });

  it("creates canonical URL link", () => {
    const url = "https://texecon.com/test-page";
    render(<SEOHead url={url} />);

    const canonical = document.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute("href")).toBe(url);
  });

  it("creates article meta tags when type is article", () => {
    const author = "Test Author";
    const publishedTime = "2025-01-01T00:00:00Z";
    const modifiedTime = "2025-01-02T00:00:00Z";

    render(
      <SEOHead
        type="article"
        author={author}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
      />
    );

    expect(document.querySelector('meta[property="article:author"]')?.getAttribute("content")).toBe(
      author
    );
    expect(
      document.querySelector('meta[property="article:published_time"]')?.getAttribute("content")
    ).toBe(publishedTime);
    expect(
      document.querySelector('meta[property="article:modified_time"]')?.getAttribute("content")
    ).toBe(modifiedTime);
  });

  it("uses default values when no props provided", () => {
    render(<SEOHead />);

    expect(document.title).toBe("TexEcon - Texas Economic Analysis & Insights");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toContain(
      "Texas economic analysis"
    );
  });

  it("updates meta tags when props change", () => {
    const { rerender } = render(<SEOHead title="First Title" />);
    expect(document.title).toBe("First Title");

    rerender(<SEOHead title="Second Title" />);
    expect(document.title).toBe("Second Title");
  });
});
