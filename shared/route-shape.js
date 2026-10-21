// Canonical route shape and menu hierarchy rules shared by the React client and the
// Node build scripts (sitemap, static pages). Constitution Principle III requires every
// published output to agree exactly on URL shape, so this is the only implementation.
// Plain ESM JavaScript so Node can import it without a compile step; types live in
// route-shape.d.ts.

/**
 * Ensure a URL path has a trailing slash (except root).
 * Empty or missing paths resolve to root.
 */
export function withTrailingSlash(url) {
  if (!url || url === '/') return '/';
  return url.endsWith('/') ? url : `${url}/`;
}

/**
 * Build the navigation hierarchy from flat content items.
 * Only items with display_navigation are included; siblings are ordered by `order`.
 * Items whose parent is missing from the navigation are promoted to top level.
 * Input items are copied, never mutated.
 */
export function buildMenuHierarchy(items) {
  const filtered = items
    .filter((item) => item.display_navigation)
    .sort((a, b) => a.order - b.order);

  const byId = {};
  const byParent = {};

  filtered.forEach((item) => {
    byId[item.id] = { ...item, children: [] };
  });

  filtered.forEach((item) => {
    const node = byId[item.id];
    if (item.parent_page) {
      if (!byParent[item.parent_page]) byParent[item.parent_page] = [];
      byParent[item.parent_page].push(node);
      const parent = byId[item.parent_page];
      if (parent) parent.children.push(node);
    }
  });

  const topLevel = filtered
    .filter((item) => !item.parent_page || !byId[item.parent_page])
    .map((item) => byId[item.id]);

  return { topLevel, byId, byParent };
}
