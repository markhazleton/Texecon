import { Star, Linkedin } from 'lucide-react';
import { useScrollToSection } from '@/hooks/use-scroll';
import { realContent } from '@/lib/data';

// Get actual pages from navigation data
const getFooterLinks = () => {
  const navItems = realContent.navigation || [];
  
  return {
    quickLinks: [
      { label: 'Home', section: 'home' },
      { label: 'Texas Economy', href: '#texas', pageId: 'texas' },
      { label: 'Economic Team', href: '#texecon', pageId: 'texecon' },
      { label: 'About Mark Hazleton', href: '#texecon/mark-hazleton', pageId: 'texecon/mark-hazleton' },
    ],
    resources: [
      { label: 'Dr. Jared Hazleton', href: '#texecon/jared-hazleton', pageId: 'texecon/jared-hazleton' },
      { label: 'Regional Analysis', href: '#kansas/wichita', pageId: 'kansas/wichita' },
      { label: 'Contact Mark Hazleton', href: 'https://www.linkedin.com/in/markhazleton/', external: true },
    ],
  };
};

const socialLinks = [
  { icon: Linkedin, href: 'https://www.linkedin.com/in/markhazleton/', label: 'Mark Hazleton LinkedIn' },
];

export default function Footer() {
  const scrollToSection = useScrollToSection();
  const footerLinks = getFooterLinks();
  
  // Function to handle link clicks for navigation items
  const handleNavClick = (pageId: string, href: string) => {
    if (pageId && window.dispatchEvent) {
      // Dispatch custom event for page navigation
      const event = new CustomEvent('navigateToPage', { 
        detail: { pageId } 
      });
      window.dispatchEvent(event);
    } else {
      // Fallback to href
      window.location.hash = href;
    }
  };

  return (
    <footer className="bg-card border-t border-border py-12" data-testid="footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="text-primary text-2xl" />
              <span className="text-xl font-bold text-primary">TexEcon</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Providing expert analysis and commentary on the Texas economy. Our mission is to educate and inform about economic trends and future prospects.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                  data-testid={`social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link, index) => (
                <li key={link.section || (link as any).pageId || index}>
                  {link.section ? (
                    <button
                      onClick={() => scrollToSection(link.section)}
                      className="text-muted-foreground hover:text-primary transition-colors text-left"
                      data-testid={`footer-link-${link.section}`}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavClick((link as any).pageId, (link as any).href)}
                      className="text-muted-foreground hover:text-primary transition-colors text-left"
                      data-testid={`footer-link-${(link as any).pageId}`}
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <li key={link.label || index}>
                  {(link as any).external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`resource-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleNavClick((link as any).pageId, link.href)}
                      className="text-muted-foreground hover:text-primary transition-colors text-left"
                      data-testid={`resource-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 TexEcon.com. All rights reserved. Powered by expert economic analysis and cutting-edge technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
