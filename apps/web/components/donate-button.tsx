type DonateButtonProps = {
  href: string;
  label: string;
  variant?: 'header' | 'mobile';
  className?: string;
};

const variantClasses: Record<NonNullable<DonateButtonProps['variant']>, string> = {
  header:
    'inline-flex min-h-[44px] items-center rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary/90',
  mobile:
    'flex min-h-[44px] w-full items-center justify-center rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white transition hover:bg-secondary/90',
};

export function DonateButton({
  href,
  label,
  variant = 'header',
  className = '',
}: DonateButtonProps) {
  const classes = `${variantClasses[variant]} ${className}`.trim();

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {label}
    </a>
  );
}
