type GapDonateButtonProps = {
  href: string;
  label: string;
  variant?: 'header' | 'hero' | 'mobile';
  className?: string;
};

const variantClasses: Record<NonNullable<GapDonateButtonProps['variant']>, string> = {
  header:
    'inline-flex min-h-[44px] items-center rounded-lg bg-gap-accent px-4 py-2 text-sm font-semibold text-gap-forest transition hover:bg-gap-accent/90',
  hero: 'inline-flex rounded-lg bg-gap-accent px-5 py-2.5 text-sm font-semibold text-gap-forest transition hover:bg-gap-accent/90',
  mobile:
    'flex min-h-[44px] w-full items-center justify-center rounded-lg bg-gap-accent px-4 py-3 text-sm font-semibold text-gap-forest transition hover:bg-gap-accent/90',
};

export function GapDonateButton({
  href,
  label,
  variant = 'header',
  className = '',
}: GapDonateButtonProps) {
  const classes = `${variantClasses[variant]} ${className}`.trim();

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      {label}
    </a>
  );
}
