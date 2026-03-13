import React from 'react';

export interface AvatarSkeletonProps {
  /**
   * Size of the avatar skeleton
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Additional CSS classes
   */
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-32 h-32',
};

/**
 * A skeleton loader for avatar/image components.
 * Displays a gray circle with pulse animation.
 *
 * @example
 * ```tsx
 * <AvatarSkeleton size="lg" />
 * ```
 */
export const AvatarSkeleton: React.FC<AvatarSkeletonProps> = ({
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={`${sizeStyles[size]} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse ${className}`}
      aria-busy="true"
      aria-label="Loading avatar"
    ></div>
  );
};
