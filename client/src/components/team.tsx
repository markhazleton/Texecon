import { Linkedin, Twitter, Github } from 'lucide-react';
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
                      {member.name}
                    </h3>
                    <p className="text-primary font-semibold mb-3">
                      {member.title}
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {member.description}
                    </p>
                    <div className="flex justify-center md:justify-start space-x-4">
                      {member.social.linkedin && (
                        <a 
                          href={member.social.linkedin}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          data-testid={`link-${member.id}-linkedin`}
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a 
                          href={member.social.twitter}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          data-testid={`link-${member.id}-twitter`}
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {member.social.github && (
                        <a 
                          href={member.social.github}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          data-testid={`link-${member.id}-github`}
                        >
                          <Github className="w-5 h-5" />
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
