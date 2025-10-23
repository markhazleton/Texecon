import { Linkedin } from "lucide-react";
import { useScrollToSection } from "@/hooks/use-scroll";
import { buildMenuHierarchy, MenuItem } from "@/lib/menu-utils";
import { generateSEOPath } from "@/lib/seo-utils";

// Get actual pages from navigation data and generate SEO-friendly paths
const getFooterLinks = () => {
  const hierarchy = buildMenuHierarchy();
  const menuItems = Object.values(hierarchy.byId);

  // Find specific menu items for footer links
  const findItemByTitle = (title: string) =>
    menuItems.find((item) => item.title.toLowerCase().includes(title.toLowerCase()));

  const texasItem = findItemByTitle("texas");
  const teamItem = findItemByTitle("team") || findItemByTitle("texecon");
  const markItem = findItemByTitle("mark");
  const jaredItem = findItemByTitle("jared");
  const regionalItem = findItemByTitle("regional") || findItemByTitle("wichita");

  return {
    quickLinks: [
      { label: "Home", section: "home" },
      ...(texasItem
        ? [{ label: "Texas Economy", path: generateSEOPath(texasItem), item: texasItem }]
        : []),
      ...(teamItem
        ? [{ label: "Economic Team", path: generateSEOPath(teamItem), item: teamItem }]
        : []),
      ...(markItem
        ? [{ label: "About Mark Hazleton", path: generateSEOPath(markItem), item: markItem }]
        : []),
    ],
    resources: [
      ...(jaredItem
        ? [{ label: "Dr. Jared Hazleton", path: generateSEOPath(jaredItem), item: jaredItem }]
        : []),
      ...(regionalItem
        ? [{ label: "Regional Analysis", path: generateSEOPath(regionalItem), item: regionalItem }]
        : []),
      {
        label: "Contact Mark Hazleton",
        href: "https://www.linkedin.com/in/markhazleton/",
        external: true,
      },
    ],
  };
};

const socialLinks = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/markhazleton/",
    label: "Mark Hazleton LinkedIn",
  },
];

export default function Footer() {
  const base = (import.meta as any).env.BASE_URL as string;
  const scrollToSection = useScrollToSection();
  const footerLinks = getFooterLinks();

  // Function to handle link clicks for navigation items
  const handleNavClick = (_path: string, item?: MenuItem) => {
    // Dispatch custom event with menu item data for the home component
    if (item) {
      const event = new CustomEvent("navigateToPage", {
        detail: { menuItem: item },
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <footer className="bg-card border-t border-border py-12" data-testid="footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={`${base}favicon-32x32.png`}
                alt="TexEcon Logo"
                className="w-8 h-8"
                loading="lazy"
              />
              <span className="text-xl font-bold text-primary">TexEcon</span>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Providing expert analysis and commentary on the Texas economy. Our mission is to
              educate and inform about economic trends and future prospects.
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
                <li key={link.section || (link as any).path || index}>
                  {link.section ? (
                    <a
                      href={`#${link.section}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.section);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`footer-link-${link.section}`}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <a
                      href={(link as any).path}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick((link as any).path, (link as any).item);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {link.label}
                    </a>
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
                      data-testid={`resource-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <a
                      href={(link as any).path}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick((link as any).path, (link as any).item);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`resource-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2006-2025 TexEcon.com. All rights reserved. Powered by expert economic analysis and
            cutting-edge technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
