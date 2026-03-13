"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Player {
  id: number;
  fullName: string;
  position: { name: string };
  nationality: { name: string };
  marketValue: number | null;
  imageUrl: string | null;
  currentClub: {
    id: number;
    name: string;
    logoUrl: string | null;
  } | null;
}

export default function WatchlistPage() {
  const { data: session, status } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"players" | "clubs">("players");

  useEffect(() => {
    if (session) {
      fetchWatchlist();
    }
  }, [session]);

  const fetchWatchlist = async () => {
    try {
      const response = await fetch("/api/watchlist");
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
        setClubs(data.clubs || []);
      }
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (type: "player" | "club", id: number) => {
    if (!confirm("Are you sure you want to remove this item from your watchlist?")) {
      return;
    }

    try {
      const response = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, id }),
      });

      if (response.ok) {
        if (type === "player") {
          setPlayers(players.filter((p) => p.id !== id));
        } else {
          setClubs(clubs.filter((c) => c.id !== id));
        }
      } else {
        alert("Failed to remove from watchlist");
      }
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      alert("An error occurred");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You must be signed in to view your watchlist.</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Watchlist</h1>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to home
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("players")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "players"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Players ({players.length})
          </button>
          <button
            onClick={() => setActiveTab("clubs")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "clubs"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Clubs ({clubs.length})
          </button>
        </nav>
      </div>

      {/* Players Tab */}
      {activeTab === "players" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {players.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No players in your watchlist.{" "}
              <Link href="/players" className="text-blue-600 hover:underline">
                Browse players
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {players.map((player) => (
                <li key={player.id} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="flex items-center flex-1 min-w-0">
                      {player.imageUrl ? (
                        <img
                          src={player.imageUrl}
                          alt={player.fullName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm">
                            {player.fullName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            <Link href={`/players/${player.id}`}>
                              {player.fullName}
                            </Link>
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-900">
                              {player.marketValue != null
                                ? `€${player.marketValue.toLocaleString()}M`
                                : "N/A"}
                            </p>
                            <button
                              onClick={() => removeFromWatchlist("player", player.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <p className="truncate">
                            {player.position?.name} • {player.nationality?.name}
                            {player.currentClub && ` • ${player.currentClub.name}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Clubs Tab */}
      {activeTab === "clubs" && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {clubs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No clubs in your watchlist.{" "}
              <Link href="/teams" className="text-blue-600 hover:underline">
                Browse teams
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clubs.map((club) => (
                <li key={club.id} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="flex items-center flex-1 min-w-0">
                      {club.logoUrl && (
                        <img
                          src={club.logoUrl}
                          alt={club.name}
                          className="h-12 w-12 object-contain"
                        />
                      )}
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            <Link href={`/teams/${club.id}`}>
                              {club.name}
                            </Link>
                          </p>
                          <button
                            onClick={() => removeFromWatchlist("club", club.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        {club.country && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">{club.country.name}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
