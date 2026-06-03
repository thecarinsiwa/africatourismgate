'use client';

import type { PosReceiptData } from '../../lib/sale/receipt';

type PosReceiptProps = {
  data: PosReceiptData;
};

function AtgLogoMark() {
  return (
    <svg
      className="h-10 w-10 text-primary"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  );
}

function ReceiptDivider() {
  return (
    <hr
      className="my-3 border-0 border-t border-dashed border-gray-300 print:border-gray-400"
      aria-hidden
    />
  );
}

export function PosReceipt({ data }: PosReceiptProps) {
  return (
    <article
      id="pos-receipt"
      className="pos-receipt mx-auto w-full max-w-sm rounded-lg border border-atg-border bg-white px-6 py-6 text-left text-gray-900 shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none"
      aria-label="Reçu de vente"
    >
      <header className="text-center">
        <div className="flex flex-col items-center gap-2">
          {data.logoUrl ? (
            <img
              src={data.logoUrl}
              alt=""
              className="h-12 max-w-[160px] object-contain"
            />
          ) : (
            <AtgLogoMark />
          )}
          <div>
            <p className="text-lg font-bold leading-tight">{data.displayName}</p>
            <p className="text-sm text-gray-600">{data.organizationName}</p>
          </div>
        </div>
        <p className="mt-3 text-xs uppercase tracking-widest text-gray-500">
          Reçu de caisse
        </p>
      </header>

      <ReceiptDivider />

      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">N° réservation</dt>
          <dd className="break-all font-mono text-xs font-medium">{data.bookingId}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Date</dt>
          <dd className="font-medium">{data.issuedAtLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Caissier</dt>
          <dd className="font-medium">{data.employeeName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Client</dt>
          <dd className="text-right font-medium">{data.clientName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">E-mail</dt>
          <dd className="break-all text-right text-xs font-medium">{data.clientEmail}</dd>
        </div>
      </dl>

      <ReceiptDivider />

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="pb-2 font-semibold">Article</th>
            <th className="pb-2 text-right font-semibold">Qté</th>
            <th className="pb-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={`${item.title}-${index}`} className="align-top">
              <td className="py-1.5 pr-2">
                <span className="font-medium">{item.title}</span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  {item.unitPriceLabel} / unité
                </span>
              </td>
              <td className="py-1.5 text-right tabular-nums">{item.quantity}</td>
              <td className="py-1.5 text-right tabular-nums font-medium">
                {item.lineTotalLabel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ReceiptDivider />

      <dl className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Sous-total</dt>
          <dd className="tabular-nums">{data.subtotalLabel}</dd>
        </div>
        {data.discountLabel ? (
          <div className="flex justify-between gap-4 text-emerald-700">
            <dt>Remise</dt>
            <dd className="tabular-nums">−{data.discountLabel}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 text-base font-bold">
          <dt>Total</dt>
          <dd className="tabular-nums">{data.totalLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Paiement</dt>
          <dd className="font-semibold">{data.paymentMethodLabel}</dd>
        </div>
      </dl>

      <ReceiptDivider />

      <p className="text-center text-sm text-gray-600">
        Merci pour votre achat !
      </p>
      <p className="mt-1 text-center text-xs text-gray-400">
        {data.displayName} — {data.currency}
      </p>
    </article>
  );
}

export function printPosReceipt(): void {
  window.print();
}
