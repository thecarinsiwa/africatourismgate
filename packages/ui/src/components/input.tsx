import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelExtra?: React.ReactNode;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  trailing?: React.ReactNode;
};

const baseInputClass =
  'w-full rounded-lg border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    labelExtra,
    hint,
    error,
    wrapperClassName,
    inputClassName,
    trailing,
    className,
    id: idProp,
    ...props
  },
  ref,
) {
  const id = idProp ?? props.name;
  const hasError = Boolean(error);

  return (
    <div className={cn('w-full', wrapperClassName)}>
      {(label || labelExtra) && (
        <div className={cn('mb-2 flex items-center justify-between gap-2', !label && 'justify-end')}>
          {label && (
            <label htmlFor={id} className="text-sm font-medium text-atg-fg">
              {label}
            </label>
          )}
          {labelExtra}
        </div>
      )}
      <div className={cn(Boolean(trailing) && 'relative')}>
        <input
          ref={ref}
          id={id}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            baseInputClass,
            hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-atg-border',
            Boolean(trailing) && 'pr-11',
            className,
            inputClassName,
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-atg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
