import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The visual style variant of the card
   * @default 'default'
   */
  variant?: 'default' | 'outlined' | 'elevated';
  /**
   * Padding size for the card content
   * @default 'medium'
   */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /**
   * Whether the card has a hover effect
   */
  hoverable?: boolean;
  /**
   * Whether the card is clickable (adds role="button" and tabindex)
   */
  clickable?: boolean;
  /**
   * Callback when card is clicked (only works if clickable is true)
   */
  onClick?: () => void;
  /**
   * Child elements to render inside the card
   */
  children?: React.ReactNode;
}

const paddingStyles = {
  none: '',
  small: 'p-3',
  medium: 'p-5',
  large: 'p-8',
};

const variantStyles = {
  default: 'bg-white dark:bg-gray-800',
  outlined: 'bg-transparent border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg',
};

/**
 * A flexible card component for grouping related content.
 *
 * @example
 * ```tsx
 * <Card variant="default" padding="medium" hoverable>
 *   <h3 className="text-lg font-semibold mb-2">Card Title</h3>
 *   <p>Card content goes here.</p>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'rounded-lg transition-all duration-200';

  const hoverStyles = hoverable ? 'hover:shadow-xl hover:-translate-y-1' : '';

  const cursorStyles = clickable ? 'cursor-pointer' : '';

  const paddingStyles = padding !== 'none' ? `p-${padding}` : '';

  const role = clickable ? 'button' : undefined;

  const tabIndex = clickable ? (props.tabIndex ?? 0) : undefined;

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles} ${hoverStyles} ${cursorStyles} ${className}`}
      onClick={clickable ? onClick : undefined}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
};
