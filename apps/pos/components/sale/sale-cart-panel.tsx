'use client';

import { Button, Card, cn } from '@africatourismgate/ui';
import { posSalePageConfig } from '../../config/sale';
import { formatCents } from '../../lib/sale/format';
import { useSaleCart } from '../../lib/sale/cart-context';
import { SaleCustomerBar } from './sale-customer-bar';
import { SalePaymentBar } from './sale-payment-bar';
import { SalePromoBar } from './sale-promo-bar';

const { cart: cartLabels, backToHomeLabel } = posSalePageConfig;

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

export function SaleCartPanel() {
  const {
    linesWithPricing,
    preview,
    previewLoading,
    previewError,
    removeLine,
    clearCart,
  } = useSaleCart();

  const lineCount = linesWithPricing.length;
  const cartCountLabel = cartLabels.itemCount(lineCount);
  const currency = preview?.currency ?? linesWithPricing[0]?.previewLine?.currency;

  return (
    <aside className="w-full min-w-0 shrink-0 lg:max-w-[22rem]">
      <div className="sticky top-4">
        <Card variant="dashboard" padding="sm" className="flex flex-col">
          <div className="mb-5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary"
                aria-hidden
              >
                <CartIcon className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-atg-fg">{cartLabels.title}</h2>
            </div>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold',
                lineCount > 0
                  ? 'bg-primary/15 text-primary'
                  : 'bg-atg-surface text-atg-muted',
              )}
            >
              {cartCountLabel}
            </span>
          </div>

          <SaleCustomerBar />

          {lineCount === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-atg-border bg-atg-surface/30 px-4 py-10 text-center">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-atg-surface text-atg-muted"
                aria-hidden
              >
                <CartIcon className="h-7 w-7" />
              </span>
              <p className="mt-4 text-base font-medium text-atg-fg">{cartLabels.empty}</p>
              <p className="mt-1.5 text-sm text-atg-muted">{cartLabels.emptyHint}</p>
            </div>
          ) : (
            <>
              <ul className="max-h-[min(40vh,24rem)] space-y-2.5 overflow-y-auto pr-0.5">
                {linesWithPricing.map((line) => {
                  const lineTotal =
                    line.previewLine?.lineTotalCents ??
                    (line.previewLine
                      ? line.previewLine.unitPriceCents * line.item.quantity
                      : null);

                  return (
                    <li
                      key={line.id}
                      className="rounded-xl border border-atg-border bg-atg-surface/50 px-3.5 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug text-atg-fg">
                            {line.label}
                          </p>
                          <p className="mt-1 text-xs text-atg-muted">
                            {cartLabels.quantityLabel(line.item.quantity)}
                          </p>
                          {lineTotal !== null && currency ? (
                            <p className="mt-1.5 text-sm font-bold text-primary">
                              {formatCents(lineTotal, currency)}
                            </p>
                          ) : previewLoading ? (
                            <p className="mt-1.5 text-xs text-atg-muted">
                              {cartLabels.previewLoadingLabel}
                            </p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 !min-h-0 px-2 py-1 text-xs text-atg-muted hover:text-red-600"
                          onClick={() => removeLine(line.id)}
                          aria-label={`${cartLabels.removeLabel} ${line.label}`}
                        >
                          {cartLabels.removeLabel}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <SalePromoBar />

              <div className="mt-5 space-y-2 rounded-xl bg-atg-surface/60 p-4">
                {previewLoading && !preview ? (
                  <p className="text-center text-sm text-atg-muted">
                    {cartLabels.previewLoadingLabel}
                  </p>
                ) : null}

                {previewError ? (
                  <p role="alert" className="text-sm text-red-600">
                    {previewError}
                  </p>
                ) : null}

                {preview && currency ? (
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-atg-muted">{cartLabels.subtotalLabel}</dt>
                      <dd className="font-medium text-atg-fg">
                        {formatCents(preview.subtotalCents, currency)}
                      </dd>
                    </div>
                    {preview.discountCents > 0 ? (
                      <div className="flex justify-between gap-2">
                        <dt className="text-atg-muted">
                          {preview.appliedDiscount?.label ?? cartLabels.discountLabel}
                        </dt>
                        <dd className="font-medium text-green-700 dark:text-green-400">
                          −{formatCents(preview.discountCents, currency)}
                        </dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-2 border-t border-atg-border pt-3">
                      <dt className="text-base font-bold text-atg-fg">{cartLabels.totalLabel}</dt>
                      <dd className="text-lg font-bold text-primary">
                        {formatCents(preview.totalCents, currency)}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </div>

              {lineCount > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth
                  className="mt-3 !min-h-0 text-atg-muted"
                  onClick={clearCart}
                >
                  {cartLabels.clearLabel}
                </Button>
              ) : null}

              <SalePaymentBar />
            </>
          )}

          <Button
            variant="outline"
            size="lg"
            href="/"
            fullWidth
            className="mt-5 min-h-[3rem]"
          >
            {backToHomeLabel}
          </Button>
        </Card>
      </div>
    </aside>
  );
}
