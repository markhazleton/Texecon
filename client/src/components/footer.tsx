import { Star, Twitter, Linkedin, Youtube, Rss } from 'lucide-react';
import { useScrollToSection } from '@/hooks/use-scroll';

const footerLinks = {
  quickLinks: [
    { label: 'Home', section: 'home' },
    { label: 'About', section: 'about' },
    { label: 'Insights', section: 'insights' },
    { label: 'Analysis', section: 'analysis' },
  ],
  resources: [
    { label: 'Economic Reports', href: '#' },
    { label: 'Data Downloads', href: '#' },
    { label: 'Research Papers', href: '#' },
    { label: 'Contact Mark Hazleton', href: 'https://www.linkedin.com/in/markhazleton/', external: true },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: 'https://www.linkedin.com/in/markhazleton/', label: 'Mark Hazleton LinkedIn' },
];

export default function Footer() {
  const scrollToSection = useScrollToSection();

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
              {footerLinks.quickLinks.map((link) => (
                <li key={link.section}>
                  <button
                    onClick={() => scrollToSection(link.section)}
                    className="text-muted-foreground hover:text-primary transition-colors text-left"
                    data-testid={`footer-link-${link.section}`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-card-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={(link as any).external ? "_blank" : undefined}
                    rel={(link as any).external ? "noopener noreferrer" : undefined}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`resource-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </a>
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
