"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "ui";

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/players?name=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl">
      <div className="relative flex items-center">
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players, clubs, leagues..."
          className="flex-1 pr-32 py-4 text-lg rounded-l-lg"
          aria-label="Search players, clubs, and leagues"
        />
        <Button
          type="submit"
          variant="primary"
          size="large"
          className="rounded-l-none"
        >
          Search
        </Button>
      </div>
      <p className="mt-2 text-center text-blue-200 text-sm">
        Try: "Mbappé", "Manchester United", "Premier League"
      </p>
    </form>
  );
}