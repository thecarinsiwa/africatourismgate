import type { ReactNode } from 'react';
import { cn } from '@africatourismgate/ui';

type IconProps = { className?: string };

function NavIcon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={cn('h-5 w-5 shrink-0', className)}
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

export function AccountProfileIcon({ className }: IconProps) {
  return (
    <NavIcon className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </NavIcon>
  );
}

export function AccountAddressesIcon({ className }: IconProps) {
  return (
    <NavIcon className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </NavIcon>
  );
}

export function AccountReservationsIcon({ className }: IconProps) {
  return (
    <NavIcon className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 9.75h18M4.5 21h15a1.5 1.5 0 001.5-1.5V8.25A1.5 1.5 0 0019.5 6.75h-15A1.5 1.5 0 003 8.25v11.25A1.5 1.5 0 004.5 21z"
      />
    </NavIcon>
  );
}

export function AccountLoyaltyIcon({ className }: IconProps) {
  return (
    <NavIcon className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </NavIcon>
  );
}

export function AccountPaymentIcon({ className }: IconProps) {
  return (
    <NavIcon className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </NavIcon>
  );
}

export function AccountBrowseIcon({ className }: IconProps) {
  return (
    <NavIcon className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21m-1.5 0h10.5M3.75 21h16.5M5.25 9V5.625A2.625 2.625 0 017.875 3h8.25A2.625 2.625 0 0118.75 5.625V9"
      />
    </NavIcon>
  );
}
