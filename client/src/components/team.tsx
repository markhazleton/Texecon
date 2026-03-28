import { Card, CardContent } from "@/components/ui/card";
import { teamMembers } from "@/lib/data";
import { buildMenuHierarchy } from "@/lib/menu-utils";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.56V14.9c0-1.32-.03-3.02-1.84-3.02-1.85 0-2.14 1.44-2.14 2.93v5.64H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.84 3.38-1.84 3.61 0 4.28 2.38 4.28 5.48v6.25ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.16c-3.34.73-4.04-1.41-4.04-1.41-.55-1.37-1.34-1.74-1.34-1.74-1.1-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.08 1.83 2.83 1.3 3.52.99.11-.77.42-1.3.76-1.6-2.67-.3-5.48-1.33-5.48-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.64.25 2.86.12 3.16.77.84 1.24 1.91 1.24 3.22 0 4.6-2.82 5.61-5.51 5.91.43.37.82 1.1.82 2.23v3.3c0 .32.22.69.82.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

export default function Team() {
  // Handle team member profile navigation
  const handleProfileClick = (pageUrl: string) => {
    // Find the menu item for this section
    const hierarchy = buildMenuHierarchy();
    const sectionSlug = pageUrl.replace("/section/", "");

    // First try to find by title match (case-insensitive slug comparison)
    let menuItem = Object.values(hierarchy.byId).find((item) => {
      const itemSlug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      return itemSlug === sectionSlug;
    });

    // If not found by title, try by argument that ends with the slug
    if (!menuItem) {
      menuItem = Object.values(hierarchy.byId).find(
        (item) => item.argument && item.argument.endsWith(sectionSlug)
      );
    }

    if (menuItem) {
      // Dispatch custom event for navigation
      window.dispatchEvent(
        new CustomEvent("navigateToPage", {
          detail: { menuItem },
        })
      );
    }
  };
  return (
    <section id="about" className="py-16 bg-muted" data-testid="team-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Our Expert Team</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Led by renowned experts with years of experience in economic analysis and technology
            solutions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className="card-hover bg-card shadow-lg"
              data-testid={`team-member-${member.id}`}
            >
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
                  <img
                    src={member.image}
                    alt={`${member.name} - ${member.title}`}
                    className="w-32 h-32 rounded-full object-cover"
                    data-testid={`img-${member.id}`}
                  />
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-card-foreground mb-2">
                      {member.page_url ? (
                        <button
                          onClick={() => handleProfileClick(member.page_url)}
                          className="hover:text-primary transition-colors text-left"
                          data-testid={`link-${member.id}-profile`}
                          title={`View ${member.name}'s Profile`}
                        >
                          {member.name}
                        </button>
                      ) : (
                        member.name
                      )}
                    </h3>
                    <p className="text-primary font-semibold mb-1">{member.title}</p>
                    {member.subtitle && (
                      <p className="text-secondary font-medium text-sm mb-3">{member.subtitle}</p>
                    )}
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {member.description}
                    </p>
                    <div className="flex justify-center md:justify-start space-x-4">
                      {member.social?.linkedin && (
                        <a
                          href={member.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          data-testid={`link-${member.id}-linkedin`}
                          title="LinkedIn Profile"
                        >
                          <LinkedInIcon className="w-5 h-5" />
                        </a>
                      )}
                      {member.social?.github && (
                        <a
                          href={member.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          data-testid={`link-${member.id}-github`}
                          title="GitHub Profile"
                        >
                          <GitHubIcon className="w-5 h-5" />
                        </a>
                      )}
                      {member.social?.website && (
                        <a
                          href={member.social.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          data-testid={`link-${member.id}-website`}
                          title="Personal Website"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
