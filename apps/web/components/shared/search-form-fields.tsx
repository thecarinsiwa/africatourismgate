import type { ReactNode } from 'react';
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
