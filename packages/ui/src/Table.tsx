import React from 'react';

export interface TableColumn<T> {
  /**
   * Unique key for the column
   */
  key: string;
  /**
   * Column header text
   */
  header: string;
  /**
   * Render function for cell content
   */
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  /**
   * Custom cell class name
   */
  className?: string;
  /**
   * Accessible label for the column (for screen readers)
   */
  ariaLabel?: string;
}

export interface TableProps<T extends Record<string, unknown>> {
  /**
   * Array of data rows
   */
  data: T[];
  /**
   * Column definitions
   */
  columns: TableColumn<T>[];
  /**
   * Key field to uniquely identify rows
   * @default 'id'
   */
  rowKey?: keyof T;
  /**
   * Whether the table is striped (alternating row colors)
   * @default false
   */
  striped?: boolean;
  /**
   * Whether the table has hover effects on rows
   * @default false
   */
  hoverable?: boolean;
  /**
   * Whether to show a loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Loading skeleton rows count
   * @default 5
   */
  loadingRows?: number;
  /**
   * Custom empty state when no data
   */
  emptyState?: React.ReactNode;
  /**
   * Additional CSS classes for the table
   */
  className?: string;
  /**
   * Additional CSS classes for the table container
   */
  containerClassName?: string;
}

/**
 * A flexible table component with sorting, striped rows, hover effects, and loading state.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { key: 'name', header: 'Name' },
 *   { key: 'email', header: 'Email' },
 * ];
 *
 * <Table
 *   data={users}
 *   columns={columns}
 *   rowKey="id"
 *   striped
 *   hoverable
 * />
 * ```
 */
export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey = 'id' as keyof T,
  striped = false,
  hoverable = false,
  loading = false,
  loadingRows = 5,
  emptyState,
  className = '',
  containerClassName = '',
}: TableProps<T>) {
  const renderLoadingRows = () => {
    return Array.from({ length: loadingRows }).map((_, index) => (
      <tr key={`loading-${index}`} role="row">
        {columns.map((column) => (
          <td
            key={column.key}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </td>
        ))}
      </tr>
    ));
  };

  const getRowStyle = (index: number) => {
    const styles = [];
    if (striped && index % 2 === 1) {
      styles.push('bg-gray-50 dark:bg-gray-900/50');
    }
    return styles.join(' ');
  };

  return (
    <div className={`overflow-x-auto ${containerClassName}`}>
      <table
        className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${className}`}
        aria-busy={loading}
      >
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                aria-label={column.ariaLabel || column.header}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800"
          role="rowgroup"
        >
          {loading
            ? renderLoadingRows()
            : data.length === 0
            ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyState || 'No data available'}
                  </td>
                </tr>
              )
            : data.map((row, index) => (
                <tr
                  key={String(row[rowKey] ?? index)}
                   className={`${getRowStyle(index)} ${hoverable ? 'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150' : ''}`}
                  role="row"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${column.className || ''}`}
                      role="cell"
                      aria-label={column.ariaLabel}
                    >
                      {column.render
                        ? column.render(row[column.key], row, index)
                        : String(row[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
