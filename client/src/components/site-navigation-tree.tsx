import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { MenuItem } from "@/lib/menu-utils";
import { generateSEOPath } from "@/lib/seo-utils";

interface TreeNodeProps {
  item: MenuItem;
  level: number;
  onItemSelect: (item: MenuItem) => void;
}

function TreeNode({ item, level, onItemSelect }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first two levels
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onItemSelect(item);
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center py-2 px-3 rounded-md hover:bg-muted/50 transition-colors group ${
          level === 0 ? "pl-3" : level === 1 ? "pl-7" : level === 2 ? "pl-11" : "pl-16"
        }`}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors mr-2"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        )}

        {/* Spacer for items without children */}
        {!hasChildren && <div className="w-7" />}

        {/* Item Link */}
        <a
          href={generateSEOPath(item)}
          onClick={handleItemClick}
          className="flex-1 flex items-center min-w-0 text-left hover:text-primary transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span
                className={`font-medium truncate ${
                  level === 0
                    ? "text-base text-foreground"
                    : level === 1
                      ? "text-sm text-foreground/90"
                      : "text-sm text-muted-foreground"
                }`}
              >
                {item.title}
              </span>
              <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
            </div>

            {item.description && level < 2 && (
              <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">
                {item.description}
              </p>
            )}

            {item.url && level === 0 && (
              <span className="text-xs text-muted-foreground/60 mt-1 block font-mono">
                {item.url}
              </span>
            )}
          </div>
        </a>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Connecting line */}
          <div
            className={`absolute top-0 bottom-0 w-px bg-border/30 ${
              level === 0 ? "left-5" : level === 1 ? "left-9" : level === 2 ? "left-14" : "left-20"
            }`}
          />

          {item.children.map((child) => (
            <TreeNode key={child.id} item={child} level={level + 1} onItemSelect={onItemSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

interface SiteNavigationTreeProps {
  items: MenuItem[];
  onItemSelect: (item: MenuItem) => void;
}

export default function SiteNavigationTree({ items, onItemSelect }: SiteNavigationTreeProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="space-y-1">
        {items.map((item) => (
          <TreeNode key={item.id} item={item} level={0} onItemSelect={onItemSelect} />
        ))}
      </div>
    </div>
  );
}
