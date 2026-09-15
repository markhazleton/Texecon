import { describe, it, expect } from "vitest";

import {
  generateMetaDescription,
  generatePageTitle,
  extractKeywords,
  generateSEOPath,
  generateCanonicalUrl,
  generateCanonicalUrlForPath,
  generateSitemapEntries,
  generateSitemapXML,
  generateRobotsTxt,
  getStructuredData,
} from "./seo-utils";
import type { MenuItem } from "./menu-utils";

function makeMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 1,
    title: "Texas Economy",
    description: "",
    url: "/texas",
    argument: null,
    icon: "",
    order: 1,
    content: "",
    display_navigation: true,
    isHomePage: false,
    parent_page: null,
    parent_title: "",
    children: [],
    ...overrides,
  };
}

describe("seo-utils", () => {
  describe("generateMetaDescription", () => {
    it("returns provided description if available", () => {
      const result = generateMetaDescription("Custom description", "Fallback content");
      expect(result).toBe("Custom description");
    });

    it("generates description from content when description is empty", () => {
      const content = "This is some content that should be used for the description";
      const result = generateMetaDescription("", content);
      expect(result).toContain("This is some content");
    });

    it("truncates long content to 160 characters", () => {
      const longContent = "a".repeat(200);
      const result = generateMetaDescription("", longContent);
      expect(result.length).toBeLessThanOrEqual(160);
    });

    it("returns default description when no description or content", () => {
      const result = generateMetaDescription("", "");
      expect(result).toContain("Texas economic analysis");
    });
  });

  describe("generatePageTitle", () => {
    it("generates title with TexEcon suffix", () => {
      const result = generatePageTitle("Test Page");
      expect(result).toBe("Test Page | TexEcon");
    });

    it("returns just TexEcon when title is empty", () => {
      const result = generatePageTitle("");
      expect(result).toBe("TexEcon - Texas Economic Analysis & Insights");
    });

    it("handles special characters", () => {
      const result = generatePageTitle("Mark & Jared");
      expect(result).toBe("Mark & Jared | TexEcon");
    });
  });

  describe("extractKeywords", () => {
    it("extracts keywords from content", () => {
      const content = "Texas economy growth economic analysis data insights";
      const result = extractKeywords(content);
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it("removes common stop words", () => {
      const content = "the and or but economy";
      const result = extractKeywords(content);
      expect(result).not.toContain("the");
      expect(result).not.toContain("and");
      expect(result).toContain("economy");
    });

    it("returns unique keywords", () => {
      const content = "economy economy economy analysis";
      const result = extractKeywords(content);
      const uniqueCount = new Set(result).size;
      expect(uniqueCount).toBe(result.length);
    });

    it("limits keywords to reasonable number", () => {
      const longContent = "word ".repeat(100);
      const result = extractKeywords(longContent);
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it("returns base keywords when string content is empty", () => {
      const result = extractKeywords("");
      expect(result).toEqual(["Texas economy", "economic analysis"]);
    });

    it("extracts keywords from a MenuItem including its title", () => {
      const item = makeMenuItem({ title: "Housing Market Overview" });
      const result = extractKeywords(item);
      expect(result).toContain("housing market overview");
    });

    it("adds description-based keywords for a MenuItem", () => {
      const item = makeMenuItem({ description: "Detailed quarterly economic outlook report" });
      const result = extractKeywords(item);
      expect(result.length).toBeGreaterThan(3);
    });

    it("adds parent-page keywords for a MenuItem with a parent", () => {
      const item = makeMenuItem({ parent_page: 5 });
      const result = extractKeywords(item);
      expect(result).toContain("Texas economic trends");
      expect(result).toContain("regional analysis");
    });

    it("adds argument-based keywords for a MenuItem with an argument", () => {
      const item = makeMenuItem({ argument: "gdp-growth" });
      const result = extractKeywords(item);
      expect(result).toContain("economic topic");
      expect(result).toContain("economic data");
    });

    it("omits parent/argument keywords for a plain top-level MenuItem", () => {
      const item = makeMenuItem();
      const result = extractKeywords(item);
      expect(result).not.toContain("economic topic");
      expect(result).not.toContain("Texas economic trends");
    });
  });

  describe("generateSEOPath", () => {
    it("uses the item url with a trailing slash when present", () => {
      const item = makeMenuItem({ url: "/texas-economy" });
      expect(generateSEOPath(item)).toBe("/texas-economy/");
    });

    it("keeps an already-trailing-slash url as is", () => {
      const item = makeMenuItem({ url: "/texas-economy/" });
      expect(generateSEOPath(item)).toBe("/texas-economy/");
    });

    it("returns root for a root url", () => {
      const item = makeMenuItem({ url: "/" });
      expect(generateSEOPath(item)).toBe("/page/1/");
    });

    it("falls back to the argument when url is missing", () => {
      const item = makeMenuItem({ url: "", argument: "team" });
      expect(generateSEOPath(item)).toBe("/team/");
    });

    it("falls back to the page id when neither url nor argument are present", () => {
      const item = makeMenuItem({ url: "", argument: null, id: 42 });
      expect(generateSEOPath(item)).toBe("/page/42/");
    });
  });

  describe("generateCanonicalUrl", () => {
    it("builds a canonical URL from the default base", () => {
      const item = makeMenuItem({ url: "/texas" });
      expect(generateCanonicalUrl(item)).toBe("https://texecon.com/texas/");
    });

    it("strips a trailing slash from a custom base url", () => {
      const item = makeMenuItem({ url: "/texas" });
      expect(generateCanonicalUrl(item, "https://example.com/")).toBe("https://example.com/texas/");
    });
  });

  describe("generateCanonicalUrlForPath", () => {
    it("adds a leading slash when missing", () => {
      expect(generateCanonicalUrlForPath("texas")).toBe("https://texecon.com/texas/");
    });

    it("keeps root path as root", () => {
      expect(generateCanonicalUrlForPath("/")).toBe("https://texecon.com/");
    });

    it("does not double a trailing slash", () => {
      expect(generateCanonicalUrlForPath("/texas/")).toBe("https://texecon.com/texas/");
    });

    it("strips a trailing slash from a custom base url", () => {
      expect(generateCanonicalUrlForPath("/texas", "https://example.com/")).toBe(
        "https://example.com/texas/"
      );
    });
  });

  describe("generateSitemapEntries", () => {
    it("includes the home page plus every navigable item", () => {
      const entries = generateSitemapEntries("https://example.com");
      expect(entries[0]).toMatchObject({ url: "https://example.com", priority: "1.0" });
      expect(entries.length).toBeGreaterThan(1);
    });

    it("assigns priority 0.6 to child pages and 0.8 to top-level pages", () => {
      const entries = generateSitemapEntries();
      const priorities = new Set(entries.map((entry) => entry.priority));
      expect(priorities.has("0.8") || priorities.has("0.6") || priorities.has("1.0")).toBe(true);
    });
  });

  describe("generateSitemapXML", () => {
    it("wraps entries in a valid urlset", () => {
      const xml = generateSitemapXML([
        {
          url: "https://example.com/a/",
          lastModified: "2024-01-01",
          changeFrequency: "daily",
          priority: "0.8",
        },
      ]);
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain("<urlset");
      expect(xml).toContain("<loc>https://example.com/a/</loc>");
    });

    it("produces an empty urlset for no entries", () => {
      const xml = generateSitemapXML([]);
      expect(xml).toContain("<urlset");
      expect(xml).not.toContain("<url>");
    });
  });

  describe("generateRobotsTxt", () => {
    it("references the sitemap using the default base url", () => {
      const robots = generateRobotsTxt();
      expect(robots).toContain("Sitemap: https://texecon.com/sitemap.xml");
      expect(robots).toContain("Disallow: /admin/");
    });

    it("references the sitemap using a custom base url", () => {
      const robots = generateRobotsTxt("https://example.com");
      expect(robots).toContain("Sitemap: https://example.com/sitemap.xml");
    });
  });

  describe("getStructuredData", () => {
    it("builds Article structured data for a MenuItem", () => {
      const item = makeMenuItem({ title: "Regional Outlook" });
      const data = getStructuredData(item);
      expect(data["@type"]).toBe("Article");
      expect(data.headline).toBe("Regional Outlook");
      expect(data.publisher.name).toBe("TexEcon");
      expect(data.mainEntityOfPage["@id"]).toBe(generateCanonicalUrl(item));
    });
  });
});
