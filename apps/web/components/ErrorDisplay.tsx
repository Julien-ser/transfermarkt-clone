"use client";

import React, { useState } from 'react';
import { Button, Card } from "ui";
import { AppError, classifyError, getDefaultUserMessage, isRetryable } from "@/lib/errors";

export interface ErrorDisplayProps {
  /** The error to display */
  error: Error | string | null;
  /** Additional custom message to show instead of default */
  message?: string;
  /** Callback when retry is clicked */
  onRetry?: () => void;
  /** Whether retry is available */
  showRetry?: boolean;
  /** Title for the error card */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Contextual help message */
  context?: string;
  /** Show technical details in development */
  showTechnical?: boolean;
}

/**
 * Enhanced error display component with consistent styling and helpful messaging.
 * Shows appropriate error messages based on error type and provides retry functionality.
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   error={error}
 *   onRetry={() => refetch()}
 *   context="loading player data"
 * />
 * ```
 */
export function ErrorDisplay({
  error,
  message,
  onRetry,
  showRetry = true,
  title = "Something went wrong",
  className = '',
  context,
  showTechnical = process.env.NODE_ENV === 'development',
}: ErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  // Convert string errors to Error objects
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  const appError = errorObj instanceof Error ? classifyError(errorObj) : 'UNKNOWN';

  // Determine if we should show retry
  const shouldShowRetry = showRetry && onRetry && isRetryable(appError);

  // Get user message
  const userMessage = message || getDefaultUserMessage(appError);

  // Format context message if provided
  const contextMessage = context ? `Failed to ${context}.` : null;

  return (
    <Card className={`max-w-2xl mx-auto ${className}`} padding="large">
      <div className="text-center">
        {/* Error Icon */}
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {/* Main message */}
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {userMessage}
        </p>

        {/* Context message */}
        {contextMessage && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            {contextMessage}
          </p>
        )}

        {/* Retry button */}
        {shouldShowRetry && (
          <div className="mt-4">
            <Button onClick={onRetry} variant="primary">
              Try Again
            </Button>
          </div>
        )}

        {/* Technical details toggle (dev only) */}
        {showTechnical && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </Button>

            {showDetails && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded text-left">
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Error Type:</strong> {appError}
                </p>
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Message:</strong> {errorObj.message}
                </p>
                {errorObj.stack && (
                  <details className="mt-2">
                    <summary className="text-xs font-mono cursor-pointer">
                      Stack Trace
                    </summary>
                    <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                      {errorObj.stack}
                    </pre>
                  </details>
                )}
                {context && (
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-2">
                    <strong>Context:</strong> {context}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Minimal inline error display for inline contexts
 */
export function InlineError({
  error,
  onRetry,
  className = '',
}: {
  error: Error | string | null;
  onRetry?: () => void;
  className?: string;
}) {
  if (!error) return null;

  const errorObj = typeof error === 'string' ? new Error(error) : error;
  const appError = classifyError(errorObj);
  const userMessage = getDefaultUserMessage(appError);
  const shouldShowRetry = onRetry && isRetryable(appError);

  return (
    <div className={`p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 ${className}`}>
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-red-400 dark:text-red-500 mt-0.5 mr-2 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-800 dark:text-red-200">{userMessage}</p>
          {shouldShowRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorDisplay;
