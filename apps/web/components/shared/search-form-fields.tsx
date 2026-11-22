'use client';

import type { FocusEvent, KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@africatourismgate/ui';

const fieldInputClass =
  'min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg transition-colors placeholder:text-atg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg dark:placeholder:text-atg-muted';

/** Classes de base des champs - réutilisable pour selects personnalisés. */
export const searchFormFieldClass = fieldInputClass;

function safeDomId(reactId: string): string {
  return reactId.replace(/:/g, '');
}

function filterSuggestions(suggestions: string[], query: string): string[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return suggestions;
  const filtered = suggestions.filter((option) =>
    option.toLowerCase().includes(needle),
  );
  // Exact single match → keep full list so the user can switch destination.
  if (filtered.length === 1 && filtered[0].toLowerCase() === needle) {
    return suggestions;
  }
  return filtered;
}

/** Libellé champ recherche - texte fourni par le parent (i18n). */
export function SearchFormLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-atg-muted">
      {children}
    </label>
  );
}

export type SearchFormInputProps = {
  type?: string;
  name: string;
  placeholder?: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Champ texte / date / nombre pour formulaires de recherche marketing. */
export function SearchFormInput({
  type = 'text',
  name,
  placeholder,
  value,
  min,
  max,
  onChange,
  className,
}: SearchFormInputProps) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className={cn(fieldInputClass, className)}
    />
  );
}

export type SearchFormDatalistInputProps = {
  name: string;
  placeholder?: string;
  value: string;
  /** Suggestions filtrées à la saisie / au focus - la valeur libre reste acceptée. */
  suggestions?: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

/** Champ texte libre avec panneau d’autocomplétion visible. */
export function SearchFormDatalistInput({
  name,
  placeholder,
  value,
  suggestions = [],
  disabled,
  onChange,
  className,
}: SearchFormDatalistInputProps) {
  const reactId = useId();
  const listId = safeDomId(reactId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = useMemo(
    () => filterSuggestions(suggestions, value),
    [suggestions, value],
  );
  const showPanel = open && !disabled && filtered.length > 0;
  const activeOptionId =
    activeIndex >= 0 && activeIndex < filtered.length
      ? `${listId}-option-${activeIndex}`
      : undefined;

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, suggestions]);

  function selectSuggestion(option: string) {
    onChange(option);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget as Node | null;
    if (containerRef.current?.contains(next)) return;
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showPanel) {
      if (event.key === 'ArrowDown' && filtered.length > 0) {
        event.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        setActiveIndex((current) =>
          current < filtered.length - 1 ? current + 1 : 0,
        );
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        setActiveIndex((current) =>
          current <= 0 ? filtered.length - 1 : current - 1,
        );
        break;
      }
      case 'Enter': {
        if (activeIndex < 0 || activeIndex >= filtered.length) return;
        event.preventDefault();
        selectSuggestion(filtered[activeIndex]);
        break;
      }
      case 'Escape': {
        event.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        break;
      }
      default:
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={cn(
          fieldInputClass,
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        autoComplete="off"
      />
      {showPanel ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-atg-border bg-atg-elevated py-1 shadow-lg dark:border-atg-border dark:bg-atg-surface"
        >
          {filtered.map((option, index) => {
            const optionId = `${listId}-option-${index}`;
            const isActive = index === activeIndex;
            return (
              <li key={option} role="presentation">
                <button
                  type="button"
                  id={optionId}
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    'flex w-full min-h-[40px] items-center px-3 text-left text-sm text-atg-fg transition-colors hover:bg-primary/10 hover:text-primary',
                    isActive && 'bg-primary/10 text-primary',
                  )}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectSuggestion(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export type SearchOption = { value: string; label: string };

/** Résout une saisie libre vers la valeur d'une option (code IATA, port, etc.). */
export function resolveSearchOptionInput(input: string, options: SearchOption[]): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  const upper = trimmed.toUpperCase();

  const exactValue = options.find(
    (option) => option.value === trimmed || option.value.toUpperCase() === upper,
  );
  if (exactValue) return exactValue.value;

  const exactLabel = options.find((option) => option.label.toLowerCase() === lower);
  if (exactLabel) return exactLabel.value;

  const partialLabel = options.find((option) => option.label.toLowerCase().includes(lower));
  if (partialLabel) return partialLabel.value;

  return trimmed;
}

export type SearchFormOptionDatalistInputProps = {
  name: string;
  placeholder?: string;
  options: SearchOption[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

/** Champ texte avec suggestions valeur/libellé - saisie libre ou sélection. */
export function SearchFormOptionDatalistInput({
  name,
  placeholder,
  options,
  value,
  disabled,
  onChange,
  className,
}: SearchFormOptionDatalistInputProps) {
  const selected = options.find((option) => option.value === value);
  const [text, setText] = useState(selected?.label ?? value);

  useEffect(() => {
    const match = options.find((option) => option.value === value);
    setText(match?.label ?? value);
  }, [value, options]);

  const suggestions = useMemo(() => {
    const unique = new Set<string>();
    for (const option of options) {
      unique.add(option.label);
    }
    return Array.from(unique);
  }, [options]);

  return (
    <SearchFormDatalistInput
      name={name}
      placeholder={placeholder}
      value={text}
      suggestions={suggestions}
      disabled={disabled}
      className={className}
      onChange={(next) => {
        setText(next);
        onChange(resolveSearchOptionInput(next, options));
      }}
    />
  );
}

export type SearchFormSelectProps = {
  name: string;
  placeholder: string;
  options: string[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

export type SearchFormOptionSelectProps = {
  name: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

/** Liste déroulante avec paires valeur / libellé (aéroports, ports, etc.). */
export function SearchFormOptionSelect({
  name,
  placeholder,
  options,
  value,
  disabled,
  onChange,
  className,
}: SearchFormOptionSelectProps) {
  return (
    <select
      name={name}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        fieldInputClass,
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/** Liste déroulante pour formulaires de recherche marketing. */
export function SearchFormSelect({
  name,
  placeholder,
  options,
  value,
  disabled,
  onChange,
  className,
}: SearchFormSelectProps) {
  return (
    <select
      name={name}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        fieldInputClass,
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export type SearchFormSubmitProps = {
  label: string;
  className?: string;
};

/** Bouton principal de soumission - libellé fourni par le parent. */
export function SearchFormSubmit({ label, className }: SearchFormSubmitProps) {
  return (
    <button
      type="submit"
      className={cn(
        'min-h-[44px] w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-primary-hover',
        className,
      )}
    >
      {label}
    </button>
  );
}

export type SearchViewAllLinkProps = {
  href: string;
  /** Libellé visible - fourni par le parent (i18n). */
  label: string;
  className?: string;
};

/** Lien « voir tous » vers le catalogue complet de l’onglet actif. */
export function SearchViewAllLink({ href, label, className }: SearchViewAllLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex min-h-[44px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 dark:hover:bg-primary/10',
        className,
      )}
    >
      {label}
    </Link>
  );
}

export type SearchFormActionsProps = {
  submit: ReactNode;
  viewAllHref: string;
  /** Libellé accessible du lien voir tout (i18n). */
  viewAllLabel: string;
};

/** Zone actions : bouton rechercher + lien voir tout côte à côte. */
export function SearchFormActions({ submit, viewAllHref, viewAllLabel }: SearchFormActionsProps) {
  return (
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1">{submit}</div>
      <SearchViewAllLink href={viewAllHref} label={viewAllLabel} />
    </div>
  );
}
