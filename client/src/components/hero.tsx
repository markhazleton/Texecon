import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollToSection } from '@/hooks/use-scroll';
import { heroContent } from '@/lib/data';

export default function Hero() {
  const scrollToSection = useScrollToSection();

  return (
    <section 
      id="home" 
      className="gradient-texas hero-pattern pt-24 pb-16 lg:pb-20"
      data-testid="hero-section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              {heroContent.title}
              <span className="block text-secondary">Analysis & Insights</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              {heroContent.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                onClick={() => scrollToSection('insights')}
                data-testid="button-latest-analysis"
              >
                Latest Analysis
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => scrollToSection('about')}
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Modern office building representing Texas economic growth" 
              className="rounded-xl shadow-2xl animate-float w-full h-auto"
              data-testid="hero-image"
            />
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                  <ArrowRight className="text-accent-foreground text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">GDP Growth</p>
                  <p className="text-accent font-bold">+4.2%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
