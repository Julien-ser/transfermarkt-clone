"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, lazy } from "react";
import { SearchBar } from "@/components/home/SearchBar";
import { Card } from "ui";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Dynamic imports for below-the-fold components
const FeaturedLeaguesCarousel = lazy(() => 
  import("@/components/home/FeaturedLeaguesCarousel").then(mod => ({ default: mod.FeaturedLeaguesCarousel }))
);
const LatestTransfersTable = lazy(() => 
  import("@/components/home/LatestTransfersTable").then(mod => ({ default: mod.LatestTransfersTable }))
);
const MarketValueLeaders = lazy(() => 
  import("@/components/home/MarketValueLeaders").then(mod => ({ default: mod.MarketValueLeaders }))
);

// Loading skeleton components
function FeaturedLeaguesCarouselSkeleton() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">Featured Leagues</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestTransfersTableSkeleton() {
  return (
    <Card className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MarketValueLeadersSkeleton() {
  return (
    <Card className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-white">Transfermarkt Clone</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {status === "loading" ? (
                <span className="text-white">Loading...</span>
              ) : session ? (
                <>
                  <span className="text-white">Welcome, {session.user?.name || session.user?.email}</span>
                  <Link
                    href="/watchlist"
                    className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Watchlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to Transfermarkt Clone
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl">
              The ultimate platform for football transfer news, player market values, and statistics.
            </p>
            <div className="mt-10 max-w-3xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Leagues Carousel */}
      <Suspense fallback={<FeaturedLeaguesCarouselSkeleton />}>
        <FeaturedLeaguesCarousel />
      </Suspense>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Suspense fallback={<LatestTransfersTableSkeleton />}>
            <LatestTransfersTable />
          </Suspense>
          <Suspense fallback={<MarketValueLeadersSkeleton />}>
            <MarketValueLeaders />
          </Suspense>
        </div>

        {session && (
          <div className="mt-12 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
            <div className="flex space-x-4">
              <Link
                href="/players"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Browse Players
              </Link>
              <Link
                href="/teams"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Teams
              </Link>
              <Link
                href="/watchlist"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                My Watchlist
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p>&copy; 2025 Transfermarkt Clone. All rights reserved.</p>
            <p className="mt-2 text-gray-400 text-sm">
              This is a clone for educational purposes.
            </p>
          </div>
         </div>
       </footer>
     </div>
   </ErrorBoundary>
 );
}
