import { cn } from '../lib/cn';

export type LogoProps = {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  /** Image de marque (remplace l’icône par défaut si fournie). */
  logoUrl?: string | null;
  /** Centre le logo horizontalement dans son conteneur. */
  centered?: boolean;
  className?: string;
  iconClassName?: string;
};

const defaultIcon = (
  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
  </svg>
);

export function Logo({
  name,
  href,
  icon = defaultIcon,
  logoUrl,
  centered = false,
  className,
  iconClassName,
}: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2.5', className)}>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className={cn('h-9 w-9 rounded-md object-contain', iconClassName)}
        />
      ) : (
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md bg-primary',
            iconClassName,
          )}
        >
          {icon}
        </div>
      )}
      <span className="text-base font-bold leading-tight tracking-tight text-atg-fg">{name}</span>
    </div>
  );

  const inner = href ? (
    <a
      href={href}
      className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
    >
      {content}
    </a>
  ) : (
    content
  );

  if (centered) {
    return <div className="flex w-full justify-center">{inner}</div>;
  }

  return inner;
}
