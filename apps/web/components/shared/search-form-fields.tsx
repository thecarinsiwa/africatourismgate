'use client';

import type { ReactNode } from 'react';
import { useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@africatourismgate/ui';

const fieldInputClass =
  'min-h-[44px] w-full rounded-lg border border-atg-border bg-atg-elevated px-3 py-2 text-sm text-atg-fg transition-colors placeholder:text-atg-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg dark:placeholder:text-atg-muted';

/** Classes de base des champs — réutilisable pour selects personnalisés. */
export const searchFormFieldClass = fieldInputClass;

/** Libellé champ recherche — texte fourni par le parent (i18n). */
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
  /** Suggestions affichées à la saisie — la valeur libre reste acceptée. */
  suggestions?: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
  className?: string;
};

/** Champ texte libre avec suggestions (datalist HTML). */
export function SearchFormDatalistInput({
  name,
  placeholder,
  value,
  suggestions = [],
  disabled,
  onChange,
  className,
}: SearchFormDatalistInputProps) {
  const listId = useId();

  return (
    <>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        list={suggestions.length > 0 ? listId : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          fieldInputClass,
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        autoComplete="off"
      />
      {suggestions.length > 0 ? (
        <datalist id={listId}>
          {suggestions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      ) : null}
    </>
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

/** Champ texte avec suggestions valeur/libellé — saisie libre ou sélection. */
export function SearchFormOptionDatalistInput({
  name,
  placeholder,
  options,
  value,
  disabled,
  onChange,
  className,
}: SearchFormOptionDatalistInputProps) {
  const listId = useId();
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
      unique.add(option.value);
    }
    return Array.from(unique);
  }, [options]);

  return (
    <>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={text}
        disabled={disabled}
        list={suggestions.length > 0 ? listId : undefined}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          onChange(resolveSearchOptionInput(next, options));
        }}
        className={cn(
          fieldInputClass,
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        autoComplete="off"
      />
      {suggestions.length > 0 ? (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      ) : null}
    </>
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

/** Bouton principal de soumission — libellé fourni par le parent. */
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
  /** Libellé accessible et infobulle — fourni par le parent (i18n). */
  label: string;
  className?: string;
};

/** Lien « voir tout » — icône seule, libellé en sr-only pour l'accessibilité. */
export function SearchViewAllLink({ href, label, className }: SearchViewAllLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-primary px-3 py-2 text-primary transition-colors hover:bg-primary/5 dark:hover:bg-primary/10',
        className,
      )}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      <span className="sr-only">{label}</span>
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
