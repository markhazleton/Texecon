import { useState } from 'react';
import { Menu, X } from 'lucide-react';
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
    
    // Let the parent handle URL navigation and content loading
    if (onMenuItemSelect) {
      onMenuItemSelect(item);
    }
  };

  const handleLogoClick = () => {
    setActiveMenuItem(null);
    
    if (onMenuItemSelect) {
      // Signal to show home page (no specific content)
      onMenuItemSelect(null as any);
    }
  };

  return (
    <nav 
  className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xs border-b border-border"
      data-testid="navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
            onClick={handleLogoClick}
            data-testid="logo-button"
            type="button"
          >
            <img 
              src="/favicon-96x96.png" 
              alt="TexEcon Logo" 
              className="w-6 h-6" 
              data-testid="logo-icon"
              loading="eager"
            />
            <span className="text-xl font-bold text-primary" data-testid="logo-text">
              TexEcon
            </span>
          </button>
          
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
