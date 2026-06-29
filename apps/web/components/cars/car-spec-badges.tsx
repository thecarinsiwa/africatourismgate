'use client';

import type { VehicleSpecs } from '../../lib/cars/specs';
import type { Translations } from '../../lib/i18n/translations';

type CarSpecBadgesProps = {
  specs: VehicleSpecs;
  labels: Translations['cars']['specs'];
  transmissionLabels: Translations['cars']['transmission'];
  fuelLabels: Translations['cars']['fuel'];
  className?: string;
};

const SPEC_ICONS = {
  seats: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  transmission: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  fuel: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  airConditioning: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
} as const;

export function CarSpecBadges({
  specs,
  labels,
  transmissionLabels,
  fuelLabels,
  className = '',
}: CarSpecBadgesProps) {
  const items = [
    {
      key: 'seats',
      icon: SPEC_ICONS.seats,
      label: labels.seats.replace('{n}', String(specs.seats)),
    },
    {
      key: 'transmission',
      icon: SPEC_ICONS.transmission,
      label: transmissionLabels[specs.transmission],
    },
    {
      key: 'fuel',
      icon: SPEC_ICONS.fuel,
      label: fuelLabels[specs.fuel],
    },
    {
      key: 'airConditioning',
      icon: SPEC_ICONS.airConditioning,
      label: specs.airConditioning ? labels.airConditioningYes : labels.airConditioningNo,
    },
  ];

  return (
    <ul
      className={`flex flex-wrap gap-2 ${className}`}
      aria-label={labels.listAria}
    >
      {items.map((item) => (
        <li
          key={item.key}
          className="inline-flex items-center gap-1.5 rounded-lg border border-atg-border bg-atg-surface px-2.5 py-1.5 text-xs font-medium text-atg-fg dark:border-atg-border dark:bg-atg-surface"
        >
          <span className="shrink-0 text-primary">{item.icon}</span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
