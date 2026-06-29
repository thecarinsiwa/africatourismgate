import { cn } from '../lib/cn';
import {
  getUserDisplayName,
  getUserInitials,
  hashEmailToHue,
} from '../lib/avatar-utils';

export type AvatarSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
};

export type AvatarProps = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
  /** Override accessible label (defaults to display name or email). */
  label?: string;
};

export function Avatar({
  email,
  firstName,
  lastName,
  src,
  size = 'md',
  className,
  label,
}: AvatarProps) {
  const displayName = getUserDisplayName(firstName, lastName, email);
  const initials = getUserInitials(firstName, lastName, email);
  const hue = hashEmailToHue(email);
  const ariaLabel = label ?? displayName;

  if (src) {
    return (
      <img
        src={src}
        alt={ariaLabel}
        className={cn(
          'shrink-0 rounded-full object-cover ring-1 ring-atg-border/60',
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-black/10 dark:ring-white/10',
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundColor: `hsl(${hue} 55% 45%)`,
      }}
    >
      <span aria-hidden>{initials}</span>
    </span>
  );
}
