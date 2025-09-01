import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { insights } from '@/lib/data';

const categoryColors = {
  ANALYSIS: 'bg-primary text-primary-foreground',
  ENERGY: 'bg-secondary text-secondary-foreground',
  TECH: 'bg-accent text-accent-foreground',
};

export default function Insights() {
  return (
    <section id="insights" className="py-16 bg-background" data-testid="insights-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Latest Economic Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with our expert analysis of Texas economic trends and market developments.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {insights.map((insight) => (
            <Card 
              key={insight.id} 
              className="card-hover overflow-hidden shadow-lg"
              data-testid={`insight-${insight.id}`}
            >
              <img 
                src={insight.image}
                alt={`Economic insight: ${insight.title} - ${insight.category} analysis`}
                className="w-full h-48 object-cover"
                loading="lazy"
                data-testid={`img-${insight.id}`}
              />
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge 
                    className={categoryColors[insight.category as keyof typeof categoryColors]}
                    data-testid={`badge-${insight.id}`}
                  >
                    {insight.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {insight.date}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">
                  {insight.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {insight.excerpt}
                </p>
                <a 
                  href={insight.slug}
                  className="text-primary font-semibold hover:text-primary/80 transition-colors inline-flex items-center gap-1"
                  data-testid={`link-${insight.id}`}
                >
                  Read Full Analysis
                  <ArrowRight className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
