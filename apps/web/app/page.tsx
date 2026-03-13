"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
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
            <div className="mt-10 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search players, clubs, leagues..."
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Latest Transfers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Latest Transfers</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with the latest player movements from top leagues around the world.
            </p>
            <Link
              href="/transfers"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              View all transfers →
            </Link>
          </div>

          {/* Market Values */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Market Values</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Explore current market valuations and trends for players worldwide.
            </p>
            <Link
              href="/players"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse players →
            </Link>
          </div>

          {/* Leagues */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Leagues & Clubs</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed standings, squad information, and club statistics.
            </p>
            <Link
              href="/leagues"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              View leagues →
            </Link>
          </div>
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
  );
}
