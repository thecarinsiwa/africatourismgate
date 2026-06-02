import type { Metadata } from 'next';
import { Button } from '@africatourismgate/ui';
import { posSalePageConfig } from '../../../config/sale';

const { title, subtitle, placeholder, backToHomeLabel } = posSalePageConfig;

export const metadata: Metadata = {
  title: 'Nouvelle vente — Caisse ATG',
  description: 'Vente sur place',
};

export default function PosSalePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-atg-fg md:text-4xl">{title}</h1>
        <p className="mt-2 text-lg text-atg-muted">{subtitle}</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-atg-border bg-atg-elevated px-6 py-16 text-center">
        <p className="max-w-md text-base text-atg-muted">{placeholder}</p>
        <Button
          variant="outline"
          size="lg"
          href="/"
          className="pos-touch mt-8 min-h-[3.25rem] px-8 text-base"
        >
          {backToHomeLabel}
        </Button>
      </div>
    </div>
  );
}
