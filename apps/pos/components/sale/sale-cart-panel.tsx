'use client';

import { Button } from '@africatourismgate/ui';
import { posSalePageConfig } from '../../config/sale';
import { formatCents } from '../../lib/sale/format';
import { useSaleCart } from '../../lib/sale/cart-context';

const { cart: cartLabels, backToHomeLabel } = posSalePageConfig;

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
    <aside className="w-full shrink-0 lg:w-80">
      <div className="sticky top-4 rounded-2xl border border-atg-border bg-atg-elevated p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-atg-fg">{cartLabels.title}</h2>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
            {cartCountLabel}
          </span>
        </div>

        {lineCount === 0 ? (
          <p className="text-base text-atg-muted">{cartLabels.empty}</p>
        ) : (
          <>
            <ul className="max-h-[40vh] space-y-3 overflow-y-auto">
              {linesWithPricing.map((line) => {
                const lineTotal =
                  line.previewLine?.lineTotalCents ??
                  (line.previewLine
                    ? line.previewLine.unitPriceCents * line.item.quantity
                    : null);

                return (
                  <li
                    key={line.id}
                    className="rounded-lg border border-atg-border bg-atg-surface px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-atg-fg">{line.label}</p>
                        <p className="mt-1 text-xs text-atg-muted">
                          {cartLabels.quantityLabel(line.item.quantity)}
                        </p>
                        {lineTotal !== null && currency ? (
                          <p className="mt-1 text-sm font-semibold text-atg-fg">
                            {formatCents(lineTotal, currency)}
                          </p>
                        ) : previewLoading ? (
                          <p className="mt-1 text-xs text-atg-muted">
                            {cartLabels.previewLoadingLabel}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-atg-muted hover:text-red-600"
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

            <div className="mt-5 space-y-2 border-t border-atg-border pt-4">
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
                  <div className="flex justify-between gap-2 border-t border-atg-border pt-2 text-base">
                    <dt className="font-bold text-atg-fg">{cartLabels.totalLabel}</dt>
                    <dd className="font-bold text-primary">
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
                className="mt-3 text-atg-muted"
                onClick={clearCart}
              >
                {cartLabels.clearLabel}
              </Button>
            ) : null}
          </>
        )}

        <Button
          variant="outline"
          size="lg"
          href="/"
          fullWidth
          className="pos-touch mt-6 min-h-[3rem]"
        >
          {backToHomeLabel}
        </Button>
      </div>
    </aside>
  );
}
