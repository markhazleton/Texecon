// Route debugger component for development
// Shows current route information and available routes

import { useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { buildMenuHierarchy } from "@/lib/menu-utils";
import { generateSEOPath } from "@/lib/seo-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RouteDebugger() {
  const [location] = useLocation();
  const [, pageParams] = useRoute("/page/:pageId");
  const [, contentParams] = useRoute("/content/:contentSlug");
  const [, topicParams] = useRoute("/topic/:topicId");
  const [, sectionParams] = useRoute("/section/:sectionSlug");

  // Memoize menu items to prevent constant rebuilding
  const menuItems = useMemo(() => {
    const hierarchy = buildMenuHierarchy();
    return Object.values(hierarchy.byId).slice(0, 5); // Show first 5 items
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-background/95 backdrop-blur-xs border shadow-lg z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Route Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <strong>Current Location:</strong> {location}
        </div>

        <div>
          <strong>Route Params:</strong>
          <div className="ml-2">
            {pageParams && <div>Page ID: {pageParams.pageId}</div>}
            {contentParams && <div>Content: {contentParams.contentSlug}</div>}
            {topicParams && <div>Topic: {topicParams.topicId}</div>}
            {sectionParams && <div>Section: {sectionParams.sectionSlug}</div>}
            {!pageParams && !contentParams && !topicParams && !sectionParams && (
              <div className="text-muted-foreground">None</div>
            )}
          </div>
        </div>

        <div>
          <strong>Available Routes:</strong>
          <div className="ml-2 space-y-1">
            <div className="text-primary">/ (Home)</div>
            {menuItems.map((item) => (
              <div key={item.id} className="text-muted-foreground">
                {generateSEOPath(item)} ({item.title})
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          This debugger only shows in development mode.
        </div>
      </CardContent>
    </Card>
  );
}
