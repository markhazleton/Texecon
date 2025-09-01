import { useState } from 'react';
import { Star, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNavigationItems, MenuItem } from '@/lib/menu-utils';
import DropdownMenuItem from './dropdown-menu-item';

interface NavigationProps {
  onMenuItemSelect?: (item: MenuItem) => void;
}

export default function Navigation({ onMenuItemSelect }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const menuItems = getNavigationItems();

  const handleMenuItemClick = (item: MenuItem) => {
    setActiveMenuItem(item.argument || item.id.toString());
    setIsMobileMenuOpen(false);
    
    // Call the parent callback to display content
    if (onMenuItemSelect) {
      onMenuItemSelect(item);
    }
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
      data-testid="navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Star className="text-primary text-2xl" data-testid="logo-icon" />
            <span className="text-xl font-bold text-primary" data-testid="logo-text">
              TexEcon
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                item={item}
                onItemClick={handleMenuItemClick}
                isActive={activeMenuItem === (item.argument || item.id.toString())}
              />
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border" data-testid="mobile-menu">
            <div className="py-2">
              {menuItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  item={item}
                  onItemClick={handleMenuItemClick}
                  isActive={activeMenuItem === (item.argument || item.id.toString())}
                  isMobile={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
