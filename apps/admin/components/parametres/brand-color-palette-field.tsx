'use client';

import { useMemo } from 'react';
import { brandColorPalette } from '../../lib/brand-color-palette';
import {
  formatContrastRatio,
  getContrastRatio,
  meetsContrastRatio,
  WCAG_AA_NORMAL_TEXT_RATIO,
} from '../../lib/color-contrast';

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase();
}

type BrandColorPaletteFieldProps = {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  hint?: string;
  /** Foreground used on the brand color (buttons, liens actifs). Default: white. */
  contrastForeground?: string;
  contrastMinimum?: number;
};

export function BrandColorPaletteField({
  label,
  value,
  onChange,
  hint,
  contrastForeground = '#FFFFFF',
  contrastMinimum = WCAG_AA_NORMAL_TEXT_RATIO,
}: BrandColorPaletteFieldProps) {
  const normalizedValue = normalizeHex(value);
  const inPalette = brandColorPalette.some(
    (c) => normalizeHex(c.hex) === normalizedValue,
  );

  const contrastRatio = useMemo(
    () => getContrastRatio(contrastForeground, value),
    [contrastForeground, value],
  );

  const hasContrastWarning =
    contrastRatio !== null && !meetsContrastRatio(contrastRatio, contrastMinimum);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-atg-fg">{label}</legend>
      {hint ? <p className="text-xs text-atg-muted">{hint}</p> : null}
      {hasContrastWarning ? (
        <p
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
        >
          Contraste insuffisant avec le texte blanc : {formatContrastRatio(contrastRatio)} (minimum{' '}
          {formatContrastRatio(contrastMinimum)} pour WCAG AA). Les boutons et liens actifs peuvent
          être difficiles à lire.
        </p>
      ) : null}
      <div
        className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8"
        role="listbox"
        aria-label={label}
      >
        {brandColorPalette.map((color) => {
          const selected = normalizeHex(color.hex) === normalizedValue;
          return (
            <button
              key={color.id}
              type="button"
              role="option"
              aria-selected={selected}
              aria-label={`${color.label} (${color.hex})`}
              title={`${color.label} — ${color.hex}`}
              onClick={() => onChange(color.hex)}
              className={`group relative flex flex-col items-center gap-1 rounded-lg p-1 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-atg-bg ${
                selected
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-atg-bg'
                  : 'hover:ring-1 hover:ring-atg-border'
              }`}
            >
              <span
                className="h-10 w-full min-w-[2.5rem] rounded-md border border-black/10 shadow-sm dark:border-white/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className="max-w-full truncate text-[10px] leading-tight text-atg-muted group-hover:text-atg-fg">
                {color.label}
              </span>
            </button>
          );
        })}
        {!inPalette && value.trim() ? (
          <button
            type="button"
            role="option"
            aria-selected
            aria-label={`Couleur actuelle (${value})`}
            title={`Couleur enregistrée — ${value}`}
            className="group relative flex flex-col items-center gap-1 rounded-lg p-1 ring-2 ring-primary ring-offset-2 ring-offset-atg-bg"
          >
            <span
              className="h-10 w-full min-w-[2.5rem] rounded-md border border-dashed border-atg-border"
              style={{ backgroundColor: value }}
            />
            <span className="max-w-full truncate text-[10px] leading-tight text-atg-fg">
              Actuelle
            </span>
          </button>
        ) : null}
      </div>
      <p className="font-mono text-xs text-atg-muted">
        Sélection : <span className="text-atg-fg">{value || '—'}</span>
      </p>
    </fieldset>
  );
}
