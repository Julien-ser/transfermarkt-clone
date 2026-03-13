import React from 'react';

export interface SelectOption {
  /**
   * The value of the option
   */
  value: string;
  /**
   * The display label of the option
   */
  label: string;
  /**
   * Whether the option is disabled
   * @default false
   */
  disabled?: boolean;
}

export interface SelectProps {
  /**
   * The label for the select
   */
  label?: string;
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  /**
   * Array of options to display in the select
   */
  options: SelectOption[];
  /**
   * The currently selected value
   */
  value?: string;
  /**
   * Whether the select is in an error state
   */
  error?: boolean;
  /**
   * Error message to display (only shown when error is true)
   */
  errorMessage?: string;
  /**
   * Helper text to display below the select
   */
  helperText?: string;
  /**
   * Whether the select is required
   */
  required?: boolean;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Optional icon to show on the left side of the select
   */
  leftIcon?: React.ReactNode;
  /**
   * Additional CSS classes for the select element
   */
  selectClassName?: string;
  /**
   * Additional CSS classes for the wrapper
   */
  className?: string;
  /**
   * The name attribute for the select
   */
  name?: string;
  /**
   * The id attribute for the select
   */
  id?: string;
  /**
   * Callback when the value changes
   */
  onChange?: (value: string) => void;
  /**
   * Tab index for accessibility
   */
  tabIndex?: number;
  /**
   * Additional aria attributes
   */
  'aria-describedby'?: string;
}

/**
 * A customizable select component with options, error states, and helper text.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'uk', label: 'United Kingdom' },
 *   ]}
 *   placeholder="Select a country"
 *   required
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = ({
  label,
  placeholder,
  options,
  error = false,
  errorMessage,
  helperText,
  required = false,
  disabled = false,
  leftIcon,
  selectClassName = '',
  className = '',
  id,
  name,
  value,
  onChange,
  ...props
}) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  const baseStyles = 'block w-full rounded-lg border bg-white dark:bg-gray-800 px-4 py-2.5 pr-10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 appearance-none disabled:opacity-50 disabled:cursor-not-allowed';

  const errorStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500';

  const iconPadding = leftIcon ? 'pl-10' : '';

  const selectStyles = `${baseStyles} ${errorStyles} ${iconPadding} ${selectClassName}`;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
            {leftIcon}
          </div>
        )}
        <select
          id={selectId}
          name={name}
          value={value}
          disabled={disabled || required && value === ''}
          required={required}
          className={selectStyles}
          aria-invalid={error}
          aria-describedby={
            error && errorMessage
              ? `${selectId}-error`
              : helperText
              ? `${selectId}-helper`
              : undefined
          }
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && errorMessage && (
        <p
          id={`${selectId}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      {!error && helperText && (
        <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
