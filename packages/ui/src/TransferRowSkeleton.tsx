import React from 'react';

export interface TransferRowSkeletonProps {
  /**
   * Number of transfer rows to display
   * @default 5
   */
  count?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * A skeleton loader for transfer history rows.
 * Shows the typical layout of a transfer with player image, names, and fee.
 *
 * @example
 * ```tsx
 * <TransferRowSkeleton count={10} />
 * ```
 */
export const TransferRowSkeleton: React.FC<TransferRowSkeletonProps> = ({
  count = 5,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`} aria-busy="true" aria-label="Loading transfers">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-l-4 border-blue-500 pl-4 py-2 relative animate-pulse"
        >
          {/* Timeline dot */}
          <div className="absolute -left-[9px] top-4 w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Clubs and Player */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                {/* From Club */}
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <span className="text-gray-500">→</span>
                {/* To Club */}
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              </div>

              {/* Date and Type */}
              <div className="flex gap-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>

            {/* Fee */}
            <div className="mt-2 md:mt-0">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 ml-auto"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
