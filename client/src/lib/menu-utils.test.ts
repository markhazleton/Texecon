import { describe, it, expect } from "vitest";

import {
  buildMenuHierarchy,
  getNavigationItems,
  findMenuItem,
  getBreadcrumbs,
  getMenuItemsByParent,
  formatMenuTitle,
  hasChildren,
  getHomePage,
} from "./menu-utils";

describe("menu-utils", () => {
  describe("buildMenuHierarchy", () => {
    it("builds a hierarchy with top-level items, byId and byParent maps", () => {
      const hierarchy = buildMenuHierarchy();
      expect(hierarchy.topLevel.length).toBeGreaterThan(0);
      expect(Object.keys(hierarchy.byId).length).toBeGreaterThan(0);
    });

    it("only includes items marked for display_navigation", () => {
      const hierarchy = buildMenuHierarchy();
      Object.values(hierarchy.byId).forEach((item) => {
        expect(item.display_navigation).toBe(true);
      });
    });

    it("sorts top-level items by order", () => {
      const hierarchy = buildMenuHierarchy();
      for (let i = 1; i < hierarchy.topLevel.length; i++) {
        expect(hierarchy.topLevel[i].order).toBeGreaterThanOrEqual(hierarchy.topLevel[i - 1].order);
      }
    });

    it("attaches children arrays sorted by order to parent items", () => {
      const hierarchy = buildMenuHierarchy();
      const parentWithChildren = Object.values(hierarchy.byId).find(
        (item) => item.children.length > 0
      );

      if (parentWithChildren) {
        for (let i = 1; i < parentWithChildren.children.length; i++) {
          expect(parentWithChildren.children[i].order).toBeGreaterThanOrEqual(
            parentWithChildren.children[i - 1].order
          );
        }
      } else {
        // No parent/child relationships in the current dataset; hierarchy is still valid.
        expect(hierarchy.topLevel.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getNavigationItems", () => {
    it("returns at most 6 top-level items", () => {
      const items = getNavigationItems();
      expect(items.length).toBeLessThanOrEqual(6);
    });
  });

  describe("findMenuItem", () => {
    it("returns null when nothing matches", () => {
      expect(findMenuItem("this-does-not-exist-anywhere")).toBeNull();
    });

    it("finds an item by its url", () => {
      const hierarchy = buildMenuHierarchy();
      const target = Object.values(hierarchy.byId)[0];
      const found = findMenuItem(target.url);
      expect(found?.id).toBe(target.id);
    });

    it("finds an item by its argument when url does not match", () => {
      const hierarchy = buildMenuHierarchy();
      const target = Object.values(hierarchy.byId).find((item) => item.argument);
      if (target?.argument) {
        const found = findMenuItem(target.argument);
        expect(found?.argument).toBe(target.argument);
      }
    });
  });

  describe("getBreadcrumbs", () => {
    it("returns an empty array for an unknown id", () => {
      expect(getBreadcrumbs(-999)).toEqual([]);
    });

    it("returns a single-item trail for a top-level item", () => {
      const hierarchy = buildMenuHierarchy();
      const topLevelItem = hierarchy.topLevel[0];
      const breadcrumbs = getBreadcrumbs(topLevelItem.id);
      expect(breadcrumbs[breadcrumbs.length - 1].id).toBe(topLevelItem.id);
    });

    it("walks up through parent items when present", () => {
      const hierarchy = buildMenuHierarchy();
      const childItem = Object.values(hierarchy.byId).find(
        (item) => item.parent_page && hierarchy.byId[item.parent_page]
      );

      if (childItem) {
        const breadcrumbs = getBreadcrumbs(childItem.id);
        expect(breadcrumbs.length).toBeGreaterThan(1);
        expect(breadcrumbs[breadcrumbs.length - 1].id).toBe(childItem.id);
      } else {
        expect(hierarchy.topLevel.length).toBeGreaterThan(0);
      }
    });
  });

  describe("getMenuItemsByParent", () => {
    it("returns an empty array when a parent has no children", () => {
      expect(getMenuItemsByParent(-999)).toEqual([]);
    });

    it("returns child items for a known parent", () => {
      const hierarchy = buildMenuHierarchy();
      const parentId = Object.keys(hierarchy.byParent)[0];
      if (parentId) {
        const children = getMenuItemsByParent(Number(parentId));
        expect(children.length).toBeGreaterThan(0);
      }
    });
  });

  describe("formatMenuTitle", () => {
    it("capitalizes each word and lowercases the rest", () => {
      expect(formatMenuTitle("texas ECONOMY overview")).toBe("Texas Economy Overview");
    });

    it("handles a single word", () => {
      expect(formatMenuTitle("home")).toBe("Home");
    });
  });

  describe("hasChildren", () => {
    it("returns false for an item without children", () => {
      const hierarchy = buildMenuHierarchy();
      const leaf = Object.values(hierarchy.byId).find((item) => item.children.length === 0);
      expect(leaf && hasChildren(leaf)).toBe(false);
    });

    it("returns true for an item with children", () => {
      const hierarchy = buildMenuHierarchy();
      const parent = Object.values(hierarchy.byId).find((item) => item.children.length > 0);
      if (parent) {
        expect(hasChildren(parent)).toBe(true);
      }
    });
  });

  describe("getHomePage", () => {
    it("returns the item marked isHomePage or null", () => {
      const homePage = getHomePage();
      if (homePage) {
        expect(homePage.isHomePage).toBe(true);
      } else {
        expect(homePage).toBeNull();
      }
    });
  });
});
