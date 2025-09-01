import { useState } from 'react';
import { Star, Menu, X } from 'lucide-react';
import { useScrollspy, useScrollToSection } from '@/hooks/use-scroll';
import { Button } from '@/components/ui/button';
import { navigationItems as realNavItems } from '@/lib/data';

const navigationItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'insights', label: 'Insights' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'contact', label: 'Contact' },
];

// Merge real navigation with default sections
const mergedNavigation = [
  ...navigationItems.slice(0, 2), // Home and About
  ...realNavItems.slice(0, 2).map(item => ({
    id: item.id.includes('/') ? item.id.split('/')[1] || item.id : item.id,
    label: item.label.includes('/') ? item.label.split('/')[1] || item.label : item.label
  })),
  ...navigationItems.slice(2) // Rest of default items
].slice(0, 5);

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeSection = useScrollspy(mergedNavigation.map(item => item.id));
  const scrollToSection = useScrollToSection();

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMobileMenuOpen(false);
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
          <div className="hidden md:flex items-center space-x-8">
            {mergedNavigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors ${
                  activeSection === item.id
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-primary'
                }`}
                data-testid={`nav-link-${item.id}`}
              >
                {item.label}
              </button>
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
          <div className="md:hidden py-4 border-t border-border" data-testid="mobile-menu">
            <div className="flex flex-col space-y-2">
              {mergedNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-4 py-2 rounded-md transition-colors ${
                    activeSection === item.id
                      ? 'text-primary font-medium bg-muted'
                      : 'text-muted-foreground hover:text-primary hover:bg-muted'
                  }`}
                  data-testid={`mobile-nav-link-${item.id}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
