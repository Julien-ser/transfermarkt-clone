import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The source URL for the avatar image
   */
  src?: string;
  /**
   * The alt text for the avatar image (important for accessibility)
   */
  alt?: string;
  /**
   * The size of the avatar
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  /**
   * Whether the avatar should be circular
   * @default true
   */
  circular?: boolean;
  /**
   * The initials to display when no image is provided
   */
  initials?: string;
  /**
   * Background color for the avatar when no image is provided
   * @default 'bg-blue-500'
   */
  backgroundColor?: string;
  /**
   * Text color for the initials
   * @default 'text-white'
   */
  textColor?: string;
  /**
   * Fallback component to show when image fails to load
   */
  fallback?: React.ReactNode;
}

const sizeStyles = {
  small: 'w-8 h-8 text-xs',
  medium: 'w-10 h-10 text-sm',
  large: 'w-12 h-12 text-base',
  xlarge: 'w-16 h-16 text-lg',
};

/**
 * An avatar component for displaying user profile pictures with fallbacks.
 *
 * @example
 * ```tsx
 * <Avatar
 *   src="/path/to/avatar.jpg"
 *   alt="User name"
 *   size="medium"
 *   circular
 * />
 * ```
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  size = 'medium',
  circular = true,
  initials,
  backgroundColor = 'bg-blue-500',
  textColor = 'text-white',
  fallback,
  className = '',
  ...props
}) => {
  const [imgError, setImgError] = React.useState(false);

  const hasImage = src && !imgError;
  const showFallback = !hasImage && (fallback || initials);

  const shapeStyles = circular ? 'rounded-full' : 'rounded-md';

  const baseStyles = `inline-flex items-center justify-center font-semibold ${sizeStyles[size]} ${shapeStyles} ${className}`;

  const renderFallback = () => {
    if (fallback) return fallback;
    if (initials) {
      const initialsText = initials
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      return <span className={`${textColor}`}>{initialsText}</span>;
    }
    return (
      <svg
        className="w-2/3 h-2/3 text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M24 20c0 4.418-4.03 8-9 8a9.863 9.863 0 01-5.031-1.877l-3.928 1.142a1 1 0 00-.515 1.336l2.335 2.719a1 1 0 001.336.515l1.852-3.868a9.864 9.864 0 011.877 5.031c0 4.418-4.03 8-9 8s-9-3.582-9-8z" />
      </svg>
    );
  };

  if (hasImage) {
    return (
      <div
        className={`${baseStyles} overflow-hidden bg-gray-200 dark:bg-gray-700`}
        role="img"
        aria-label={alt || 'Avatar'}
        {...props}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${baseStyles} ${backgroundColor}`}
      role="img"
      aria-label={alt || initials || 'Avatar'}
      {...props}
    >
      {showFallback ? renderFallback() : null}
    </div>
  );
};
