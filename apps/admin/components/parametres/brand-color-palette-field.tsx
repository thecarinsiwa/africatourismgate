'use client';

import { brandColorPalette } from '../../lib/brand-color-palette';

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase();
}

type BrandColorPaletteFieldProps = {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  hint?: string;
};

export function BrandColorPaletteField({
  label,
  value,
  onChange,
  hint,
}: BrandColorPaletteFieldProps) {
  const normalizedValue = normalizeHex(value);
  const inPalette = brandColorPalette.some(
    (c) => normalizeHex(c.hex) === normalizedValue,
  );

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-atg-fg">{label}</legend>
      {hint ? <p className="text-xs text-atg-muted">{hint}</p> : null}
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
