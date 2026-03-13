import React from 'react';

export interface TableSkeletonProps {
  /**
   * Number of rows to display in the skeleton
   * @default 5
   */
  rows?: number;
  /**
   * Number of columns to display in the skeleton
   * @default 4
   */
  columns?: number;
  /**
   * Whether to show a header row
   * @default true
   */
  withHeader?: boolean;
  /**
   * Custom widths for columns (as percentages)
   * @example ['20%', '30%', '25%', '25%']
   */
  columnWidths?: string[];
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * A skeleton loader component that mimics the Table component.
 * Shows animated placeholder rows and columns.
 *
 * @example
 * ```tsx
 * <TableSkeleton rows={10} columns={6} withHeader />
 * ```
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  withHeader = true,
  columnWidths,
  className = '',
}) => {
  const defaultWidths = Array.from({ length: columns }, () => `${Math.floor(100 / columns)}%`);
  const widths = columnWidths || defaultWidths;

  return (
    <div className={`overflow-x-auto ${className}`} aria-busy="true" aria-label="Loading table">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        {withHeader && (
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th
                  key={`header-${i}`}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  style={{ width: widths[i] }}
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="animate-pulse">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                  style={{ width: widths[colIndex] }}
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
