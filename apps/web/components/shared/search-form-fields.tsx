import type { ReactNode } from 'react';
import { cn } from '@africatourismgate/ui';

const fieldInputClass =
  'min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-atg-border dark:bg-atg-surface dark:text-atg-fg dark:placeholder:text-atg-muted';

/** Classes de base des champs — réutilisable pour selects personnalisés. */
export const searchFormFieldClass = fieldInputClass;

/** Libellé champ recherche — texte fourni par le parent (i18n). */
export function SearchFormLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-atg-muted">
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
        'min-h-[44px] w-full rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-primary-hover',
        className,
      )}
    >
      {label}
    </button>
  );
}
