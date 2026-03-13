import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production by setting the SENTRY_ENABLED environment variable
  enabled: process.env.SENTRY_ENABLED === "true",

  // Adjust the sample rate in production by setting the SENTRY_SAMPLE_RATE environment variable
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting things up
  debug: false,

  // Server-specific configuration
  serverName: process.env.NEXT_PUBLIC_APP_NAME || "transfermarkt-clone",
});

export const config = {
  // Match all API routes except static files
  matcher: [
    /*
     * Match all API routes but not static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
