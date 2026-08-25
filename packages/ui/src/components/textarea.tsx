import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  labelExtra?: React.ReactNode;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  textareaClassName?: string;
};

const baseTextareaClass =
  'w-full resize-y rounded-lg border bg-atg-elevated px-4 py-3 text-sm text-atg-fg placeholder:text-atg-muted/70 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    labelExtra,
    hint,
    error,
    wrapperClassName,
    textareaClassName,
    className,
    id: idProp,
    rows = 3,
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
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          baseTextareaClass,
          hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-atg-border',
          className,
          textareaClassName,
        )}
        {...props}
      />
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
