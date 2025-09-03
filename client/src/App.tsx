import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/error-boundary";
import { useAnalytics } from "@/hooks/useAnalytics";
import { trackException } from "@/lib/analytics";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  // Track page views with Google Analytics
  useAnalytics();

  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Dynamic routes for menu items */}
      <Route path="/page/:pageId" component={Home} />
      <Route path="/content/:contentSlug" component={Home} />
      <Route path="/topic/:topicId" component={Home} />
      <Route path="/section/:sectionSlug" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Use Vite's injected base path (e.g., '/Texecon/') and normalize for wouter
  const rawBase = import.meta.env.BASE_URL as string;
  const base = rawBase && rawBase !== "/" ? rawBase.replace(/\/$/, "") : "";
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary onError={(error, errorInfo) => {
          // Log error in development
          if (process.env.NODE_ENV === 'development') {
            console.error('App Error Boundary caught error:', error, errorInfo);
          }
          
          // Track error with Google Analytics
          trackException(`${error.name}: ${error.message}`, true);
          
          // TODO: Send to error reporting service in production
        }}>
          <Toaster />
          <WouterRouter base={base}>
            <Router />
          </WouterRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
