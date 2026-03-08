import { useState, useEffect, MouseEvent } from "react";
import { MenuItem, getBreadcrumbs, getMenuItemsByParent } from "@/lib/menu-utils";
import { generateSEOPath } from "@/lib/seo-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag } from "lucide-react";

interface ContentDisplayProps {
  menuItem: MenuItem | null;
  onNavigate?: (item: MenuItem) => void;
}

export default function ContentDisplay({ menuItem, onNavigate }: ContentDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (menuItem) {
      // Schedule state updates for next render
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 50);
      }, 0);
    }
  }, [menuItem]);

  if (!menuItem) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center">
        <div>
          <h3 className="text-2xl font-semibold text-muted-foreground mb-4">Welcome to TexEcon</h3>
          <p className="text-muted-foreground max-w-md">
            Select a topic from the navigation menu above to explore our economic analysis and
            insights.
          </p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = getBreadcrumbs(menuItem.id);
  const siblingItems =
    menuItem.parent_page !== null
      ? getMenuItemsByParent(menuItem.parent_page).filter((item) => item.id !== menuItem.id)
      : [];

  const relatedCandidates = [...siblingItems, ...(menuItem.children || [])];
  const relatedItems = Array.from(new Map(relatedCandidates.map((item) => [item.id, item])).values())
    .filter((item) => item.id !== menuItem.id)
    .slice(0, 6);

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, item: MenuItem) => {
    if (!onNavigate) return;
    event.preventDefault();
    onNavigate(item);
  };

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      data-testid={`content-${menuItem.argument || menuItem.id}`}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            {breadcrumbItems.map((item) => {
              const isCurrentPage = item.id === menuItem.id;
              const path = generateSEOPath(item);

              return (
                <span key={item.id}>
                  <span className="mx-2">/</span>
                  {isCurrentPage ? (
                    <span className="text-foreground">{item.title}</span>
                  ) : (
                    <a
                      href={path}
                      onClick={(event) => handleNavigate(event, item)}
                      className="hover:text-primary transition-colors"
                    >
                      {item.title}
                    </a>
                  )}
                </span>
              );
            })}
          </nav>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold mb-3">{menuItem.title}</CardTitle>
              {menuItem.description && (
                <p className="text-xl text-muted-foreground mb-4">{menuItem.description}</p>
              )}
            </div>
            {menuItem.icon && (
              <div className="ml-4">
                <i className={`${menuItem.icon} text-3xl text-primary`}></i>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Last updated recently</span>
            </div>

            {menuItem.argument && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {menuItem.argument.replace("/", " › ")}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {menuItem.content ? (
            <div
              className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
              dangerouslySetInnerHTML={{ __html: menuItem.content }}
              data-testid={`content-html-${menuItem.id}`}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Content for this section is being updated. Please check back soon.
              </p>
            </div>
          )}

          {relatedItems.length > 0 && (
            <section className="mt-10 border-t border-border pt-6" aria-label="Related pages">
              <h3 className="text-lg font-semibold text-foreground mb-3">Related pages</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {relatedItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={generateSEOPath(item)}
                      onClick={(event) => handleNavigate(event, item)}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
