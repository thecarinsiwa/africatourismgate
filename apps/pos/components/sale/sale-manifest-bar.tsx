'use client';

import { Button } from '@africatourismgate/ui';
import { useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { useSaleCart } from '../../lib/sale/cart-context';
import { SaleManifestSheet } from './sale-manifest-sheet';

const { manifest: labels } = posSalePageConfig;

export function SaleManifestBar() {
  const {
    manifestEntries,
    setManifestEntries,
    customer,
    expectedTravelersCount,
    isCheckingOut,
  } = useSaleCart();
  const [sheetOpen, setSheetOpen] = useState(false);

  const count = manifestEntries.length;
  const subtitle = count > 0 ? labels.subtitleCount(count) : labels.subtitleEmpty;
  const buttonLabel = count > 0 ? labels.editLabel : labels.fillLabel;

  return (
    <>
      <div className="mb-5 rounded-xl border border-atg-border bg-atg-surface/50 px-3.5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
          {labels.sectionLabel}
        </p>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-atg-fg">{subtitle}</p>
            {count > 0 ? (
              <p className="mt-0.5 truncate text-xs text-atg-muted">
                {manifestEntries.map((e) => e.fullName).filter(Boolean).join(', ')}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isCheckingOut}
            className="shrink-0 !min-h-[2.75rem] px-3 disabled:opacity-50"
            onClick={() => setSheetOpen(true)}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>

      <SaleManifestSheet
        open={sheetOpen}
        entries={manifestEntries}
        customer={customer}
        expectedCount={expectedTravelersCount}
        onClose={() => setSheetOpen(false)}
        onSave={setManifestEntries}
      />
    </>
  );
}
