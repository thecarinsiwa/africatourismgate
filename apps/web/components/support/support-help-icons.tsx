import type { ReactNode } from 'react';
import { cn } from '@africatourismgate/ui';
import type { HelpIcon } from '../../lib/support/help-catalog';

type IconProps = { className?: string };

function HelpIconShell({
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={cn('h-6 w-6 shrink-0', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function HelpCalendarIcon({ className }: IconProps) {
  return (
    <HelpIconShell className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 9.75h18M4.5 21h15a1.5 1.5 0 001.5-1.5V8.25A1.5 1.5 0 0019.5 6.75h-15A1.5 1.5 0 003 8.25v11.25A1.5 1.5 0 004.5 21z"
      />
    </HelpIconShell>
  );
}

export function HelpCardIcon({ className }: IconProps) {
  return (
    <HelpIconShell className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </HelpIconShell>
  );
}

export function HelpUserIcon({ className }: IconProps) {
  return (
    <HelpIconShell className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </HelpIconShell>
  );
}

export function HelpShieldIcon({ className }: IconProps) {
  return (
    <HelpIconShell className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </HelpIconShell>
  );
}

export function HelpMessageIcon({ className }: IconProps) {
  return (
    <HelpIconShell className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
      />
    </HelpIconShell>
  );
}

export function HelpSearchIcon({ className }: IconProps) {
  return (
    <HelpIconShell className={cn('h-5 w-5', className)}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </HelpIconShell>
  );
}

const HELP_ICON_MAP: Record<
  HelpIcon,
  (props: IconProps) => ReactNode
> = {
  calendar: HelpCalendarIcon,
  card: HelpCardIcon,
  user: HelpUserIcon,
  shield: HelpShieldIcon,
  message: HelpMessageIcon,
};

export function HelpTopicIcon({
  icon,
  className,
}: {
  icon: HelpIcon;
  className?: string;
}) {
  const Icon = HELP_ICON_MAP[icon];
  return <Icon className={className} />;
}
