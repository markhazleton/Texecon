import { useEffect } from 'react';

// Performance monitoring for Core Web Vitals
export default function PerformanceMonitor() {
  useEffect(() => {
    // Monitor Core Web Vitals if supported
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry && process.env.NODE_ENV === 'development') {
          console.log('LCP:', lastEntry.startTime);
        }
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Fallback for browsers that don't support LCP
      }

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsScore = 0;
        const entries = entryList.getEntries();
        for (const entry of entries) {
          if (!(entry as any).hadRecentInput) {
            clsScore += (entry as any).value;
          }
        }
        if (process.env.NODE_ENV === 'development' && clsScore > 0) {
          console.log('CLS:', clsScore);
        }
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Fallback for browsers that don't support CLS
      }

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry && process.env.NODE_ENV === 'development') {
          console.log('FID:', (lastEntry as any).processingStart - lastEntry.startTime);
        }
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Fallback for browsers that don't support FID
      }

      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect(); 
        fidObserver.disconnect();
      };
    }
    
    // Return empty cleanup function if PerformanceObserver not supported
    return () => {};
  }, []);

  return null; // This component doesn't render anything
}