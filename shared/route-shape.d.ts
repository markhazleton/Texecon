export function withTrailingSlash(url: string | null | undefined): string;

export interface MenuSource {
  id: number;
  order: number;
  display_navigation: boolean;
  parent_page: number | null;
}

export type MenuNode<T extends MenuSource> = T & { children: MenuNode<T>[] };

export interface MenuHierarchyOf<T extends MenuSource> {
  topLevel: MenuNode<T>[];
  byId: Record<number, MenuNode<T>>;
  byParent: Record<number, MenuNode<T>[]>;
}

export function buildMenuHierarchy<T extends MenuSource>(items: readonly T[]): MenuHierarchyOf<T>;
