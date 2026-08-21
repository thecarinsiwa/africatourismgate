'use client';

import { Card } from '@africatourismgate/ui';
import { useMemo } from 'react';
import { useVehicleSpecLabels } from '../../lib/i18n/use-module-labels';
import { resolveVehicleSpecs } from '../../lib/vehicle-category-specs';

type VehicleSpecsGridProps = {
  categoryName: string;
};

type SpecItem = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

function SpecIconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      className="h-5 w-5"
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

function SeatsIcon() {
  return (
    <SpecIconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </SpecIconBase>
  );
}

function TransmissionIcon() {
  return (
    <SpecIconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </SpecIconBase>
  );
}

function FuelIcon() {
  return (
    <SpecIconBase>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
      />
    </SpecIconBase>
  );
}

function localizeTransmission(
  value: string,
  labels: ReturnType<typeof useVehicleSpecLabels>,
): string {
  const normalized = value.toLowerCase();
  if (normalized.includes('manual') || normalized.includes('manuelle')) {
    return labels.transmissionManual;
  }
  if (normalized.includes('auto') || normalized.includes('automatique')) {
    return labels.transmissionAutomatic;
  }
  return value;
}

function localizeFuel(value: string, labels: ReturnType<typeof useVehicleSpecLabels>): string {
  const normalized = value.toLowerCase();
  if (normalized.includes('essence') || normalized.includes('petrol')) {
    return labels.fuelPetrol;
  }
  if (normalized.includes('diesel')) {
    return labels.fuelDiesel;
  }
  if (normalized.includes('hybrid') || normalized.includes('hybride')) {
    return labels.fuelHybrid;
  }
  return value;
}

export function VehicleSpecsGrid({ categoryName }: VehicleSpecsGridProps) {
  const specLabels = useVehicleSpecLabels();
  const specs = resolveVehicleSpecs(categoryName);

  const items: SpecItem[] = useMemo(
    () => [
      {
        label: specLabels.seats,
        value: String(specs.seats),
        icon: <SeatsIcon />,
      },
      {
        label: specLabels.transmission,
        value: localizeTransmission(specs.transmission, specLabels),
        icon: <TransmissionIcon />,
      },
      {
        label: specLabels.fuel,
        value: localizeFuel(specs.fuel, specLabels),
        icon: <FuelIcon />,
      },
    ],
    [specLabels, specs.fuel, specs.seats, specs.transmission],
  );

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <Card
          key={item.label}
          variant="dashboard"
          className="flex min-w-[9.5rem] flex-1 items-center gap-3 p-3 sm:max-w-[14rem] sm:flex-none"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-atg-surface text-primary ring-1 ring-atg-border/60">
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-atg-muted">
              {item.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-atg-fg">{item.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
