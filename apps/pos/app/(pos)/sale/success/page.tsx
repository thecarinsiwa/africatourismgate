import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PosSaleSuccessContent } from '../../../../components/pos-sale-success-content';
import { posSaleSuccessPageConfig } from '../../../../config/sale';

export const metadata: Metadata = {
  title: 'Vente confirmée — Caisse ATG',
  description: 'Confirmation de vente sur place',
};

function SuccessFallback() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center py-16"
      aria-busy="true"
      aria-label="Chargement"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-atg-border border-t-primary" />
      <p className="mt-4 text-lg text-atg-muted">{posSaleSuccessPageConfig.title}</p>
    </div>
  );
}

export default function PosSaleSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <PosSaleSuccessContent />
    </Suspense>
  );
}
