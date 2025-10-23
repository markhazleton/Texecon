import { useState, useEffect } from "react";
import { MenuItem } from "@/lib/menu-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag } from "lucide-react";

interface ContentDisplayProps {
  menuItem: MenuItem | null;
}

export default function ContentDisplay({ menuItem }: ContentDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (menuItem) {
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 50);
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

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      data-testid={`content-${menuItem.argument || menuItem.id}`}
    >
      <Card className="shadow-lg">
        <CardHeader>
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
        </CardContent>
      </Card>
    </div>
  );
}
