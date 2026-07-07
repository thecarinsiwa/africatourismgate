import type { PublicDonation } from '@africatourismgate/types';
import { GapDonateButton } from './gap-donate-button';

type DonationsListProps = {
  items: PublicDonation[];
  allCampaignsLabel: string;
};

export function DonationsListSection({ items, allCampaignsLabel }: DonationsListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h2 className="text-2xl font-bold text-atg-fg">{allCampaignsLabel}</h2>
      <ul className="mt-6 grid gap-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-atg-border bg-atg-elevated p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {item.contextNote ? (
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {item.contextNote}
                  </p>
                ) : null}
                <h3 className="mt-1 text-lg font-semibold text-atg-fg">{item.title}</h3>
                {item.description ? (
                  <p className="mt-2 text-sm leading-relaxed text-atg-muted">{item.description}</p>
                ) : null}
              </div>
              <GapDonateButton href={item.url} label={item.buttonLabel} variant="hero" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
