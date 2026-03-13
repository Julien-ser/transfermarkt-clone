"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, Button } from "ui";

interface Competition {
  id: number;
  name: string;
  type: string;
  country: {
    name: string;
    flagUrl?: string | null;
  } | null;
  logoUrl?: string | null;
}

export function FeaturedLeaguesCarousel() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollAmount = 300;

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/competitions?limit=8&sortBy=name&sortOrder=asc");
        if (!response.ok) {
          throw new Error("Failed to fetch competitions");
        }
        const data = await response.json();
        setCompetitions(data.competitions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('leagues-carousel');
    if (container) {
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Featured Leagues</h2>
          <div className="text-red-600 dark:text-red-400">Error loading competitions: {error}</div>
        </div>
      </section>
    );
  }

  if (competitions.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Featured Leagues
        </h2>
        
        <div className="relative">
          {/* Left Arrow */}
          <Button
            variant="outline"
            size="small"
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg"
            aria-label="Scroll left"
          >
            ←
          </Button>

          {/* Carousel Container */}
          <div
            id="leagues-carousel"
            className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {competitions.map((competition) => (
              <Card
                key={competition.id}
                hoverable
                clickable
                onClick={() => window.location.href = `/leagues/${competition.id}`}
                className="flex-shrink-0 w-48 p-4 cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  {competition.logoUrl ? (
                    <div className="relative w-16 h-16 mb-3">
                      <Image
                        src={competition.logoUrl}
                        alt={`${competition.name} logo`}
                        fill
                        className="object-contain"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 mb-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-400">
                        {competition.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {competition.name}
                  </h3>
                  
                  {competition.country && (
                    <div className="flex items-center mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {competition.country.flagUrl && (
                        <div className="relative w-4 h-3 mr-1">
                          <Image
                            src={competition.country.flagUrl}
                            alt={competition.country.name}
                            fill
                            className="object-cover"
                            sizes="16px"
                          />
                        </div>
                      )}
                      <span>{competition.country.name}</span>
                    </div>
                  )}
                  
                  <span className="mt-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    {competition.type}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Right Arrow */}
          <Button
            variant="outline"
            size="small"
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-lg"
            aria-label="Scroll right"
          >
            →
          </Button>
        </div>
      </div>
    </section>
  );
}
