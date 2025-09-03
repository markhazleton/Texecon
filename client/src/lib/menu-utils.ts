// Utility functions for building hierarchical menu structure from WebSpark API data

import { realContent } from "./data";

export interface MenuItem {
  id: number;
  title: string;
  description: string;
  url: string;
  argument: string | null;
  icon: string;
  order: number;
  content: string;
  display_navigation: boolean;
  isHomePage: boolean;
  parent_page: number | null;
  parent_title: string;
  children: MenuItem[];
}

export interface MenuHierarchy {
  topLevel: MenuItem[];
  byId: Record<number, MenuItem>;
  byParent: Record<number, MenuItem[]>;
}

// Build hierarchical menu structure from flat API data
export function buildMenuHierarchy(): MenuHierarchy {
  const rawMenuItems = realContent.pages.all;

  // Convert to our MenuItem interface and sort by order
  const menuItems: MenuItem[] = rawMenuItems
    .filter((item) => item.display_navigation)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      argument: item.argument,
      icon: item.icon,
      order: item.order,
      content: item.content,
      display_navigation: item.display_navigation,
      isHomePage: item.isHomePage,
      parent_page: item.parent_page,
      parent_title: item.parent_title,
      children: [],
    }))
    .sort((a, b) => a.order - b.order);

  // Create lookup maps
  const byId: Record<number, MenuItem> = {};
  const byParent: Record<number, MenuItem[]> = {};

  // Build byId lookup and initialize byParent
  menuItems.forEach((item) => {
    byId[item.id] = item;

    if (item.parent_page) {
      if (!byParent[item.parent_page]) {
        byParent[item.parent_page] = [];
      }
      byParent[item.parent_page].push(item);
    }
  });

  // Populate children arrays
  menuItems.forEach((item) => {
    if (byParent[item.id]) {
      item.children = byParent[item.id].sort((a, b) => a.order - b.order);
    }
  });

  // Get top-level items (those without parents or whose parents aren't in the navigation)
  const topLevel = menuItems.filter(
    (item) => !item.parent_page || !byId[item.parent_page]?.display_navigation
  );

  return {
    topLevel,
    byId,
    byParent,
  };
}

// Get navigation items formatted for the navigation component
export function getNavigationItems(): MenuItem[] {
  const hierarchy = buildMenuHierarchy();

  // Return top-level items with their children
  return hierarchy.topLevel.slice(0, 6); // Limit to 6 top-level items for UI
}

// Find a menu item by URL or argument
export function findMenuItem(urlOrArgument: string): MenuItem | null {
  const hierarchy = buildMenuHierarchy();

  // Search by URL first
  let found = Object.values(hierarchy.byId).find(
    (item) => item.url === urlOrArgument || item.url === `/${urlOrArgument}`
  );

  // If not found by URL, search by argument
  if (!found) {
    found = Object.values(hierarchy.byId).find(
      (item) => item.argument === urlOrArgument
    );
  }

  return found || null;
}

// Get breadcrumb trail for a menu item
export function getBreadcrumbs(itemId: number): MenuItem[] {
  const hierarchy = buildMenuHierarchy();
  const breadcrumbs: MenuItem[] = [];
  let currentItem = hierarchy.byId[itemId];

  while (currentItem) {
    breadcrumbs.unshift(currentItem);
    if (currentItem.parent_page && hierarchy.byId[currentItem.parent_page]) {
      currentItem = hierarchy.byId[currentItem.parent_page];
    } else {
      break;
    }
  }

  return breadcrumbs;
}

// Get menu items by category/parent
export function getMenuItemsByParent(parentId: number): MenuItem[] {
  const hierarchy = buildMenuHierarchy();
  return hierarchy.byParent[parentId] || [];
}

// Format menu item title for display (capitalize, clean up)
export function formatMenuTitle(title: string): string {
  return title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Check if a menu item has children
export function hasChildren(item: MenuItem): boolean {
  return item.children && item.children.length > 0;
}

// Get the home page menu item
export function getHomePage(): MenuItem | null {
  const hierarchy = buildMenuHierarchy();

  // Find the item marked as home page
  const homePage = Object.values(hierarchy.byId).find(
    (item) => item.isHomePage
  );

  return homePage || null;
}
