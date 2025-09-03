import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/error-boundary";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary onError={(error, errorInfo) => {
          // Log error in development
          if (process.env.NODE_ENV === 'development') {
            console.error('App Error Boundary caught error:', error, errorInfo);
          }
          // TODO: Send to error reporting service in production
        }}>
          <Toaster />
          <Router />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
