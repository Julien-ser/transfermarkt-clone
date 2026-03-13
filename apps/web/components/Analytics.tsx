"use client";

import { useEffect } from "react";

interface AnalyticsProps {
  domain: string;
}

/**
 * Simple Analytics integration component
 * Privacy-friendly analytics without cookies or tracking of personal data
 * See: https://simpleanalytics.com/
 */
export function Analytics({ domain }: AnalyticsProps) {
  useEffect(() => {
    if (!domain || domain === "your-domain.simpleanalytics.com") {
      console.warn("Analytics domain not configured. Set NEXT_PUBLIC_SIMPLE_ANALYTICS_DOMAIN in .env");
      return;
    }

    // Simple Analytics script is loaded via script tag in layout
    // This component just ensures proper initialization on client
    console.log("Simple Analytics initialized with domain:", domain);
  }, [domain]);

  return null;
}
