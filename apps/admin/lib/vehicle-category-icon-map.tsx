import type { ReactNode } from 'react';

type IconProps = { className?: string };

export type VehicleCategoryIconType = 'compact' | 'suv' | 'luxury' | 'default';

function IconBase({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className ?? 'h-5 w-5'}
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

function CompactCarIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l1.5-4.5A1.5 1.5 0 018 7.5h8a1.5 1.5 0 011.5 1L19 13M5 13h14M5 13v3.5a1 1 0 001 1h1.5M19 13v3.5a1 1 0 01-1 1h-1.5M8 17h8"
      />
    </IconBase>
  );
}

function SuvCarIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 14l1.8-5.4A1.8 1.8 0 017.6 7.5h8.8a1.8 1.8 0 011.8 1.1L20 14M4 14h16M4 14v2.5a1 1 0 001 1h1M20 14v2.5a1 1 0 01-1 1h-1M7.5 17.5h9"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5h6" />
    </IconBase>
  );
}

function LuxuryCarIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 13.5l2-5.25A1.5 1.5 0 018 7.5h8a1.5 1.5 0 011.5 1.125L19.5 13.5M4.5 13.5h15M4.5 13.5V16a1 1 0 001 1h1M19.5 13.5V16a1 1 0 01-1 1h-1M8 17h8"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v1.5" />
    </IconBase>
  );
}

function DefaultCarIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a18.902 18.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177V5.25A2.25 2.25 0 0012 3h-2.25A2.25 2.25 0 007.5 5.25v2.323"
      />
    </IconBase>
  );
}

const ICON_BY_TYPE: Record<
  VehicleCategoryIconType,
  (props: IconProps) => ReactNode
> = {
  compact: CompactCarIcon,
  suv: SuvCarIcon,
  luxury: LuxuryCarIcon,
  default: DefaultCarIcon,
};

function normalizeCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function resolveVehicleCategoryIconType(name: string): VehicleCategoryIconType {
  const normalized = normalizeCategoryName(name);

  if (
    normalized.includes('compact') ||
    normalized.includes('citadine') ||
    normalized.includes('econom') ||
    normalized.includes('eco ')
  ) {
    return 'compact';
  }

  if (normalized.includes('suv') || normalized.includes('4x4')) {
    return 'suv';
  }

  if (
    normalized.includes('luxe') ||
    normalized.includes('luxury') ||
    normalized.includes('premium') ||
    normalized.includes('berline')
  ) {
    return 'luxury';
  }

  return 'default';
}

export function getVehicleCategoryIcon(name: string, className?: string): ReactNode {
  const type = resolveVehicleCategoryIconType(name);
  const Icon = ICON_BY_TYPE[type];
  return <Icon className={className} />;
}
