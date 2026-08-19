import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: React.ReactNode;
  wrapperClassName?: string;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, wrapperClassName, className, id: idProp, disabled, checked, defaultChecked, ...props },
  ref,
) {
  const id = idProp ?? props.name;

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2.5 text-sm text-atg-fg select-none',
        disabled && 'cursor-not-allowed opacity-60',
        wrapperClassName,
      )}
    >
      <span className="relative inline-flex shrink-0">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          role="switch"
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            'block h-6 w-11 rounded-full border border-atg-border bg-atg-border transition-colors',
            'peer-checked:border-primary peer-checked:bg-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-atg-surface',
            'peer-disabled:cursor-not-allowed',
            className,
          )}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            'peer-checked:translate-x-5',
          )}
        />
      </span>
      {label}
    </label>
  );
});
