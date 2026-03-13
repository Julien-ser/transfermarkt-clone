"use client";

/**
 * Hook for tracking user interactions
 * Integrates with Simple Analytics for privacy-friendly event tracking
 */
export function useAnalytics() {
  const trackEvent = (category: string, action: string, label?: string, value?: number) => {
    if (typeof window === "undefined") return;

    // Simple Analytics custom event tracking
    // https://docs.simpleanalytics.com/features/custom-events
    try {
      // @ts-expect-error - Simple Analytics global
      if (window.sa_event) {
        // @ts-expect-error - Simple Analytics global
        window.sa_event(category, action, label, value);
      }
    } catch (error) {
      console.warn("Analytics tracking failed:", error);
    }
  };

  const trackClick = (buttonName: string, label?: string) => {
    trackEvent("button", "click", label || buttonName);
  };

  const trackSearch = (query: string) => {
    trackEvent("search", "query", query);
  };

  const trackPageView = (path: string) => {
    if (typeof window === "undefined") return;

    try {
      // @ts-expect-error - Simple Analytics global
      if (window.sa_pageview) {
        // @ts-expect-error - Simple Analytics global
        window.sa_pageview(path);
      }
    } catch (error) {
      console.warn("Analytics pageview tracking failed:", error);
    }
  };

  return {
    trackEvent,
    trackClick,
    trackSearch,
    trackPageView,
  };
}
