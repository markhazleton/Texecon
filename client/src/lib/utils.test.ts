import { describe, it, expect } from "vitest";

import { cn } from "./utils";

describe("utils", () => {
  describe("cn (className utility)", () => {
    it("merges class names", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
    });

    it("handles conditional classes", () => {
      expect(cn("class1", false && "class2", "class3")).toBe("class1 class3");
    });

    it("handles undefined and null", () => {
      expect(cn("class1", undefined, null, "class2")).toBe("class1 class2");
    });

    it("merges Tailwind classes correctly", () => {
      // tailwind-merge should handle conflicting classes
      expect(cn("px-2", "px-4")).toBe("px-4");
    });

    it("handles empty input", () => {
      expect(cn()).toBe("");
    });

    it("handles arrays", () => {
      expect(cn(["class1", "class2"])).toBe("class1 class2");
    });

    it("handles objects", () => {
      expect(cn({ class1: true, class2: false, class3: true })).toBe("class1 class3");
    });
  });
});
