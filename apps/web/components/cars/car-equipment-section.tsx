'use client';

import type { ReactNode } from 'react';
import type { VehicleEquipmentKey } from '../../lib/cars/specs';
import type { Translations } from '../../lib/i18n/translations';

const EQUIPMENT_ICONS: Record<VehicleEquipmentKey, ReactNode> = {
  airConditioning: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  bluetooth: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M4.93 8.465a14 14 0 0114.142 0"
      />
    </svg>
  ),
  gps: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  ),
  usb: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 18v-6m0 0V9m0 3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

type CarEquipmentSectionProps = {
  items: VehicleEquipmentKey[];
  title: string;
  labels: Translations['cars']['equipment'];
};

export function CarEquipmentSection({ items, title, labels }: CarEquipmentSectionProps) {
  if (!items.length) return null;

  return (
    <section
      className="rounded-2xl border border-atg-border bg-atg-elevated p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-6"
      aria-labelledby="car-equipment-heading"
    >
      <h2 id="car-equipment-heading" className="mb-4 text-lg font-bold text-atg-fg">
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((key) => (
          <li
            key={key}
            className="flex items-center gap-2 rounded-lg border border-atg-border bg-atg-surface px-3 py-2.5 text-sm text-atg-fg dark:border-atg-border dark:bg-atg-surface"
          >
            <span className="shrink-0 text-primary">{EQUIPMENT_ICONS[key]}</span>
            <span>{labels[key]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
