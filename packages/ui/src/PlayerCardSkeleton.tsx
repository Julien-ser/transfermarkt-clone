import React from 'react';

export interface PlayerCardSkeletonProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show the player image
   * @default true
   */
  withImage?: boolean;
  /**
   * Whether to show market value section
   * @default true
   */
  withMarketValue?: boolean;
}

/**
 * A skeleton loader for player profile cards.
 * Mimics the layout of a player card with avatar, name, and stats.
 *
 * @example
 * ```tsx
 * <PlayerCardSkeleton />
 * ```
 */
export const PlayerCardSkeleton: React.FC<PlayerCardSkeletonProps> = ({
  className = '',
  withImage = true,
  withMarketValue = true,
}) => {
  return (
    <div
      className={`rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 animate-pulse ${className}`}
      aria-busy="true"
      aria-label="Loading player information"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image/Avatar Section */}
        {withImage && (
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        )}

        {/* Info Section */}
        <div className="flex-1 space-y-4">
          {/* Name */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>

              {/* Badges */}
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>

            {/* Market Value */}
            {withMarketValue && (
              <div className="mt-4 md:mt-0 md:ml-4 text-right">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-auto mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 ml-auto"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto mt-2"></div>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
