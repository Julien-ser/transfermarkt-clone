import * as Sentry from "@sentry/nextjs";

import { middleware, isServerError } from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production by setting the SENTRY_ENABLED environment variable
  enabled: process.env.SENTRY_ENABLED === "true",

  // Adjust the sample rate in production by setting the SENTRY_SAMPLE_RATE environment variable
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting things up
  debug: false,

  // Capture all unhandled exceptions and unhandled promise rejections
  beforeSend(event: any, hint: any) {
    // Filter out errors in development that aren't actual errors
    if (process.env.NODE_ENV === "development" && !isServerError(hint.originalException)) {
      return null;
    }
    return event;
  },
});

export const config = {
  // Match all routes except static assets and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - we'll handle errors there separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// Export middleware for global error handling
export { middleware };
