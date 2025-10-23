/**
 * Google Analytics utilities for SPA tracking
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics tracking ID
export const GA_TRACKING_ID = "G-MFGJJRS2SH";

/**
 * Track a page view in Google Analytics
 * @param url - The page URL to track
 */
export function trackPageView(url: string): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_location: window.location.origin + url,
      page_path: url,
    });
  }
}

/**
 * Track a custom event in Google Analytics
 * @param action - The event action
 * @param category - The event category
 * @param label - Optional event label
 * @param value - Optional numeric value
 */
export function trackEvent(action: string, category: string, label?: string, value?: number): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Track an exception in Google Analytics
 * @param description - Error description
 * @param fatal - Whether the error was fatal
 */
export function trackException(description: string, fatal = false): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "exception", {
      description,
      fatal,
    });
  }
}

/**
 * Track timing information in Google Analytics
 * @param name - The timing variable name
 * @param value - The timing value in milliseconds
 * @param category - The timing category
 * @param label - Optional timing label
 */
export function trackTiming(
  name: string,
  value: number,
  category = "Performance",
  label?: string
): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "timing_complete", {
      name,
      value,
      event_category: category,
      event_label: label,
    });
  }
}
