import React from 'react';

export interface StatsSkeletonProps {
  /**
   * Whether to show a chart area
   * @default false
   */
  withChart?: boolean;
  /**
   * Number of stat rows to display
   * @default 8
   */
  rows?: number;
  /**
   * Height of the chart container if withChart is true
   * @default 'h-80'
   */
  chartHeight?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * A skeleton loader for statistics sections.
 * Can show a chart placeholder and/or a stats table.
 *
 * @example
 * ```tsx
 * <StatsSkeleton withChart rows={12} />
 * ```
 */
export const StatsSkeleton: React.FC<StatsSkeletonProps> = ({
  withChart = false,
  rows = 8,
  chartHeight = 'h-80',
  className = '',
}) => {
  return (
    <div className={`space-y-6 animate-pulse ${className}`} aria-busy="true" aria-label="Loading statistics">
      {withChart && (
        <div className={`${chartHeight} bg-gray-100 dark:bg-gray-700 rounded-lg`}>
          <div className="p-4 space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
            <div className="flex items-end gap-2 h-48">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-t"
                  style={{ height: `${30 + i * 15}%` }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-8"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Table */}
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>

        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
