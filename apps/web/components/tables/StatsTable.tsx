"use client";

import React from 'react';

interface StatsTableProps {
  stats: Array<Record<string, any>>;
  columns?: Array<{
    key: string;
    label: string;
    numeric?: boolean;
  }>;
}

const defaultColumns = [
  { key: 'season', label: 'Season' },
  { key: 'competition', label: 'Competition' },
  { key: 'appearances', label: 'Apps', numeric: true },
  { key: 'goals', label: 'Goals', numeric: true },
  { key: 'assists', label: 'Assists', numeric: true },
  { key: 'minutesPlayed', label: 'Minutes', numeric: true },
];

export default function StatsTable({ stats, columns = defaultColumns }: StatsTableProps) {
  if (!stats || stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  col.numeric ? 'text-right' : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {stats.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    col.numeric
                      ? 'text-right text-gray-900 dark:text-gray-100'
                      : 'text-left text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {String(row[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
