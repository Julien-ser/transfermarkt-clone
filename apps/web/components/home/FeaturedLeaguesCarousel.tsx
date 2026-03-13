"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

interface FeaturedLeaguesCarouselProps {
  competitions: Competition[];
}

export function FeaturedLeaguesCarousel({ competitions }: FeaturedLeaguesCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollAmount = 300;

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
            variant="outlined"
            size="icon"
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
            variant="outlined"
            size="icon"
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
