'use client';

import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';

export type ChartThemeColors = {
  bookings: string;
  revenue: string;
  grid: string;
  tick: string;
  cursor: string;
};

const CSS_VAR_NAMES = {
  bookings: '--atg-primary',
  revenue: '--atg-success',
  grid: '--atg-border',
  tick: '--atg-muted',
} as const;

function readCssColor(varName: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function withAlpha(color: string, alpha: number): string {
  const trimmed = color.trim();
  const hex = /^#?([0-9a-fA-F]{6})$/.exec(trimmed);
  if (hex) {
    const value = hex[1];
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (trimmed.startsWith('rgb')) {
    return trimmed.replace(/\)$/, `, ${alpha})`).replace(/^rgb\(/, 'rgba(');
  }
  return trimmed;
}

function readChartTheme(): ChartThemeColors {
  const grid = readCssColor(CSS_VAR_NAMES.grid);
  return {
    bookings: readCssColor(CSS_VAR_NAMES.bookings),
    revenue: readCssColor(CSS_VAR_NAMES.revenue),
    grid,
    tick: readCssColor(CSS_VAR_NAMES.tick),
    cursor: withAlpha(grid, 0.35),
  };
}

/**
 * Couleurs du graphique alignées sur les tokens CSS ATG (--atg-primary, --atg-success, etc.).
 * Se met à jour au changement de thème clair/sombre et de branding organisation.
 */
export function useChartTheme(): ChartThemeColors {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<ChartThemeColors>(readChartTheme);

  const sync = useCallback(() => {
    setColors(readChartTheme());
  }, []);

  useEffect(() => {
    sync();
  }, [resolvedTheme, sync]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] });

    return () => observer.disconnect();
  }, [sync]);

  return colors;
}
