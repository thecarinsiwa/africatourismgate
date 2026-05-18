import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: React.ReactNode;
  wrapperClassName?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, wrapperClassName, className, id: idProp, ...props },
  ref,
) {
  const id = idProp ?? props.name;

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-center gap-2.5 text-sm text-atg-muted select-none',
        wrapperClassName,
      )}
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-atg-border bg-atg-elevated text-primary',
          'focus:ring-primary focus:ring-offset-atg-surface',
          className,
        )}
        {...props}
      />
      {label}
    </label>
  );
});
