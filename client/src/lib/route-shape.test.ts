import { describe, expect, it } from "vitest";
import { buildMenuHierarchy, withTrailingSlash } from "@shared/route-shape";

interface Item {
  id: number;
  title: string;
  order: number;
  display_navigation: boolean;
  parent_page: number | null;
}

const item = (overrides: Partial<Item> & Pick<Item, "id">): Item => ({
  title: `Item ${overrides.id}`,
  order: overrides.id,
  display_navigation: true,
  parent_page: null,
  ...overrides,
});

describe("withTrailingSlash", () => {
  it("adds a trailing slash to non-root paths", () => {
    expect(withTrailingSlash("/texas")).toBe("/texas/");
    expect(withTrailingSlash("/arizona/phoenix")).toBe("/arizona/phoenix/");
  });

  it("leaves already-canonical paths unchanged", () => {
    expect(withTrailingSlash("/texecon/mark-hazleton/")).toBe("/texecon/mark-hazleton/");
  });

  it("resolves root, empty, and missing paths to root", () => {
    expect(withTrailingSlash("/")).toBe("/");
    expect(withTrailingSlash("")).toBe("/");
    expect(withTrailingSlash(null)).toBe("/");
    expect(withTrailingSlash(undefined)).toBe("/");
  });
});

describe("buildMenuHierarchy", () => {
  it("excludes items not marked for navigation", () => {
    const { topLevel, byId } = buildMenuHierarchy([
      item({ id: 1 }),
      item({ id: 2, display_navigation: false }),
    ]);
    expect(topLevel.map((i) => i.id)).toEqual([1]);
    expect(byId[2]).toBeUndefined();
  });

  it("orders top-level items and children by order", () => {
    const { topLevel, byId } = buildMenuHierarchy([
      item({ id: 1, order: 2 }),
      item({ id: 2, order: 1 }),
      item({ id: 3, order: 9, parent_page: 1 }),
      item({ id: 4, order: 3, parent_page: 1 }),
    ]);
    expect(topLevel.map((i) => i.id)).toEqual([2, 1]);
    expect(byId[1]?.children.map((i) => i.id)).toEqual([4, 3]);
  });

  it("groups children by parent id", () => {
    const { byParent } = buildMenuHierarchy([
      item({ id: 1 }),
      item({ id: 2, parent_page: 1 }),
      item({ id: 3, parent_page: 1 }),
    ]);
    expect(byParent[1]?.map((i) => i.id)).toEqual([2, 3]);
  });

  it("promotes items whose parent is not in the navigation to top level", () => {
    const { topLevel } = buildMenuHierarchy([
      item({ id: 1, display_navigation: false }),
      item({ id: 2, parent_page: 1 }),
    ]);
    expect(topLevel.map((i) => i.id)).toEqual([2]);
  });

  it("does not mutate the input items", () => {
    const input = [item({ id: 1 }), item({ id: 2, parent_page: 1 })];
    const snapshot = structuredClone(input);
    buildMenuHierarchy(input);
    expect(input).toEqual(snapshot);
  });
});
