import { forwardRef } from 'react';
import { cn } from '../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export type ButtonProps = ButtonBaseProps &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
  );

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary disabled:opacity-60',
  secondary:
    'bg-atg-elevated text-atg-fg border border-atg-border hover:border-atg-muted hover:bg-atg-surface',
  outline:
    'border border-atg-border bg-transparent text-atg-fg hover:border-atg-muted hover:bg-atg-surface',
  ghost: 'bg-transparent text-atg-muted hover:text-atg-fg hover:bg-atg-surface',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs gap-1.5',
  md: 'px-4 py-3 text-sm gap-2',
  lg: 'px-5 py-3.5 text-sm gap-2',
};

function buttonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: Pick<ButtonProps, 'variant' | 'size' | 'fullWidth' | 'className'>) {
  return cn(
    'inline-flex items-center justify-center rounded-lg font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-atg-surface',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      className,
      children,
      href,
      ...props
    },
    ref,
  ) {
    const classes = buttonClassName({ variant, size, fullWidth, className });
    const content = (
      <>
        {!loading && leftIcon}
        <span>{loading && loadingText ? loadingText : children}</span>
        {!loading && rightIcon}
      </>
    );

    if (href) {
      const { disabled, ...anchorProps } = props as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
        disabled?: boolean;
      };
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={cn(classes, disabled && 'pointer-events-none opacity-60')}
          aria-disabled={disabled || undefined}
          {...anchorProps}
        >
          {content}
        </a>
      );
    }

    const { disabled, type = 'button', ...buttonProps } =
      props as React.ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled || loading}
        className={classes}
        {...buttonProps}
      >
        {content}
      </button>
    );
  },
);
