import { cn } from '../lib/cn';

export type TextLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'muted';
};

const variantClasses = {
  primary: 'text-primary hover:text-primary-hover',
  muted: 'text-atg-muted hover:text-white',
};

export function TextLink({ variant = 'primary', className, children, ...props }: TextLinkProps) {
  return (
    <a
      className={cn('text-sm transition-colors', variantClasses[variant], className)}
      {...props}
    >
      {children}
    </a>
  );
}
