'use client';

import { Button } from '@africatourismgate/ui';
import { useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { useSaleCart } from '../../lib/sale/cart-context';
import { SaleCustomerSheet } from './sale-customer-sheet';

const { customer: labels } = posSalePageConfig;

function formatCustomerDisplay(firstName: string, lastName: string, email: string): string {
  const name = `${firstName} ${lastName}`.trim();
  return name || email;
}

export function SaleCustomerBar() {
  const { customer, setCustomer } = useSaleCart();
  const [sheetOpen, setSheetOpen] = useState(false);

  const title = customer
    ? formatCustomerDisplay(customer.firstName, customer.lastName, customer.email)
    : labels.walkInLabel;
  const subtitle = customer ? customer.email : labels.walkInHint;

  return (
    <>
      <div className="mb-5 rounded-xl border border-atg-border bg-atg-surface/50 px-3.5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
          {labels.sectionLabel}
        </p>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug text-atg-fg">{title}</p>
            <p className="mt-0.5 truncate text-xs text-atg-muted">{subtitle}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0 !min-h-[2.75rem] px-3"
            onClick={() => setSheetOpen(true)}
          >
            {labels.changeLabel}
          </Button>
        </div>
      </div>

      <SaleCustomerSheet
        open={sheetOpen}
        selectedCustomerId={customer?.id ?? null}
        onClose={() => setSheetOpen(false)}
        onSelect={setCustomer}
      />
    </>
  );
}
