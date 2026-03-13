import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * The label for the input field
   */
  label?: string;
  /**
   * The name attribute for the input
   */
  name?: string;
  /**
   * Placeholder text when the input is empty
   */
  placeholder?: string;
  /**
   * The type of the input
   * @default 'text'
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /**
   * Whether the input is in an error state
   */
  error?: boolean;
  /**
   * Error message to display (only shown when error is true)
   */
  errorMessage?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Whether the input is required
   */
  required?: boolean;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes for the input element
   */
  inputClassName?: string;
  /**
   * Child elements (typically for adding icons)
   */
  children?: React.ReactNode;
}

/**
 * A versatile input component with label, error states, and helper text.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   name="email"
 *   type="email"
 *   placeholder="Enter your email"
 *   required
 *   error={false}
 *   helperText="We'll never share your email."
 * />
 * ```
 */
export const Input: React.FC<InputProps> = ({
  label,
  name,
  placeholder,
  type = 'text',
  error = false,
  errorMessage,
  helperText,
  required = false,
  disabled = false,
  inputClassName = '',
  className = '',
  id,
  children,
  ...props
}) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseInputStyles = 'block w-full rounded-lg border bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const errorStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500';

  const inputStyles = `${baseInputStyles} ${errorStyles} ${inputClassName}`;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputStyles}
          aria-invalid={error}
          aria-describedby={
            error && errorMessage
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
        {children}
      </div>
      {error && errorMessage && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
