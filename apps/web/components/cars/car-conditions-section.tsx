'use client';

import type { Translations } from '../../lib/i18n/translations';

type CarConditionsSectionProps = {
  title: string;
  items: Translations['cars']['conditionItems'];
};

export function CarConditionsSection({ title, items }: CarConditionsSectionProps) {
  const entries = [
    items.minAge,
    items.deposit,
    items.mileage,
    items.insurance,
    items.fuelPolicy,
  ];

  return (
    <section
      className="rounded-2xl border border-atg-border bg-atg-elevated p-5 shadow-sm dark:border-atg-border dark:bg-atg-elevated sm:p-6"
      aria-labelledby="car-conditions-heading"
    >
      <h2 id="car-conditions-heading" className="mb-4 text-lg font-bold text-atg-fg">
        {title}
      </h2>
      <ul className="space-y-3 text-sm leading-relaxed text-atg-muted">
        {entries.map((text) => (
          <li key={text} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
