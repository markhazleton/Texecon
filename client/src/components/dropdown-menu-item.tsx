import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { MenuItem, hasChildren, formatMenuTitle } from '@/lib/menu-utils';

interface DropdownMenuItemProps {
  item: MenuItem;
  onItemClick: (item: MenuItem) => void;
  isActive: boolean;
  isMobile?: boolean;
}

export default function DropdownMenuItem({ 
  item, 
  onItemClick, 
  isActive, 
  isMobile = false 
}: DropdownMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasSubItems = hasChildren(item);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleItemClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else {
      onItemClick(item);
    }
  };

  const handleChildClick = (childItem: MenuItem) => {
    onItemClick(childItem);
    setIsOpen(false);
  };

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Add a small delay before closing to prevent accidental closes
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 150);
    setHoverTimeout(timeout);
  };

  if (isMobile) {
    return (
      <div className="w-full">
        <button
          onClick={handleItemClick}
          className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
            isActive
              ? 'text-primary font-medium bg-muted'
              : 'text-muted-foreground hover:text-primary hover:bg-muted'
          }`}
          data-testid={`mobile-nav-${item.argument || item.id}`}
        >
          <span>{formatMenuTitle(item.title)}</span>
          {hasSubItems && (
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          )}
        </button>
        
        {hasSubItems && isOpen && (
          <div className="pl-6 bg-muted/50">
            {item.children.map((child) => (
              <button
                key={child.id}
                onClick={() => handleChildClick(child)}
                className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                data-testid={`mobile-nav-child-${child.argument || child.id}`}
              >
                {formatMenuTitle(child.title)}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop dropdown
  return (
    <div 
      ref={dropdownRef}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleItemClick}
        className={`flex items-center space-x-1 transition-colors ${
          isActive
            ? 'text-primary font-medium'
            : 'text-muted-foreground hover:text-primary'
        }`}
        data-testid={`nav-${item.argument || item.id}`}
      >
        <span>{formatMenuTitle(item.title)}</span>
        {hasSubItems && (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {hasSubItems && isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-48 bg-card border border-border rounded-md shadow-lg z-50">
          <div className="py-2">
            {item.children.map((child) => (
              <button
                key={child.id}
                onClick={() => handleChildClick(child)}
                className="w-full text-left px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
                data-testid={`nav-child-${child.argument || child.id}`}
              >
                <div>
                  <div className="font-medium">{formatMenuTitle(child.title)}</div>
                  {child.description && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {child.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}