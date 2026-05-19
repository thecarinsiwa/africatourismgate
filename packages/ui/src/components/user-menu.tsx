'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export type UserMenuProps = {
  displayName: string;
  email: string;
  onLogout: () => void | Promise<void>;
  logoutLabel?: string;
  className?: string;
};

function getInitials(displayName: string, email: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0]!.length > 0) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function UserMenu({
  displayName,
  email,
  onLogout,
  logoutLabel = 'Se déconnecter',
  className,
}: UserMenuProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  }

  const initials = getInitials(displayName, email);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-atg-border bg-atg-elevated px-2 py-1.5',
          'text-sm text-atg-fg transition-colors hover:bg-atg-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-white"
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden max-w-[8rem] truncate font-medium sm:inline">{displayName}</span>
        <svg
          className={cn('h-4 w-4 text-atg-muted transition-transform', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-atg-border bg-atg-elevated py-2 shadow-lg"
        >
          <div className="border-b border-atg-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-atg-fg">{displayName}</p>
            <p className="mt-0.5 truncate text-xs text-atg-muted">{email}</p>
          </div>
          <div className="p-2">
            <button
              type="button"
              role="menuitem"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600',
                'transition-colors hover:bg-red-50 disabled:opacity-60',
                'dark:text-red-400 dark:hover:bg-red-950/40',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              )}
            >
              {loggingOut ? 'Déconnexion…' : logoutLabel}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
