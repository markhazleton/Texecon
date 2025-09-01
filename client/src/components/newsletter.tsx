import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';

export default function Newsletter() {
  return (
    <section id="contact" className="py-16 bg-primary" data-testid="contact-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Get In Touch
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            For inquiries about Texas economic analysis, collaboration, or consulting services, please connect with Mark Hazleton directly.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Linkedin className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-primary-foreground mb-2">
              Mark Hazleton
            </h3>
            <p className="text-primary-foreground/80 mb-6">
              Technology Director & Solutions Architect
            </p>
            <Button
              asChild
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full"
              data-testid="button-contact-mark"
            >
              <a 
                href="https://www.linkedin.com/in/markhazleton/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <Linkedin className="w-5 h-5" />
                Connect on LinkedIn
              </a>
            </Button>
          </div>
          
          <p className="text-sm text-primary-foreground/70 mt-6">
            Professional inquiries and collaboration opportunities welcome.
          </p>
        </div>
      </div>
    </section>
  );
}
