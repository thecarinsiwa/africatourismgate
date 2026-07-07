'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Logo } from './logo';

export type SidebarNavLink = {
  href: string;
  label: string;
  icon?: ReactNode;
};

export type SidebarNavGroup = {
  id: string;
  label: string;
  icon?: ReactNode;
  children: SidebarNavLink[];
  defaultOpen?: boolean;
};

export type SidebarNavEntry =
  | ({ type: 'link' } & SidebarNavLink)
  | ({ type: 'group' } & SidebarNavGroup);

/** @deprecated Use SidebarNavLink */
export type SidebarNavItem = SidebarNavLink;

export type SidebarProps = {
  navItems: SidebarNavEntry[];
  logo?: { name: string; href?: string; logoUrl?: string | null };
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  closeMenuLabel?: string;
};

const STORAGE_KEY = 'atg-sidebar-open-group';

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

function collectNavHrefs(navItems: SidebarNavEntry[]): string[] {
  const hrefs: string[] = [];
  for (const entry of navItems) {
    if (entry.type === 'link') {
      hrefs.push(entry.href);
    } else {
      for (const child of entry.children) {
        hrefs.push(child.href);
      }
    }
  }
  return hrefs;
}

/** Plus long préfixe correspondant (évite /utilisateurs actif sur /utilisateurs/employes). */
function resolveActiveHref(pathname: string, allHrefs: string[]): string | null {
  const current = normalizePath(pathname);
  let best: string | null = null;

  for (const href of allHrefs) {
    const target = normalizePath(href);
    const matches =
      current === target || current.startsWith(`${target}/`);
    if (matches && (!best || target.length > best.length)) {
      best = target;
    }
  }

  return best;
}

function isActivePath(pathname: string, href: string, allHrefs: string[]): boolean {
  const active = resolveActiveHref(pathname, allHrefs);
  return active !== null && active === normalizePath(href);
}

function isGroupActive(
  pathname: string,
  children: SidebarNavLink[],
  allHrefs: string[],
): boolean {
  return children.some((child) => isActivePath(pathname, child.href, allHrefs));
}

function findActiveGroupId(pathname: string, navItems: SidebarNavEntry[]): string | null {
  const allHrefs = collectNavHrefs(navItems);
  for (const entry of navItems) {
    if (entry.type === 'group' && isGroupActive(pathname, entry.children, allHrefs)) {
      return entry.id;
    }
  }
  return null;
}

function readStoredOpenGroupId(navItems: SidebarNavEntry[]): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const validIds = navItems.filter((e) => e.type === 'group').map((e) => e.id);
    return validIds.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredOpenGroupId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

function resolveInitialOpenGroupId(
  pathname: string,
  navItems: SidebarNavEntry[],
): string | null {
  const activeId = findActiveGroupId(pathname, navItems);
  if (activeId) return activeId;

  const defaultOpen = navItems.find((e) => e.type === 'group' && e.defaultOpen);
  if (defaultOpen?.type === 'group') return defaultOpen.id;

  // localStorage is restored after mount — reading it here causes hydration mismatch.
  return null;
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn('h-4 w-4 shrink-0 text-atg-muted transition-transform', open && 'rotate-90')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

const linkClassName = (active: boolean, nested = false) =>
  cn(
    'flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    nested ? 'pl-9 pr-3' : 'px-3',
    active
      ? 'bg-primary text-white shadow-sm'
      : 'text-atg-muted hover:bg-atg-surface/80 hover:text-atg-fg',
  );

type SidebarNavLinkRowProps = {
  item: SidebarNavLink;
  pathname: string;
  allHrefs: string[];
  nested?: boolean;
  onNavigate?: () => void;
};

function SidebarNavLinkRow({ item, pathname, allHrefs, nested, onNavigate }: SidebarNavLinkRowProps) {
  const active = isActivePath(pathname, item.href, allHrefs);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={linkClassName(active, nested)}
      aria-current={active ? 'page' : undefined}
    >
      {item.icon ? <span className="flex shrink-0">{item.icon}</span> : null}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

type SidebarNavGroupRowProps = {
  group: SidebarNavGroup;
  pathname: string;
  allHrefs: string[];
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
};

function SidebarNavGroupRow({
  group,
  pathname,
  allHrefs,
  open,
  onToggle,
  onNavigate,
}: SidebarNavGroupRowProps) {
  const panelId = useId();
  const groupActive = isGroupActive(pathname, group.children, allHrefs);

  return (
    <div className="relative flex flex-col">
      {groupActive ? (
        <span
          aria-hidden
          className="absolute bottom-1 left-0 top-1 w-1 rounded-full bg-primary"
        />
      ) : null}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg py-2.5 pl-3 pr-3 text-left text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          groupActive
            ? 'bg-primary/8 text-primary'
            : 'text-atg-muted hover:bg-atg-surface/80 hover:text-atg-fg',
        )}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {group.icon ? <span className="flex shrink-0">{group.icon}</span> : null}
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div id={panelId} className="mt-0.5 flex flex-col gap-0.5" role="group">
          {group.children.map((child) => (
            <SidebarNavLinkRow
              key={child.href}
              item={child}
              pathname={pathname}
              allHrefs={allHrefs}
              nested
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type SidebarContentProps = Pick<SidebarProps, 'navItems' | 'logo' | 'onMobileClose' | 'closeMenuLabel'> & {
  openGroupId: string | null;
  onGroupToggle: (groupId: string) => void;
};

function SidebarContent({
  navItems,
  logo,
  onMobileClose,
  closeMenuLabel = 'Close menu',
  openGroupId,
  onGroupToggle,
}: SidebarContentProps) {
  const pathname = usePathname();
  const allHrefs = collectNavHrefs(navItems);

  const closeButton = onMobileClose ? (
    <button
      type="button"
      onClick={onMobileClose}
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-atg-border',
        'bg-atg-elevated text-atg-fg transition-colors hover:bg-atg-surface md:hidden',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      )}
      aria-label={closeMenuLabel}
    >
      <CloseIcon />
    </button>
  ) : null;

  return (
    <>
      {logo ? (
        <div className="flex items-center justify-between gap-3 border-b border-atg-border px-4 py-5 md:px-5">
          <Logo
            name={logo.name}
            href={logo.href ?? '/dashboard'}
            logoUrl={logo.logoUrl}
          />
          {closeButton}
        </div>
      ) : closeButton ? (
        <div className="flex justify-end border-b border-atg-border px-4 py-3 md:hidden">
          {closeButton}
        </div>
      ) : null}

      <nav className="flex flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map((entry) => {
          if (entry.type === 'link') {
            return (
              <SidebarNavLinkRow
                key={entry.href}
                item={entry}
                pathname={pathname}
                allHrefs={allHrefs}
                onNavigate={onMobileClose}
              />
            );
          }
          return (
            <SidebarNavGroupRow
              key={entry.id}
              group={entry}
              pathname={pathname}
              allHrefs={allHrefs}
              open={openGroupId === entry.id}
              onToggle={() => onGroupToggle(entry.id)}
              onNavigate={onMobileClose}
            />
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar({
  navItems,
  logo,
  className,
  mobileOpen = false,
  onMobileClose,
  closeMenuLabel,
}: SidebarProps) {
  const pathname = usePathname();
  const mobileAsideRef = useRef<HTMLElement>(null);
  const [openGroupId, setOpenGroupId] = useState<string | null>(() =>
    resolveInitialOpenGroupId(pathname, navItems),
  );

  useEffect(() => {
    const activeId = findActiveGroupId(pathname, navItems);
    if (activeId) {
      setOpenGroupId(activeId);
      writeStoredOpenGroupId(activeId);
      return;
    }
    const stored = readStoredOpenGroupId(navItems);
    if (stored) {
      setOpenGroupId(stored);
    }
  }, [pathname, navItems]);

  const handleGroupToggle = useCallback((groupId: string) => {
    setOpenGroupId((current) => {
      const next = current === groupId ? null : groupId;
      writeStoredOpenGroupId(next);
      return next;
    });
  }, []);

  useEffect(() => {
    onMobileClose?.();
  }, [pathname, onMobileClose]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onMobileClose?.();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileOpen, onMobileClose]);

  useEffect(() => {
    const el = mobileAsideRef.current;
    if (!el) return;

    el.inert = !mobileOpen;

    if (!mobileOpen) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && el.contains(active)) {
        active.blur();
      }
    }
  }, [mobileOpen]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
      />

      <aside
        ref={mobileAsideRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(100%,17rem)] max-w-full flex-col border-r border-atg-border bg-atg-elevated pb-[env(safe-area-inset-bottom)]',
          'transition-transform duration-200 ease-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
        role="dialog"
        aria-modal={mobileOpen}
        aria-label="Navigation"
      >
        <SidebarContent
          navItems={navItems}
          logo={logo}
          onMobileClose={onMobileClose}
          closeMenuLabel={closeMenuLabel}
          openGroupId={openGroupId}
          onGroupToggle={handleGroupToggle}
        />
      </aside>

      <aside
        className={cn(
          'hidden w-60 shrink-0 flex-col border-r border-atg-border bg-atg-elevated md:flex lg:w-64',
          className,
        )}
      >
        <SidebarContent
          navItems={navItems}
          logo={logo}
          openGroupId={openGroupId}
          onGroupToggle={handleGroupToggle}
        />
      </aside>
    </>
  );
}
