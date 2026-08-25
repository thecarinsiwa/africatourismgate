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
                  <div
                    className="mt-2 text-sm leading-relaxed text-atg-muted [&_p]:mb-2 [&_p:last-child]:mb-0 [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-atg-fg [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline [&_img]:my-2 [&_img]:max-h-64 [&_img]:w-auto [&_img]:max-w-full [&_img]:rounded-md"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
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
