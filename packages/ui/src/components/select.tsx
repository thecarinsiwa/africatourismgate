import { forwardRef, useId } from 'react';
import { cn } from '../lib/cn';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'onChange'
> & {
  /** Libellé associé au champ (htmlFor). */
  label?: string;
  /** Options affichées dans la liste déroulante. */
  options: SelectOption[];
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  wrapperClassName?: string;
  selectClassName?: string;
  hint?: string;
  error?: string;
};

const baseSelectClass =
  'w-full appearance-none rounded-lg border bg-atg-elevated px-4 py-3 pr-10 text-sm text-atg-fg outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    options,
    wrapperClassName,
    selectClassName,
    hint,
    error,
    className,
    id: idProp,
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? props.name ?? generatedId;
  const hasError = Boolean(error);

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-atg-fg">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={cn(
            baseSelectClass,
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-atg-border',
            disabled && 'cursor-not-allowed opacity-60',
            selectClassName,
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-atg-muted"
        >
          ▾
        </span>
      </div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-atg-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
