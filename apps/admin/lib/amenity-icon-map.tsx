import type { ReactNode } from 'react';

type IconProps = { className?: string };

function AmenityIconBase({ className, children }: IconProps & { children: ReactNode }) {
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

function WifiIcon({ className }: IconProps) {
  return (
    <AmenityIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M2.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
      />
    </AmenityIconBase>
  );
}

function PoolIcon({ className }: IconProps) {
  return (
    <AmenityIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75V9.75A2.25 2.25 0 0017.25 7.5h-10.5A2.25 2.25 0 004.5 9.75v3z"
      />
    </AmenityIconBase>
  );
}

function ParkingIcon({ className }: IconProps) {
  return (
    <AmenityIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a18.902 18.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177V5.25A2.25 2.25 0 0012 3h-2.25A2.25 2.25 0 007.5 5.25v2.323"
      />
    </AmenityIconBase>
  );
}

function BreakfastIcon({ className }: IconProps) {
  return (
    <AmenityIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.379a48.474 48.474 0 00-6-.371c-2.032 0-4.034.125-6 .371m0 0a48.507 48.507 0 01-1.5-.734 2.25 2.25 0 00-2.394 0l-1.548.516a1.125 1.125 0 01-1.298-1.298l.516-1.548a2.25 2.25 0 000-2.394l-.734-1.5"
      />
    </AmenityIconBase>
  );
}

function AcIcon({ className }: IconProps) {
  return (
    <AmenityIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </AmenityIconBase>
  );
}

function SpaIcon({ className }: IconProps) {
  return (
    <AmenityIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </AmenityIconBase>
  );
}

function GenericIcon({ className }: IconProps) {
  return (
    <AmenityIconBase className={className}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"
      />
    </AmenityIconBase>
  );
}

const CODE_ICON_MAP: Record<string, (props: IconProps) => ReactNode> = {
  wifi: WifiIcon,
  pool: PoolIcon,
  pool_parking: PoolIcon,
  parking: ParkingIcon,
  breakfast: BreakfastIcon,
  ac: AcIcon,
  air_conditioning: AcIcon,
  spa: SpaIcon,
  gym: SpaIcon,
};

export function getAmenityIcon(code: string, className?: string): ReactNode {
  const normalized = code.trim().toLowerCase();
  for (const [key, Icon] of Object.entries(CODE_ICON_MAP)) {
    if (normalized === key || normalized.includes(key)) {
      return <Icon className={className} />;
    }
  }
  return <GenericIcon className={className} />;
}
