import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "@/lib/analytics";

/**
 * Hook to track page views with Google Analytics
 * Automatically tracks route changes in Wouter-based SPAs
 */
export function useAnalytics() {
  const [location] = useLocation();

  useEffect(() => {
    // Track initial page view and subsequent route changes
    trackPageView(location);
  }, [location]);
}
