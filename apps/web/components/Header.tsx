"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [watchlistCount, setWatchlistCount] = useState<number>(0);

  useEffect(() => {
    if (session) {
      fetchWatchlistCount();
    }
  }, [session]);

  const fetchWatchlistCount = async () => {
    try {
      const response = await fetch("/api/watchlist");
      if (response.ok) {
        const data = await response.json();
        const total = (data.players?.length || 0) + (data.clubs?.length || 0);
        setWatchlistCount(total);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist count:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
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
                  className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center"
                >
                  Watchlist
                  {watchlistCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {watchlistCount}
                    </span>
                  )}
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
  );
}
