'use client';

import { cn } from '@africatourismgate/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getIsoCountryOptions, type IsoCountryOption } from '../../lib/iso-countries';

type CountryCodeComboboxProps = {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (countryCode: string) => void;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function CountryCodeCombobox({
  id: idProp,
  name = 'countryCode',
  label,
  value,
  onChange,
  hint,
  error,
  required,
  disabled,
  className,
}: CountryCodeComboboxProps) {
  const t = useTranslations('modules.destinations.form');
  const tSelect = useTranslations('modules.common.select');
  const locale = useLocale();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listboxId = `${id}-listbox`;
  const searchId = `${id}-search`;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  const options = useMemo(() => getIsoCountryOptions(locale), [locale]);
  const selected = useMemo(() => {
    const code = value.trim().toUpperCase();
    return options.find((option) => option.code === code) ?? null;
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const needle = normalizeSearch(query);
    if (!needle) return options;
    return options.filter((option) => {
      const haystack = normalizeSearch(`${option.label} ${option.code}`);
      return haystack.includes(needle);
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setHighlightIndex(0);
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  function selectOption(option: IsoCountryOption) {
    onChange(option.code);
    setOpen(false);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightIndex((index) =>
        filteredOptions.length === 0 ? 0 : Math.min(index + 1, filteredOptions.length - 1),
      );
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const option = filteredOptions[highlightIndex];
      if (option) selectOption(option);
    }
  }

  const hasError = Boolean(error);
  const displayLabel = selected?.label ?? (value ? value.toUpperCase() : tSelect('chooseDash'));

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-atg-fg">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <button
        id={id}
        type="button"
        name={name}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border bg-atg-elevated px-4 py-3 text-left text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary',
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-atg-border',
          disabled && 'cursor-not-allowed opacity-60',
          selected ? 'text-atg-fg' : 'text-atg-muted',
        )}
      >
        <span className="truncate">{displayLabel}</span>
        <span aria-hidden className="ml-2 text-atg-muted">
          ▾
        </span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-atg-border bg-atg-elevated shadow-lg">
          <div className="border-b border-atg-border p-2">
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('countrySearchPlaceholder')}
              aria-label={t('countrySearchAria')}
              className="w-full rounded-md border border-atg-border bg-atg-surface px-3 py-2 text-sm text-atg-fg outline-none placeholder:text-atg-muted/70 focus:border-primary focus:ring-1 focus:ring-primary"
              autoComplete="off"
            />
          </div>
          <ul
            id={listboxId}
            role="listbox"
            aria-label={label}
            className="max-h-60 overflow-y-auto py-1"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-atg-muted">{t('countrySearchEmpty')}</li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.code === value.trim().toUpperCase();
                const isHighlighted = index === highlightIndex;
                return (
                  <li key={option.code} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full px-4 py-2 text-left text-sm text-atg-fg',
                        isHighlighted && 'bg-primary/10',
                        isSelected && 'font-medium text-primary',
                        !isHighlighted && 'hover:bg-atg-muted/10',
                      )}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectOption(option)}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}

      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-atg-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs text-red-500 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
