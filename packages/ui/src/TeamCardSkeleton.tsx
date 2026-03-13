import React from 'react';

export interface TeamCardSkeletonProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Number of player rows to show in the squad skeleton
   * @default 5
   */
  squadRows?: number;
}

/**
 * A skeleton loader for team profile pages.
 * Mimics the team card layout with logo, info, and squad list.
 *
 * @example
 * ```tsx
 * <TeamCardSkeleton squadRows={8} />
 * ```
 */
export const TeamCardSkeleton: React.FC<TeamCardSkeletonProps> = ({
  className = '',
  squadRows = 5,
}) => {
  return (
    <div
      className={`space-y-6 animate-pulse ${className}`}
      aria-busy="true"
      aria-label="Loading team information"
    >
      {/* Team Header Card */}
      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Team Logo */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>

          {/* Team Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Squad Table */}
      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          {['Player', 'Position', 'Age', 'Market Value', ''].map((header) => (
            <div
              key={header}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>

        {/* Table Rows */}
        {Array.from({ length: squadRows }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
          >
            <div className="col-span-12 md:col-span-4 flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="space-y-1 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="col-span-4 md:col-span-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
            <div className="col-span-4 md:col-span-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="col-span-4 md:col-span-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
            <div className="col-span-12 md:col-span-2 flex justify-end">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
