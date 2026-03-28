import { Button } from "@/components/ui/button";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.56V14.9c0-1.32-.03-3.02-1.84-3.02-1.85 0-2.14 1.44-2.14 2.93v5.64H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.84 3.38-1.84 3.61 0 4.28 2.38 4.28 5.48v6.25ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export default function Newsletter() {
  return (
    <section
      id="contact"
      className="py-16 bg-gradient-to-b from-muted to-background text-foreground"
      data-testid="contact-section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Get In Touch</h2>
          <p className="text-xl text-muted-foreground mb-8">
            For inquiries about Texas economic analysis, collaboration, or consulting services,
            please connect with Mark Hazleton directly.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 max-w-md mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary rounded-full p-3">
                <LinkedInIcon className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Mark Hazleton</h3>
            <p className="text-muted-foreground mb-6">Technology Director & Solutions Architect</p>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
              data-testid="button-contact-mark"
            >
              <a
                href="https://www.linkedin.com/in/markhazleton/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2"
              >
                <LinkedInIcon className="w-5 h-5" />
                Connect on LinkedIn
              </a>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Professional inquiries and collaboration opportunities welcome.
          </p>
        </div>
      </div>
    </section>
  );
}
