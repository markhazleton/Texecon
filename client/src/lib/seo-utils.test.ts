import { describe, it, expect } from "vitest";

import { generateMetaDescription, generatePageTitle, extractKeywords } from "./seo-utils";

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
  });
});
