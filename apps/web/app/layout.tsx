import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Transfermarkt Clone",
  description: "A comprehensive football/soccer transfer database and statistics platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Font preloading for better LCP */}
        <link
          rel="preload"
          href="/_next/static/css/app/layout.css?ts=1"
          as="style"
        />
        {/* DNS prefetch for external image domains */}
        <link rel="dns-prefetch" href="//via.placeholder.com" />
        <link rel="dns-prefetch" href="//placehold.co" />
        <link rel="dns-prefetch" href="//upload.wikimedia.org" />
        {/* Simple Analytics - privacy-friendly */}
        <script
          async
          defer
          src="https://scripts.simpleanalytics.com/latest.js"
          data-spa="async"
          data-ignore="localhost"
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <SessionProvider>{children}</SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
