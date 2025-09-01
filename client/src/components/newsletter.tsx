import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - in real implementation, this would call your newsletter service
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Successfully Subscribed!",
        description: "Thank you for subscribing to our economic insights.",
      });
      
      setEmail('');
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "There was an error subscribing you to our newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-primary" data-testid="newsletter-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Stay Informed
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Get the latest Texas economic insights delivered to your inbox weekly.
          </p>
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            data-testid="newsletter-form"
          >
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-background text-foreground"
              disabled={isLoading}
              data-testid="input-email"
            />
            <Button
              type="submit"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 whitespace-nowrap"
              disabled={isLoading}
              data-testid="button-subscribe"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
          <p className="text-sm text-primary-foreground/70 mt-4">
            Join 5,000+ professionals who trust our economic insights.
          </p>
        </div>
      </div>
    </section>
  );
}
