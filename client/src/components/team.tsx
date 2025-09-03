import { Linkedin, Github } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { teamMembers } from '@/lib/data';

export default function Team() {
  return (
    <section id="about" className="py-16 bg-muted" data-testid="team-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Our Expert Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Led by renowned experts with years of experience in economic analysis and technology solutions.
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
                      {(member as any).page_url ? (
                        <a 
                          href={(member as any).page_url}
                          className="hover:text-primary transition-colors"
                          data-testid={`link-${member.id}-profile`}
                          title={`View ${member.name}'s Profile`}
                        >
                          {member.name}
                        </a>
                      ) : (
                        member.name
                      )}
                    </h3>
                    <p className="text-primary font-semibold mb-1">
                      {member.title}
                    </p>
                    {(member as any).subtitle && (
                      <p className="text-secondary font-medium text-sm mb-3">
                        {(member as any).subtitle}
                      </p>
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
                          <Linkedin className="w-5 h-5" />
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
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {(member.social as any)?.website && (
                        <a 
                          href={(member.social as any).website}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
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
