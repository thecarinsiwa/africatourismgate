import { cn } from '@africatourismgate/ui';
import type { ComponentType } from 'react';
import type { SaleCatalogHit } from '../../lib/sale/types';

type SaleKind = SaleCatalogHit['kind'];

const kindStyles: Record<
  SaleKind,
  { bg: string; text: string; ring: string }
> = {
  activity: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'group-hover:ring-amber-500/30',
  },
  room: {
    bg: 'bg-sky-500/15',
    text: 'text-sky-600 dark:text-sky-400',
    ring: 'group-hover:ring-sky-500/30',
  },
  flight_class: {
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-600 dark:text-cyan-400',
    ring: 'group-hover:ring-cyan-500/30',
  },
  vehicle: {
    bg: 'bg-primary/15',
    text: 'text-primary',
    ring: 'group-hover:ring-primary/30',
  },
  cabin: {
    bg: 'bg-violet-500/15',
    text: 'text-violet-600 dark:text-violet-400',
    ring: 'group-hover:ring-violet-500/30',
  },
  package: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    ring: 'group-hover:ring-emerald-500/30',
  },
};

export function getSaleKindStyles(kind: SaleKind) {
  return kindStyles[kind];
}

type IconProps = { className?: string };

function ActivityIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function RoomIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function FlightIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  );
}

function VehicleIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8 17h8M5 17h14a1 1 0 001-1v-4.586a1 1 0 00-.293-.707l-2-2A1 1 0 0017 9h-3.586a1 1 0 00-.707.293l-2.414 2.414A1 1 0 0010 12.586V16a1 1 0 001 1z"
      />
    </svg>
  );
}

function CabinIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
  );
}

function PackageIcon({ className }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

const kindIcons: Record<SaleKind, ComponentType<IconProps>> = {
  activity: ActivityIcon,
  room: RoomIcon,
  flight_class: FlightIcon,
  vehicle: VehicleIcon,
  cabin: CabinIcon,
  package: PackageIcon,
};

export function SaleKindIcon({ kind, className }: { kind: SaleKind; className?: string }) {
  const Icon = kindIcons[kind];
  return <Icon className={cn('h-5 w-5', className)} />;
}

export function SaleKindBadge({
  kind,
  label,
}: {
  kind: SaleKind;
  label: string;
}) {
  const styles = kindStyles[kind];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        styles.bg,
        styles.text,
      )}
    >
      <SaleKindIcon kind={kind} className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
