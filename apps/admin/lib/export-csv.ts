'use client';

import { useCallback } from 'react';

export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function cellToString(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function exportCsv<T>(options: {
  filename: string;
  columns: CsvColumn<T>[];
  rows: T[];
}): void {
  const { filename, columns, rows } = options;
  const headerLine = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(cellToString(col.value(row)))).join(','),
  );
  const csv = `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function useExportCsv(): typeof exportCsv {
  return useCallback(exportCsv, []);
}
