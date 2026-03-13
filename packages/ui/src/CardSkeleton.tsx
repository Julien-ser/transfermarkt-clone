import React from 'react';

export interface CardSkeletonProps {
  /**
   * Number of skeleton blocks to display
   * @default 3
   */
  lines?: number;
  /**
   * Whether to show an image/avatar area at the top
   * @default false
   */
  withImage?: boolean;
  /**
   * Whether to show a header area
   * @default false
   */
  withHeader?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Padding size for the skeleton
   * @default 'medium'
   */
  padding?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * A skeleton loader component that mimics the Card component.
 * Used to show loading state while content is being fetched.
 *
 * @example
 * ```tsx
 * <CardSkeleton lines={4} withImage />
 * ```
 */
export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  lines = 3,
  withImage = false,
  withHeader = false,
  className = '',
  padding = 'medium',
}) => {
  const paddingStyles = {
    none: '',
    small: 'p-3',
    medium: 'p-5',
    large: 'p-8',
  };

  return (
    <div
      className={`rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse ${paddingStyles[padding]} ${className}`}
      aria-busy="true"
      aria-label="Loading content"
    >
      {withHeader && (
        <div className="mb-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      )}

      {withImage && (
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {Array.from({ length: Math.max(0, lines - 2) }).map((_, i) => (
          <div key={`text-${i}`} className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
};
