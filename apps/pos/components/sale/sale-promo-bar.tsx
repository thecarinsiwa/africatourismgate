'use client';

import { Button, Input } from '@africatourismgate/ui';
import { useEffect, useState } from 'react';
import { posSalePageConfig } from '../../config/sale';
import { useSaleCart } from '../../lib/sale/cart-context';

const { promo: labels } = posSalePageConfig;

export function SalePromoBar() {
  const {
    appliedPromoCode,
    applyPromoCode,
    clearPromoCode,
    preview,
    previewLoading,
    previewError,
  } = useSaleCart();
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setDraft(appliedPromoCode ?? '');
  }, [appliedPromoCode]);

  const promoApplied =
    Boolean(appliedPromoCode) && preview !== null && !previewError && !previewLoading;

  function handleApply() {
    applyPromoCode(draft);
  }

  function handleClear() {
    clearPromoCode();
    setDraft('');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleApply();
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-atg-border bg-atg-surface/50 px-3.5 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-atg-muted">
        {labels.sectionLabel}
      </p>

      {promoApplied && appliedPromoCode ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="min-w-0 flex-1 text-sm font-semibold text-green-700 dark:text-green-400">
            {labels.appliedHint(appliedPromoCode)}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 !min-h-[2.75rem] px-3 text-atg-muted"
            onClick={handleClear}
          >
            {labels.removeLabel}
          </Button>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <Input
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={draft}
            placeholder={labels.placeholder}
            className="min-h-[2.75rem] flex-1"
            aria-label={labels.sectionLabel}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          {appliedPromoCode && previewError ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 !min-h-[2.75rem] px-3 text-atg-muted"
              onClick={handleClear}
            >
              {labels.removeLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0 !min-h-[2.75rem] px-4"
            disabled={previewLoading}
            onClick={handleApply}
          >
            {labels.applyLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
