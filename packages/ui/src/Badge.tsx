import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The color variant of the badge
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /**
   * The size of the badge
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Whether the badge should be rounded (pill shape)
   */
  rounded?: boolean;
  /**
   * The content of the badge
   */
  children?: React.ReactNode;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const sizeStyles = {
  small: 'px-2 py-0.5 text-xs',
  medium: 'px-2.5 py-1 text-sm',
  large: 'px-3 py-1.5 text-base',
};

/**
 * A small badge component for status indicators, labels, or counts.
 *
 * @example
 * ```tsx
 * <Badge variant="primary" size="medium" rounded>
 *   New
 * </Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'medium',
  rounded = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium';

  const shapeStyles = rounded ? 'rounded-full' : 'rounded-md';

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
